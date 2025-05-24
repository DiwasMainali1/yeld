import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Menu, X, Hand, Plane } from 'lucide-react';
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
    
    // Enhanced bird state
    const [birdVisible, setBirdVisible] = useState(false);
    const [birdPosition, setBirdPosition] = useState({ x: 200, y: 200 });
    const [birdSelected, setBirdSelected] = useState(false);
    const [birdTarget, setBirdTarget] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [birdRotation, setBirdRotation] = useState(0);
    const [showTrail, setShowTrail] = useState(false);
    const [trailPositions, setTrailPositions] = useState([]);
    const [interactionMode, setInteractionMode] = useState('pet'); // 'pet' or 'fly'
    
    // Enhanced animation states
    const [showThoughtBubble, setShowThoughtBubble] = useState(false);
    const [currentThought, setCurrentThought] = useState('');
    const [idleAnimation, setIdleAnimation] = useState('');
    const [auraParticles, setAuraParticles] = useState([]);
    const [masterEffects, setMasterEffects] = useState([]);
    const [petEffect, setPetEffect] = useState(null);
    const [backgroundGlow, setBackgroundGlow] = useState(false);
    const [orbitalElements, setOrbitalElements] = useState([]);
    const [magicCircles, setMagicCircles] = useState([]);
    const [prismaticBeams, setPrismaticBeams] = useState([]);
    const [dimensionalRifts, setDimensionalRifts] = useState([]);
    
    const birdRef = useRef(null);
    const animationRef = useRef(null);
    const idleTimerRef = useRef(null);
    const thoughtTimerRef = useRef(null);
    const auraTimerRef = useRef(null);
    const effectsTimerRef = useRef(null);

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

    // Enhanced pet effects with professional quality
    const getPetEffects = (petType) => {
        switch(petType) {
            case 'novice':
                return {
                    filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))',
                    auraColor: 'rgba(34, 197, 94, 0.2)',
                    trailColor: 'rgb(34, 197, 94)',
                    glowColor: 'rgba(34, 197, 94, 0.6)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
                };
            case 'apprentice':
                return {
                    filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 6px rgba(147, 51, 234, 0.4))',
                    auraColor: 'rgba(59, 130, 246, 0.3)',
                    trailColor: 'rgb(59, 130, 246)',
                    glowColor: 'rgba(59, 130, 246, 0.8)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)'
                };
            case 'scholar':
                return {
                    filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 8px rgba(236, 72, 153, 0.5))',
                    auraColor: 'rgba(168, 85, 247, 0.4)',
                    trailColor: 'rgb(168, 85, 247)',
                    glowColor: 'rgba(168, 85, 247, 0.9)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)'
                };
            case 'sage':
                return {
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 10px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))',
                    auraColor: 'rgba(251, 191, 36, 0.5)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 1)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.25) 0%, rgba(251, 146, 60, 0.2) 40%, rgba(239, 68, 68, 0.15) 70%, transparent 90%)'
                };
            case 'master':
                return {
                    filter: 'drop-shadow(0 0 25px rgba(255, 69, 0, 0.9)) drop-shadow(0 0 15px rgba(255, 140, 0, 0.7)) drop-shadow(0 0 10px rgba(255, 165, 0, 0.6)) drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))',
                    auraColor: 'rgba(255, 69, 0, 0.6)',
                    trailColor: 'rgb(255, 69, 0)',
                    glowColor: 'rgba(255, 69, 0, 1)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(255, 69, 0, 0.3) 0%, rgba(255, 140, 0, 0.25) 30%, rgba(255, 165, 0, 0.2) 50%, rgba(255, 215, 0, 0.15) 70%, transparent 90%)'
                };
            default:
                return {
                    filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))',
                    auraColor: 'rgba(251, 191, 36, 0.3)',
                    trailColor: 'rgb(251, 191, 36)',
                    glowColor: 'rgba(251, 191, 36, 0.8)',
                    backgroundGlow: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)'
                };
        }
    };

    // Generate enhanced aura particles
    const generateAuraParticles = (petType) => {
        if (petType === 'novice') return;
        
        const configs = {
            apprentice: { count: 4, distance: 15, speed: 1.5, size: 4 },
            scholar: { count: 6, distance: 20, speed: 2, size: 5 },
            sage: { count: 8, distance: 25, speed: 2.5, size: 6 },
            master: { count: 12, distance: 30, speed: 3, size: 8 }
        };
        
        const config = configs[petType] || configs.apprentice;
        const particles = [];
        
        for (let i = 0; i < config.count; i++) {
            particles.push({
                id: i,
                angle: (360 / config.count) * i,
                distance: config.distance + Math.random() * 10,
                speed: config.speed + Math.random() * 0.5,
                size: config.size + Math.random() * 2,
                opacity: Math.random() * 0.6 + 0.4,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        setAuraParticles(particles);
    };

    // Generate orbital elements for higher tiers
    const generateOrbitalElements = (petType) => {
        if (petType === 'novice' || petType === 'apprentice') return;
        
        const elements = [];
        const count = petType === 'master' ? 6 : petType === 'sage' ? 4 : 3;
        
        for (let i = 0; i < count; i++) {
            elements.push({
                id: i,
                radius: 40 + i * 15,
                speed: 1 + i * 0.3,
                angle: (360 / count) * i,
                size: petType === 'master' ? 6 : 4,
                opacity: 0.7 - i * 0.1
            });
        }
        
        setOrbitalElements(elements);
    };

    // Generate magic circles for sage and master
    const generateMagicCircles = (petType) => {
        if (petType !== 'sage' && petType !== 'master') return;
        
        const circles = [];
        const count = petType === 'master' ? 3 : 2;
        
        for (let i = 0; i < count; i++) {
            circles.push({
                id: i,
                radius: 60 + i * 30,
                rotation: 0,
                speed: 0.5 + i * 0.3,
                opacity: 0.3 - i * 0.1,
                strokeWidth: petType === 'master' ? 3 : 2
            });
        }
        
        setMagicCircles(circles);
    };

    // Generate prismatic beams for master
    const generatePrismaticBeams = () => {
        const beams = [];
        for (let i = 0; i < 8; i++) {
            beams.push({
                id: i,
                angle: (360 / 8) * i,
                length: 100 + Math.random() * 50,
                width: 2 + Math.random() * 2,
                opacity: 0.4 + Math.random() * 0.4,
                color: `hsl(${(360 / 8) * i}, 80%, 60%)`
            });
        }
        setPrismaticBeams(beams);
        
        setTimeout(() => setPrismaticBeams([]), 3000);
    };

    // Generate dimensional rifts for master ultimate animation
    const generateDimensionalRifts = () => {
        const rifts = [];
        for (let i = 0; i < 5; i++) {
            rifts.push({
                id: i,
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
                width: 3 + Math.random() * 4,
                height: 40 + Math.random() * 60,
                rotation: Math.random() * 360,
                opacity: 0.6 + Math.random() * 0.4
            });
        }
        setDimensionalRifts(rifts);
        
        setTimeout(() => setDimensionalRifts([]), 2000);
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
        if (birdSelected || isMoving || petEffect) {
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
            generateMagicCircles(currentPet);
        }
    }, [birdVisible, activePet, userRank]);

    // Enhanced idle animations
    useEffect(() => {
        if (birdVisible && !isMoving && !birdSelected && !petEffect) {
            const currentPet = getCurrentPetType();
            
            const startIdleAnimations = () => {
                let animations = [];
                
                switch(currentPet) {
                    case 'novice':
                        animations = ['gentle-bounce', 'subtle-sway', 'curious-tilt'];
                        break;
                    case 'apprentice':
                        animations = ['energy-pulse', 'electric-bounce', 'power-sway', 'spark-dance'];
                        break;
                    case 'scholar':
                        animations = ['wisdom-float', 'knowledge-glow', 'mystic-sway', 'scholar-meditation'];
                        break;
                    case 'sage':
                        animations = ['celestial-float', 'cosmic-pulse', 'ancient-wisdom', 'stellar-dance'];
                        break;
                    case 'master':
                        animations = ['legendary-presence', 'divine-ascension', 'reality-warp', 'dimensional-shift', 'prismatic-aura'];
                        break;
                    default:
                        animations = ['gentle-bounce', 'subtle-sway'];
                }
                
                const randomDelay = Math.random() * 4000 + 3000;
                
                idleTimerRef.current = setTimeout(() => {
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    setIdleAnimation(randomAnimation);
                    
                    // Special effects for high-tier pets
                    if (currentPet === 'master') {
                        if (randomAnimation === 'prismatic-aura') {
                            generatePrismaticBeams();
                        } else if (randomAnimation === 'dimensional-shift') {
                            generateDimensionalRifts();
                        }
                        setBackgroundGlow(true);
                    } else if (currentPet === 'sage') {
                        setBackgroundGlow(true);
                    }
                    
                    const duration = currentPet === 'master' ? 8000 : currentPet === 'sage' ? 6000 : 4000;
                    
                    setTimeout(() => {
                        setIdleAnimation('');
                        setBackgroundGlow(false);
                        
                        const gapBetweenAnimations = Math.random() * 2000 + 1500;
                        setTimeout(() => {
                            startIdleAnimations();
                        }, gapBetweenAnimations);
                        
                    }, duration);
                    
                }, randomDelay);
            };

            // Enhanced thought bubbles
            const startThoughtBubbles = () => {
                const randomDelay = Math.random() * 12000 + 10000;
                
                thoughtTimerRef.current = setTimeout(() => {
                    const petThoughts = thoughtBubbles[currentPet] || thoughtBubbles.novice;
                    const randomThought = petThoughts[Math.floor(Math.random() * petThoughts.length)];
                    setCurrentThought(randomThought);
                    setShowThoughtBubble(true);
                    
                    setTimeout(() => setShowThoughtBubble(false), 4000);
                    
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
                            opacity: Math.sin(Date.now() * 0.002 + particle.phase) * 0.3 + 0.5,
                            distance: particle.distance + Math.sin(Date.now() * 0.001 + particle.phase) * 2
                        }))
                    );
                    
                    setOrbitalElements(prevElements => 
                        prevElements.map(element => ({
                            ...element,
                            angle: (element.angle + element.speed) % 360
                        }))
                    );
                    
                    setMagicCircles(prevCircles => 
                        prevCircles.map(circle => ({
                            ...circle,
                            rotation: (circle.rotation + circle.speed) % 360
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
    }, [birdVisible, isMoving, birdSelected, petEffect, activePet, userRank]);

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
            const recentTrail = trailHistory.filter(pos => Date.now() - pos.time < 800);
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

    // Enhanced page click handling
    useEffect(() => {
        const handlePageClick = (e) => {
            const currentPetRank = activePet || userRank;
            if (birdSelected && birdRef.current && !birdRef.current.contains(e.target)) {
                if (interactionMode === 'fly') {
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
                } else {
                    // Pet mode - trigger petting animation
                    handlePetInteraction();
                }
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
    }, [birdSelected, birdVisible, isMoving, userRank, activePet, interactionMode]);

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
        if (!isMoving && !petEffect) {
            setBirdSelected(!birdSelected);
        }
    };

    // Enhanced pet interaction
    const handlePetInteraction = () => {
        const currentPet = getCurrentPetType();
        const messages = petMessages[currentPet] || petMessages.novice;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        setPetEffect({
            message: randomMessage,
            type: currentPet,
            timestamp: Date.now()
        });
        
        // Enhanced effects based on pet level
        switch(currentPet) {
            case 'novice':
                // Simple heart particles
                break;
            case 'apprentice':
                // Electric sparkles
                setBackgroundGlow(true);
                break;
            case 'scholar':
                // Wisdom aura expansion
                setBackgroundGlow(true);
                break;
            case 'sage':
                // Mystical energy waves
                setBackgroundGlow(true);
                break;
            case 'master':
                // Reality-bending effects
                generatePrismaticBeams();
                generateDimensionalRifts();
                setBackgroundGlow(true);
                break;
        }
        
        // Clear effect after duration
        setTimeout(() => {
            setPetEffect(null);
            setBackgroundGlow(false);
        }, currentPet === 'master' ? 5000 : currentPet === 'sage' ? 4000 : 3000);
        
        setBirdSelected(false);
    };

    const handlePetIconClick = () => {
        if (unlockedPets.length > 1) {
            setShowPetSelectionModal(true);
        } else {
            setBirdVisible(!birdVisible);
        }
    };

    const handlePetSelection = (selectedPet) => {
        setActivePet(selectedPet);
        setBirdVisible(true);
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
            'spark-dance': 'animate-spark-dance',
            'wisdom-float': 'animate-wisdom-float',
            'knowledge-glow': 'animate-knowledge-glow',
            'mystic-sway': 'animate-mystic-sway',
            'scholar-meditation': 'animate-scholar-meditation',
            'celestial-float': 'animate-celestial-float',
            'cosmic-pulse': 'animate-cosmic-pulse',
            'ancient-wisdom': 'animate-ancient-wisdom',
            'stellar-dance': 'animate-stellar-dance',
            'legendary-presence': 'animate-legendary-presence',
            'divine-ascension': 'animate-divine-ascension',
            'reality-warp': 'animate-reality-warp',
            'dimensional-shift': 'animate-dimensional-shift',
            'prismatic-aura': 'animate-prismatic-aura'
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
                    50% { transform: translateY(-3px); }
                }
                
                @keyframes subtle-sway {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                
                @keyframes curious-tilt {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(5deg) scale(1.02); }
                    75% { transform: rotate(-3deg) scale(1.01); }
                }
                
                @keyframes energy-pulse {
                    0%, 100% { 
                        transform: scale(1);
                        filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 6px rgba(147, 51, 234, 0.4));
                    }
                    50% { 
                        transform: scale(1.08);
                        filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 12px rgba(147, 51, 234, 0.7));
                    }
                }
                
                @keyframes electric-bounce {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    25% { transform: translateY(-8px) scale(1.05); }
                    50% { transform: translateY(-4px) scale(1.03); }
                    75% { transform: translateY(-6px) scale(1.04); }
                }
                
                @keyframes power-sway {
                    0%, 100% { transform: rotate(-2deg) scale(1); }
                    33% { transform: rotate(3deg) scale(1.02); }
                    66% { transform: rotate(-1deg) scale(1.01); }
                }
                
                @keyframes spark-dance {
                    0%, 100% { transform: rotate(0deg) translateY(0px); }
                    25% { transform: rotate(5deg) translateY(-5px); }
                    50% { transform: rotate(-3deg) translateY(-3px); }
                    75% { transform: rotate(2deg) translateY(-7px); }
                }
                
                @keyframes wisdom-float {
                    0%, 100% { 
                        transform: translateY(0px) scale(1);
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 8px rgba(236, 72, 153, 0.5));
                    }
                    50% { 
                        transform: translateY(-12px) scale(1.06);
                        filter: drop-shadow(0 0 25px rgba(168, 85, 247, 1)) drop-shadow(0 0 15px rgba(236, 72, 153, 0.8));
                    }
                }
                
                @keyframes knowledge-glow {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.7));
                    }
                    50% { 
                        transform: scale(1.1) rotate(2deg);
                        filter: drop-shadow(0 0 30px rgba(168, 85, 247, 1)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.8));
                    }
                }
                
                @keyframes mystic-sway {
                    0%, 100% { transform: rotate(-3deg) translateY(0px); }
                    25% { transform: rotate(4deg) translateY(-6px); }
                    75% { transform: rotate(-2deg) translateY(-3px); }
                }
                
                @keyframes scholar-meditation {
                    0%, 100% { 
                        transform: translateY(0px) scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
                    }
                    50% { 
                        transform: translateY(-8px) scale(1.05) rotate(1deg);
                        filter: drop-shadow(0 0 35px rgba(168, 85, 247, 1)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.9));
                    }
                }
                
                @keyframes celestial-float {
                    0%, 100% { 
                        transform: translateY(0px) scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 10px rgba(251, 146, 60, 0.6));
                    }
                    33% { 
                        transform: translateY(-15px) scale(1.08) rotate(3deg);
                        filter: drop-shadow(0 0 35px rgba(251, 191, 36, 1)) drop-shadow(0 0 20px rgba(251, 146, 60, 0.9));
                    }
                    66% { 
                        transform: translateY(-8px) scale(1.04) rotate(-2deg);
                        filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 15px rgba(239, 68, 68, 0.7));
                    }
                }
                
                @keyframes cosmic-pulse {
                    0%, 100% { 
                        transform: scale(1) translateY(0px);
                        filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.9));
                    }
                    50% { 
                        transform: scale(1.12) translateY(-10px);
                        filter: drop-shadow(0 0 40px rgba(251, 191, 36, 1)) drop-shadow(0 0 25px rgba(251, 146, 60, 0.8));
                    }
                }
                
                @keyframes ancient-wisdom {
                    0%, 100% { 
                        transform: rotate(0deg) scale(1);
                        filter: drop-shadow(0 0 30px rgba(251, 191, 36, 1));
                    }
                    25% { 
                        transform: rotate(2deg) scale(1.06);
                        filter: drop-shadow(0 0 45px rgba(251, 191, 36, 1)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.8));
                    }
                    75% { 
                        transform: rotate(-1deg) scale(1.03);
                        filter: drop-shadow(0 0 35px rgba(251, 146, 60, 1)) drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));
                    }
                }
                
                @keyframes stellar-dance {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg) scale(1);
                    }
                    20% { 
                        transform: translateY(-12px) rotate(5deg) scale(1.08);
                    }
                    40% { 
                        transform: translateY(-6px) rotate(-3deg) scale(1.04);
                    }
                    60% { 
                        transform: translateY(-15px) rotate(2deg) scale(1.1);
                    }
                    80% { 
                        transform: translateY(-3px) rotate(-1deg) scale(1.02);
                    }
                }
                
                @keyframes legendary-presence {
                    0%, 100% { 
                        transform: scale(1) translateY(0px) rotate(0deg);
                        filter: drop-shadow(0 0 40px rgba(255, 69, 0, 1)) drop-shadow(0 0 25px rgba(255, 140, 0, 0.8));
                    }
                    25% { 
                        transform: scale(1.15) translateY(-20px) rotate(3deg);
                        filter: drop-shadow(0 0 60px rgba(255, 69, 0, 1)) drop-shadow(0 0 40px rgba(255, 140, 0, 1)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
                    }
                    75% { 
                        transform: scale(1.08) translateY(-10px) rotate(-2deg);
                        filter: drop-shadow(0 0 50px rgba(255, 140, 0, 1)) drop-shadow(0 0 30px rgba(255, 165, 0, 0.9));
                    }
                }
                
                @keyframes divine-ascension {
                    0%, 100% { 
                        transform: translateY(0px) scale(1) rotate(0deg);
                        filter: drop-shadow(0 0 50px rgba(255, 69, 0, 1));
                    }
                    50% { 
                        transform: translateY(-25px) scale(1.2) rotate(5deg);
                        filter: drop-shadow(0 0 80px rgba(255, 69, 0, 1)) drop-shadow(0 0 50px rgba(255, 215, 0, 1));
                    }
                }
                
                @keyframes reality-warp {
                    0%, 100% { 
                        transform: scale(1) skew(0deg, 0deg);
                        filter: drop-shadow(0 0 45px rgba(255, 69, 0, 1));
                    }
                    25% { 
                        transform: scale(1.1) skew(2deg, 1deg);
                        filter: drop-shadow(0 0 70px rgba(255, 69, 0, 1)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.8));
                    }
                    75% { 
                        transform: scale(1.05) skew(-1deg, -2deg);
                        filter: drop-shadow(0 0 60px rgba(255, 140, 0, 1)) drop-shadow(0 0 35px rgba(59, 130, 246, 0.7));
                    }
                }
                
                @keyframes dimensional-shift {
                    0%, 100% { 
                        transform: scale(1) perspective(500px) rotateY(0deg);
                        filter: drop-shadow(0 0 50px rgba(255, 69, 0, 1));
                    }
                    50% { 
                        transform: scale(1.15) perspective(500px) rotateY(15deg);
                        filter: drop-shadow(0 0 80px rgba(255, 69, 0, 1)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.9));
                    }
                }
                
                @keyframes prismatic-aura {
                    0%, 100% { 
                        transform: scale(1);
                        filter: drop-shadow(0 0 60px rgba(255, 69, 0, 1)) hue-rotate(0deg);
                    }
                    25% { 
                        transform: scale(1.12);
                        filter: drop-shadow(0 0 80px rgba(255, 69, 0, 1)) hue-rotate(90deg);
                    }
                    50% { 
                        transform: scale(1.08);
                        filter: drop-shadow(0 0 70px rgba(255, 69, 0, 1)) hue-rotate(180deg);
                    }
                    75% { 
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 75px rgba(255, 69, 0, 1)) hue-rotate(270deg);
                    }
                }
                
                @keyframes thought-bubble-appear {
                    0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0px); }
                }
                
                @keyframes pet-effect-bounce {
                    0%, 100% { transform: scale(1) translateY(0px); }
                    50% { transform: scale(1.15) translateY(-8px); }
                }
                
                @keyframes heart-float {
                    0% { opacity: 1; transform: translateY(0px) scale(0.5); }
                    100% { opacity: 0; transform: translateY(-40px) scale(1); }
                }
                
                @keyframes prismatic-beam {
                    0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
                    100% { opacity: 0; transform: scale(0.8) rotate(360deg); }
                }
                
                @keyframes dimensional-rift {
                    0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
                    50% { opacity: 0.8; transform: scale(1) rotate(90deg); }
                    100% { opacity: 0; transform: scale(0.5) rotate(180deg); }
                }
                
                /* Animation Classes */
                .animate-gentle-bounce { animation: gentle-bounce 2s ease-in-out; }
                .animate-subtle-sway { animation: subtle-sway 3s ease-in-out; }
                .animate-curious-tilt { animation: curious-tilt 2.5s ease-in-out; }
                .animate-energy-pulse { animation: energy-pulse 2.5s ease-in-out; }
                .animate-electric-bounce { animation: electric-bounce 3s ease-in-out; }
                .animate-power-sway { animation: power-sway 3.5s ease-in-out; }
                .animate-spark-dance { animation: spark-dance 4s ease-in-out; }
                .animate-wisdom-float { animation: wisdom-float 4s ease-in-out; }
                .animate-knowledge-glow { animation: knowledge-glow 3.5s ease-in-out; }
                .animate-mystic-sway { animation: mystic-sway 4s ease-in-out; }
                .animate-scholar-meditation { animation: scholar-meditation 5s ease-in-out; }
                .animate-celestial-float { animation: celestial-float 5s ease-in-out; }
                .animate-cosmic-pulse { animation: cosmic-pulse 4s ease-in-out; }
                .animate-ancient-wisdom { animation: ancient-wisdom 6s ease-in-out; }
                .animate-stellar-dance { animation: stellar-dance 5s ease-in-out; }
                .animate-legendary-presence { animation: legendary-presence 6s ease-in-out; }
                .animate-divine-ascension { animation: divine-ascension 7s ease-in-out; }
                .animate-reality-warp { animation: reality-warp 5s ease-in-out; }
                .animate-dimensional-shift { animation: dimensional-shift 6s ease-in-out; }
                .animate-prismatic-aura { animation: prismatic-aura 8s ease-in-out; }
                
                .thought-bubble-enter { animation: thought-bubble-appear 0.6s ease-out; }
                .pet-effect-active { animation: pet-effect-bounce 0.8s ease-in-out; }
                .heart-particle { animation: heart-float 2s ease-out forwards; }
                .prismatic-beam-effect { animation: prismatic-beam 3s ease-out; }
                .dimensional-rift-effect { animation: dimensional-rift 2s ease-out; }
                
                /* Background glow overlay */
                .background-glow-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 25;
                    opacity: 0.6;
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

                {/* Enhanced interaction mode toggle for mobile */}
                {isMobile && birdVisible && (
                    <div className="flex items-center gap-2">
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setInteractionMode('pet')}
                                className={`p-1.5 rounded ${interactionMode === 'pet' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                            >
                                <Hand className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setInteractionMode('fly')}
                                className={`p-1.5 rounded ${interactionMode === 'fly' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                            >
                                <Plane className="w-4 h-4" />
                            </button>
                        </div>
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
                    </div>
                )}
                
                {!isMobile && (
                    <div className="flex flex-row gap-4 items-center">
                        {/* Enhanced interaction mode toggle for desktop */}
                        {birdVisible && (
                            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1 mr-2">
                                <button
                                    onClick={() => setInteractionMode('pet')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                        interactionMode === 'pet' 
                                            ? 'bg-purple-600 text-white shadow-lg' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Pet Mode - Click bird to pet"
                                >
                                    <Hand className="w-4 h-4" />
                                    Pet
                                </button>
                                <button
                                    onClick={() => setInteractionMode('fly')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                        interactionMode === 'fly' 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Fly Mode - Click bird then click destination"
                                >
                                    <Plane className="w-4 h-4" />
                                    Fly
                                </button>
                            </div>
                        )}

                        {hasHatchedPet ? (
                            <button
                                onClick={handlePetIconClick}
                                className="relative w-10 h-10 rounded-full bg-black border-gray-400 hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-lg"
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
                        const opacity = (index / trailPositions.length) * 0.9;
                        const size = currentPet === 'sage' ? 8 : currentPet === 'scholar' ? 6 : 5;
                        
                        return (
                            <div
                                key={index}
                                className="fixed z-30 pointer-events-none"
                                style={{
                                    left: `${pos.x + 96}px`,
                                    top: `${pos.y + 96}px`,
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
                                        boxShadow: `0 0 ${size * 3}px ${effects.glowColor}`,
                                    }}
                                />
                                {currentPet === 'sage' && (
                                    <div 
                                        className="absolute inset-0 rounded-full animate-ping"
                                        style={{
                                            background: `radial-gradient(circle, ${effects.auraColor}, transparent)`,
                                        }}
                                    />
                                )}
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
                                    animation: `aura-particle-${currentPet} 3s ease-in-out infinite`,
                                    animationDelay: `${particle.id * 0.2}s`
                                }}
                            >
                                <div
                                    className="rounded-full"
                                    style={{
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        background: `radial-gradient(circle, ${effects.auraColor}, ${effects.glowColor}20)`,
                                        boxShadow: `0 0 ${particle.size * 2}px ${effects.glowColor}`,
                                    }}
                                />
                                {currentPet === 'master' && (
                                    <div 
                                        className="absolute inset-0 rounded-full animate-ping"
                                        style={{
                                            background: `conic-gradient(from 0deg, ${effects.glowColor}, transparent, ${effects.glowColor})`,
                                        }}
                                    />
                                )}
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
                                        boxShadow: `0 0 ${element.size * 4}px ${effects.glowColor}`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Magic Circles for Sage+ */}
                    {magicCircles.map((circle) => {
                        const currentPet = getCurrentPetType();
                        const effects = getPetEffects(currentPet);
                        
                        return (
                            <svg
                                key={circle.id}
                                className="fixed z-33 pointer-events-none"
                                style={{
                                    left: `${birdPosition.x + 80}px`,
                                    top: `${birdPosition.y + 80}px`,
                                    width: `${circle.radius * 2}px`,
                                    height: `${circle.radius * 2}px`,
                                    opacity: circle.opacity,
                                    transform: `translate(-50%, -50%) rotate(${circle.rotation}deg)`,
                                }}
                            >
                                <circle
                                    cx={circle.radius}
                                    cy={circle.radius}
                                    r={circle.radius - circle.strokeWidth}
                                    fill="none"
                                    stroke={effects.glowColor}
                                    strokeWidth={circle.strokeWidth}
                                    strokeDasharray="10 5"
                                    filter={`drop-shadow(0 0 10px ${effects.glowColor})`}
                                />
                                {currentPet === 'master' && (
                                    <>
                                        <circle
                                            cx={circle.radius}
                                            cy={circle.radius}
                                            r={circle.radius - circle.strokeWidth - 10}
                                            fill="none"
                                            stroke={effects.auraColor}
                                            strokeWidth="1"
                                            strokeDasharray="5 3"
                                        />
                                        {/* Runic symbols */}
                                        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                                            const symbolRadian = (angle * Math.PI) / 180;
                                            const symbolX = circle.radius + Math.cos(symbolRadian) * (circle.radius - 15);
                                            const symbolY = circle.radius + Math.sin(symbolRadian) * (circle.radius - 15);
                                            return (
                                                <text
                                                    key={i}
                                                    x={symbolX}
                                                    y={symbolY}
                                                    fill={effects.glowColor}
                                                    fontSize="12"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    style={{ filter: `drop-shadow(0 0 5px ${effects.glowColor})` }}
                                                >
                                                    ✦
                                                </text>
                                            );
                                        })}
                                    </>
                                )}
                            </svg>
                        );
                    })}
                    
                    {/* Prismatic Beams for Master */}
                    {getCurrentPetType() === 'master' && prismaticBeams.map((beam) => (
                        <div
                            key={beam.id}
                            className="fixed z-36 pointer-events-none prismatic-beam-effect"
                            style={{
                                left: `${birdPosition.x + 80}px`,
                                top: `${birdPosition.y + 80}px`,
                                width: `${beam.length}px`,
                                height: `${beam.width}px`,
                                background: `linear-gradient(90deg, ${beam.color}, transparent)`,
                                transform: `translate(-50%, -50%) rotate(${beam.angle}deg)`,
                                opacity: beam.opacity,
                                boxShadow: `0 0 20px ${beam.color}`,
                                borderRadius: '50px',
                            }}
                        />
                    ))}
                    
                    {/* Dimensional Rifts for Master */}
                    {getCurrentPetType() === 'master' && dimensionalRifts.map((rift) => (
                        <div
                            key={rift.id}
                            className="fixed z-37 pointer-events-none dimensional-rift-effect"
                            style={{
                                left: `${birdPosition.x + 80 + rift.x}px`,
                                top: `${birdPosition.y + 80 + rift.y}px`,
                                width: `${rift.width}px`,
                                height: `${rift.height}px`,
                                background: 'linear-gradient(90deg, rgba(255,69,0,0.9), rgba(147,51,234,0.7), rgba(59,130,246,0.5))',
                                transform: `translate(-50%, -50%) rotate(${rift.rotation}deg)`,
                                opacity: rift.opacity,
                                borderRadius: '2px',
                                boxShadow: '0 0 30px rgba(255,69,0,0.8)',
                            }}
                        />
                    ))}
                    
                    {/* Main Bird with Enhanced Effects */}
                    <div
                        ref={birdRef}
                        onClick={handleBirdClick}
                        className={`fixed z-40 cursor-pointer transition-all duration-300 ${
                            !isMoving && !petEffect ? 'hover:scale-110' : ''
                        } ${isMoving && (activePet !== 'master' && userRank !== 'master') ? 'animate-bounce' : getIdleAnimationClass()} ${
                            petEffect ? 'pet-effect-active' : ''
                        }`}
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
                        {showThoughtBubble && !birdSelected && !isMoving && !petEffect && (
                            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 thought-bubble-enter">
                                <div 
                                    className="relative rounded-2xl p-4 shadow-2xl border-2 backdrop-blur-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).auraColor}80, rgba(255, 255, 255, 0.95))`,
                                        borderColor: getPetEffects(getCurrentPetType()).glowColor,
                                        boxShadow: `0 0 30px ${getPetEffects(getCurrentPetType()).glowColor}, inset 0 0 20px rgba(255,255,255,0.3)`
                                    }}
                                >
                                    <span className="text-3xl drop-shadow-lg">{currentThought}</span>
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                        <div 
                                            className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent"
                                            style={{ borderTopColor: getPetEffects(getCurrentPetType()).glowColor }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Pet Effect Message */}
                        {petEffect && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                                <div 
                                    className="relative rounded-full px-6 py-3 shadow-2xl border-2 backdrop-blur-sm animate-bounce"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}, ${getPetEffects(getCurrentPetType()).auraColor})`,
                                        borderColor: '#ffffff',
                                        boxShadow: `0 0 40px ${getPetEffects(getCurrentPetType()).glowColor}, inset 0 0 20px rgba(255,255,255,0.3)`,
                                        textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <span className="text-white font-bold text-lg">{petEffect.message}</span>
                                    {/* Heart particles for petting */}
                                    {[...Array(getCurrentPetType() === 'master' ? 8 : getCurrentPetType() === 'sage' ? 6 : 4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute heart-particle"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: '100%',
                                                animationDelay: `${i * 0.2}s`,
                                                fontSize: getCurrentPetType() === 'master' ? '20px' : '16px'
                                            }}
                                        >
                                            {getCurrentPetType() === 'master' ? '💎' : getCurrentPetType() === 'sage' ? '✨' : '💝'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Selection Messages */}
                        {birdSelected && !isMoving && !petEffect && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                <div 
                                    className="relative rounded-full px-4 py-2 shadow-lg border backdrop-blur-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}E0, ${getPetEffects(getCurrentPetType()).auraColor}C0)`,
                                        borderColor: '#ffffff80',
                                        boxShadow: `0 0 20px ${getPetEffects(getCurrentPetType()).glowColor}`
                                    }}
                                >
                                    <span className="text-white font-semibold text-sm">
                                        {interactionMode === 'pet' ? (
                                            getCurrentPetType() === 'master' ? '👑 READY FOR LEGENDARY PETS! 👑' :
                                            getCurrentPetType() === 'sage' ? '🌟 Ready for mystical pets! 🌟' :
                                            getCurrentPetType() === 'scholar' ? '📚 Ready for wise pets! 📚' :
                                            getCurrentPetType() === 'apprentice' ? '⚡ Ready for magical pets! ⚡' :
                                            '💚 Ready for gentle pets! 💚'
                                        ) : (
                                            getCurrentPetType() === 'master' ? '👑 LEGENDARY MASTER (No flight needed!) 👑' :
                                            getCurrentPetType() === 'sage' ? '🌟 Click to command flight! 🌟' :
                                            getCurrentPetType() === 'scholar' ? '📚 Click where to fly! 📚' :
                                            getCurrentPetType() === 'apprentice' ? '⚡ Ready to soar! ⚡' :
                                            '💚 Click where to fly! 💚'
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Movement Messages */}
                        {isMoving && (activePet !== 'master') && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                                <div 
                                    className="text-white text-sm px-4 py-2 rounded-full animate-pulse backdrop-blur-sm border"
                                    style={{
                                        background: `linear-gradient(135deg, ${getPetEffects(getCurrentPetType()).glowColor}, ${getPetEffects(getCurrentPetType()).auraColor})`,
                                        borderColor: '#ffffff60',
                                        boxShadow: `0 0 25px ${getPetEffects(getCurrentPetType()).glowColor}`,
                                        textShadow: '0 0 10px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {getCurrentPetType() === 'sage' ? '🌟 COSMIC FLIGHT! 🌟' : 
                                     getCurrentPetType() === 'scholar' ? '📚 SCHOLARLY SOAR! 📚' :
                                     getCurrentPetType() === 'apprentice' ? '⚡ MAGICAL ZOOM! ⚡' : 
                                     '💚 FLYING! 💚'}
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
                />
            )}
        </>
    );
}

export default Header;