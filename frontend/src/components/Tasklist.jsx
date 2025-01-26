import React, { useState, useEffect } from 'react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
      setTasks(data);
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
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      setError('');
    } catch (error) {
      setError('Error deleting task');
      console.error('Error deleting task:', error);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task');
      }

      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, completed: updatedTask.completed } : task
        )
      );
      setError('');
    } catch (error) {
      setError('Error updating task');
      console.error('Error toggling task:', error);
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
            disabled={!newTaskText.trim()}
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="text-zinc-400 text-center">No tasks yet</p>
      ) : (
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
      )}
    </div>
  );
};

export default TaskList;