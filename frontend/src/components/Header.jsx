import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Menu, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import LeaderboardModal from './custom-components/LeaderboardModal';

import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';

// Import all bird assets
import sageGif from './pet-components/pet-assets/sage.gif';
import sageIdlePng from './pet-components/pet-assets/sage-idle.png';
import noviceGif from './pet-components/pet-assets/novice.gif';
import noviceIdlePng from './pet-components/pet-assets/novice-idle.png';
import apprenticeGif from './pet-components/pet-assets/apprentice.gif';
import apprenticeIdlePng from './pet-components/pet-assets/apprentice-idle.png';
import scholarGif from './pet-components/pet-assets/scholar.gif';
import scholarIdlePng from './pet-components/pet-assets/scholar-idle.png';
import masterGif from './pet-components/pet-assets/master.gif';
import masterIdlePng from './pet-components/pet-assets/master-idle.png';

import PetModal from './pet-components/PetModal';
import PetSelectionModal from './pet-components/PetSelectionModal'; // New component

const animalAvatars = {
  fox: foxImage,
  owl: owlImage,
  panda: pandaImage,
  penguin: penguinImage,
  koala: koalaImage
};

// Bird assets mapping based on rank
const birdAssets = {
  novice: {
    gif: noviceGif,
    idle: noviceIdlePng,
    name: 'Novice Bird'
  },
  apprentice: {
    gif: apprenticeGif,
    idle: apprenticeIdlePng,
    name: 'Apprentice Bird'
  },
  scholar: {
    gif: scholarGif,
    idle: scholarIdlePng,
    name: 'Scholar Bird'
  },
  sage: {
    gif: sageGif,
    idle: sageIdlePng,
    name: 'Sage'
  },
  master: {
    gif: masterGif,
    idle: masterIdlePng,
    name: 'Master Bird'
  }
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
    const [userRank, setUserRank] = useState('novice'); // Track user's rank
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showPetModal, setShowPetModal] = useState(false);
    const [showPetSelectionModal, setShowPetSelectionModal] = useState(false);
    
    // Pet state management
    const [hasHatchedPet, setHasHatchedPet] = useState(false);
    const [unlockedPets, setUnlockedPets] = useState([]);
    const [activePet, setActivePet] = useState(null);
    
    const [birdVisible, setBirdVisible] = useState(false);
    const [birdPosition, setBirdPosition] = useState({ x: 200, y: 200 });
    const [birdSelected, setBirdSelected] = useState(false);
    const [birdTarget, setBirdTarget] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [birdRotation, setBirdRotation] = useState(0);
    const [showTrail, setShowTrail] = useState(false);
    const [trailPositions, setTrailPositions] = useState([]);
    
    // New idle animation states
    const [showThoughtBubble, setShowThoughtBubble] = useState(false);
    const [currentThought, setCurrentThought] = useState('');
    const [idleAnimation, setIdleAnimation] = useState('');
    
    const birdRef = useRef(null);
    const animationRef = useRef(null);
    const idleTimerRef = useRef(null);
    const thoughtTimerRef = useRef(null);

    const MOVEMENT_SPEED = 200;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Load pet data from localStorage on mount
    useEffect(() => {
        const savedPetData = localStorage.getItem(`petData_${username}`);
        if (savedPetData) {
            const petData = JSON.parse(savedPetData);
            setHasHatchedPet(petData.hasHatched || false);
            setUnlockedPets(petData.unlockedPets || []);
            setActivePet(petData.activePet || null);
            
            // If there's an active pet, show it
            if (petData.activePet && petData.hasHatched) {
                setBirdVisible(true);
            }
        }
    }, [username]);

    // Save pet data whenever it changes
    useEffect(() => {
        if (username) {
            const petData = {
                hasHatched: hasHatchedPet,
                unlockedPets: unlockedPets,
                activePet: activePet
            };
            localStorage.setItem(`petData_${username}`, JSON.stringify(petData));
        }
    }, [hasHatchedPet, unlockedPets, activePet, username]);

    // Get current bird assets based on rank or active pet
    const getCurrentBirdAssets = () => {
        // If there's a specific active pet selected, use that
        if (activePet && birdAssets[activePet]) {
            return birdAssets[activePet];
        }
        // Otherwise use rank-based pet
        return birdAssets[userRank] || birdAssets.novice;
    };

    // Determine which image to show based on state and rank
    const getBirdImage = () => {
        const assets = getCurrentBirdAssets();
        
        // For master rank, only show gif when selected, no movement
        if (userRank === 'master' || (activePet === 'master')) {
            return birdSelected ? assets.gif : assets.idle;
        }
        
        // For other ranks, show gif when selected or moving
        return (birdSelected || isMoving) ? assets.gif : assets.idle;
    };

    // Get user rank based on total hours studied
    const getUserRank = (totalHours) => {
        if (totalHours >= 50) return 'master';
        if (totalHours >= 20) return 'sage';
        if (totalHours >= 10) return 'scholar';
        if (totalHours >= 5) return 'apprentice';
        return 'novice';
    };

    // Update unlocked pets based on rank
    useEffect(() => {
        const newUnlockedPets = ['novice']; // Always have novice unlocked
        
        if (userRank === 'apprentice' || userRank === 'scholar' || userRank === 'sage' || userRank === 'master') {
            newUnlockedPets.push('apprentice');
        }
        if (userRank === 'scholar' || userRank === 'sage' || userRank === 'master') {
            newUnlockedPets.push('scholar');
        }
        if (userRank === 'sage' || userRank === 'master') {
            newUnlockedPets.push('sage');
        }
        if (userRank === 'master') {
            newUnlockedPets.push('master');
        }
        
        setUnlockedPets(newUnlockedPets);
        
        // If no active pet is set, set it to the current rank
        if (!activePet && hasHatchedPet) {
            setActivePet(userRank);
        }
    }, [userRank, activePet, hasHatchedPet]);

    // Start idle animations when bird is visible and not moving/selected
    useEffect(() => {
        if (birdVisible && !isMoving && !birdSelected) {
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
    }, [birdVisible, isMoving, birdSelected]);

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
        // Skip movement animation for master rank
        const currentPetRank = activePet || userRank;
        if (currentPetRank === 'master' || !birdTarget || !isMoving) return;

        const startPosition = { ...birdPosition };
        const targetPosition = { ...birdTarget };
        
        const deltaX = targetPosition.x - startPosition.x;
        const deltaY = targetPosition.y - startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = (distance / MOVEMENT_SPEED) * 1000;
        
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        setBirdRotation(angle);
        setShowTrail(true);
        
        const startTime = Date.now();
        const trailHistory = [];

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);
            const progress = easeOutCubic(rawProgress);
            
            const currentX = startPosition.x + (deltaX * progress);
            const currentY = startPosition.y + (deltaY * progress);
            
            setBirdPosition({ x: currentX, y: currentY });
            
            trailHistory.push({ x: currentX, y: currentY, time: Date.now() });
            const recentTrail = trailHistory.filter(pos => Date.now() - pos.time < 300);
            setTrailPositions(recentTrail);
            
            if (rawProgress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsMoving(false);
                setBirdTarget(null);
                setBirdSelected(false);
                setBirdRotation(0);
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
    }, [birdTarget, isMoving, birdPosition, MOVEMENT_SPEED, userRank, activePet]);

    useEffect(() => {
        const handlePageClick = (e) => {
            const currentPetRank = activePet || userRank;
            if (birdSelected && birdRef.current && !birdRef.current.contains(e.target)) {
                // For master rank, don't allow movement - just deselect
                if (currentPetRank === 'master') {
                    setBirdSelected(false);
                    return;
                }
                
                if (isMoving) return;
                
                const rect = document.body.getBoundingClientRect();
                const x = e.clientX - rect.left - 80;
                const y = e.clientY - rect.top - 80;
                
                setBirdTarget({ x, y });
                setIsMoving(true);
            }
            else if (birdRef.current && !birdRef.current.contains(e.target)) {
                setBirdSelected(false);
            }
        };

        if (birdVisible) {
            document.addEventListener('click', handlePageClick);
        }

        return () => {
            document.removeEventListener('click', handlePageClick);
        };
    }, [birdSelected, birdVisible, isMoving, userRank, activePet]);

    const handleEggClick = () => {
        console.log('Egg clicked! Spawning bird...');
        setHasHatchedPet(true);
        setBirdVisible(true);
        setBirdPosition({ x: 200, y: 150 }); 
        setShowPetModal(false);
        
        // Set the active pet to the current rank
        setActivePet(userRank);
    };

    const handleBirdClick = (e) => {
        e.stopPropagation();
        if (!isMoving) {
            setBirdSelected(!birdSelected);
        }
    };

    const handlePetIconClick = () => {
        if (unlockedPets.length > 1) {
            setShowPetSelectionModal(true);
        } else {
            // Toggle bird visibility if only one pet
            setBirdVisible(!birdVisible);
        }
    };

    const handlePetSelection = (selectedPet) => {
        setActivePet(selectedPet);
        setBirdVisible(true);
        setShowPetSelectionModal(false);
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
                    
                    // Calculate and set user rank based on total time studied
                    const totalHours = data.totalTimeStudied / 60;
                    const rank = getUserRank(totalHours);
                    setUserRank(rank);
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
                    hasHatchedPet ? (
                        <button
                            onClick={handlePetIconClick}
                            className="relative w-10 h-10 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-lg"
                        >
                            <img 
                                src={getCurrentBirdAssets().idle} 
                                alt="Pet"
                                className="w-8 h-8 object-contain"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                            {unlockedPets.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                                    {unlockedPets.length}
                                </span>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleSilverEgg}
                            className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                        >
                        </button>
                    )
                )}
                
                {!isMobile && (
                    <div className="flex flex-row gap-4 items-center">
                        {hasHatchedPet ? (
                            <button
                                onClick={handlePetIconClick}
                                className="relative w-10 h-10 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-lg"
                            >
                                <img 
                                    src={getCurrentBirdAssets().idle} 
                                    alt="Pet"
                                    className="w-8 h-8 object-contain"
                                    style={{ imageRendering: 'crisp-edges' }}
                                />
                                {unlockedPets.length > 1 && (
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                                        {unlockedPets.length}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleSilverEgg}
                                className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                            >
                            </button>
                        )}
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

            {birdVisible && (
                <>
                    {showTrail && (activePet !== 'master' && userRank !== 'master') && trailPositions.map((pos, index) => (
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
                        ref={birdRef}
                        onClick={handleBirdClick}
                        className={`fixed z-40 cursor-pointer transition-all duration-200 ${
                            !isMoving ? 'hover:scale-120' : 'scale-120'
                        } ${isMoving && (activePet !== 'master' && userRank !== 'master') ? 'animate-bounce' : getIdleAnimationClass()}`}
                        style={{
                            left: `${birdPosition.x}px`,
                            top: `${birdPosition.y}px`,
                            transform: (activePet !== 'master' && userRank !== 'master') ? `rotate(${birdRotation}deg)` : 'rotate(0deg)',
                            transition: isMoving ? 'none' : 'transform 0.3s ease-out',
                        }}
                    >
                        <img
                        src={getBirdImage()}
                        alt={getCurrentBirdAssets().name}
                        className={`${getBirdImage().includes('.gif') ? 'w-44 h-44' : 'w-36 h-36'} object-contain pointer-events-none ${
                            isMoving && (activePet !== 'master' && userRank !== 'master') ? 'animate-pulse' : ''
                        }`}
                        draggable={false}
                        style={{
                            imageRendering: 'crisp-edges',
                            filter: idleAnimation === 'glow-pulse' ? undefined : 
                                'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
                        }}
                        />
                        
                        {/* Thought bubble */}
                        {showThoughtBubble && !birdSelected && !isMoving && (
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
                        
                        {birdSelected && !isMoving && (activePet !== 'master') && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                                Time to fly!
                            </div>
                        )}
                        
                        {birdSelected && (activePet === 'master') && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                Majestic Master!
                            </div>
                        )}
                        
                        {isMoving && (activePet !== 'master') && (
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
            {!hasHatchedPet && (
                <PetModal
                    isOpen={showPetModal}
                    onClose={() => setShowPetModal(false)}
                    onEggClick={handleEggClick}
                />
            )}
            {showPetSelectionModal && (
                <PetSelectionModal
                    isOpen={showPetSelectionModal}
                    onClose={() => setShowPetSelectionModal(false)}
                    unlockedPets={unlockedPets}
                    activePet={activePet}
                    onSelectPet={handlePetSelection}
                    birdAssets={birdAssets}
                />
            )}
        </>
    );
}

export default Header;