import React from "react";

function Filters({ filters, onChange }) {
  const handleStatusChange = (e) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleImportanceChange = (e) => {
    onChange({ ...filters, minImportance: e.target.value });
  };

  const handleReset = () => {
    onChange({ status: "", minImportance: "1" });
  };

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={filters.status || ""}
          onChange={handleStatusChange}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="importance-filter">Min Importance</label>
        <div className="importance-slider">
          <input
            id="importance-filter"
            type="range"
            min="1"
            max="5"
            step="1"
            value={filters.minImportance || "1"}
            onChange={handleImportanceChange}
          />
          <span className="importance-val">{filters.minImportance || 1}</span>
        </div>
      </div>

      {(filters.status || (filters.minImportance && filters.minImportance !== "1")) && (
        <button
          className="btn-cancel"
          onClick={handleReset}
          style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default Filters;
