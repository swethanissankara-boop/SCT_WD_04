import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("focusFlowTasks");
    if (savedTasks) return JSON.parse(savedTasks);
    return [];
  });
  
  // --- UPGRADE 1: Dark Mode State (Persisted to localStorage!) ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("focusFlowTheme");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  const [taskText, setTaskText] = useState("");
  const [taskList, setTaskList] = useState("Personal");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  
  // --- UPGRADE 2: Priority State ---
  const [taskPriority, setTaskPriority] = useState("Low"); 

  const [filterStatus, setFilterStatus] = useState("Active"); 
  const [filterCategory, setFilterCategory] = useState("All"); 

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Save Tasks and Theme
  useEffect(() => {
    localStorage.setItem("focusFlowTasks", JSON.stringify(tasks));
    localStorage.setItem("focusFlowTheme", JSON.stringify(darkMode));
  }, [tasks, darkMode]); 

  // --- UPGRADE 3: The Notification Engine ---
  useEffect(() => {
    // 1. Ask the browser for permission to send notifications
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 2. Set up a clock that checks the time every 10 seconds
    const intervalId = setInterval(() => {
      const now = new Date();
      // Format current time to match our HTML input format (YYYY-MM-DD and HH:MM)
      const currentYYYYMMDD = now.toISOString().split('T')[0];
      const currentHHMM = now.toTimeString().slice(0, 5); 

      let tasksUpdated = false;
      const updatedTasks = tasks.map(task => {
        // If task is not completed, hasn't been notified yet, and matches the exact minute...
        if (!task.completed && !task.notified && task.date === currentYYYYMMDD && task.time === currentHHMM) {
          
          // FIRE THE SYSTEM NOTIFICATION!
          if (Notification.permission === "granted") {
            new Notification("FocusFlow: Task Due!", {
              body: task.text,
              icon: "https://cdn-icons-png.flaticon.com/512/1828/1828640.png" // Little bell icon
            });
          }
          
          tasksUpdated = true;
          // Mark it as notified so we don't spam them 6 times in that single minute
          return { ...task, notified: true };
        }
        return task;
      });

      // Only save if we actually triggered a notification
      if (tasksUpdated) {
        setTasks(updatedTasks);
      }
    }, 10000);

    // Clean up the clock when the app closes
    return () => clearInterval(intervalId);
  }, [tasks]); // Re-run whenever tasks change


  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskText.trim() === "") return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      list: taskList,
      date: taskDate,
      time: taskTime,
      priority: taskPriority, // Save Priority
      completed: false,
      notified: false // Tracking for the notification engine
    };

    // Advanced: Automatically sort High priority tasks to the top!
    const updatedTasks = [...tasks, newTask].sort((a, b) => {
      const pValues = { "High": 3, "Medium": 2, "Low": 1 };
      return pValues[b.priority] - pValues[a.priority];
    });

    setTasks(updatedTasks);
    setTaskText("");
    setTaskDate("");
    setTaskTime("");
    setTaskPriority("Low"); // Reset priority to default
  };

  const toggleComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, text: editingText } : task
    ));
    setEditingTaskId(null);
    setEditingText("");
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return null;
    let dateTimeStr = "";
    if (date) dateTimeStr += new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (date && time) dateTimeStr += " at ";
    if (time) {
      const [h, m] = time.split(':');
      const hours = parseInt(h);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      dateTimeStr += `${formattedHours}:${m} ${ampm}`;
    }
    return dateTimeStr;
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === "Active" && task.completed) return false;
    if (filterStatus === "Completed" && !task.completed) return false;
    if (filterCategory !== "All" && task.list !== filterCategory) return false;
    return true; 
  });

  // Priority Color Helper
  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-500 bg-red-100 dark:bg-red-500/20";
    if (priority === "Medium") return "text-amber-500 bg-amber-100 dark:bg-amber-500/20";
    return "text-green-500 bg-green-100 dark:bg-green-500/20";
  };

  // We wrap the entire app in a div that conditionally has the 'dark' class
  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-start justify-center p-6 py-12 font-sans transition-colors duration-300">
        
        <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 p-8 md:p-10 transition-colors duration-300">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
                Focus<span className="text-blue-600 dark:text-blue-400">Flow</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Organize your day, your way.</p>
            </div>

            {/* --- UPGRADE 1: Dark Mode Toggle Button --- */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          <form onSubmit={handleAddTask} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner mb-8 transition-colors">
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="What do you need to get done?"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 p-4 rounded-xl text-lg font-medium text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="date" 
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full md:w-auto bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 p-3 rounded-xl text-slate-600 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              />
              <input 
                type="time" 
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                className="w-full md:w-auto bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 p-3 rounded-xl text-slate-600 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              />
              <select 
                value={taskList}
                onChange={(e) => setTaskList(e.target.value)}
                className="w-full md:w-auto bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 p-3 rounded-xl text-slate-600 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
              </select>

              {/* --- UPGRADE 2: Priority Dropdown --- */}
              <select 
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className={`w-full md:w-auto border-2 p-3 rounded-xl font-bold focus:outline-none focus:ring-4 transition-all cursor-pointer ${
                  taskPriority === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 
                  taskPriority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : 
                  'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:border-green-800'
                }`}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>

              <button 
                type="submit"
                className="w-full md:w-auto ml-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Add Task
              </button>
            </div>
          </form>

          {tasks.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl mb-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
              <div className="flex gap-1 w-full sm:w-auto mb-2 sm:mb-0">
                {['All', 'Active', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      filterStatus === status 
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-500' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="All">All Categories</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 font-medium py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                {tasks.length === 0 ? "No tasks yet. Add one above!" : "No tasks match your filters!"}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                    task.completed 
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' 
                      : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {editingTaskId !== task.id && (
                      <button 
                        onClick={() => toggleComplete(task.id)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          task.completed 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'border-slate-300 dark:border-slate-500 hover:border-blue-500 text-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                        </svg>
                      </button>
                    )}

                    {editingTaskId === task.id ? (
                      <div className="flex flex-1 items-center gap-2 w-full pr-4">
                        <input 
                          type="text" 
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-600 border-2 border-blue-300 dark:border-blue-500 p-2 rounded-xl text-slate-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveEdit(task.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className={`text-lg font-semibold transition-all ${
                          task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'
                        }`}>
                          {task.text}
                        </span>
                        {(task.date || task.time) && (
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            ⏱️ {formatDateTime(task.date, task.time)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {editingTaskId !== task.id && (
                    <div className="flex items-center gap-1 sm:gap-3">
                      
                      {/* --- UPGRADE 2: Visual Priority Indicator --- */}
                      <span className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        {task.priority}
                      </span>
                      
                      <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {task.list}
                      </span>
                      
                      <button 
                        onClick={() => startEditing(task)}
                        className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-600 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;