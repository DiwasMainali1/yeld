import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Timer } from 'lucide-react';
import Header from './Header';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await fetch('http://localhost:5000/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black font-sans">
            <Header username={profileData?.username} />
            
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Cards */}
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

                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl">
                        <div className="flex items-center gap-4">
                            <Trophy className="w-8 h-8 text-gray-400" />
                            <div>
                                <h3 className="text-gray-200 font-semibold">Current Milestone</h3>
                                <p className="text-2xl font-bold text-gray-100">{profileData?.currentMilestone} hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Progress */}
                    <div className="lg:col-span-3 bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-200 mb-6">Progress to Next Milestone</h2>
                        <div className="relative">
                            <div className="w-full bg-zinc-900 rounded-full h-4 mb-8">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${profileData?.progress}%` }}
                                ></div>
                            </div>
                            
                            {/* Milestone Markers */}
                            <div className="absolute w-full flex justify-between -bottom-6">
                                {/* 0 hours marker */}
                                <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-zinc-700 mb-2"></div>
                                    <span className="text-sm text-gray-400">0h</span>
                                </div>
                                
                                {/* 5 hours marker (1/4) */}
                                <div className="flex flex-col items-center" style={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)' }}>
                                    <div className="w-1 h-4 bg-zinc-700 mb-2"></div>
                                    <span className="text-sm text-gray-400">5h</span>
                                </div>
                                
                                {/* 10 hours marker (1/2) */}
                                <div className="flex flex-col items-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="w-1 h-4 bg-zinc-700 mb-2"></div>
                                    <span className="text-sm text-gray-400">10h</span>
                                </div>
                                
                                {/* 20 hours marker (3/4) */}
                                <div className="flex flex-col items-center" style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>
                                    <div className="w-1 h-4 bg-zinc-700 mb-2"></div>
                                    <span className="text-sm text-gray-400">20h</span>
                                </div>
                                
                                {/* 50 hours marker (final) */}
                                <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-zinc-700 mb-2"></div>
                                    <span className="text-sm text-gray-400">50h</span>
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