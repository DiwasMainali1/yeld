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

// Thought bubble messages for each pet type
const thoughtBubbles = {
  novice: ["🌱", "📚", "💭", "⭐"],
  apprentice: ["⚡", "🔥", "✨", "🎯"],
  scholar: ["🧠", "💡", "🔮", "🌟"],
  sage: ["🧙‍♂️", "🌙", "💫", "🔱"],
  master: ["👑", "💎", "🦅", "⚡", "🌈", "🔥"]
};

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
    const [unlockedPets, setUnlockedPets] = useState(['novice']);
    const [activePet, setActivePet] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);
    
    const [birdVisible, setBirdVisible] = useState(false);
    const [birdPosition, setBirdPosition] = useState({ x: 200, y: 200 });
    const [birdSelected, setBirdSelected] = useState(false);
    const [birdTarget, setBirdTarget] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [birdRotation, setBirdRotation] = useState(0);
    const [showTrail, setShowTrail] = useState(false);
    const [trailPositions, setTrailPositions] = useState([]);
    
    // Enhanced animation states
    const [showThoughtBubble, setShowThoughtBubble] = useState(false);
    const [currentThought, setCurrentThought] = useState('');
    const [idleAnimation, setIdleAnimation] = useState('');
    const [auraParticles, setAuraParticles] = useState([]);
    const [masterLightning, setMasterLightning] = useState([]);
    
    const birdRef = useRef(null);
    const animationRef = useRef(null);
    const idleTimerRef = useRef(null);
    const thoughtTimerRef = useRef(null);
    const auraTimerRef = useRef(null);

    const MOVEMENT_SPEED = 200;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Get user rank based on total hours studied
    const getUserRank = (totalHours) => {
        if (totalHours >= 50) return 'master';
        if (totalHours >= 20) return 'sage';
        if (totalHours >= 10) return 'scholar';
        if (totalHours >= 5) return 'apprentice';
        return 'novice';
    };

    // Get pet-specific effects
    const getPetEffects = (petType) => {
        switch(petType) {
            case 'novice':
                return {
                    filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                    auraColor: 'rgba(34, 197, 94, 0.3)',
                    trailColor: 'rgb(34, 197, 94)',
                    glowColor: 'rgba(34, 197, 94, 0.8)'
                };
            case 'apprentice':
                return {
                    filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 6px rgba(147, 51, 234, 0.5)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                    auraColor: 'rgba(59, 130, 246, 0.4)',
                    trailColor: 'rgb(59, 130, 246)',
                    glowColor: 'rgba(59, 130, 246, 0.9)'
                };
            case 'scholar':
                return {
                    filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 8px rgba(236, 72, 153, 0.6)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                    auraColor: 'rgba(168, 85, 247, 0.1)',
                    trailColor: 'rgb(168, 85, 247)',
                    glowColor: 'rgba(168, 85, 247, 1)'
                };
            case 'sage':
                return {
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 10px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 5px rgba(239, 68, 68, 0.5)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                    auraColor: 'rgba(251, 191, 36, 0.6)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 1)'
                };
            case 'master':
                return {
                    filter: 'drop-shadow(0 0 15px rgba(255, 69, 0, 0.8)) drop-shadow(0 0 10px rgba(255, 140, 0, 0.6)) drop-shadow(0 0 8px rgba(255, 165, 0, 0.5)) drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)) drop-shadow(1px 1px 3px rgba(0,0,0,0.6))',
                    auraColor: 'rgba(255, 69, 0, 0.4)',
                    trailColor: 'rgb(255, 69, 0)',
                    glowColor: 'rgba(255, 69, 0, 0.8)'
                };
            default:
                return {
                    filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                    auraColor: 'rgba(251, 191, 36, 0.4)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 0.8)'
                };
        }
    };

    // Generate aura particles for higher-tier pets
    const generateAuraParticles = (petType) => {
        if (petType === 'novice' || petType === 'apprentice') return;
        
        const particleCount = petType === 'master' ? 8 : petType === 'sage' ? 6 : 4;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                angle: (360 / particleCount) * i,
                distance: petType === 'master' ? 10 : 10,
                speed: petType === 'master' ? 2 : 1,
                size: petType === 'master' ? 8 : 6,
                opacity: Math.random() * 0.7 + 0.3
            });
        }
        
        setAuraParticles(particles);
    };

    // Generate lightning effects for master
    const generateMasterLightning = () => {
        const lightning = [];
        for (let i = 0; i < 3; i++) {
            lightning.push({
                id: i,
                startX: Math.random() * 100 - 50,
                startY: Math.random() * 100 - 50,
                endX: Math.random() * 200 - 100,
                endY: Math.random() * 200 - 100,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
        setMasterLightning(lightning);
        
        setTimeout(() => setMasterLightning([]), 200);
    };

    const updatePetDataInDB = async (petData) => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch('http://localhost:5000/profile/update-pet-data', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ petData })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to update pet data:', response.status, errorText);
                throw new Error(`Failed to update pet data: ${response.status}`);
            }

            const result = await response.json();
        } catch (error) {
            console.error('Error updating pet data:', error);
        }
    };

    // Load user data from database on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!username) {
                setIsLoadingUserData(false);
                return;
            }

            try {
                setIsLoadingUserData(true);
                const token = localStorage.getItem('userToken');
                if (!token) {
                    console.error('No token found');
                    setIsLoadingUserData(false);
                    return;
                }
                const response = await fetch(`http://localhost:5000/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Set avatar
                    if (data.avatar && animalAvatars[data.avatar]) {
                        setUserAvatar(data.avatar);
                    }
                    
                    // Calculate and set user rank based on total time studied
                    const totalHours = data.totalTimeStudied / 60;
                    const rank = getUserRank(totalHours);
                    setUserRank(rank);
                    
                    // Set pet data from database with proper fallbacks
                    const petData = data.petData || {};
                    
                    const hasHatched = petData.hasHatched || false;
                    const unlocked = petData.unlockedPets || ['novice'];
                    const active = petData.activePet || null;
                    
                    setHasHatchedPet(hasHatched);
                    setUnlockedPets(unlocked);
                    setActivePet(active);
                    
                    
                    // Show bird if hatched and has active pet
                    if (hasHatched && active) {
                        setBirdVisible(true);
                    }
                } else {
                    console.error('Failed to fetch user data:', response.status, await response.text());
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoadingUserData(false);
            }
        };

        fetchUserData();
    }, [username]);

    // Save pet data to database whenever it changes (but not on initial load)
    useEffect(() => {
        // Skip saving during initial load
        if (isLoadingUserData || !username) return;
        
        // Only save if we have meaningful pet data changes
        if (hasHatchedPet || unlockedPets.length > 1 || activePet) {
            const petData = {
                hasHatched: hasHatchedPet,
                unlockedPets: unlockedPets,
                activePet: activePet
            };
            updatePetDataInDB(petData);
        }
    }, [hasHatchedPet, unlockedPets, activePet, username, isLoadingUserData]);

    // Get current bird assets based on rank or active pet
    const getCurrentBirdAssets = () => {
        // If there's a specific active pet selected, use that
        if (activePet && birdAssets[activePet]) {
            return birdAssets[activePet];
        }
        // Otherwise use rank-based pet
        return birdAssets[userRank] || birdAssets.novice;
    };

    // Get current pet type for effects
    const getCurrentPetType = () => {
        return activePet || userRank;
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

    // Update unlocked pets based on rank
    useEffect(() => {
        // Skip during initial load
        if (isLoadingUserData) return;

        const newUnlockedPets = ['novice']; 
        
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
        
        // If no active pet is set and the pet has hatched, set it to the current rank
        if (!activePet && hasHatchedPet) {
            setActivePet(userRank);
        }
    }, [userRank, activePet, hasHatchedPet, isLoadingUserData]);

    // Generate aura particles when pet changes
    useEffect(() => {
        if (birdVisible) {
            const currentPet = getCurrentPetType();
            generateAuraParticles(currentPet);
        }
    }, [birdVisible, activePet, userRank]);

    // Start idle animations when bird is visible and not moving/selected
    useEffect(() => {
        if (birdVisible && !isMoving && !birdSelected) {
            const currentPet = getCurrentPetType();
            
            // Pet-specific animations
            const startIdleAnimations = () => {
                let animations = [];
                
                switch(currentPet) {
                    case 'novice':
                        animations = ['bounce-subtle', 'sway'];
                        break;
                    case 'apprentice':
                        animations = ['electric-pulse', 'bounce-subtle', 'sway'];
                        break;
                    case 'scholar':
                        animations = ['wisdom-glow', 'float-gentle', 'sway'];
                        break;
                    case 'sage':
                        animations = ['mystical-aura', 'float-gentle', 'cosmic-pulse'];
                        break;
                    case 'master':
                        animations = ['royal-presence', 'lightning-aura', 'divine-float'];
                        break;
                    default:
                        animations = ['bounce-subtle', 'sway'];
                }
                
                // Random delay before starting animation (2-5 seconds)
                const randomDelay = Math.random() * 3000 + 2000;
                
                idleTimerRef.current = setTimeout(() => {
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    setIdleAnimation(randomAnimation);
                    
                    // Special effects for master
                    if (currentPet === 'master' && randomAnimation === 'lightning-aura') {
                        generateMasterLightning();
                    }
                    
                    // Animation duration based on pet type
                    const duration = currentPet === 'master' ? 6000 : 4000;
                    
                    // Clear animation after it completes, THEN schedule next one
                    setTimeout(() => {
                        setIdleAnimation('');
                        
                        // Schedule next animation only after current one is completely done
                        // Add a small gap between animations (1-2 seconds)
                        const gapBetweenAnimations = Math.random() * 1000 + 1000;
                        setTimeout(() => {
                            startIdleAnimations(); // Recursive call for next animation
                        }, gapBetweenAnimations);
                        
                    }, duration);
                    
                }, randomDelay);
            };

            // Pet-specific thought bubbles
            const startThoughtBubbles = () => {
                const randomDelay = Math.random() * 10000 + 8000;
                
                thoughtTimerRef.current = setTimeout(() => {
                    const petThoughts = thoughtBubbles[currentPet] || thoughtBubbles.novice;
                    const randomThought = petThoughts[Math.floor(Math.random() * petThoughts.length)];
                    setCurrentThought(randomThought);
                    setShowThoughtBubble(true);
                    
                    // Hide thought bubble after 3 seconds
                    setTimeout(() => setShowThoughtBubble(false), 3000);
                    
                    // Schedule next thought
                    startThoughtBubbles();
                }, randomDelay);
            };

            // Aura particle animation for higher tiers
            const startAuraAnimation = () => {
                if (currentPet === 'scholar' || currentPet === 'sage' || currentPet === 'master') {
                    const animateAura = () => {
                        setAuraParticles(prevParticles => 
                            prevParticles.map(particle => ({
                                ...particle,
                                angle: (particle.angle + particle.speed) % 360,
                                opacity: Math.sin(Date.now() * 0.003 + particle.id) * 0.3 + 0.5
                            }))
                        );
                    };
                    
                    auraTimerRef.current = setInterval(animateAura, 50);
                }
            };

            startIdleAnimations();
            startThoughtBubbles();
            startAuraAnimation();
        }

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
            if (auraTimerRef.current) clearInterval(auraTimerRef.current);
        };
    }, [birdVisible, isMoving, birdSelected, activePet, userRank]);

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
            const recentTrail = trailHistory.filter(pos => Date.now() - pos.time < 500);
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

    const handleEggClick = async () => {
        
        // Update states immediately
        setHasHatchedPet(true);
        setBirdVisible(true);
        setBirdPosition({ x: 200, y: 150 }); 
        setShowPetModal(false);
        
        // Set the active pet to the current rank
        setActivePet(userRank);
        
        // Save to database immediately
        const petData = {
            hasHatched: true,
            unlockedPets: unlockedPets,
            activePet: userRank
        };
        
        await updatePetDataInDB(petData);
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

    // Get idle animation classes based on pet type
    const getIdleAnimationClass = () => {
        const currentPet = getCurrentPetType();
        
        switch(idleAnimation) {
            case 'bounce-subtle':
                return 'animate-bounce-subtle';
            case 'sway':
                return 'animate-sway';
            case 'electric-pulse':
                return 'animate-electric-pulse';
            case 'wisdom-glow':
                return 'animate-wisdom-glow';
            case 'float-gentle':
                return 'animate-float-gentle';
            case 'mystical-aura':
                return 'animate-mystical-aura';
            case 'cosmic-pulse':
                return 'animate-cosmic-pulse';
            case 'royal-presence':
                return 'animate-royal-presence';
            case 'lightning-aura':
                return 'animate-lightning-aura';
            case 'divine-float':
                return 'animate-divine-float';
            default:
                return '';
        }
    };

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

    // Show loading state if still fetching user data
    if (isLoadingUserData) {
        return (
            <nav className="w-full h-16 md:h-20 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/30 backdrop-blur-sm relative">
                <div className="flex items-center gap-4">
                    <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-3xl md:text-4xl font-bold tracking-tight">
                        Yeld
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 animate-pulse"></div>
                        <span className="text-gray-400">Loading...</span>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse"></div>
            </nav>
        );
    }

    return (
        <>
            <style jsx="true" global="true">{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-5px) rotate(0deg); }
                }
                
                @keyframes sway {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }
                
                @keyframes electric-pulse {
                    0%, 100% { 
                        filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 6px rgba(147, 51, 234, 0.5));
                        transform: scale(1);
                    }
                    50% { 
                        filter: drop-shadow(0 0 20px rgba(59, 130, 246, 1)) drop-shadow(0 0 12px rgba(147, 51, 234, 0.8));
                        transform: scale(1.05);
                    }
                }
                
                @keyframes wisdom-glow {
                    0%, 100% { 
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 8px rgba(236, 72, 153, 0.6));
                        transform: translateY(0px);
                    }
                    50% { 
                        filter: drop-shadow(0 0 25px rgba(168, 85, 247, 1)) drop-shadow(0 0 15px rgba(236, 72, 153, 0.9));
                        transform: translateY(-8px);
                    }
                }
                
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-6px) rotate(1deg); }
                    66% { transform: translateY(-3px) rotate(-1deg); }
                }
                
                @keyframes mystical-aura {
                    0%, 100% { 
                        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 10px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 5px rgba(239, 68, 68, 0.5));
                        transform: scale(1) rotate(0deg);
                    }
                    25% { 
                        filter: drop-shadow(0 0 30px rgba(251, 191, 36, 1)) drop-shadow(0 0 15px rgba(251, 146, 60, 0.9)) drop-shadow(0 0 8px rgba(239, 68, 68, 0.7));
                        transform: scale(1.08) rotate(2deg);
                    }
                    75% { 
                        filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 12px rgba(251, 146, 60, 0.8)) drop-shadow(0 0 6px rgba(239, 68, 68, 0.6));
                        transform: scale(1.03) rotate(-1deg);
                    }
                }
                
                @keyframes cosmic-pulse {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-10px) scale(1.1); }
                }
                
                @keyframes royal-presence {
                    0%, 100% { 
                        filter: drop-shadow(0 0 30px rgba(236, 72, 153, 1)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 15px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.7));
                        transform: scale(1) translateY(0px);
                    }
                    33% { 
                        filter: drop-shadow(0 0 40px rgba(236, 72, 153, 1)) drop-shadow(0 0 30px rgba(59, 130, 246, 1)) drop-shadow(0 0 25px rgba(168, 85, 247, 1)) drop-shadow(0 0 20px rgba(251, 191, 36, 1));
                        transform: scale(1.15) translateY(-12px);
                    }
                    66% { 
                        filter: drop-shadow(0 0 35px rgba(236, 72, 153, 1)) drop-shadow(0 0 25px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.95)) drop-shadow(0 0 15px rgba(251, 191, 36, 0.85));
                        transform: scale(1.08) translateY(-6px);
                    }
                }
                
                @keyframes lightning-aura {
                    0%, 100% { 
                        filter: drop-shadow(0 0 30px rgba(236, 72, 153, 1)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 15px rgba(168, 85, 247, 0.9));
                    }
                    20% { 
                        filter: drop-shadow(0 0 50px rgba(255, 255, 255, 1)) drop-shadow(0 0 40px rgba(236, 72, 153, 1)) drop-shadow(0 0 30px rgba(59, 130, 246, 1));
                    }
                    40% { 
                        filter: drop-shadow(0 0 35px rgba(236, 72, 153, 1)) drop-shadow(0 0 25px rgba(59, 130, 246, 0.9));
                    }
                    60% { 
                        filter: drop-shadow(0 0 45px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 35px rgba(168, 85, 247, 1)) drop-shadow(0 0 25px rgba(251, 191, 36, 1));
                    }
                    80% { 
                        filter: drop-shadow(0 0 40px rgba(236, 72, 153, 1)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.9));
                    }
                }
                
                @keyframes divine-float {
                    0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
                    25% { transform: translateY(-15px) scale(1.12) rotate(3deg); }
                    50% { transform: translateY(-8px) scale(1.06) rotate(0deg); }
                    75% { transform: translateY(-12px) scale(1.09) rotate(-2deg); }
                }
                
                @keyframes thought-bubble-appear {
                    0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0px); }
                }
                
                @keyframes aura-particle {
                    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
                    50% { transform: scale(1.2) rotate(180deg); opacity: 0.9; }
                }
                
                @keyframes lightning-bolt {
                    0% { opacity: 0; transform: scale(0.5); }
                    10% { opacity: 1; transform: scale(1.2); }
                    20% { opacity: 0.8; transform: scale(0.9); }
                    30% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 0; transform: scale(0.8); }
                }
                
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out;
                }
                
                .animate-sway {
                    animation: sway 3s ease-in-out;
                }
                
                .animate-electric-pulse {
                    animation: electric-pulse 2.5s ease-in-out;
                }
                
                .animate-wisdom-glow {
                    animation: wisdom-glow 3s ease-in-out;
                }
                
                .animate-float-gentle {
                    animation: float-gentle 4s ease-in-out;
                }
                
                .animate-mystical-aura {
                    animation: mystical-aura 4s ease-in-out;
                }
                
                .animate-cosmic-pulse {
                    animation: cosmic-pulse 3s ease-in-out;
                }
                
                .animate-royal-presence {
                    animation: royal-presence 5s ease-in-out;
                }
                
                .animate-lightning-aura {
                    animation: lightning-aura 3s ease-in-out;
                }
                
                .animate-divine-float {
                    animation: divine-float 6s ease-in-out;
                }
                
                .thought-bubble-enter {
                    animation: thought-bubble-appear 0.5s ease-out;
                }
                
                .aura-particle {
                    animation: aura-particle 3s ease-in-out infinite;
                }
                
                .lightning-bolt {
                    animation: lightning-bolt 0.2s ease-out;
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
                    {/* Enhanced Trail Effects */}
                    {showTrail && (activePet !== 'master' && userRank !== 'master') && trailPositions.map((pos, index) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        return (
                            <div
                                key={index}
                                className="fixed z-30 pointer-events-none"
                                style={{
                                    left: `${pos.x + 96}px`,
                                    top: `${pos.y + 96}px`,
                                    opacity: (index / trailPositions.length) * 0.8,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div 
                                    className="rounded-full animate-pulse"
                                    style={{
                                        width: currentPet === 'sage' ? '6px' : currentPet === 'scholar' ? '5px' : '4px',
                                        height: currentPet === 'sage' ? '6px' : currentPet === 'scholar' ? '5px' : '4px',
                                        backgroundColor: effects.trailColor,
                                        boxShadow: `0 0 15px ${effects.glowColor}`,
                                        animation: `pulse 0.5s ease-in-out infinite`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Aura Particles for Scholar, Sage, Master */}
                    {auraParticles.map((particle) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        const radian = (particle.angle * Math.PI) / 180;
                        const x = birdPosition.x + 80 + Math.cos(radian) * particle.distance;
                        const y = birdPosition.y + 80 + Math.sin(radian) * particle.distance;
                        
                        return (
                            <div
                                key={particle.id}
                                className="fixed z-35 pointer-events-none aura-particle"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    opacity: particle.opacity,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div
                                    className="rounded-full"
                                    style={{
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        backgroundColor: effects.auraColor,
                                        boxShadow: `0 0 ${particle.size * 2}px ${effects.glowColor}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Master Lightning Effects */}
                    {getCurrentPetType() === 'master' && masterLightning.map((bolt) => (
                        <svg
                            key={bolt.id}
                            className="fixed z-36 pointer-events-none lightning-bolt"
                            style={{
                                left: `${birdPosition.x + 80 + bolt.startX}px`,
                                top: `${birdPosition.y + 80 + bolt.startY}px`,
                                width: '200px',
                                height: '200px',
                                opacity: bolt.opacity,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <path
                                d={`M ${100 + bolt.startX} ${100 + bolt.startY} L ${100 + bolt.endX} ${100 + bolt.endY}`}
                                stroke="rgba(255, 255, 255, 0.9)"
                                strokeWidth="3"
                                fill="none"
                                filter="drop-shadow(0 0 10px rgba(255, 255, 255, 1))"
                            />
                            <path
                                d={`M ${100 + bolt.startX} ${100 + bolt.startY} L ${100 + bolt.endX} ${100 + bolt.endY}`}
                                stroke="rgba(236, 72, 153, 0.8)"
                                strokeWidth="1"
                                fill="none"
                            />
                        </svg>
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
                            isolation: 'isolate',
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
                                filter: getPetEffects(getCurrentPetType()).filter,
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden'
                            }}
                        />
                        
                        {/* Enhanced Thought Bubble */}
                        {showThoughtBubble && !birdSelected && !isMoving && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 thought-bubble-enter">
                                <div 
                                    className="relative rounded-full p-3 shadow-lg border-2"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).auraColor}, rgba(255, 255, 255, 0.9))`,
                                        borderColor: getPetEffects(getCurrentPetType()).glowColor,
                                        boxShadow: `0 0 20px ${getPetEffects(getCurrentPetType()).glowColor}`
                                    }}
                                >
                                    <span className="text-2xl">{currentThought}</span>
                                    {/* Enhanced thought bubble tail */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <div 
                                            className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                                            style={{ borderTopColor: getPetEffects(getCurrentPetType()).glowColor }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Selection Messages */}
                        {birdSelected && !isMoving && (activePet !== 'master') && (
                            <div 
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                                style={{
                                    background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}, ${getPetEffects(getCurrentPetType()).auraColor})`,
                                    boxShadow: `0 0 10px ${getPetEffects(getCurrentPetType()).glowColor}`
                                }}
                            >
                                {getCurrentPetType() === 'sage' ? 'Wisdom guides my flight!' : 
                                 getCurrentPetType() === 'scholar' ? 'Knowledge awaits!' :
                                 getCurrentPetType() === 'apprentice' ? 'Ready to soar!' : 'Time to fly!'}
                            </div>
                        )}
                        
                        {birdSelected && (activePet === 'master') && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-pulse">
                                ✨ LEGENDARY MASTER ✨
                            </div>
                        )}
                        
                        {/* Enhanced Movement Messages */}
                        {isMoving && (activePet !== 'master') && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                                <div 
                                    className="text-white text-xs px-2 py-1 rounded-full animate-pulse"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}, ${getPetEffects(getCurrentPetType()).auraColor})`,
                                        boxShadow: `0 0 15px ${getPetEffects(getCurrentPetType()).glowColor}`
                                    }}
                                >
                                    {getCurrentPetType() === 'sage' ? '🌟 MYSTIC FLIGHT! 🌟' : 
                                     getCurrentPetType() === 'scholar' ? '📚 SWIFT STUDY! 📚' :
                                     getCurrentPetType() === 'apprentice' ? '⚡ ZOOM! ⚡' : 'WOOOO!'}
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