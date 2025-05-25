import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Menu, X, Hand, Plane, Settings, Sparkles } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import LeaderboardModal from './custom-components/LeaderboardModal';

import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';

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
import palmImage from './pet-components/pet-assets/palm.png';

import PetModal from './pet-components/PetModal';
import PetSelectionModal from './pet-components/PetSelectionModal';

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

// Enhanced thought bubble messages for each pet type
const thoughtBubbles = {
  novice: ["🌱", "📚", "💭", "⭐", "🔍"],
  apprentice: ["⚡", "🔥", "✨", "🎯", "💎"],
  scholar: ["🧠", "💡", "🔮", "🌟", "📖"],
  sage: ["🧙‍♂️", "🌙", "💫", "🔱", "🦉"],
  master: ["👑", "💎", "🦅", "⚡", "🌈", "🔥", "🎭", "🎪"]
};

// Pet interaction messages
const petMessages = {
  novice: ["Chirp! 🐣", "So gentle! 💚", "Learning from you! 📚", "Happy chirps! 🎵"],
  apprentice: ["Magical touch! ✨", "Power grows! ⚡", "Sparkling joy! 💎", "Energy surges! 🔋"],
  scholar: ["Wisdom shared! 🔮", "Mind connection! 🧠", "Knowledge flows! 📚", "Enlightened! 💡"],
  sage: ["Ancient bond! 🌙", "Mystical harmony! 🔱", "Sacred touch! ✨", "Cosmic alignment! 🌟"],
  master: ["LEGENDARY BOND! 👑", "DIVINE CONNECTION! ⚡", "ULTIMATE POWER! 🌈", "TRANSCENDENT! 🎭"]
};

// Enhanced legendary abilities
const legendaryAbilities = {
  master: [
    { name: "Reality Shift", icon: "🌀", description: "Bend space and time" },
    { name: "Cosmic Flight", icon: "🚀", description: "Teleport instantly" },
    { name: "Divine Aura", icon: "👑", description: "Emanate pure power" },
    { name: "Time Freeze", icon: "⏰", description: "Stop the world" },
    { name: "Dimensional Portal", icon: "🌌", description: "Open rifts in reality" }
  ]
};

