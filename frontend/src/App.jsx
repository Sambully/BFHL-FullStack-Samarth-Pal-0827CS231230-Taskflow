import React, { useState, useEffect, useCallback } from "react";
import { getTasks, getStats } from "./api";
import StatsStrip from "./components/StatsStrip";
import Filters from "./components/Filters";
import CreateTaskForm from "./components/CreateTaskForm";
import TaskCard from "./components/TaskCard";

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ status: "", minImportance: "1" });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.minImportance && filters.minImportance !== "1") {
        params.minImportance = filters.minImportance;
      }

      const [tasksRes, statsRes] = await Promise.all([
        getTasks(params),
        getStats(),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreated = () => {
    setShowCreate(false);
    fetchData();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>⚡ TaskFlow</h1>
          <span className="header-subtitle">Smart Task Manager with Priority Scoring</span>
        </div>
        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + New Task
        </button>
      </header>

      <StatsStrip stats={stats} />
      <Filters filters={filters} onChange={setFilters} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>No tasks found</p>
          <span className="empty-sub">Try adjusting filters or create a new task</span>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onUpdate={fetchData} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTaskForm
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

export default App;
