import React, { useState, useEffect } from 'react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const MAX_TASKS = 10; // Maximum number of tasks allowed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      // Sort tasks by creation date (oldest first)
      const sortedTasks = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setTasks(sortedTasks);
      setError('');
    } catch (error) {
      setError('Error loading tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      // Check if we've reached the maximum number of tasks
      if (tasks.length >= MAX_TASKS) {
        setError(`You can only have a maximum of ${MAX_TASKS} tasks. Please delete some tasks first.`);
        return;
      }

      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newTaskText.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const newTask = await response.json();
      
      // Add the new task to the end of the list (newest will be at the bottom)
      setTasks(prevTasks => [...prevTasks, newTask]);
      setNewTaskText('');
      setError('');
    } catch (error) {
      setError('Error adding task');
      console.error('Error adding task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('userToken');
      const task = tasks.find(t => t._id === taskId);
  
      // Add to task history if the task was completed
      if (task.completed) {
        await fetch('http://localhost:5000/tasks/history', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: task.text,
            completedAt: new Date()
          })
        });
      }
  
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
    } catch (error) {
      setError('Error deleting task');
      console.error('Error:', error);
    }
  };
  
  const handleToggle = async (taskId) => {
    try {
      const token = localStorage.getItem('userToken');
      const task = tasks.find(t => t._id === taskId);
      const newCompleted = !task.completed;
  
      const response = await fetch(`http://localhost:5000/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to toggle task');
      setTasks(prevTasks => prevTasks.map(t => 
        t._id === taskId ? { ...t, completed: newCompleted } : t
      ));
    } catch (error) {
      setError('Error updating task');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
        <p className="text-white">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
      <h3 className="text-white text-xl font-bold mb-4">Task List</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900/50 border border-red-800 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col justify-center items-center space-y-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task"
            className="flex-1 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim() || tasks.length >= MAX_TASKS}
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
          {tasks.length >= MAX_TASKS && (
            <p className="text-xs text-red-400">
              Task limit reached ({MAX_TASKS} maximum)
            </p>
          )}
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="text-zinc-400 text-center">No tasks yet</p>
      ) : (
        <div>
          <p className="text-xs text-zinc-500 mb-4 text-center">
            {tasks.length} of {MAX_TASKS} tasks used
          </p>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center gap-3 p-3 hover:bg-zinc-900/50 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task._id)}
                  className="w-4 h-4 accent-zinc-400"
                />
                <span
                  className={`flex-1 text-white ${
                    task.completed ? 'line-through text-zinc-500' : ''
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskList;