import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trophy, Timer, User, Calendar } from 'lucide-react';
import Header from './Header';
import TaskHistoryModal from './TaskHistoryModal';
import EditProfileModal from './EditProfileModal';

const Profile = () => {
    const [showTaskHistory, setShowTaskHistory] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const { username } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleProfileUpdate = (updatedData) => {
        setProfileData(prev => ({
            ...prev,
            ...updatedData
        }));
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

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header 
                username={profileData?.username}
                isOwnProfile={profileData?.isOwnProfile}
                onEditProfile={() => setShowEditProfile(true)}
            />
            
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl p-8 mb-8">
                    <div className="flex items-start gap-8">
                        {/* Profile Photo */}
                        <div className="w-32 h-32 bg-zinc-900 rounded-full overflow-hidden">
                            {profileData?.profilePhoto ? (
                                <img 
                                    src={profileData.profilePhoto} 
                                    alt={profileData.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-16 h-16 text-gray-600" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className={`text-3xl font-bold ${currentTitle.gradient || currentTitle.color}`}>
                                    {profileData?.username}
                                </h1>
    
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentTitle.background} ${currentTitle.color} ${currentTitle.border} border`}>
                                    {currentTitle.name}
                                </div>
                                
                                <div className="flex-1"></div>
                                
                                <button
                                    onClick={() => setShowTaskHistory(true)}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2 rounded-xl border border-zinc-800 transition-all duration-300 flex items-center gap-2 hover:border-zinc-700 shadow-lg hover:shadow-zinc-900/25"
                                >
                                    <span>Task History</span>
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {createdAt}</span>
                            </div>
    
                            <p className="text-zinc-300">
                                {profileData?.bio || 'No bio yet'}
                            </p>
                        </div>
                    </div>
                </div>
    
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Trophy className={`w-8 h-8 ${currentTitle.color}`} />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Current Title</h3>
                                <p className={`text-2xl font-bold ${currentTitle.gradient || currentTitle.color}`}>
                                    {currentTitle.name}
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Timer className="w-8 h-8 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Sessions Completed</h3>
                                <p className="text-2xl font-bold text-gray-100">{profileData?.sessionsCompleted}</p>
                            </div>
                        </div>
                    </div>
    
                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Total Time Studied</h3>
                                <p className="text-2xl font-bold text-gray-100">
                                    {Math.floor(profileData?.totalTimeStudied / 60)} hours {profileData?.totalTimeStudied % 60} mins
                                </p>
                            </div>
                        </div>
                    </div>
    
                    <div className="lg:col-span-3 bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-200 mb-8">Journey Progress</h2>
                        <div className="relative">
                            <div className="w-full bg-zinc-900 h-2 mb-8 relative rounded-full overflow-hidden">
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
                            
                            <div className="flex justify-between -mx-4">
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-sm font-medium text-emerald-400">Novice</span>
                                    <span className="text-xs text-zinc-600">0h</span>
                                </div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-sm font-medium text-blue-400">Apprentice</span>
                                    <span className="text-xs text-zinc-600">5h</span>
                                </div>
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-sm font-medium text-purple-400">Scholar</span>
                                    <span className="text-xs text-zinc-600">10h</span>
                                </div>
                                <div className="flex flex-col items-center px-5">
                                    <span className="text-sm font-medium text-amber-400">Sage</span>
                                    <span className="text-xs text-zinc-600">20h</span>
                                </div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-sm font-medium bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Master</span>
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
                tasks={profileData?.taskHistory}
            />
    
            {showEditProfile && (
                <EditProfileModal
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    profileData={profileData}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default Profile;