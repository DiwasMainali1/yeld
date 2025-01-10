import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, BarChart3, Calendar, Settings } from 'lucide-react';
import Header from './Header';

function Dashboard() {
    const [username, setUsername] = useState('');
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [timerType, setTimerType] = useState('pomodoro');
    const [sessionCount, setSessionCount] = useState(0);
    const [completedSessions, setCompletedSessions] = useState(0);
    
    const [audio] = useState(new Audio('/notification.mp3'));

    const switchToBreak = useCallback(() => {
        if (sessionCount === 2) {
            setTimerType('longBreak');
            setTime(40 * 60);
            setSessionCount(0);
        } else {
            setTimerType('shortBreak');
            setTime(5 * 60);
        }
        setIsActive(true);
    }, [sessionCount]);

    const switchToPomodoro = useCallback(() => {
        setTimerType('pomodoro');
        setTime(25 * 60);
        setIsActive(true);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await fetch('http://localhost:5000/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setUsername(data.username);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(time => time - 1);
            }, 1000);
        } else if (time === 0) {
            setIsActive(false);
            audio.play().catch(error => console.error('Error playing alarm:', error));
            
            if (timerType === 'pomodoro') {
                setSessionCount(prev => prev + 1);
                setCompletedSessions(prev => prev + 1);
                
                switchToBreak();
            } else if (timerType === 'shortBreak' || timerType === 'longBreak') {
                switchToPomodoro();
            }
        }
        return () => clearInterval(interval);
    }, [isActive, time, timerType, audio, switchToBreak, switchToPomodoro]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        switch(timerType) {
            case 'pomodoro':
                setTime(25 * 60);
                break;
            case 'shortBreak':
                setTime(5 * 60);
                break;
            case 'longBreak':
                setTime(40 * 60);
                break;
            default:
                setTime(25 * 60);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header username={username} />
            
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
                            <div className="flex justify-center mb-8">
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {setTimerType('pomodoro'); setTime(25 * 60);}}
                                        className={`px-4 py-2 rounded-lg ${timerType === 'pomodoro' ? 'bg-zinc-800 text-white' : 'text-gray-400'}`}
                                    >
                                        Pomodoro
                                    </button>
                                    <button 
                                        onClick={() => {setTimerType('shortBreak'); setTime(5 * 60);}}
                                        className={`px-4 py-2 rounded-lg ${timerType === 'shortBreak' ? 'bg-zinc-800 text-white' : 'text-gray-400'}`}
                                    >
                                        Short Break
                                    </button>
                                    <button 
                                        onClick={() => {setTimerType('longBreak'); setTime(40 * 60);}}
                                        className={`px-4 py-2 rounded-lg ${timerType === 'longBreak' ? 'bg-zinc-800 text-white' : 'text-gray-400'}`}
                                    >
                                        Long Break
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-center mb-8">
                                <h2 className="text-8xl font-bold text-gray-200 font-mono">
                                    {formatTime(time)}
                                </h2>
                            </div>
                            
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={toggleTimer}
                                    className="bg-black text-white p-4 rounded-full hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                                >
                                    {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="bg-black text-white p-4 rounded-full hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl flex items-center gap-4">
                            <BarChart3 className="w-6 h-6 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Today's Focus</h3>
                                <p className="text-gray-400">{Math.floor(completedSessions * 25 / 60)} hours {(completedSessions * 25) % 60} mins</p>
                            </div>
                        </div>
                        
                        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Sessions</h3>
                                <p className="text-gray-400">{completedSessions} completed</p>
                            </div>
                        </div>
                        
                        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl flex items-center gap-4">
                            <Settings className="w-6 h-6 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Next Long Break</h3>
                                <p className="text-gray-400">In {3 - sessionCount} sessions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;