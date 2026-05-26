import React, { useState } from "react";
import { updateTask, deleteTask } from "../api";

function formatRelativeDate(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  if (diffDays > 1) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

function TaskCard({ task, onUpdate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleComplete = async () => {
    setUpdating(true);
    try {
      await updateTask(task._id, { status: "completed" });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setUpdating(true);
    try {
      await deleteTask(task._id);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
      setShowConfirm(false);
    }
  };

  const isHighPriority = task.priorityScore >= 50;

  return (
    <div
      className={`task-card ${isHighPriority ? "high-priority" : ""} ${
        task.status === "completed" ? "completed" : ""
      }`}
    >
      <div className="task-top">
        <h3 className="task-title">{task.title}</h3>
        <span className="task-score">Score: {task.priorityScore}</span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="meta-badge">
          Importance:{" "}
          <span className="importance-stars">
            {"★".repeat(task.importance)}
            {"☆".repeat(5 - task.importance)}
          </span>
        </span>
        <span className="meta-badge">
          Due: {formatRelativeDate(task.dueDate)}
        </span>
        <span className={`status-badge ${task.status}`}>
          {task.status}
        </span>
        {isHighPriority && task.status !== "completed" && (
          <span
            className="status-badge"
            style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
          >
            High Priority
          </span>
        )}
      </div>

      <div className="task-actions">
        {task.status === "pending" && (
          <button
            className="btn-complete"
            onClick={handleComplete}
            disabled={updating}
          >
            {updating ? "Updating..." : "Mark as Complete"}
          </button>
        )}
        <button
          className="btn-delete"
          onClick={() => setShowConfirm(true)}
          disabled={updating}
        >
          Delete
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Are you sure you want to delete this task?</p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirm(false)}
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDelete}
                style={{ padding: "8px 16px", background: "var(--danger)", color: "#fff" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
