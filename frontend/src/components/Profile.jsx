import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trophy, Timer, User, Camera, ChevronRight, Calendar, Edit2, Check, X } from 'lucide-react';
import Header from './Header';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [tempBio, setTempBio] = useState('');
    const fileInputRef = useRef(null);

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

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);
            
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:5000/profile/${username}/photo`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload image');
            }
            
            const data = await response.json();
            setProfileData(prev => ({ ...prev, profilePhoto: data.profilePhoto }));
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleBioUpdate = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:5000/profile/bio', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bio: tempBio })
            });

            if (!response.ok) throw new Error('Failed to update bio');
            
            const data = await response.json();
            setBio(data.bio);
            setEditingBio(false);
        } catch (error) {
            console.error('Error updating bio:', error);
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
                setBio(data.bio || '');
                setTempBio(data.bio || '');
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

    const totalHours = Math.floor(profileData?.totalTimeStudied / 60);
    const currentTitle = getCurrentTitle(totalHours);
    const nextTitle = Object.values(titles).find(title => title.hours > totalHours);
    const createdAt = new Date(profileData?.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header username={profileData?.username} />
            
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl p-8 mb-8">
                    <div className="flex items-start gap-8">
                        <div className="relative group">
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
                            
                            {profileData?.isOwnProfile && (
                                <>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                        disabled={uploading}
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </>
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
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {createdAt}</span>
                            </div>

                            <div className="relative group">
                                {editingBio ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={tempBio}
                                            onChange={(e) => setTempBio(e.target.value)}
                                            placeholder="Write something about yourself..."
                                            className="w-full bg-zinc-900 text-white rounded-lg p-3 min-h-[100px] resize-none"
                                            maxLength={500}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingBio(false);
                                                    setTempBio(bio);
                                                }}
                                                className="p-2 text-zinc-400 hover:text-zinc-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleBioUpdate}
                                                className="p-2 text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <p className="text-zinc-300">
                                            {bio || (profileData?.isOwnProfile ? 'Add a bio to tell others about yourself...' : 'No bio yet')}
                                        </p>
                                        {profileData?.isOwnProfile && (
                                            <button
                                                onClick={() => setEditingBio(true)}
                                                className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit2 className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                                // For progress before 5 hours
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
        </div>
    );
};

export default Profile;