function Header({ username, isTimerActive }) {
    const navigate = useNavigate();
    const [userAvatar, setUserAvatar] = useState('fox');
    const [userRank, setUserRank] = useState('novice');
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
    
    // Enhanced bird state - SIMPLIFIED
    const [birdVisible, setBirdVisible] = useState(false);
    const [birdPosition, setBirdPosition] = useState({ x: 200, y: 200 });
    const [birdSelected, setBirdSelected] = useState(false);
    const [birdTarget, setBirdTarget] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [birdRotation, setBirdRotation] = useState(0);
    const [showTrail, setShowTrail] = useState(false);
    const [trailPositions, setTrailPositions] = useState([]);
    
    // SIMPLIFIED: Single flight mode state
    const [isInFlightMode, setIsInFlightMode] = useState(false);
    
    // Enhanced animation states
    const [showThoughtBubble, setShowThoughtBubble] = useState(false);
    const [currentThought, setCurrentThought] = useState('');
    const [idleAnimation, setIdleAnimation] = useState('');
    const [auraParticles, setAuraParticles] = useState([]);
    const [petEffect, setPetEffect] = useState(null);
    const [backgroundGlow, setBackgroundGlow] = useState(false);
    const [orbitalElements, setOrbitalElements] = useState([]);
    const [showBirdControls, setShowBirdControls] = useState(false);
    const [legendaryEffect, setLegendaryEffect] = useState(null);
    const [currentAbility, setCurrentAbility] = useState(null);
    
    // NEW: Hand petting animation state
    const [showPettingHand, setShowPettingHand] = useState(false);
    const [pettingHandPosition, setPettingHandPosition] = useState({ x: 0, y: 0 });
    const [handRotation, setHandRotation] = useState(0);
    
    const birdRef = useRef(null);
    const animationRef = useRef(null);
    const idleTimerRef = useRef(null);
    const thoughtTimerRef = useRef(null);
    const auraTimerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const pettingTimerRef = useRef(null);

    const MOVEMENT_SPEED = 200;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Check if bird is in any animation state (prevents pet switching)
    const isInAnimationState = () => {
        return isMoving || petEffect || legendaryEffect || idleAnimation !== '';
    };

    // Get user rank based on total hours studied
    const getUserRank = (totalHours) => {
        if (totalHours >= 50) return 'master';
        if (totalHours >= 20) return 'sage';
        if (totalHours >= 10) return 'scholar';
        if (totalHours >= 5) return 'apprentice';
        return 'novice';
    };

    // Enhanced pet effects with refined visuals
    const getPetEffects = (petType) => {
        switch(petType) {
            case 'novice':
                return {
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.3))',
                    auraColor: 'rgba(34, 197, 94, 0.15)',
                    trailColor: 'rgb(34, 197, 94)',
                    glowColor: 'rgba(34, 197, 94, 0.4)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%)'
                };
            case 'apprentice':
                return {
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 4px rgba(147, 51, 234, 0.3))',
                    auraColor: 'rgba(59, 130, 246, 0.2)',
                    trailColor: 'rgb(59, 130, 246)',
                    glowColor: 'rgba(59, 130, 246, 0.5)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 70%)'
                };
            case 'scholar':
                return {
                    filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)) drop-shadow(0 0 5px rgba(236, 72, 153, 0.3))',
                    auraColor: 'rgba(168, 85, 247, 0.25)',
                    trailColor: 'rgb(168, 85, 247)',
                    glowColor: 'rgba(168, 85, 247, 0.6)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 70%)'
                };
            case 'sage':
                return {
                    filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 6px rgba(251, 146, 60, 0.4))',
                    auraColor: 'rgba(251, 191, 36, 0.3)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 0.7)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.12) 0%, rgba(251, 146, 60, 0.1) 40%, transparent 70%)'
                };
            case 'master':
                return {
                    filter: 'drop-shadow(0 0 15px rgba(255, 69, 0, 0.5)) drop-shadow(0 0 8px rgba(255, 140, 0, 0.4))',
                    auraColor: 'rgba(255, 69, 0, 0.2)',
                    trailColor: 'rgb(255, 69, 0)',
                    glowColor: 'rgba(255, 69, 0, 0.6)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(255, 69, 0, 0.08) 0%, rgba(255, 140, 0, 0.06) 30%, transparent 60%)'
                };
            default:
                return {
                    filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                    auraColor: 'rgba(251, 191, 36, 0.2)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 0.5)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)'
                };
        }
    };

    // Generate refined aura particles
    const generateAuraParticles = (petType) => {
        if (petType === 'novice') return;
        
        const configs = {
            apprentice: { count: 3, distance: 12, speed: 1, size: 3 },
            scholar: { count: 4, distance: 16, speed: 1.2, size: 4 },
            sage: { count: 5, distance: 20, speed: 1.5, size: 5 },
            master: { count: 6, distance: 25, speed: 1.8, size: 6 }
        };
        
        const config = configs[petType] || configs.apprentice;
        const particles = [];
        
        for (let i = 0; i < config.count; i++) {
            particles.push({
                id: i,
                angle: (360 / config.count) * i,
                distance: config.distance + Math.random() * 5,
                speed: config.speed + Math.random() * 0.3,
                size: config.size + Math.random() * 1,
                opacity: Math.random() * 0.4 + 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        setAuraParticles(particles);
    };

    // Generate orbital elements for higher tiers
    const generateOrbitalElements = (petType) => {
        if (petType === 'novice' || petType === 'apprentice') return;
        
        const elements = [];
        const count = petType === 'master' ? 4 : petType === 'sage' ? 3 : 2;
        
        for (let i = 0; i < count; i++) {
            elements.push({
                id: i,
                radius: 30 + i * 12,
                speed: 0.8 + i * 0.2,
                angle: (360 / count) * i,
                size: petType === 'master' ? 4 : 3,
                opacity: 0.5 - i * 0.1
            });
        }
        
        setOrbitalElements(elements);
    };

    // Legendary abilities handler
    const triggerLegendaryAbility = (ability) => {
        if (getCurrentPetType() !== 'master') return;
        
        setCurrentAbility(ability);
        setLegendaryEffect(ability.name);
        
        switch(ability.name) {
            case "Reality Shift":
                // Subtle reality distortion effect
                setBirdPosition(prev => ({
                    x: Math.random() * (window.innerWidth - 200),
                    y: Math.random() * (window.innerHeight - 200)
                }));
                break;
            case "Cosmic Flight":
                // Instant teleportation
                setIsMoving(true);
                setTimeout(() => setIsMoving(false), 500);
                break;
            case "Divine Aura":
                // Enhanced aura expansion
                setBackgroundGlow(true);
                setTimeout(() => setBackgroundGlow(false), 3000);
                break;
            case "Time Freeze":
                // Pause effect
                document.body.style.filter = 'grayscale(50%)';
                setTimeout(() => {
                    document.body.style.filter = 'none';
                }, 2000);
                break;
            case "Dimensional Portal":
                // Portal effects around the screen
                break;
        }
        
        setTimeout(() => {
            setLegendaryEffect(null);
            setCurrentAbility(null);
        }, 3000);
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
                    
                    if (data.avatar && animalAvatars[data.avatar]) {
                        setUserAvatar(data.avatar);
                    }
                    
                    const totalHours = data.totalTimeStudied / 60;
                    const rank = getUserRank(totalHours);
                    setUserRank(rank);
                    
                    const petData = data.petData || {};
                    
                    const hasHatched = petData.hasHatched || false;
                    const unlocked = petData.unlockedPets || ['novice'];
                    const active = petData.activePet || null;
                    
                    setHasHatchedPet(hasHatched);
                    setUnlockedPets(unlocked);
                    setActivePet(active);
                    
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

    // Save pet data to database whenever it changes
    useEffect(() => {
        if (isLoadingUserData || !username) return;
        
        if (hasHatchedPet || unlockedPets.length > 1 || activePet) {
            const petData = {
                hasHatched: hasHatchedPet,
                unlockedPets: unlockedPets,
                activePet: activePet
            };
            updatePetDataInDB(petData);
        }
    }, [hasHatchedPet, unlockedPets, activePet, username, isLoadingUserData]);

    // Get current bird assets
    const getCurrentBirdAssets = () => {
        if (activePet && birdAssets[activePet]) {
            return birdAssets[activePet];
        }
        return birdAssets[userRank] || birdAssets.novice;
    };

    // Get current pet type
    const getCurrentPetType = () => {
        return activePet || userRank;
    };

    // Enhanced bird image logic
    const getBirdImage = () => {
        const assets = getCurrentBirdAssets();
        const currentPet = getCurrentPetType();
        
        // Show gif when selected, moving, or during pet effect
        if (birdSelected || isMoving || petEffect || legendaryEffect) {
            return assets.gif;
        }
        
        return assets.idle;
    };

    // Update unlocked pets based on rank
    useEffect(() => {
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
        
        if (!activePet && hasHatchedPet) {
            setActivePet(userRank);
        }
    }, [userRank, activePet, hasHatchedPet, isLoadingUserData]);

    // Generate effects when pet changes
    useEffect(() => {
        if (birdVisible) {
            const currentPet = getCurrentPetType();
            generateAuraParticles(currentPet);
            generateOrbitalElements(currentPet);
        }
    }, [birdVisible, activePet, userRank]);

    // Enhanced idle animations
    useEffect(() => {
        if (birdVisible && !isMoving && !birdSelected && !petEffect && !legendaryEffect && !isInFlightMode) {
            const currentPet = getCurrentPetType();
            
            const startIdleAnimations = () => {
                let animations = [];
                
                switch(currentPet) {
                    case 'novice':
                        animations = ['gentle-bounce', 'subtle-sway', 'curious-tilt'];
                        break;
                    case 'apprentice':
                        animations = ['energy-pulse', 'electric-bounce', 'power-sway'];
                        break;
                    case 'scholar':
                        animations = ['wisdom-float', 'knowledge-glow', 'mystic-sway'];
                        break;
                    case 'sage':
                        animations = ['celestial-float', 'cosmic-pulse', 'ancient-wisdom'];
                        break;
                    case 'master':
                        animations = ['legendary-presence', 'divine-ascension', 'reality-warp'];
                        break;
                    default:
                        animations = ['gentle-bounce', 'subtle-sway'];
                }
                
                const randomDelay = Math.random() * 6000 + 4000;
                
                idleTimerRef.current = setTimeout(() => {
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    setIdleAnimation(randomAnimation);
                    
                    if (currentPet === 'master' || currentPet === 'sage') {
                        setBackgroundGlow(true);
                    }
                    
                    const duration = currentPet === 'master' ? 4000 : currentPet === 'sage' ? 3500 : 3000;
                    
                    setTimeout(() => {
                        setIdleAnimation('');
                        setBackgroundGlow(false);
                        
                        const gapBetweenAnimations = Math.random() * 3000 + 2000;
                        setTimeout(() => {
                            startIdleAnimations();
                        }, gapBetweenAnimations);
                        
                    }, duration);
                    
                }, randomDelay);
            };

            const startThoughtBubbles = () => {
                const randomDelay = Math.random() * 15000 + 12000;
                
                thoughtTimerRef.current = setTimeout(() => {
                    const petThoughts = thoughtBubbles[currentPet] || thoughtBubbles.novice;
                    const randomThought = petThoughts[Math.floor(Math.random() * petThoughts.length)];
                    setCurrentThought(randomThought);
                    setShowThoughtBubble(true);
                    
                    setTimeout(() => setShowThoughtBubble(false), 3000);
                    
                    startThoughtBubbles();
                }, randomDelay);
            };

            // Enhanced aura animation
            const startAuraAnimation = () => {
                const animateAura = () => {
                    setAuraParticles(prevParticles => 
                        prevParticles.map(particle => ({
                            ...particle,
                            angle: (particle.angle + particle.speed) % 360,
                            opacity: Math.sin(Date.now() * 0.001 + particle.phase) * 0.2 + 0.4,
                            distance: particle.distance + Math.sin(Date.now() * 0.0008 + particle.phase) * 1
                        }))
                    );
                    
                    setOrbitalElements(prevElements => 
                        prevElements.map(element => ({
                            ...element,
                            angle: (element.angle + element.speed) % 360
                        }))
                    );
                };
                
                auraTimerRef.current = setInterval(animateAura, 50);
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
    }, [birdVisible, isMoving, birdSelected, petEffect, legendaryEffect, activePet, userRank, isInFlightMode]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Enhanced movement animation
    useEffect(() => {
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
            const recentTrail = trailHistory.filter(pos => Date.now() - pos.time < 600);
            setTrailPositions(recentTrail);
            
            if (rawProgress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Movement completed - reset to idle state
                setIsMoving(false);
                setBirdTarget(null);
                setBirdSelected(false);
                setBirdRotation(0);
                setShowTrail(false);
                setTrailPositions([]);
                setIsInFlightMode(false); // Exit flight mode
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

    // SIMPLIFIED page click handler
    useEffect(() => {
        const handlePageClick = (e) => {
            // Don't handle clicks on the bird itself
            if (birdRef.current && birdRef.current.contains(e.target)) {
                return;
            }
            
            const currentPetRank = activePet || userRank;
            
            // Handle flight mode clicks
            if (isInFlightMode && birdSelected && !isMoving) {
                if (currentPetRank === 'master') {
                    // Master pets teleport instantly
                    const rect = document.body.getBoundingClientRect();
                    const x = e.clientX - rect.left - 80;
                    const y = e.clientY - rect.top - 80;
                    setBirdPosition({ x, y });
                    triggerLegendaryAbility({ name: "Cosmic Flight", icon: "🚀" });
                    // Reset to idle after teleport
                    setBirdSelected(false);
                    setIsInFlightMode(false);
                    return;
                }
                
                // Calculate destination and start movement
                const rect = document.body.getBoundingClientRect();
                const x = e.clientX - rect.left - 80;
                const y = e.clientY - rect.top - 80;
                
                setBirdTarget({ x, y });
                setIsMoving(true);
                return;
            }
            
            // Default: hide controls and deselect bird
            if (showBirdControls || birdSelected) {
                setShowBirdControls(false);
                setBirdSelected(false);
                setIsInFlightMode(false);
                
                // Clear any control timer
                if (controlsTimerRef.current) {
                    clearTimeout(controlsTimerRef.current);
                    controlsTimerRef.current = null;
                }
            }
        };

        if (birdVisible) {
            document.addEventListener('click', handlePageClick);
        }

        return () => {
            if (birdVisible) {
                document.removeEventListener('click', handlePageClick);
            }
        };
    }, [birdSelected, birdVisible, isMoving, userRank, activePet, isInFlightMode, showBirdControls]);

    const handleEggClick = async () => {
        setHasHatchedPet(true);
        setBirdVisible(true);
        setBirdPosition({ x: 200, y: 150 }); 
        setShowPetModal(false);
        setActivePet(userRank);
        
        const petData = {
            hasHatched: true,
            unlockedPets: unlockedPets,
            activePet: userRank
        };
        
        await updatePetDataInDB(petData);
    };

    const handleBirdClick = (e) => {
        e.stopPropagation();
        
        // Don't show controls if in animation state or flight mode
        if (isInAnimationState() || isInFlightMode) {
            return;
        }
        
        // Clear any existing timer
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
            controlsTimerRef.current = null;
        }
        
        // Show controls
        setShowBirdControls(true);
        setBirdSelected(true);
        
        // Auto-hide after 5 seconds
        controlsTimerRef.current = setTimeout(() => {
            setShowBirdControls(false);
            setBirdSelected(false);
            controlsTimerRef.current = null;
        }, 5000);
    };

    const handlePetInteraction = () => {
        const currentPet = getCurrentPetType();
        const messages = petMessages[currentPet] || petMessages.novice;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
            controlsTimerRef.current = null;
        }
        
        setShowBirdControls(false);
        setBirdSelected(false);
        setIsInFlightMode(false);
        
        // Start the petting hand animation
        startPettingAnimation();
        
        setPetEffect({
            message: randomMessage,
            type: currentPet,
            timestamp: Date.now()
        });
        
        switch(currentPet) {
            case 'apprentice':
            case 'scholar':
            case 'sage':
            case 'master':
                setBackgroundGlow(true);
                break;
        }

        const duration = currentPet === 'master' ? 4000 : currentPet === 'sage' ? 3500 : 3000;
        
        setTimeout(() => {
            setPetEffect(null);
            setBackgroundGlow(false);
        }, duration);
    };

    const startPettingAnimation = () => {
        const handX = birdPosition.x + 40; 
        const handY = birdPosition.y; 
        
        setPettingHandPosition({ x: handX, y: handY });
        setShowPettingHand(true);
        
        let animationStep = 0;
        const pettingSteps = 8;
        const stepDuration = 400; 
        
        const doPettingMotion = () => {
            if (animationStep >= pettingSteps) {
                setShowPettingHand(false);
                setHandRotation(0);
                if (pettingTimerRef.current) {
                    clearInterval(pettingTimerRef.current);
                    pettingTimerRef.current = null;
                }
                return;
            }
            
            // Alternate between down and up motions
            const isDownStroke = animationStep % 2 === 0;
            const newY = handY + (isDownStroke ? 8 : -8); 
            const newRotation = isDownStroke ? 10 : -5; 
            
            setPettingHandPosition({ x: handX, y: newY });
            setHandRotation(newRotation);
            
            animationStep++;
        };
        
        // Start the petting animation
        pettingTimerRef.current = setInterval(doPettingMotion, stepDuration);
        
        // Clean up after total duration
        setTimeout(() => {
            setShowPettingHand(false);
            setHandRotation(0);
            if (pettingTimerRef.current) {
                clearInterval(pettingTimerRef.current);
                pettingTimerRef.current = null;
            }
        }, pettingSteps * stepDuration + 500);
    };

    // SIMPLIFIED flight mode handler
    const handleFlightMode = () => {
        // Clear timer and hide controls immediately
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
            controlsTimerRef.current = null;
        }
        
        // Set flight mode states
        setIsInFlightMode(true);
        setShowBirdControls(false);
        setBirdSelected(true); // Keep bird selected for visual feedback
    };

    const handlePetIconClick = () => {
        // Always show the pet selection modal if pet is hatched
        if (hasHatchedPet) {
            // Don't allow pet switching during animations
            if (isInAnimationState()) {
                return;
            }
            setShowPetSelectionModal(true);
        } else {
            setShowPetModal(true);
        }
    };

    const handlePetSelection = (selectedPet) => {
        if (selectedPet === 'none') {
            setBirdVisible(false);
            setActivePet(null);
        } else {
            setActivePet(selectedPet);
            setBirdVisible(true);
        }
        setShowPetSelectionModal(false);
    };

    // Enhanced idle animation classes
    const getIdleAnimationClass = () => {
        const animationMap = {
            'gentle-bounce': 'animate-gentle-bounce',
            'subtle-sway': 'animate-subtle-sway',
            'curious-tilt': 'animate-curious-tilt',
            'energy-pulse': 'animate-energy-pulse',
            'electric-bounce': 'animate-electric-bounce',
            'power-sway': 'animate-power-sway',
            'wisdom-float': 'animate-wisdom-float',
            'knowledge-glow': 'animate-knowledge-glow',
            'mystic-sway': 'animate-mystic-sway',
            'celestial-float': 'animate-celestial-float',
            'cosmic-pulse': 'animate-cosmic-pulse',
            'ancient-wisdom': 'animate-ancient-wisdom',
            'legendary-presence': 'animate-legendary-presence',
            'divine-ascension': 'animate-divine-ascension',
            'reality-warp': 'animate-reality-warp'
        };
        
        return animationMap[idleAnimation] || '';
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

    // Show loading state
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
                /* Enhanced Professional Animations */
                @keyframes gentle-bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-2px); }
                }
                
                @keyframes subtle-sway {
                    0%, 100% { transform: rotate(-0.5deg); }
                    50% { transform: rotate(0.5deg); }
                }
                
                @keyframes curious-tilt {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(3deg) scale(1.01); }
                    75% { transform: rotate(-2deg) scale(1.005); }
                }
                
                @keyframes energy-pulse {
                    0%, 100% { 
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
                    }
                    50% { 
                        transform: scale(1.03);
                        filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
                    }
                }
                
                @keyframes electric-bounce {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-4px) scale(1.02); }
                }
                
                @keyframes power-sway {
                    0%, 100% { transform: rotate(-1deg) scale(1); }
                    50% { transform: rotate(1.5deg) scale(1.01); }
                }
                
                @keyframes wisdom-float {
                    0%, 100% { 
                        transform: translateY(0px) scale(1);
                        filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
                    }
                    50% { 
                        transform: translateY(-6px) scale(1.03);
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7));
                    }
                }
                
                @keyframes knowledge-glow {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
                    }
                    50% { 
                        transform: scale(1.04) rotate(1deg);
                        filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.8));
                    }
                }
                
                @keyframes mystic-sway {
                    0%, 100% { transform: rotate(-1.5deg) translateY(0px); }
                    50% { transform: rotate(2deg) translateY(-3px); }
                }
                
                @keyframes celestial-float {
                    0%, 100% { 
                        transform: translateY(0px) scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
                    }
                    33% { 
                        transform: translateY(-8px) scale(1.04) rotate(1deg);
                        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8));
                    }
                    66% { 
                        transform: translateY(-4px) scale(1.02) rotate(-0.5deg);
                        filter: drop-shadow(0 0 16px rgba(251, 146, 60, 0.7));
                    }
                }
                
                @keyframes cosmic-pulse {
                    0%, 100% { 
                        transform: scale(1) translateY(0px);
                        filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.7));
                    }
                    50% { 
                        transform: scale(1.06) translateY(-5px);
                        filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.9));
                    }
                }
                
                @keyframes ancient-wisdom {
                    0%, 100% { 
                        transform: rotate(0deg) scale(1);
                        filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.8));
                    }
                    25% { 
                        transform: rotate(1deg) scale(1.03);
                        filter: drop-shadow(0 0 25px rgba(251, 191, 36, 1));
                    }
                    75% { 
                        transform: rotate(-0.5deg) scale(1.015);
                        filter: drop-shadow(0 0 20px rgba(251, 146, 60, 0.8));
                    }
                }
                
                @keyframes legendary-presence {
                    0%, 100% { 
                        transform: scale(1) translateY(0px) rotate(0deg);
                        filter: drop-shadow(0 0 15px rgba(255, 69, 0, 0.5));
                    }
                    33% { 
                        transform: scale(1.05) translateY(-8px) rotate(1deg);
                        filter: drop-shadow(0 0 25px rgba(255, 69, 0, 0.7));
                    }
                    66% { 
                        transform: scale(1.02) translateY(-4px) rotate(-0.5deg);
                        filter: drop-shadow(0 0 20px rgba(255, 140, 0, 0.6));
                    }
                }
                
                @keyframes divine-ascension {
                    0%, 100% { 
                        transform: translateY(0px) scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 20px rgba(255, 69, 0, 0.6));
                    }
                    50% { 
                        transform: translateY(-12px) scale(1.08) rotate(2deg);
                        filter: drop-shadow(0 0 30px rgba(255, 69, 0, 0.8));
                    }
                }
                
                @keyframes reality-warp {
                    0%, 100% { 
                        transform: scale(1) skew(0deg, 0deg);
                        filter: drop-shadow(0 0 18px rgba(255, 69, 0, 0.6));
                    }
                    50% { 
                        transform: scale(1.04) skew(1deg, 0.5deg);
                        filter: drop-shadow(0 0 28px rgba(255, 69, 0, 0.8));
                    }
                }
                
                @keyframes thought-bubble-appear {
                    0% { opacity: 0; transform: scale(0.8) translateY(5px); }
                    100% { opacity: 1; transform: scale(1) translateY(0px); }
                }
                
                @keyframes pet-effect-bounce {
                    0%, 100% { transform: scale(1) translateY(0px); }
                    50% { transform: scale(1.08) translateY(-4px); }
                }
                
                @keyframes heart-float {
                    0% { opacity: 1; transform: translateY(0px) scale(0.5); }
                    100% { opacity: 0; transform: translateY(-30px) scale(1); }
                }
                
                @keyframes legendary-effect {
                    0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
                    100% { opacity: 0; transform: scale(0.8) rotate(360deg); }
                }
                
                @keyframes control-panel-appear {
                    0% { opacity: 0; transform: translateY(-10px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0px) scale(1); }
                }
                
                /* NEW: Hand petting animation */
                @keyframes gentle-pet {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg) scale(1);
                        opacity: 0.9;
                    }
                    50% { 
                        transform: translateY(5px) rotate(8deg) scale(1.1);
                        opacity: 1;
                    }
                }
                
                @keyframes sparkle-burst {
                    0% { 
                        opacity: 0;
                        transform: scale(0) rotate(0deg);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.2) rotate(180deg);
                    }
                    100% { 
                        opacity: 0;
                        transform: scale(0.8) rotate(360deg);
                    }
                }
                
                /* Animation Classes */
                .animate-gentle-bounce { animation: gentle-bounce 2s ease-in-out; }
                .animate-subtle-sway { animation: subtle-sway 3s ease-in-out; }
                .animate-curious-tilt { animation: curious-tilt 2.5s ease-in-out; }
                .animate-energy-pulse { animation: energy-pulse 2.5s ease-in-out; }
                .animate-electric-bounce { animation: electric-bounce 3s ease-in-out; }
                .animate-power-sway { animation: power-sway 3.5s ease-in-out; }
                .animate-wisdom-float { animation: wisdom-float 4s ease-in-out; }
                .animate-knowledge-glow { animation: knowledge-glow 3.5s ease-in-out; }
                .animate-mystic-sway { animation: mystic-sway 4s ease-in-out; }
                .animate-celestial-float { animation: celestial-float 5s ease-in-out; }
                .animate-cosmic-pulse { animation: cosmic-pulse 4s ease-in-out; }
                .animate-ancient-wisdom { animation: ancient-wisdom 6s ease-in-out; }
                .animate-legendary-presence { animation: legendary-presence 5s ease-in-out; }
                .animate-divine-ascension { animation: divine-ascension 6s ease-in-out; }
                .animate-reality-warp { animation: reality-warp 5s ease-in-out; }
                
                .thought-bubble-enter { animation: thought-bubble-appear 0.5s ease-out; }
                .pet-effect-active { animation: pet-effect-bounce 0.6s ease-in-out; }
                .heart-particle { animation: heart-float 1.8s ease-out forwards; }
                .legendary-effect-active { animation: legendary-effect 3s ease-out; }
                .control-panel-enter { animation: control-panel-appear 0.3s ease-out; }
                
                /* NEW: Hand animation classes */
                .petting-hand { animation: gentle-pet 0.4s ease-in-out; }
                .sparkle-effect { animation: sparkle-burst 0.8s ease-out forwards; }
                
                /* Background glow overlay */
                .background-glow-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 25;
                    opacity: 0.4;
                    transition: opacity 0.5s ease-in-out;
                }
            `}</style>

            {/* Background glow overlay for high-tier pets */}
            {backgroundGlow && (
                <div 
                    className="background-glow-overlay"
                    style={{
                        background: getPetEffects(getCurrentPetType()).backgroundGlow
                    }}
                />
            )}

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

                {/* Pet controls for mobile */}
                {isMobile && (
                    <div className="flex items-center gap-2">
                        {hasHatchedPet ? (
                            <button
                                onClick={handlePetIconClick}
                                disabled={isInAnimationState()}
                                className={`relative w-10 h-10 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-lg ${
                                    isInAnimationState() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {activePet && birdVisible ? (
                                    <img 
                                        src={getCurrentBirdAssets().idle} 
                                        alt="Pet"
                                        className="w-8 h-8 object-contain"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                ) : (
                                    <span className="text-xs text-gray-600">No Pet</span>
                                )}
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                                    {unlockedPets.length}
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSilverEgg}
                                className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                            >
                            </button>
                        )}
                    </div>
                )}
                
                {!isMobile && (
                    <div className="flex flex-row gap-4 items-center">
                        {hasHatchedPet ? (
                            <button
                                onClick={handlePetIconClick}
                                disabled={isInAnimationState()}
                                className={`relative w-10 h-10 rounded-full bg-black border-gray-400 hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-lg ${
                                    isInAnimationState() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {activePet && birdVisible ? (
                                    <img 
                                        src={getCurrentBirdAssets().idle} 
                                        alt="Pet"
                                        className="w-8 h-8 object-contain"
                                        style={{ imageRendering: 'crisp-edges' }}
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">No Pet</span>
                                )}
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                                    {unlockedPets.length}
                                </span>
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
                    {/* NEW: Petting Hand Animation */}
                    {showPettingHand && (
                        <div
                            className="fixed z-50 pointer-events-none petting-hand"
                            style={{
                                left: `${pettingHandPosition.x}px`,
                                top: `${pettingHandPosition.y}px`,
                                transform: `rotate(${handRotation}deg)`,
                                transition: 'all 0.2s ease-out',
                            }}
                        >
                            <img 
                                src={palmImage}
                                alt="Petting hand"
                                className="w-10 h-10 object-contain"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
                                    imageRendering: 'crisp-edges'
                                }}
                            />
                            
                            {/* Sparkle effects around the hand */}
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute sparkle-effect"
                                    style={{
                                        left: `${15 + Math.random() * 20}px`,
                                        top: `${10 + Math.random() * 20}px`,
                                        animationDelay: `${i * 0.1}s`,
                                        fontSize: '16px'
                                    }}
                                >
                                    ✨
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Trail Effects */}
                    {showTrail && (activePet !== 'master' && userRank !== 'master') && trailPositions.map((pos, index) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        const opacity = (index / trailPositions.length) * 0.6;
                        const size = currentPet === 'sage' ? 6 : currentPet === 'scholar' ? 4 : 3;
                        
                        return (
                            <div
                                key={index}
                                className="fixed z-30 pointer-events-none"
                                style={{
                                    left: `${pos.x + 80}px`,
                                    top: `${pos.y + 80}px`,
                                    opacity: opacity,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div 
                                    className="rounded-full animate-pulse"
                                    style={{
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        background: `radial-gradient(circle, ${effects.trailColor}, transparent)`,
                                        boxShadow: `0 0 ${size * 2}px ${effects.glowColor}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Enhanced Aura Particles */}
                    {auraParticles.map((particle) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        const radian = (particle.angle * Math.PI) / 180;
                        const x = birdPosition.x + 80 + Math.cos(radian) * particle.distance;
                        const y = birdPosition.y + 80 + Math.sin(radian) * particle.distance;
                        
                        return (
                            <div
                                key={particle.id}
                                className="fixed z-35 pointer-events-none"
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
                                        background: `radial-gradient(circle, ${effects.auraColor}, ${effects.glowColor}40)`,
                                        boxShadow: `0 0 ${particle.size * 1.5}px ${effects.glowColor}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Orbital Elements for Scholar+ */}
                    {orbitalElements.map((element) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        const radian = (element.angle * Math.PI) / 180;
                        const x = birdPosition.x + 80 + Math.cos(radian) * element.radius;
                        const y = birdPosition.y + 80 + Math.sin(radian) * element.radius;
                        
                        return (
                            <div
                                key={element.id}
                                className="fixed z-34 pointer-events-none"
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    opacity: element.opacity,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div
                                    className="rounded-full animate-pulse"
                                    style={{
                                        width: `${element.size}px`,
                                        height: `${element.size}px`,
                                        background: `linear-gradient(45deg, ${effects.glowColor}, ${effects.auraColor})`,
                                        boxShadow: `0 0 ${element.size * 2}px ${effects.glowColor}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Main Bird with Enhanced Effects */}
                    <div
                        ref={birdRef}
                        onClick={handleBirdClick}
                        className={`fixed z-40 cursor-pointer transition-all duration-300 ${
                            !isMoving && !petEffect && !legendaryEffect ? 'hover:scale-105' : ''
                        } ${isMoving && (activePet !== 'master' && userRank !== 'master') ? 'animate-bounce' : getIdleAnimationClass()} ${
                            petEffect ? 'pet-effect-active' : ''
                        } ${legendaryEffect ? 'legendary-effect-active' : ''}`}
                        style={{
                            left: `${birdPosition.x}px`,
                            top: `${birdPosition.y}px`,
                            transform: (activePet !== 'master' && userRank !== 'master') ? `rotate(${birdRotation}deg)` : 'rotate(0deg)',
                            transition: isMoving ? 'none' : 'transform 0.4s ease-out, filter 0.3s ease-out',
                            isolation: 'isolate',
                        }}
                    >
                        <img
                            src={getBirdImage()}
                            alt={getCurrentBirdAssets().name}
                            className={`${getBirdImage().includes('.gif') ? 'w-40 h-40' : 'w-32 h-32'} object-contain pointer-events-none ${
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
                        
                        {/* Enhanced Bird Control Panel - Only show when NOT in flight mode */}
                        {showBirdControls && !petEffect && !legendaryEffect && !isInFlightMode && (
                            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 control-panel-enter">
                                <div 
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl border backdrop-blur-md"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.8))`,
                                        borderColor: getPetEffects(getCurrentPetType()).glowColor,
                                        boxShadow: `0 0 20px ${getPetEffects(getCurrentPetType()).glowColor}40, 0 4px 20px rgba(0,0,0,0.3)`
                                    }}
                                >
                                    <button
                                        onClick={handlePetInteraction}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all text-sm"
                                        title="Pet your companion"
                                    >
                                        <Hand className="w-4 h-4" />
                                        Pet
                                    </button>
                                    
                                    {getCurrentPetType() !== 'master' && (
                                        <button
                                            onClick={handleFlightMode}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-sm"
                                            title="Flight mode - click then click destination"
                                        >
                                            <Plane className="w-4 h-4" />
                                            Fly
                                        </button>
                                    )}
                                    
                                    {getCurrentPetType() === 'master' && legendaryAbilities.master && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-px h-6 bg-gray-600 mx-1"></div>
                                            {legendaryAbilities.master.slice(0, 3).map((ability, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => triggerLegendaryAbility(ability)}
                                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium transition-all text-xs"
                                                    title={ability.description}
                                                >
                                                    <span className="text-xs">{ability.icon}</span>
                                                    <span className="hidden sm:inline">{ability.name.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Thought Bubble */}
                        {showThoughtBubble && !birdSelected && !isMoving && !petEffect && !legendaryEffect && !isInFlightMode && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 thought-bubble-enter">
                                <div 
                                    className="relative rounded-2xl px-3 py-2 shadow-lg border backdrop-blur-sm min-w-[160px]"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))`,
                                        borderColor: getPetEffects(getCurrentPetType()).glowColor + '60',
                                        boxShadow: `0 0 15px ${getPetEffects(getCurrentPetType()).glowColor}40, 0 2px 10px rgba(0,0,0,0.1)`
                                    }}
                                >
                                    <span className="text-2xl drop-shadow-sm">{currentThought}</span>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <div 
                                            className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                                            style={{ borderTopColor: 'rgba(255,255,255,0.95)' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Pet Effect Message */}
                        {petEffect && (
                            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
                                <div 
                                    className="relative rounded-xl px-4 py-2 shadow-xl border backdrop-blur-sm animate-bounce min-w-[150px] text-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}E0, ${getPetEffects(getCurrentPetType()).auraColor}C0)`,
                                        borderColor: '#ffffff80',
                                        boxShadow: `0 0 25px ${getPetEffects(getCurrentPetType()).glowColor}60, 0 4px 15px rgba(0,0,0,0.2)`,
                                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <span className="text-white font-semibold text-base">{petEffect.message}</span>
                                    {/* Heart particles for petting */}
                                    {[...Array(getCurrentPetType() === 'master' ? 6 : getCurrentPetType() === 'sage' ? 5 : 3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute heart-particle"
                                            style={{
                                                left: `${20 + Math.random() * 60}%`,
                                                top: '100%',
                                                animationDelay: `${i * 0.15}s`,
                                                fontSize: getCurrentPetType() === 'master' ? '18px' : '14px'
                                            }}
                                        >
                                            {getCurrentPetType() === 'master' ? '💎' : getCurrentPetType() === 'sage' ? '✨' : '💝'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Legendary Effect Message */}
                        {legendaryEffect && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                <div 
                                    className="relative rounded-xl px-6 py-3 shadow-2xl border-2 backdrop-blur-sm legendary-effect-active"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(255,69,0,0.95), rgba(255,140,0,0.9))`,
                                        borderColor: '#FFD700',
                                        boxShadow: `0 0 40px rgba(255,69,0,0.8), 0 0 20px rgba(255,215,0,0.6), 0 6px 25px rgba(0,0,0,0.3)`,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <span className="text-white font-bold text-lg">
                                        👑 {currentAbility?.name.toUpperCase()} ACTIVATED! 👑
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* SIMPLIFIED Flight Mode Message */}
                        {isInFlightMode && birdSelected && !isMoving && !petEffect && !legendaryEffect && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                                <div 
                                    className="text-white text-sm px-3 py-1.5 rounded-lg animate-pulse backdrop-blur-sm border min-w-[200px] text-center"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(59,130,246,0.9), rgba(147,51,234,0.8))`,
                                        borderColor: '#ffffff40',
                                        boxShadow: `0 0 15px rgba(59,130,246,0.5)`,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                                    }}
                                >
                                    {getCurrentPetType() === 'master' ? '👑 Click to teleport! 👑' : '✈️ Click destination! ✈️'}
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Movement Messages */}
                        {isMoving && (activePet !== 'master') && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                                <div 
                                    className="text-white text-sm px-3 py-2 rounded-lg animate-pulse backdrop-blur-sm border min-w-[170px] text-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}, ${getPetEffects(getCurrentPetType()).auraColor})`,
                                        borderColor: '#ffffff50',
                                        boxShadow: `0 0 20px ${getPetEffects(getCurrentPetType()).glowColor}60`,
                                        textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {getCurrentPetType() === 'sage' ? '🌟 Mystical Flight! 🌟' : 
                                     getCurrentPetType() === 'scholar' ? '📚 Scholarly Soar! 📚' :
                                     getCurrentPetType() === 'apprentice' ? '⚡ Magical Flight! ⚡' : 
                                     '💚 Flying! 💚'}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Mobile Menu */}
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
                    showNoneOption={true}
                />
            )}
        </>
    );
}

export default Header;