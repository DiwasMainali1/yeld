import { X, Clock } from 'lucide-react';


const TaskHistoryModal = ({ isOpen, onClose, tasks = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Task History</h2>
                    <button 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(80vh-8rem)]">
                    {tasks?.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task, index) => (
                                <div 
                                    key={index} 
                                    className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-white font-medium">{task.title}</h3>
                                            <p className="text-zinc-400 text-sm mt-1">{task.description}</p>
                                        </div>
                                        <span className="text-zinc-500 text-sm">
                                            {new Date(task.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        <div className="flex items-center gap-1 text-zinc-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{task.duration} mins</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-zinc-400 py-8">
                            No completed tasks yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskHistoryModal;
