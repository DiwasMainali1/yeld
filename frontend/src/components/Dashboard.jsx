import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import Header from './Header';
import MusicPlayer from './MusicPlayer';
import QuoteSection from './QuoteSection';
import Alarm from '../music/notification.mp3';
import TaskList from './Tasklist';

function Dashboard() {
  // Timer duration states (in seconds)
  const [pomodoroDuration, setPomodoroDuration] = useState(50 * 60); // default 50 minutes
  const [shortBreakDuration, setShortBreakDuration] = useState(10 * 60); // default 10 minutes
  const [longBreakDuration, setLongBreakDuration] = useState(60 * 60); // default 60 minutes

  // Timer & session states
  const [time, setTime] = useState(pomodoroDuration);
  const [isActive, setIsActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timerType, setTimerType] = useState('pomodoro');
  const [currentCycleCount, setCurrentCycleCount] = useState(0);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);

  // Other states
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState('');
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [audio] = useState(new Audio(Alarm));

  // Temporary inputs for editing durations (in minutes)
  const [tempPomodoro, setTempPomodoro] = useState(pomodoroDuration / 60);
  const [tempShortBreak, setTempShortBreak] = useState(shortBreakDuration / 60);
  const [tempLongBreak, setTempLongBreak] = useState(longBreakDuration / 60);

  // Tab focus tracking
  useEffect(() => {
    if (!sessionStarted || !isActive) return;

    // When the tab loses focus (user switches tabs or windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionStarted && isActive) {
        // Show the warning when they return
        setShowExitWarning(true);
        setExitAttempts(prev => prev + 1);
        
        // If this is their third attempt, reset the timer
        if (exitAttempts >= 2) {
          resetTimer();
          setExitAttempts(0);
        }
      }
    };

    // Detect tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionStarted, isActive, exitAttempts]);

  // Block browser navigation during active session
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (sessionStarted && isActive) {
        // Standard way to show a confirmation dialog before unloading
        event.preventDefault();
        event.returnValue = 'You have an active focus session. Leaving will reset your timer. Are you sure?';
        setExitAttempts(prev => prev + 1);
        return event.returnValue;
      }
    };

    // History API navigation blocking (for SPA navigation)
    const blockNavigation = () => {
      if (sessionStarted && isActive) {
        setShowExitWarning(true);
        setExitAttempts(prev => prev + 1);
        
        // If this is their third attempt, reset the timer
        if (exitAttempts >= 2) {
          resetTimer();
          setExitAttempts(0);
        }
        
        return false;
      }
      return true;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Set up history blocker (this is a simplified example; in a real app
    // you would use the router's navigation blocking features)
    const unblock = window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        if (blockNavigation()) {
          return target.apply(thisArg, argArray);
        }
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionStarted, isActive, exitAttempts]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('http://localhost:5000/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
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

  const fetchUserStats = async (currentUsername) => {
    try {
      if (!currentUsername) return;
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/profile/${currentUsername}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      const data = await response.json();
      setTotalTimeStudied(data.totalTimeStudied);
      setCompletedSessions(data.sessionsCompleted || 0);

      // If the user has saved timer settings, apply them
      if (data.timerSettings) {
        setPomodoroDuration(data.timerSettings.pomodoro);
        setShortBreakDuration(data.timerSettings.shortBreak);
        setLongBreakDuration(data.timerSettings.longBreak);

        // Also update time if not in session
        if (!sessionStarted && timerType === 'pomodoro') {
          setTime(data.timerSettings.pomodoro);
        }
      }
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to update user stats');
      }
      const data = await response.json();
      setTotalTimeStudied(data.totalTimeStudied);
      setCompletedSessions((prev) => prev + 1);
    } catch (error) {
      console.error('Error updating session stats:', error);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      setSessionStarted(false);
      setExitAttempts(0);
      audio.play().catch((error) => console.error('Error playing alarm:', error));

      if (timerType === 'pomodoro') {
        updateUserStats();
        const newCycleCount = currentCycleCount + 1;
        setCurrentCycleCount(newCycleCount);

        // After third Pomodoro, switch to long break
        if (newCycleCount % 3 === 0) {
          setTimerType('longBreak');
          setTime(longBreakDuration);
        } else {
          setTimerType('shortBreak');
          setTime(shortBreakDuration);
        }
      } else if (timerType === 'shortBreak' || timerType === 'longBreak') {
        // After any break, switch back to Pomodoro
        setTimerType('pomodoro');
        setTime(pomodoroDuration);
      }
    }
    return () => clearInterval(interval);
  }, [
    isActive,
    time,
    timerType,
    audio,
    currentCycleCount,
    pomodoroDuration,
    shortBreakDuration,
    longBreakDuration
  ]);

  const toggleTimer = () => {
    if (!isActive && !sessionStarted) {
      setSessionStarted(true);
    }
    setIsActive(!isActive);
    
    // Reset exit attempts when toggling timer
    setExitAttempts(0);
    setShowExitWarning(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionStarted(false);
    setCurrentCycleCount(0);
    setExitAttempts(0);
    setShowExitWarning(false);
    
    switch (timerType) {
      case 'pomodoro':
        setTime(pomodoroDuration);
        break;
      case 'shortBreak':
        setTime(shortBreakDuration);
        break;
      case 'longBreak':
        setTime(longBreakDuration);
        break;
      default:
        setTime(pomodoroDuration);
    }
  };

  const handleTimerTypeChange = (type) => {
    if (sessionStarted) {
      const confirmed = window.confirm(
        'Changing timer type will reset your current session. Are you sure?'
      );
      if (!confirmed) return;
    }
    setTimerType(type);
    setCurrentCycleCount(0);
    setExitAttempts(0);
    setShowExitWarning(false);
    
    switch (type) {
      case 'pomodoro':
        setTime(pomodoroDuration);
        break;
      case 'shortBreak':
        setTime(shortBreakDuration);
        break;
      case 'longBreak':
        setTime(longBreakDuration);
        break;
      default:
        setTime(pomodoroDuration);
    }
    setSessionStarted(false);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show modal to edit all timer settings
  const handleOpenEditModal = () => {
    // Fill temp values from current durations
    setTempPomodoro(pomodoroDuration / 60);
    setTempShortBreak(shortBreakDuration / 60);
    setTempLongBreak(longBreakDuration / 60);
    setShowEditModal(true);
  };

  // Save the updated timer settings
  const handleSaveTimerSettings = async () => {
    const newPomodoro = tempPomodoro * 60;
    const newShortBreak = tempShortBreak * 60;
    const newLongBreak = tempLongBreak * 60;

    setPomodoroDuration(newPomodoro);
    setShortBreakDuration(newShortBreak);
    setLongBreakDuration(newLongBreak);

    // If the timer isn't running, update the displayed time too
    if (!sessionStarted) {
      if (timerType === 'pomodoro') setTime(newPomodoro);
      else if (timerType === 'shortBreak') setTime(newShortBreak);
      else if (timerType === 'longBreak') setTime(newLongBreak);
    }

    // Save to backend
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/profile/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timerSettings: {
            pomodoro: newPomodoro,
            shortBreak: newShortBreak,
            longBreak: newLongBreak
          }
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save timer settings');
      }
      // Optionally handle success
    } catch (error) {
      console.error('Error saving timer settings:', error);
    }

    setShowEditModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };
  
  const dismissWarning = () => {
    setShowExitWarning(false);
  };

  return (
    <div className="min-h-screen bg-black font-sans select-none">
      <Header 
        username={username} 
        isTimerActive={sessionStarted}
        preventNavigation={sessionStarted && isActive}
        onExitAttempt={() => {
          setShowExitWarning(true);
          setExitAttempts(prev => prev + 1);
        }}
      />
      
      <div className="max-w-[1500px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TaskList />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
              {/* Exit warning alert */}
              {showExitWarning && (
                <div className="mb-6 bg-amber-950/30 border border-amber-900/50 text-amber-400 px-6 py-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Focus Session Active</h4>
                    <p className="text-sm mb-3">
                      Leaving this tab will reset your timer. You have {3 - exitAttempts} warnings remaining.
                    </p>
                    <button 
                      onClick={dismissWarning}
                      className="text-sm bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-1.5 rounded-lg transition"
                    >
                      I'll Stay Focused
                    </button>
                  </div>
                </div>
              )}
              
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
              {/* Timer Display */}
              <div className="text-center mb-6">
                <h2 className="text-8xl font-bold text-white font-mono tracking-widest">
                  {formatTime(time)}
                </h2>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-6 mb-6">
                <button
                  onClick={toggleTimer}
                  className="bg-zinc-900 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  {isActive ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-zinc-900 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>

              {/* Edit Times Button */}
              <div className="flex justify-center">
                <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                    <Clock size={20} />
                    Edit Times
                </button>
              </div>
              
              {/* Session Rules */}
              {sessionStarted && isActive && (
                <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <h3 className="text-white font-medium mb-2">Focus Session Rules</h3>
                  <ul className="text-zinc-400 text-sm space-y-1.5">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span>Leaving this tab will count as a warning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span>After 3 warnings, your timer will reset</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span>Stay on this tab to maintain your focus streak</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <MusicPlayer />
            <QuoteSection />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-zinc-900 p-6 rounded-md shadow-lg w-80">
            <h3 className="text-xl text-white mb-4">Edit Timer Durations</h3>
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-white mb-1">Pomodoro (min):</label>
                <input
                  type="number"
                  min="1"
                  value={tempPomodoro}
                  onChange={(e) => setTempPomodoro(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Short Break (min):</label>
                <input
                  type="number"
                  min="1"
                  value={tempShortBreak}
                  onChange={(e) => setTempShortBreak(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Long Break (min):</label>
                <input
                  type="number"
                  min="1"
                  value={tempLongBreak}
                  onChange={(e) => setTempLongBreak(parseInt(e.target.value, 10))}
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTimerSettings}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;