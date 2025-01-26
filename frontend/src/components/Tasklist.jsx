import { useState } from 'react';

const TaskList = ({ tasks, onAddTask, onDeleteTask, onToggleTask }) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };

  return (
    <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl h-fit">
      <h3 className="text-white text-xl font-bold mb-4">Task List</h3>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col justify-center items-center">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700"
        />
        <button
          type="submit"
          className="mt-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Add Task
        </button>
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-2 hover:bg-zinc-900 rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
              className="w-4 h-4 accent-zinc-400"
            />
            <span
              className={`flex-1 text-white ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.text}
            </span>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;