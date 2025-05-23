import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, memo, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Image, Users, X, LogOut } from 'lucide-react';
import Header from './Header';
import MusicPlayer from './custom-components/MusicPlayer';
import SessionParticipantsModal from './group-components/SessionParticipantsModal';
import QuoteSection from './custom-components/QuoteSection';
import Alarm from '../music/notification.mp3';
import TaskList from './task-components/Tasklist';
import GroupSession from './group-components/GroupSession';
import { useSession } from './group-components/SessionContext';
import BackgroundModal from './custom-components/BackgroundModal';
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
  sunset: sunsetBackground,
};

const MemoizedMusicPlayer = memo(MusicPlayer);
const MemoizedQuoteSection = memo(QuoteSection);
const MemoizedTaskList = memo(TaskList);

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get('session');

  const {
    session,
    isInSession,
    joinSession,
    leaveSession,
    startSession,
    sessionStarted,
    isCreator,
    sessionDuration,
    participants,
    participantNames,
    resetSessionState
  } = useSession();

  const [pomodoroDuration, setPomodoroDuration] = useState(50 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(10 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(60 * 60);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [time, setTime] = useState(pomodoroDuration);
  const [isActive, setIsActive] = useState(false);
  const [timerSessionStarted, setTimerSessionStarted] = useState(false);
  const [timerType, setTimerType] = useState('pomodoro');
  const [currentCycleCount, setCurrentCycleCount] = useState(0);
  const sessionTimerRef = useRef(null);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionStats, setCompletionStats] = useState(null);

  const [username, setUsername] = useState('');
  const [totalTimeStudied, setTotalTimeStudied] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [audio] = useState(new Audio(Alarm));
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsList, setParticipantsList] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // REMOVED localStorage usage for background - now purely from database
  const [background, setBackground] = useState('default');
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  const [tempPomodoro, setTempPomodoro] = useState(pomodoroDuration / 60);
  const [tempShortBreak, setTempShortBreak] = useState(shortBreakDuration / 60);
  const [tempLongBreak, setTempLongBreak] = useState(longBreakDuration / 60);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (sessionIdFromUrl && !isInSession) {
      joinSession(sessionIdFromUrl);
    }
  }, [sessionIdFromUrl, isInSession, joinSession]);

  useEffect(() => {
    if (isInSession) {
      setTime(sessionDuration);

      if (sessionStarted && !isActive) {
        setIsActive(true);
        setTimerSessionStarted(true);
      }
    }
  }, [isInSession, sessionDuration, sessionStarted, isActive]);

const sessionCompletedRef = useRef(false);

// Reset completion flag when session changes
useEffect(() => {
  if (session) {
    sessionCompletedRef.current = false;
  }
}, [session]);

