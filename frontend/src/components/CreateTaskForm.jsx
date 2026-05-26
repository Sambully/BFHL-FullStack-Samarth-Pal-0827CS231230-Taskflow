import React, { useState } from "react";
import { createTask } from "../api";

function CreateTaskForm({ onCreated, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(3);
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!title.trim()) {
      err.title = "Title is required";
    } else if (title.trim().length < 3 || title.trim().length > 100) {
      err.title = "Title must be between 3 and 100 characters";
    }

    if (description.length > 500) {
      err.description = "Description must be at most 500 characters";
    }

    if (!dueDate) {
      err.dueDate = "Due date is required";
    } else {
      const selected = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        err.dueDate = "Due date must be a future date";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createTask({
        title,
        description,
        importance,
        dueDate,
      });
      onCreated();
    } catch (err) {
      setErrors({ api: err.response?.data?.error || "Failed to create task" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          {errors.api && <div className="error-banner">{errors.api}</div>}

          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write unit tests"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cover main routes with integration tests"
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task-importance">Importance ({importance})</label>
            <select
              id="task-importance"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
            >
              <option value="1">1 - Low</option>
              <option value="2">2 - Medium</option>
              <option value="3">3 - High</option>
              <option value="4">4 - Critical</option>
              <option value="5">5 - Immediate</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-duedate">Due Date *</label>
            <input
              id="task-duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskForm;
