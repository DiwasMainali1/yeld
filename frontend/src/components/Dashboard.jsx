import { useState, useEffect, memo } from 'react';
import { Play, Pause, RotateCcw, Clock, Image } from 'lucide-react';
import Header from './Header';
import MusicPlayer from './MusicPlayer';
import QuoteSection from './QuoteSection';
import Alarm from '../music/notification.mp3';
import TaskList from './Tasklist';
import BackgroundModal from './BackgroundModal';
import cafeBackground from '../backgrounds/cafe.jpg';
import fireplaceBackground from '../backgrounds/fireplace.jpg';
import forestBackground from '../backgrounds/forest.jpg';
import galaxyBackground from '../backgrounds/galaxy.jpg';
import ghibliBackground from '../backgrounds/ghibli.jpg';
import midnightBackground from '../backgrounds/midnight.jpg';
import oceanBackground from '../backgrounds/ocean.jpg';
import spiritedBackground from '../backgrounds/spirited.jpg';
import sunsetBackground from '../backgrounds/sunset.jpg';

const backgroundMap = {
  default: null,
  cafe: cafeBackground,
  fireplace: fireplaceBackground,
  forest: forestBackground,
  galaxy: galaxyBackground,
  ghibli: ghibliBackground,
  midnight: midnightBackground,
  ocean: oceanBackground,
  spirited: spiritedBackground,
  sunset: sunsetBackground
};

// Memoize components to prevent re-renders when Dashboard state changes
const MemoizedMusicPlayer = memo(MusicPlayer);
const MemoizedQuoteSection = memo(QuoteSection);
const MemoizedTaskList = memo(TaskList);

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

  // Other states
  const [username, setUsername] = useState('');
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [audio] = useState(new Audio(Alarm));

  // Modal controls
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  
  // Background state
  const [background, setBackground] = useState('default');

  // Temporary inputs for editing durations (in minutes)
  const [tempPomodoro, setTempPomodoro] = useState(pomodoroDuration / 60);
  const [tempShortBreak, setTempShortBreak] = useState(shortBreakDuration / 60);
  const [tempLongBreak, setTempLongBreak] = useState(longBreakDuration / 60);

    // Background styles based on selection
  const renderBackground = () => {
    if (background === 'default' || !backgroundMap[background]) {
      return <div className="fixed inset-0 bg-black -z-10"></div>;
    }

    return (
      <div className="fixed inset-0 -z-10">
        <img 
          src={backgroundMap[background]} 
          alt={background} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
    );
  };

  // Load saved background from localStorage
  useEffect(() => {
    const savedBackground = localStorage.getItem('background');
    if (savedBackground) {
      setBackground(savedBackground);
    }
  }, []);

  // Save background to localStorage when changed
  useEffect(() => {
    localStorage.setItem('background', background);
  }, [background]);

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
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      setSessionStarted(false);
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
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionStarted(false);
    setCurrentCycleCount(0);
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Background selection handlers
  const handleOpenBackgroundModal = () => {
    setShowBackgroundModal(true);
  };

  const handleCloseBackgroundModal = () => {
    setShowBackgroundModal(false);
  };

  const handleSelectBackground = (backgroundId) => {
    setBackground(backgroundId);
    setShowBackgroundModal(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 select-none`}>
      {renderBackground()}
      <Header username={username} isTimerActive={sessionStarted} />
      
      <div className="max-w-[1500px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <MemoizedTaskList />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-zinc-950/30 backdrop-blur-sm p-8 rounded-2xl border border-zinc-900 shadow-xl">
              <div className="flex justify-center mb-12">
                <div className="flex gap-4 bg-zinc-900/30 p-1 rounded-lg">
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
              <div className="text-center mb-6">
                <h2 className="text-8xl font-bold text-white font-mono tracking-widest">
                  {formatTime(time)}
                </h2>
              </div>

              <div className="flex justify-center gap-6 mb-6">
                <button
                  onClick={toggleTimer}
                  className="bg-zinc-900/30 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  {isActive ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-zinc-900/30 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleOpenBackgroundModal}
                  className="flex items-center gap-2 bg-zinc-900/30 text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  <Image size={20} />
                  Change Background
                </button>
                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-2 bg-zinc-900/30 text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                >
                  <Clock size={20} />
                  Edit Times
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 order-3">
            <div className="mb-4">
              <MemoizedMusicPlayer />
            </div>
            <MemoizedQuoteSection />
          </div>
        </div>
      </div>

      {/* Edit Timer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-zinc-900 p-6 rounded-xl shadow-lg w-80">
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
                onClick={handleCloseEditModal}
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

      {/* Background Modal */}
      <BackgroundModal 
        isOpen={showBackgroundModal}
        onClose={handleCloseBackgroundModal}
        onSelect={handleSelectBackground}
        currentBackground={background}
      />
    </div>
  );
}

export default Dashboard;