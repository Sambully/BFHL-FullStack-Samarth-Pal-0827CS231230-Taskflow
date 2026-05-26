const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

function computePriorityScore(task) {
  if (task.status === "completed") return 0;
  const now = new Date();
  const due = new Date(task.dueDate);
  const diffMs = due.getTime() - now.getTime();
  const daysUntilDue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const safeDays = Math.max(daysUntilDue, 1);
  const score = (task.importance * 10) + (100 / safeDays);
  return Math.round(score * 100) / 100;
}

function formatTask(task) {
  const obj = task.toObject();
  obj.priorityScore = computePriorityScore(task);
  return obj;
}

router.post("/", async (req, res) => {
  try {
    const { title, description, importance, dueDate, status } = req.body;

    if (!title || importance === undefined || importance === null || !dueDate) {
      return res.status(400).json({ error: "Missing required fields: title, importance, and dueDate are required" });
    }

    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 100) {
      return res.status(400).json({ error: "Title must be a string between 3 and 100 characters" });
    }

    if (description !== undefined && description !== null && description !== "") {
      if (typeof description !== "string" || description.length > 500) {
        return res.status(400).json({ error: "Description must be a string of at most 500 characters" });
      }
    }

    const imp = Number(importance);
    if (!Number.isInteger(imp) || imp < 1 || imp > 5) {
      return res.status(400).json({ error: "Importance must be an integer between 1 and 5" });
    }

    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid dueDate format" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: "dueDate must be a future date" });
    }

    if (status !== undefined && status !== "pending" && status !== "completed") {
      return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      importance: imp,
      dueDate: parsedDate,
      status: status || "pending",
    });

    const saved = await task.save();
    res.status(201).json(formatTask(saved));
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      if (req.query.status !== "pending" && req.query.status !== "completed") {
        return res.status(400).json({ error: 'Status filter must be "pending" or "completed"' });
      }
      filter.status = req.query.status;
    }

    if (req.query.minImportance) {
      const minImp = Number(req.query.minImportance);
      if (isNaN(minImp) || minImp < 1 || minImp > 5) {
        return res.status(400).json({ error: "minImportance must be a number between 1 and 5" });
      }
      filter.importance = { $gte: minImp };
    }

    const tasks = await Task.find(filter);
    const formatted = tasks.map(formatTask);
    formatted.sort((a, b) => b.priorityScore - a.priorityScore);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const stats = await Task.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                averageImportance: { $avg: "$importance" },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "pending"] },
                          { $lt: ["$dueDate", now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          tasksByImportance: [
            {
              $group: {
                _id: { $toString: "$importance" },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const totals = stats[0].totals[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0,
    };

    const tasksByImportance = {};
    for (const item of stats[0].tasksByImportance) {
      tasksByImportance[item._id] = item.count;
    }

    res.json({
      totalTasks: totals.totalTasks,
      pendingTasks: totals.pendingTasks,
      completedTasks: totals.completedTasks,
      averageImportance: Math.round((totals.averageImportance || 0) * 100) / 100,
      overdueTasks: totals.overdueTasks,
      tasksByImportance,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const allowed = ["title", "description", "importance", "dueDate", "status"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || updates.title.trim().length < 3 || updates.title.trim().length > 100) {
        return res.status(400).json({ error: "Title must be a string between 3 and 100 characters" });
      }
      updates.title = updates.title.trim();
    }

    if (updates.importance !== undefined) {
      const imp = Number(updates.importance);
      if (!Number.isInteger(imp) || imp < 1 || imp > 5) {
        return res.status(400).json({ error: "Importance must be an integer between 1 and 5" });
      }
      updates.importance = imp;
    }

    if (updates.dueDate !== undefined) {
      const parsedDate = new Date(updates.dueDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid dueDate format" });
      }
      updates.dueDate = parsedDate;
    }

    if (updates.status !== undefined && updates.status !== "pending" && updates.status !== "completed") {
      return res.status(400).json({ error: 'Status must be "pending" or "completed"' });
    }

    Object.assign(task, updates);
    const saved = await task.save();
    res.json(formatTask(saved));
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
