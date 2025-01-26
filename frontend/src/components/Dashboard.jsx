import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Header from './Header';
import MusicPlayer from './MusicPlayer';
import QuoteSection from './QuoteSection';
import Alarm from '../music/notification.mp3'
import TaskList from './Tasklist';

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState('');
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [timerType, setTimerType] = useState('pomodoro');
    const [totalTimeStudied, setTotalTimeStudied] = useState(0);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [currentCycleCount, setCurrentCycleCount] = useState(0);
    const [audio] = useState(new Audio(Alarm));

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await fetch('http://localhost:5000/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUsername(data.username);
                localStorage.setItem('username', data.username);
                await fetchUserStats(data.username);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUser();
    }, []);

    const addTask = (text) => {
        setTasks([...tasks, { id: Date.now(), text, completed: false }]);
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    };

    const toggleTask = (taskId) => {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        );
    };

    const fetchUserStats = async (currentUsername) => {
        try {
            if (!currentUsername) return;
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:5000/profile/${currentUsername}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const data = await response.json();
            setTotalTimeStudied(data.totalTimeStudied);
            setCompletedSessions(data.sessionsCompleted || 0);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const updateUserStats = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:5000/session/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to update user stats');
            }
            const data = await response.json();
            setTotalTimeStudied(data.totalTimeStudied);
            setCompletedSessions(prev => prev + 1);
        } catch (error) {
            console.error('Error updating session stats:', error);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (sessionStarted) {
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sessionStarted]);

    useEffect(() => {
        let interval = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(time => time - 1);
            }, 1000);
        } else if (time === 0) {
            setIsActive(false);
            setSessionStarted(false);
            audio.play().catch(error => console.error('Error playing alarm:', error));
            
            if (timerType === 'pomodoro') {
                updateUserStats();
                const newCycleCount = currentCycleCount + 1;
                setCurrentCycleCount(newCycleCount);
                
                // After third Pomodoro, switch to long break
                if (newCycleCount % 3 === 0) {
                    setTimerType('longBreak');
                    setTime(50 * 60);
                } else {
                    // Otherwise switch to short break
                    setTimerType('shortBreak');
                    setTime(5 * 60);
                }
            } else if (timerType === 'shortBreak' || timerType === 'longBreak') {
                // After any break, switch back to Pomodoro
                setTimerType('pomodoro');
                setTime(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, time, timerType, audio, currentCycleCount]);

    const toggleTimer = () => {
        if (!isActive && !sessionStarted) {
            setSessionStarted(true);
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setSessionStarted(false);
        setCurrentCycleCount(0); // Reset cycle count when manually resetting timer
        switch(timerType) {
            case 'pomodoro':
                setTime(25 * 60);
                break;
            case 'shortBreak':
                setTime(5 * 60);
                break;
            case 'longBreak':
                setTime(50 * 60);
                break;
            default:
                setTime(25 * 60);
        }
    };

    const handleTimerTypeChange = (type) => {
        if (sessionStarted) {
            const confirmed = window.confirm('Changing timer type will reset your current session. Are you sure?');
            if (!confirmed) return;
        }
        setTimerType(type);
        setCurrentCycleCount(0); // Reset cycle count when manually changing timer type
        switch(type) {
            case 'pomodoro':
                setTime(25 * 60);
                break;
            case 'shortBreak':
                setTime(5 * 60);
                break;
            case 'longBreak':
                setTime(50 * 60);
                break;
            default:
                setTime(25 * 60);
        }
        setSessionStarted(false);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-black font-sans select-none">
            <Header username={username} isTimerActive={sessionStarted} />
            <div className="max-w-[1500px] mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <TaskList
                        tasks={tasks}
                        onAddTask={addTask}
                        onDeleteTask={deleteTask}
                        onToggleTask={toggleTask}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
                            <div className="flex justify-center mb-12">
                                <div className="flex gap-4 bg-zinc-900 p-1 rounded-lg">
                                    <button 
                                        onClick={() => handleTimerTypeChange('pomodoro')}
                                        className={`px-6 py-2 rounded-lg transition-colors ${
                                            timerType === 'pomodoro' 
                                                ? 'bg-zinc-800 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Pomodoro
                                    </button>
                                    <button 
                                        onClick={() => handleTimerTypeChange('shortBreak')}
                                        className={`px-6 py-2 rounded-lg transition-colors ${
                                            timerType === 'shortBreak' 
                                                ? 'bg-zinc-800 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Short Break
                                    </button>
                                    <button 
                                        onClick={() => handleTimerTypeChange('longBreak')}
                                        className={`px-6 py-2 rounded-lg transition-colors ${
                                            timerType === 'longBreak' 
                                                ? 'bg-zinc-800 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Long Break
                                    </button>
                                </div>
                            </div>
                            <div className="text-center mb-12">
                                <h2 className="text-8xl font-bold text-white font-mono tracking-widest">
                                    {formatTime(time)}
                                </h2>
                            </div>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={toggleTimer}
                                    className="bg-zinc-900 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                                >
                                    {isActive ? 
                                        <Pause className="w-8 h-8" /> : 
                                        <Play className="w-8 h-8" />
                                    }
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="bg-zinc-900 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                                >
                                    <RotateCcw className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                        <MusicPlayer />
                        <QuoteSection />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;