const completeGroupSession = async () => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`http://localhost:5000/sessions/${session._id}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.stats) {
        setTotalTimeStudied(data.stats.totalTimeStudied);
        setCompletedSessions(data.stats.sessionsCompleted);
      }
    }
  } catch (error) {
    console.error('Error completing session:', error);
  } finally {
    handleSessionCompletionCleanup();
  }
};


useEffect(() => {
  if (sessionTimerRef.current) {
    clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = null;
  }

  if (isInSession && sessionStarted && isActive && session && !sessionCompletedRef.current) {
    let endTime;
    
    if (session.expiresAt) {
      endTime = new Date(session.expiresAt).getTime();
    } else if (session.startTime) {
      const startTime = new Date(session.startTime).getTime();
      endTime = startTime + (sessionDuration * 1000);
    } else {
      setTime(sessionDuration);
      return;
    }
    
    setSessionEndTime(endTime);

    sessionTimerRef.current = setInterval(() => {
      const currentTime = Date.now() + serverTimeOffset;
      const remainingTime = Math.max(0, Math.floor((endTime - currentTime) / 1000));

      if (remainingTime <= 0) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
        
        if (!sessionCompletedRef.current) {
          sessionCompletedRef.current = true;
          audio.play().catch((error) => console.error("Error playing alarm:", error));
          
          completeGroupSession();
          
          setTime(0);
          setIsActive(false);
        }
      } else {
        setTime(remainingTime);
      }
    }, 1000);
  }
  else if (!isInSession && isActive) {
    sessionTimerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(sessionTimerRef.current);
          sessionTimerRef.current = null;
          audio.play().catch((error) => console.error("Error playing alarm:", error));
          
          if (timerType === 'pomodoro') {
            updateUserStats(pomodoroDuration);
          }
          
          handleTimerCompletion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }

  return () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };
}, [isActive, isInSession, sessionStarted, session, serverTimeOffset, sessionDuration, pomodoroDuration]);



// Add this new function to handle the cleanup after session completion:
const handleSessionCompletionCleanup = async () => {
  try {
    resetSessionState(); 
    
    console.log('Session completed and cleaned up successfully');
  } catch (error) {
    console.error('Error during session cleanup:', error);
  } finally {
    resetToUserTimer();
  }
};

// Add this function to reset back to user's personal timer:
  const resetToUserTimer = () => {
    // Clear any running timers
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    
  // Reset all timer states to user's personal timer
  setIsActive(false);
  setTimerSessionStarted(false);
  setCurrentCycleCount(0);
  setTimerType('pomodoro');
  setTime(pomodoroDuration);
  
  console.log('Timer reset to personal pomodoro timer');
};


useEffect(() => {
  if (sessionTimerRef.current) {
    clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = null;
  }

  if (isInSession && sessionStarted && isActive && session && !sessionCompletedRef.current) {
    let endTime;
    
    if (session.expiresAt) {
      endTime = new Date(session.expiresAt).getTime();
    } else if (session.startTime) {
      const startTime = new Date(session.startTime).getTime();
      endTime = startTime + (sessionDuration * 1000);
    } else {
      setTime(sessionDuration);
      return;
    }
    
    if (isNaN(endTime)) {
      console.error("Invalid endTime calculated:", { 
        expiresAt: session.expiresAt,
        startTime: session.startTime,
        sessionDuration 
      });
      setTime(sessionDuration);
      return;
    }
    
    console.log("Session end time calculated:", new Date(endTime).toISOString());
    setSessionEndTime(endTime);

    sessionTimerRef.current = setInterval(() => {
      const currentTime = Date.now() + serverTimeOffset;
      const remainingTime = Math.max(
        0,
        Math.floor((endTime - currentTime) / 1000)
      );

      if (remainingTime <= 0) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
        
        // Prevent multiple completions
        if (!sessionCompletedRef.current) {
          sessionCompletedRef.current = true;
          audio.play().catch((error) => console.error("Error playing alarm:", error));
          
          // Use the updated completion function
          completeGroupSession();
          
          setTime(0);
          setIsActive(false);
        }
      } else {
        setTime(remainingTime);
      }
    }, 1000);
  }
  else if (!isInSession && isActive) {
    // Personal timer logic (unchanged)
    sessionTimerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(sessionTimerRef.current);
          sessionTimerRef.current = null;
          audio.play().catch((error) => console.error("Error playing alarm:", error));
          
          if (timerType === 'pomodoro') {
            updateUserStats(pomodoroDuration);
          }
          
          handleTimerCompletion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }

  return () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };
}, [isActive, isInSession, sessionStarted, session, serverTimeOffset, sessionDuration, pomodoroDuration]);

  const handleTimerCompletion = () => {
    setIsActive(false);
    setTimerSessionStarted(false);

    if (timerType === 'pomodoro') {
      const newCycleCount = currentCycleCount + 1;
      setCurrentCycleCount(newCycleCount);

      if (newCycleCount % 3 === 0) {
        setTimerType('longBreak');
        setTime(longBreakDuration);
      } else {
        setTimerType('shortBreak');
        setTime(shortBreakDuration);
      }
    } else if (timerType === 'shortBreak' || timerType === 'longBreak') {
      setTimerType('pomodoro');
      setTime(pomodoroDuration);
    }
  };

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

  // REMOVED localStorage effects for background - now purely database driven

  useEffect(() => {
    setParticipantsList(participantNames || []);
  }, [participantNames]);

  // UPDATED: Fetch user data and set all settings from database
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch("http://localhost:5000/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUsername(data.username);
        // REMOVED: localStorage.setItem("username", data.username);
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
      const response = await fetch(
        `http://localhost:5000/profile/${currentUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }
      const data = await response.json();
      setTotalTimeStudied(data.totalTimeStudied);
      setCompletedSessions(data.sessionsCompleted || 0);

      // Set background from database (not localStorage)
      if (data.background) {
        setBackground(data.background);
      }

      if (data.timerSettings) {
        setPomodoroDuration(data.timerSettings.pomodoro);
        setShortBreakDuration(data.timerSettings.shortBreak);
        setLongBreakDuration(data.timerSettings.longBreak);

        if (!timerSessionStarted && !isInSession && timerType === 'pomodoro') {
          setTime(data.timerSettings.pomodoro);
        }
      }

      setIsUserDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const updateUserStats = async (duration) => {
    try {
      const token = localStorage.getItem('userToken');
      const actualDuration = duration || (isInSession ? sessionDuration : pomodoroDuration);
      
      const response = await fetch("http://localhost:5000/session/complete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pomodoroDuration: actualDuration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user stats");
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
      if (timerSessionStarted || (isInSession && sessionStarted)) {
        event.preventDefault();
        event.returnValue = "You have an active session. Are you sure you want to leave?";
        return event.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [timerSessionStarted, isInSession, sessionStarted]);

  const toggleTimer = () => {
    if (isInSession && !sessionStarted && isCreator) {
      setIsLoadingSession(true);
      startSession().then((response) => {
        if (response) {
          if (response.serverTime) {
            const serverTime = new Date(response.serverTime).getTime();
            const clientTime = Date.now();
            const offset = serverTime - clientTime;
            setServerTimeOffset(offset);
            console.log("Server time offset set to:", offset);
          }

          if (response.expiresAt) {
            const serverEndTime = new Date(response.expiresAt).getTime();
            setSessionEndTime(serverEndTime);
          }
          
          setIsActive(true);
        }
        setIsLoadingSession(false);
      })
      .catch(error => {
        console.error("Error starting session:", error);
        setIsLoadingSession(false);
      });
    } else if (!isInSession) {
      if (!isActive && !timerSessionStarted) {
        setTimerSessionStarted(true);
      }
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    if (isInSession && sessionStarted) {
      return;
    }

    setIsActive(false);
    setTimerSessionStarted(false);
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
    if (isInSession && sessionStarted) {
      return;
    }
    if (timerSessionStarted) {
      const confirmed = window.confirm(
        "Changing timer type will reset your current session. Are you sure?"
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
    setTimerSessionStarted(false);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenEditModal = () => {
    if (isInSession && sessionStarted) {
      return;
    }
    setTempPomodoro(pomodoroDuration / 60);
    setTempShortBreak(shortBreakDuration / 60);
    setTempLongBreak(longBreakDuration / 60);
    setShowEditModal(true);
  };

  const handleSaveTimerSettings = async () => {
    const newPomodoro = tempPomodoro * 60;
    const newShortBreak = tempShortBreak * 60;
    const newLongBreak = tempLongBreak * 60;

    setPomodoroDuration(newPomodoro);
    setShortBreakDuration(newShortBreak);
    setLongBreakDuration(newLongBreak);

    if (!timerSessionStarted && !isInSession) {
      if (timerType === 'pomodoro') setTime(newPomodoro);
      else if (timerType === 'shortBreak') setTime(newShortBreak);
      else if (timerType === 'longBreak') setTime(newLongBreak);
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch("http://localhost:5000/profile/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timerSettings: {
            pomodoro: newPomodoro,
            shortBreak: newShortBreak,
            longBreak: newLongBreak,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save timer settings");
      }
    } catch (error) {
      console.error('Error saving timer settings:', error);
    }

    setShowEditModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleOpenBackgroundModal = () => {
    setShowBackgroundModal(true);
  };

  const handleCloseBackgroundModal = () => {
    setShowBackgroundModal(false);
  };

  // UPDATED: Background selection now purely database-driven
  const handleSelectBackground = async (backgroundId) => {
    setBackground(backgroundId);
    setShowBackgroundModal(false);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch("http://localhost:5000/profile/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          background: backgroundId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save background preference");
      }
    } catch (error) {
      console.error('Error saving background preference:', error);
      // Revert background if save failed
      const token = localStorage.getItem('userToken');
      const revertResponse = await fetch(`http://localhost:5000/profile/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (revertResponse.ok) {
        const data = await revertResponse.json();
        setBackground(data.background || 'default');
      }
    }
  };

  const handleExitSession = async () => {
    if (
      window.confirm(
        "Are you sure you want to exit the session? Your progress will be saved."
      )
    ) {
      try {
        if (sessionStarted && time < sessionDuration) {
          await updateUserStats(sessionDuration - time);
        }

        await leaveSession();

        setIsActive(false);
        setTimerSessionStarted(false);
        setTime(pomodoroDuration);
        setTimerType("pomodoro");

        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
          sessionTimerRef.current = null;
        }
      } catch (error) {
        console.error('Error exiting session:', error);
      }
    }
  };

  const navigateWithConfirmation = (path) => {
    if (isInSession || timerSessionStarted) {
      const confirmed = window.confirm(
        "You have an active session. Are you sure you want to leave this page? Your progress will be saved."
      );
      if (!confirmed) return;

      if (isInSession) {
        handleExitSession();
      }
    }
    navigate(path);
  };

  useEffect(() => {
    const handleNavigation = () => {
      if (isInSession || timerSessionStarted) {
        return "You have an active session. Are you sure you want to leave? Your progress will be saved.";
      }
    };

    window.onbeforeunload = handleNavigation;

    return () => {
      window.onbeforeunload = null;
    };
  }, [isInSession, timerSessionStarted]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isMobile = windowWidth < 768;
  const isSmallScreen = windowWidth < 1024;
  const isExtraSmallScreen = windowWidth < 640;

  // Don't render until user data is loaded to prevent flash
  if (!isUserDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 border-2 border-white rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter transition-colors duration-500 select-none overflow-x-hidden">
      {renderBackground()}

      <div className="relative">
        <Header
          username={username}
          isTimerActive={sessionStarted || timerSessionStarted}
          isMobile={isMobile}
          onToggleMenu={toggleMobileMenu}
          navigateWithConfirmation={navigateWithConfirmation}
        />

        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 bg-black/80 z-40 flex flex-col">
            <div className="flex justify-end p-4">
              <button onClick={toggleMobileMenu} className="text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 p-6">
              <button
                onClick={() => {
                  toggleMobileMenu();
                  navigateWithConfirmation("/leaderboard");
                }}
                className="w-full bg-zinc-800 text-white p-4 rounded-xl"
              >
                Leaderboard
              </button>
              <button
                onClick={() => {
                  if (timerSessionStarted) {
                    handleExitSession();
                    console.log('Exited!')
                  }
                  toggleMobileMenu();
                  navigateWithConfirmation(`/profile/${username}`);
                }}
                className="w-full bg-zinc-800 text-white p-4 rounded-xl"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  if (isInSession || timerSessionStarted) {
                    const confirmed = window.confirm(
                      "You have an active session. Are you sure you want to log out?"
                    );
                    if (!confirmed) return;
                    if (isInSession) handleExitSession();
                  }
                  localStorage.removeItem("userToken");
                  navigate("/login");
                }}
                className="w-full bg-zinc-800 text-white p-4 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`max-w-[1500px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 lg:py-12`}
      >
        <div
          className={`grid grid-cols-1 ${isSmallScreen ? "lg:grid-cols-1" : "lg:grid-cols-4"} gap-4 md:gap-6 lg:gap-8`}
        >
          <div
            className={`${isSmallScreen ? "order-2" : "lg:col-span-1 order-2 lg:order-1"}`}
          >
            <MemoizedTaskList />
          </div>

          <div
            className={`${isSmallScreen ? "order-1" : "lg:col-span-2 order-1 lg:order-2"}`}
          >
            <div className="bg-zinc-950/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
              <div className="flex justify-center mb-6 md:mb-12">
                <div
                  className={`mb-2 flex gap-2 sm:gap-4 bg-zinc-900/30 border border-gray-800 p-1 rounded-lg ${isExtraSmallScreen ? "text-xs" : "text-sm"}`}
                >
                  <button
                    onClick={() => handleTimerTypeChange("pomodoro")}
                    disabled={isInSession}
                    className={`px-2 sm:px-4 md:px-6 py-2 rounded-lg transition-colors ${
                      timerType === "pomodoro"
                        ? "bg-zinc-800 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Pomodoro
                  </button>
                  <button
                    onClick={() => handleTimerTypeChange("shortBreak")}
                    disabled={isInSession}
                    className={`px-2 sm:px-4 md:px-6 py-2 rounded-lg transition-colors ${
                      timerType === "shortBreak"
                        ? "bg-zinc-800 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Short Break
                  </button>
                  <button
                    onClick={() => handleTimerTypeChange("longBreak")}
                    disabled={isInSession}
                    className={`px-2 sm:px-4 md:px-6 py-2 rounded-lg transition-colors ${
                      timerType === "longBreak"
                        ? "bg-zinc-800 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Long Break
                  </button>
                </div>
              </div>

              <div className="text-center mb-8 md:mb-6">
                <h2
                className={`font-inter tracking-widest text-white ${
                  isExtraSmallScreen
                    ? "text-5xl"
                    : windowWidth < 1080
                      ? "text-6xl"
                      : windowWidth > 1350
                        ? "text-8xl"
                        : "text-7xl"
                } font-bold`}
                >
                  {formatTime(time)}
                </h2>
              </div>

              <div className="flex justify-center  gap-4 md:gap-6 mb-8 md:mb-6">
                {(!isInSession ||
                  (isInSession && isCreator && !sessionStarted)) && (
                  <button
                    onClick={toggleTimer}
                    disabled={isLoadingSession}
                    className={`${
                      isInSession && !sessionStarted && isCreator
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-zinc-900/30 hover:bg-zinc-800"
                    } text-white p-4 md:p-6 rounded-full border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${
                      isLoadingSession ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoadingSession ? (
                      <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : isActive ? (
                      <Pause
                        className={`${isExtraSmallScreen ? "w-6 h-6" : "w-8 h-8"}`}
                      />
                    ) : (
                      <Play
                        className={`${isExtraSmallScreen ? "w-6 h-6" : "w-8 h-8"}`}
                      />
                    )}
                  </button>
                )}

                {!isInSession && (
                  <button
                    onClick={resetTimer}
                    className="bg-zinc-900/30 text-white p-4 md:p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                  >
                    <RotateCcw
                      className={`${isExtraSmallScreen ? "w-6 h-6" : "w-8 h-8"}`}
                    />
                  </button>
                )}
              </div>

              {isInSession &&
                !sessionStarted &&
                isCreator &&
                isLoadingSession && (
                  <div className="text-center mb-4 text-green-400">
                    <p>Starting session... waiting for participants to sync</p>
                  </div>
                )}

              {isInSession && (
                <div className="flex justify-center mb-4 md:mb-6">
                  <button
                    onClick={() => setShowParticipantsModal(true)}
                    className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl hover:bg-zinc-900 transition-colors"
                  >
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-white">
                      {participants}{" "}
                      {participants === 1 ? "Participant" : "Participants"}
                    </span>
                  </button>
                </div>
              )}

              <div className="flex justify-center gap-2 sm:gap-4">
                <button
                  onClick={handleOpenBackgroundModal}
                  className={`flex items-center gap-2 bg-zinc-900/30 text-white py-1 px-2 sm:py-2 sm:px-4 rounded-xl font-semibold hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${
                    isExtraSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  <Image size={isExtraSmallScreen ? 16 : 20} />
                  <span
                    className={`${isExtraSmallScreen ? "hidden" : "inline"}`}
                  >
                    Change Background
                  </span>
                </button>

                {(!isInSession || !sessionStarted) && (
                  <button
                    onClick={handleOpenEditModal}
                    disabled={isInSession}
                    className={`flex items-center gap-2 bg-zinc-900/30 text-white py-1 px-2 sm:py-2 sm:px-4 rounded-xl font-semibold hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${
                      isExtraSmallScreen ? "text-xs" : "text-sm"
                    }`}
                  >
                    <Clock size={isExtraSmallScreen ? 16 : 20} />
                    <span
                      className={`${isExtraSmallScreen ? "hidden" : "inline"}`}
                    >
                      Edit Times
                    </span>
                  </button>
                )}
                
                {isInSession && sessionStarted && (
                  <button
                    onClick={handleExitSession}
                    className={`flex items-center gap-2 bg-red-900/30 text-white py-1 px-2 sm:py-2 sm:px-4 rounded-xl font-semibold hover:bg-red-800/50 border border-red-800/30 transition duration-300 shadow-lg hover:shadow-red-900/25 ${
                      isExtraSmallScreen ? "text-xs" : "text-sm"
                    }`}
                  >
                    <LogOut size={isExtraSmallScreen ? 16 : 20} />
                    <span className={`${isExtraSmallScreen ? "hidden" : "inline"}`}>
                      Exit Session
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <GroupSession handleExitSession={handleExitSession} />
            </div>
          </div>

          <div
            className={`${isSmallScreen ? "order-3" : "lg:col-span-1 order-3"}`}
          >
            <div className="mb-4">
              <MemoizedMusicPlayer isSmallScreen={isExtraSmallScreen} />
            </div>
            <MemoizedQuoteSection isSmallScreen={isExtraSmallScreen} />
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div
            className={`bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-lg ${isExtraSmallScreen ? "w-11/12" : "w-80"}`}
          >
            <h3 className="text-lg sm:text-xl text-white mb-4">
              Edit Timer Durations
            </h3>
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-white mb-1">Pomodoro (min):</label>
                <input
                  type="number"
                  min="1"
                  value={tempPomodoro}
                  onChange={(e) =>
                    setTempPomodoro(parseInt(e.target.value, 10))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Short Break (min):
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempShortBreak}
                  onChange={(e) =>
                    setTempShortBreak(parseInt(e.target.value, 10))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Long Break (min):
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempLongBreak}
                  onChange={(e) =>
                    setTempLongBreak(parseInt(e.target.value, 10))
                  }
                  className="w-full p-2 rounded bg-zinc-800 text-white text-center"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseEditModal}
                className="px-3 sm:px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTimerSettings}
                className="px-3 sm:px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <BackgroundModal
        isOpen={showBackgroundModal}
        onClose={handleCloseBackgroundModal}
        onSelect={handleSelectBackground}
        currentBackground={background}
        isSmallScreen={isExtraSmallScreen}
      />
      <SessionParticipantsModal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        participantsList={participantsList}
      />
    </div>
  );
}

export default Dashboard;