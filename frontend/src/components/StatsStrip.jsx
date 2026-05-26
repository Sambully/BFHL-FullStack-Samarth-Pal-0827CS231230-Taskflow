import React from "react";

function StatsStrip({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <div className="stat-label">Total Tasks</div>
        <div className="stat-value">{stats.totalTasks}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending</div>
        <div className="stat-value">{stats.pendingTasks}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Completed</div>
        <div className="stat-value">{stats.completedTasks}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Avg Importance</div>
        <div className="stat-value">{stats.averageImportance}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Overdue</div>
        <div className={`stat-value ${stats.overdueTasks > 0 ? "overdue" : ""}`}>
          {stats.overdueTasks}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">By Importance</div>
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          {[1, 2, 3, 4, 5].map((imp) => (
            <div
              key={imp}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700 }}>
                {imp}★
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--accent)" }}>
                {stats.tasksByImportance?.[imp] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsStrip;
