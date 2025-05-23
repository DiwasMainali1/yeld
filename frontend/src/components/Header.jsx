import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Menu, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import LeaderboardModal from './custom-components/LeaderboardModal';

import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';
import sageGif from './pet-components/pet-assets/sage.gif';
import sageIdlePng from './pet-components/pet-assets/sage-idle.png';
import PetModal from './pet-components/PetModal';

const animalAvatars = {
  fox: foxImage,
  owl: owlImage,
  panda: pandaImage,
  penguin: penguinImage,
  koala: koalaImage
};

// Thought bubble messages for idle state
const thoughtBubbles = [
  "🌟",
  "💭",
  "✨",
  "🎯",
  "💡",
  "🚀",
  "⭐",
  "🌙",
  "☁️",
  "🌈"
];

function Header({ username, isTimerActive }) {
    const navigate = useNavigate();
    const [userAvatar, setUserAvatar] = useState('fox');
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showPetModal, setShowPetModal] = useState(false);
    
    const [sageVisible, setSageVisible] = useState(false);
    const [sagePosition, setSagePosition] = useState({ x: 200, y: 200 });
    const [sageSelected, setSageSelected] = useState(false);
    const [sageTarget, setSageTarget] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [sageRotation, setSageRotation] = useState(0);
    const [showTrail, setShowTrail] = useState(false);
    const [trailPositions, setTrailPositions] = useState([]);
    
    // New idle animation states
    const [showThoughtBubble, setShowThoughtBubble] = useState(false);
    const [currentThought, setCurrentThought] = useState('');
    const [idleAnimation, setIdleAnimation] = useState('');
    
    const sageRef = useRef(null);
    const animationRef = useRef(null);
    const idleTimerRef = useRef(null);
    const thoughtTimerRef = useRef(null);

    const MOVEMENT_SPEED = 200;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Determine which image to show based on state
    const getSageImage = () => {
        return (sageSelected || isMoving) ? sageGif : sageIdlePng;
    };

    // Start idle animations when sage is visible and not moving/selected
    useEffect(() => {
        if (sageVisible && !isMoving && !sageSelected) {
            // Random subtle animations every 3-8 seconds
            const startIdleAnimations = () => {
                const animations = ['bounce-subtle', 'sway', 'glow-pulse', 'bob'];
                const randomDelay = Math.random() * 2000 + 2000;
                
                idleTimerRef.current = setTimeout(() => {
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    setIdleAnimation(randomAnimation);
                    
                    // Clear animation after 2 seconds
                    setTimeout(() => setIdleAnimation(''), 4000);
                    
                    // Schedule next animation
                    startIdleAnimations();
                }, randomDelay);
            };

            // Random thought bubbles every 10-20 seconds
            const startThoughtBubbles = () => {
                const randomDelay = Math.random() * 10000 + 10000; // 10-20 seconds
                
                thoughtTimerRef.current = setTimeout(() => {
                    const randomThought = thoughtBubbles[Math.floor(Math.random() * thoughtBubbles.length)];
                    setCurrentThought(randomThought);
                    setShowThoughtBubble(true);
                    
                    // Hide thought bubble after 3 seconds
                    setTimeout(() => setShowThoughtBubble(false), 3000);
                    
                    // Schedule next thought
                    startThoughtBubbles();
                }, randomDelay);
            };

            startIdleAnimations();
            startThoughtBubbles();
        }

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
        };
    }, [sageVisible, isMoving, sageSelected]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!sageTarget || !isMoving) return;

        const startPosition = { ...sagePosition };
        const targetPosition = { ...sageTarget };
        
        const deltaX = targetPosition.x - startPosition.x;
        const deltaY = targetPosition.y - startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = (distance / MOVEMENT_SPEED) * 1000;
        
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        setSageRotation(angle);
        setShowTrail(true);
        
        const startTime = Date.now();
        const trailHistory = [];

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);
            const progress = easeOutCubic(rawProgress);
            
            const currentX = startPosition.x + (deltaX * progress);
            const currentY = startPosition.y + (deltaY * progress);
            
            setSagePosition({ x: currentX, y: currentY });
            
            trailHistory.push({ x: currentX, y: currentY, time: Date.now() });
            const recentTrail = trailHistory.filter(pos => Date.now() - pos.time < 300);
            setTrailPositions(recentTrail);
            
            if (rawProgress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsMoving(false);
                setSageTarget(null);
                setSageSelected(false);
                setSageRotation(0);
                setShowTrail(false);
                setTrailPositions([]);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setShowTrail(false);
            setTrailPositions([]);
        };
    }, [sageTarget, isMoving, sagePosition, MOVEMENT_SPEED]);

    useEffect(() => {
        const handlePageClick = (e) => {
            if (sageSelected && sageRef.current && !sageRef.current.contains(e.target)) {
                if (isMoving) return;
                
                const rect = document.body.getBoundingClientRect();
                const x = e.clientX - rect.left - 80;
                const y = e.clientY - rect.top - 80;
                
                setSageTarget({ x, y });
                setIsMoving(true);
            }
            else if (sageRef.current && !sageRef.current.contains(e.target)) {
                setSageSelected(false);
            }
        };

        if (sageVisible) {
            document.addEventListener('click', handlePageClick);
        }

        return () => {
            document.removeEventListener('click', handlePageClick);
        };
    }, [sageSelected, sageVisible, isMoving]);

    const handleEggClick = () => {
        console.log('Egg clicked! Spawning sage...');
        setSageVisible(true);
        setSagePosition({ x: 200, y: 150 }); 
        setShowPetModal(false); 
    };

    const handleSageClick = (e) => {
        e.stopPropagation();
        if (!isMoving) {
            setSageSelected(!sageSelected);
        }
    };

    // Get idle animation classes
    const getIdleAnimationClass = () => {
        switch(idleAnimation) {
            case 'bounce-subtle':
                return 'animate-bounce-subtle';
            case 'sway':
                return 'animate-sway';
            case 'glow-pulse':
                return 'animate-glow-pulse';
            case 'bob':
                return 'animate-bob';
            default:
                return '';
        }
    };

    useEffect(() => {
        const fetchUserAvatar = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const response = await fetch(`http://localhost:5000/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.avatar && animalAvatars[data.avatar]) {
                        setUserAvatar(data.avatar);
                    }
                }
            } catch (error) {
                console.error('Error fetching user avatar:', error);
            }
        };

        if (username) {
            fetchUserAvatar();
        }
    }, [username]);

    const handleLogout = () => {
        if (isTimerActive) {
            const confirmed = window.confirm('You have an active session. Are you sure you want to logout?');
            if (!confirmed) return;
        }
        localStorage.removeItem('userToken');
        setMobileMenuOpen(false);
        navigate('/login');
    };
    
    const handleProfile = () => {
        if (isTimerActive) {
            const confirmed = window.confirm('You have an active session. Are you sure you want to leave this page?');
            if (!confirmed) return;
        }
        setMobileMenuOpen(false);
        navigate(`/profile/${username}`);
    };

    const handleDashboard = () => {
        if (isTimerActive) {
            const confirmed = window.confirm('You have an active session. Are you sure you want to leave this page?');
            if (!confirmed) return;
        }
        setMobileMenuOpen(false);
        navigate('/dashboard');
    };

    const toggleLeaderboard = () => {
        setMobileMenuOpen(false);
        setShowLeaderboard(!showLeaderboard);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleSilverEgg = () => {
        setShowPetModal(true);
    };

    return (
        <>
            <style jsx>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-5px) rotate(0deg); }
                }
                
                @keyframes sway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                
                @keyframes glow-pulse {
                    0%, 100% { filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5)); }
                    50% { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 1)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5)); }
                }
                
                @keyframes bob {
                    0%, 100% { transform: translateY(0px); }
                    25% { transform: translateY(-3px); }
                    75% { transform: translateY(3px); }
                }
                
                @keyframes thought-bubble-appear {
                    0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0px); }
                }
                
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out;
                }
                
                .animate-sway {
                    animation: sway 3s ease-in-out;
                }
                
                .animate-glow-pulse {
                    animation: glow-pulse 2s ease-in-out;
                }
                
                .animate-bob {
                    animation: bob 2.5s ease-in-out;
                }
                
                .thought-bubble-enter {
                    animation: thought-bubble-appear 0.5s ease-out;
                }
            `}</style>

            <nav className="w-full h-16 md:h-20 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/30 backdrop-blur-sm relative">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <button 
                            onClick={toggleMobileMenu}
                            className="text-white"
                            aria-label="Toggle mobile menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    
                    <button 
                        onClick={handleDashboard}
                        className="hover:scale-105 transition-transform"
                    >
                        <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-3xl md:text-4xl font-bold tracking-tight">
                            Yeld
                        </h1>
                    </button>

                    {!isMobile && (
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                                <img 
                                    src={animalAvatars[userAvatar]} 
                                    alt={userAvatar} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-gray-200 font-medium">Welcome back, {username}</span>
                        </div>
                    )}
                </div>
                {isMobile && (
                    <button
                        onClick={handleSilverEgg}
                        className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                    >
                    </button>
                )}
                
                {!isMobile && (
                    <div className="flex flex-row gap-4 items-center">
                        <button
                        onClick={handleSilverEgg}
                        className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                        >
                        </button>
                        <button
                            className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900/30 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                            onClick={toggleLeaderboard}
                        >
                            <Trophy className="w-5 h-5 text-gray-300" />
                            Rankings
                        </button>
                        <button
                            className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900/30 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                            onClick={handleProfile}
                        >
                            <div className="w-5 h-5 rounded-full overflow-hidden">
                                <img 
                                    src={animalAvatars[userAvatar]} 
                                    alt={userAvatar} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900/30 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {sageVisible && (
                <>
                    {showTrail && trailPositions.map((pos, index) => (
                        <div
                            key={index}
                            className="fixed z-30 pointer-events-none"
                            style={{
                                left: `${pos.x + 96}px`,
                                top: `${pos.y + 96}px`,
                                opacity: (index / trailPositions.length) * 0.6,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div 
                                className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                                style={{
                                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
                                    animation: `pulse 0.5s ease-in-out infinite`,
                                }}
                            />
                        </div>
                    ))}
                    
                    <div
                        ref={sageRef}
                        onClick={handleSageClick}
                        className={`fixed z-40 cursor-pointer transition-all duration-200 ${
                            !isMoving ? 'hover:scale-105' : 'scale-110'
                        } ${isMoving ? 'animate-bounce' : getIdleAnimationClass()}`}
                        style={{
                            left: `${sagePosition.x}px`,
                            top: `${sagePosition.y}px`,
                            transform: `rotate(${sageRotation}deg)`,
                            transition: isMoving ? 'none' : 'transform 0.3s ease-out',
                        }}
                    >
                        <img
                            src={getSageImage()}
                            alt="Sage the chicken"
                            className={`w-48 h-48 object-contain pointer-events-none ${
                                isMoving ? 'animate-pulse' : ''
                            }`}
                            draggable={false}
                            style={{
                                imageRendering: 'crisp-edges',
                                filter: idleAnimation === 'glow-pulse' ? undefined : 
                                    'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
                            }}
                        />
                        
                        {/* Thought bubble */}
                        {showThoughtBubble && !sageSelected && !isMoving && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 thought-bubble-enter">
                                <div className="relative bg-white rounded-full p-3 shadow-lg border-2 border-gray-200">
                                    <span className="text-2xl">{currentThought}</span>
                                    {/* Thought bubble tail */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {sageSelected && !isMoving && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                                Time to fly!
                            </div>
                        )}
                        
                        {isMoving && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                    WOOOO!
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {isMobile && mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-zinc-900 border-l border-zinc-800 flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <img 
                                        src={animalAvatars[userAvatar]} 
                                        alt={userAvatar} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-gray-200 font-medium">{username}</span>
                            </div>
                            <button 
                                onClick={toggleMobileMenu}
                                className="text-white"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                            <button
                                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition duration-300"
                                onClick={handleDashboard}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Dashboard
                            </button>
                            <button
                                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition duration-300"
                                onClick={toggleLeaderboard}
                            >
                                <Trophy className="w-5 h-5" />
                                Leaderboard
                            </button>
                            <button
                                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition duration-300"
                                onClick={handleProfile}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Profile
                            </button>
                            <button
                                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition duration-300"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LeaderboardModal 
                isOpen={showLeaderboard} 
                onClose={() => setShowLeaderboard(false)} 
            />
            <PetModal
                isOpen={showPetModal}
                onClose={() => setShowPetModal(false)}
                onEggClick={handleEggClick}
            />
        </>
    );
}

export default Header;