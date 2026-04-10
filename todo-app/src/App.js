import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [dark, setDark] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedName = localStorage.getItem("username");

    setTasks(savedTasks);
    if (savedName) {
      setName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const saveName = () => {
    if (!tempName.trim()) return;
    setName(tempName.trim());
    localStorage.setItem("username", tempName.trim());
    setShowNameInput(false);
  };

  // Calculations
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const highPriorityCount = tasks.filter(t => t.priority === "High").length;

  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  const filteredTasks = tasks
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
    .filter(task => {
      if (filter === "pending") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .sort((a, b) => a.completed - b.completed);

  // Dynamic pending text
  const pendingText = pendingTasks.length === 0 
    ? "No tasks pending" 
    : `${pendingTasks.length} Task${pendingTasks.length > 1 ? 's' : ''} pending`;

  const openAddModal = () => {
    setEditingTask(null);
    setNewTaskTitle("");
    setDescription("");
    setPriority("Low");
    setDueDate("");
    setShowForm(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setShowForm(true);
  };

  const saveTask = () => {
    if (!newTaskTitle.trim()) return;

    if (editingTask) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingTask.id
            ? { ...task, title: newTaskTitle.trim(), description: description.trim(), priority, dueDate }
            : task
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        description: description.trim(),
        priority,
        dueDate,
        completed: false,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setTasks(prev => [newTask, ...prev]);
    }

    setNewTaskTitle("");
    setDescription("");
    setPriority("Low");
    setDueDate("");
    setEditingTask(null);
    setShowForm(false);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getPriorityClass = (p) => {
    if (p === "High") return "high";
    if (p === "Medium") return "medium";
    return "low";
  };

  if (showNameInput) {
    return (
      <div className="app center">
        <h2>Welcome 👋</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>What should we call you?</p>
        <input 
          className="add-input" 
          placeholder="Enter your name" 
          value={tempName} 
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
        />
        <button className="add-btn" onClick={saveName}>Get Started</button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h2>Hello {name} 👋</h2>
        
        {/* Fixed Dynamic Pending Text */}
        <p style={{ margin: "4px 0 2px 0", fontSize: "15px", color: "#64748b" }}>
          {pendingText}
        </p>

        <p style={{ 
          margin: "6px 0 0 0", 
          fontSize: "14.5px", 
          fontWeight: 500, 
          color: "#4f46e5",
          letterSpacing: "0.3px"
        }}>
          Stay productive today ✨
        </p>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            setDark(!dark);
            document.body.classList.toggle("dark-mode");
          }}
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            cursor: "pointer"
          }}
        >
          🌙
        </button>
      </div>

      <div className="dashboard">
        <div className="card total">Total {tasks.length}</div>
        <div className="card pending">Pending {pendingTasks.length}</div>
        <div className="card completed">Done {completedTasks.length}</div>
        <div className="card high">High {highPriorityCount}</div>
      </div>

      <div className="progressBox">
        <div className="progressBar">
          <div className="progressFill" style={{ width: `${progress}%` }}>
            <div className="stars">
              {[...Array(8)].map((_, i) => <div key={i} className="star"></div>)}
            </div>
          </div>
        </div>
        <p style={{ marginTop: "9px", color: "#64748b", fontSize: "14.8px", fontWeight: 500 }}>
          {progress}% Completed
        </p>
      </div>

      <input
        className="search"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
        <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <div className="tasks-container">
        <div className="tasks">
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <p>No tasks yet</p>
              <p style={{ fontSize: "13px" }}>Tap the + button to add one</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                id={`task-${task.id}`}
                key={task.id} 
                className={`taskCard ${task.completed ? "done" : ""}`}
              >
                <div className="task-info">
                  <h3>{task.title}</h3>
                  {task.description && <p className="desc">{task.description}</p>}
                  
                  <span className={`meta ${getPriorityClass(task.priority)}`}>
                    {task.priority} Priority • {task.dueDate || "No due date"}
                  </span>
                  
                  <p className="time">{task.time}</p>
                </div>

                <div className="actions">
                  <button 
                    className={`tick-btn ${task.completed ? 'completed' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? "↩" : "✔"}
                  </button>
                  <button onClick={() => openEditModal(task)} style={{ background: "#3b82f6", color: "white" }}>✏️</button>
                  <button onClick={() => deleteTask(task.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="fab" onClick={openAddModal}>+</button>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="formBox" onClick={e => e.stopPropagation()}>
            <h3>{editingTask ? "Edit Task" : "New Task"}</h3>
            
            <input 
              className="add-input" 
              placeholder="Task title" 
              value={newTaskTitle} 
              onChange={e => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            
            <input 
              className="add-input" 
              placeholder="Description (optional)" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />

            <div style={{ marginBottom: "8px" }}>
              <p style={{ 
                margin: "4px 4px 8px 4px", 
                fontSize: "13.5px", 
                color: "#64748b",
                fontWeight: 500 
              }}>
                Priority & Due Date
              </p>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <select 
                  className="add-input" 
                  style={{ flex: 1 }}
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                
                <div style={{ position: "relative", flex: 1.4 }}>
                  <input 
                    type="date" 
                    className="add-input date-input" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                  />
                  {!dueDate && (
                    <div 
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "18px",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        fontSize: "15px",
                        pointerEvents: "none",
                        userSelect: "none",
                        zIndex: 1
                      }}
                    >
                      
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="add-btn" 
              onClick={saveTask}
              disabled={!newTaskTitle.trim()}
            >
              {editingTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;