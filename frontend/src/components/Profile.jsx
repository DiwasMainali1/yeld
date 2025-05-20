import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trophy, Timer, Calendar, List } from 'lucide-react';
import Header from './Header';
import TaskHistoryModal from './TaskHistoryModal';

import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';

const animalAvatars = [
  { id: 'fox', src: foxImage, alt: 'Fox' },
  { id: 'owl', src: owlImage, alt: 'Owl' },
  { id: 'panda', src: pandaImage, alt: 'Panda' },
  { id: 'penguin', src: penguinImage, alt: 'Penguin' },
  { id: 'koala', src: koalaImage, alt: 'Koala' },
];

const Profile = () => {
    const [showTaskHistory, setShowTaskHistory] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const { username } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAvatar, setSelectedAvatar] = useState('fox'); // Default avatar

    const titles = {
        novice: { 
            hours: 0, 
            name: "Learning Novice",
            description: "Taking the first steps into the learning journey",
            color: "text-emerald-400",
            background: "bg-emerald-400/10",
            border: "border-emerald-400/20"
        },
        apprentice: { 
            hours: 5, 
            name: "Knowledge Apprentice",
            description: "Building foundational study habits",
            color: "text-blue-400",
            background: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        scholar: { 
            hours: 10, 
            name: "Dedicated Scholar",
            description: "Mastering the art of focused learning",
            color: "text-purple-400",
            background: "bg-purple-400/10",
            border: "border-purple-400/20"
        },
        sage: { 
            hours: 20, 
            name: "Wisdom Sage",
            description: "Demonstrating exceptional dedication to growth",
            color: "text-amber-400",
            background: "bg-amber-400/10",
            border: "border-amber-400/20",
            gradient: "bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
        },
        master: { 
            hours: 50, 
            name: "Learning Master",
            description: "Achieved mastery in sustained learning",
            color: "text-rose-400",
            background: "bg-rose-400/10",
            border: "border-rose-400/20",
            gradient: "bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient"
        }
    };

    const getCurrentTitle = (hours) => {
        if (hours >= 50) return titles.master;
        if (hours >= 20) return titles.sage;
        if (hours >= 10) return titles.scholar;
        if (hours >= 5) return titles.apprentice;
        return titles.novice;
    };

    const handleAvatarChange = async (avatarId) => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:5000/profile/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    avatar: avatarId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update avatar');
            }

            setSelectedAvatar(avatarId);
            setShowAvatarSelector(false);
            
            // Update local profile data
            setProfileData(prev => ({
                ...prev,
                avatar: avatarId
            }));
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    navigate('/login');
                    return;
                }
        
                const response = await fetch(`http://localhost:5000/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('userToken');
                        navigate('/login');
                        return;
                    }
                    if (response.status === 404) {
                        navigate('/404');
                        return;
                    }
                    throw new Error('Failed to fetch profile');
                }
                
                const data = await response.json();
                setProfileData(data);
                
                // Set selected avatar from data
                if (data.avatar) {
                    setSelectedAvatar(data.avatar);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, navigate]);

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    const totalHours = profileData?.totalTimeStudied / 60;
    const currentTitle = getCurrentTitle(totalHours);
    const createdAt = new Date(profileData?.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get current avatar image
    const currentAvatar = animalAvatars.find(avatar => avatar.id === selectedAvatar) || animalAvatars[0];

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header 
                username={profileData?.username}
                isOwnProfile={profileData?.isOwnProfile}
            />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
                <div className="max-w-2xl mx-auto bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl p-4 sm:p-6 md:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
                        {/* Animal Avatar */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-zinc-900 rounded-full overflow-hidden group">
                            <img 
                                src={currentAvatar.src} 
                                alt={currentAvatar.alt}
                                className="w-full h-full object-cover"
                            />
                            {profileData?.isOwnProfile && (
                                <button
                                    onClick={() => setShowAvatarSelector(true)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
                                >
                                    <span className="text-xs sm:text-sm">Change Avatar</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-2 sm:mb-4">
                                <h1 className={`text-2xl sm:text-3xl font-bold ${currentTitle.gradient || currentTitle.color}`}>
                                    {profileData?.username}
                                </h1>
                                
                                <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${currentTitle.background} ${currentTitle.color} ${currentTitle.border} border`}>
                                    {currentTitle.name}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Joined {createdAt}</span>
                            </div>
                            
                            <div className="mt-3 sm:mt-0">
                                <button
                                    onClick={() => setShowTaskHistory(true)}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 sm:px-6 py-2 rounded-xl border border-zinc-800 transition-all duration-300 flex items-center gap-2 hover:border-zinc-700 shadow-lg hover:shadow-zinc-900/25 mx-auto sm:mx-0"
                                >
                                    <List className="w-4 h-4" />
                                    <span>Task History</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Trophy className={`w-6 h-6 sm:w-8 sm:h-8 ${currentTitle.color}`} />
                            <div>
                                <h3 className="text-gray-200 text-sm sm:text-base font-semibold">Current Title</h3>
                                <p className={`text-lg sm:text-2xl font-bold ${currentTitle.gradient || currentTitle.color}`}>
                                    {currentTitle.name}
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 text-sm sm:text-base font-semibold">Sessions Completed</h3>
                                <p className="text-lg sm:text-2xl font-bold text-gray-100">{profileData?.sessionsCompleted}</p>
                            </div>
                        </div>
                    </div>
    
                    <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 text-sm sm:text-base font-semibold">Total Time Studied</h3>
                                <p className="text-lg sm:text-2xl font-bold text-gray-100">
                                    {Math.floor(profileData?.totalTimeStudied / 60)} hours {profileData?.totalTimeStudied % 60} mins
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div className="lg:col-span-3 bg-zinc-950 p-4 sm:p-6 md:p-8 rounded-2xl border border-zinc-900 shadow-xl">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-200 mb-4 sm:mb-6 md:mb-8">Journey Progress</h2>
                        <div className="relative">
                            <div className="w-full bg-zinc-900 h-2 mb-6 sm:mb-8 relative rounded-full overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500"
                                    style={{ 
                                        width: (() => {
                                            const totalTimeInHours = totalHours;
                                            let progressWidth = 0;
                                            
                                            if (totalTimeInHours >= 50) {
                                                progressWidth = 100;
                                            } else if (totalTimeInHours >= 20) {
                                                progressWidth = 75 + ((totalTimeInHours - 20) / 30) * 25;
                                            } else if (totalTimeInHours >= 10) {
                                                progressWidth = 50 + ((totalTimeInHours - 10) / 10) * 25;
                                            } else if (totalTimeInHours >= 5) {
                                                progressWidth = 25 + ((totalTimeInHours - 5) / 5) * 25;
                                            } else {
                                                progressWidth = (totalTimeInHours / 5) * 25;
                                            }
                                            
                                            return `${Math.min(100, Math.max(0, progressWidth))}%`;
                                        })()
                                    }}
                                ></div>
                                
                                <div className="absolute top-1/2 left-0 w-0.5 h-4 bg-zinc-800 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-1/4 w-0.5 h-4 bg-zinc-800 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-zinc-800 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-3/4 w-0.5 h-4 bg-zinc-800 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 right-0 w-0.5 h-4 bg-zinc-800 -translate-y-1/2"></div>
                            </div>
                            
                            <div className="flex justify-between">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs sm:text-sm font-medium text-emerald-400">Novice</span>
                                    <span className="text-xs text-zinc-600">0h</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs sm:text-sm font-medium text-blue-400">Apprentice</span>
                                    <span className="text-xs text-zinc-600">5h</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs sm:text-sm font-medium text-purple-400">Scholar</span>
                                    <span className="text-xs text-zinc-600">10h</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs sm:text-sm font-medium text-amber-400">Sage</span>
                                    <span className="text-xs text-zinc-600">20h</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Master</span>
                                    <span className="text-xs text-zinc-600">50h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            <TaskHistoryModal 
                isOpen={showTaskHistory}
                onClose={() => setShowTaskHistory(false)}
                tasks={profileData?.taskHistory?.slice(0, 10)}
            />
    
            {/* Avatar Selection Modal */}
            {showAvatarSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-white">Choose an Avatar</h2>
                            <button 
                                onClick={() => setShowAvatarSelector(false)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {animalAvatars.map(avatar => (
                                <div 
                                    key={avatar.id}
                                    className={`cursor-pointer rounded-lg p-2 transition-all ${selectedAvatar === avatar.id ? 'bg-zinc-800 ring-2 ring-blue-500' : 'hover:bg-zinc-900'}`}
                                    onClick={() => handleAvatarChange(avatar.id)}
                                >
                                    <div className="aspect-square rounded-full overflow-hidden border-2 border-zinc-800">
                                        <img 
                                            src={avatar.src} 
                                            alt={avatar.alt}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="text-center text-white text-xs sm:text-sm mt-1 sm:mt-2">{avatar.alt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;