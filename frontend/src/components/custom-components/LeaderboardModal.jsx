import React, { useState, useEffect } from 'react';
import { X, Trophy, Clock, Medal, Loader2, User as UserIcon } from 'lucide-react';

// Import animal avatar images
import foxImage from '../../assets/fox.png';
import owlImage from '../../assets/owl.png';
import pandaImage from '../../assets/panda.png';
import penguinImage from '../../assets/penguin.png';
import koalaImage from '../../assets/koala.png';

const animalAvatars = {
  fox: foxImage,
  owl: owlImage,
  panda: pandaImage,
  penguin: penguinImage,
  koala: koalaImage
};

const LeaderboardModal = ({ isOpen, onClose }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    setError('Authentication required');
                    return;
                }

                // Get leaderboard data - top 10 users by total study time
                const response = await fetch('http://localhost:5000/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard data');
                }

                const data = await response.json();
                setLeaderboard(data.leaderboard);
                setCurrentUser(data.currentUser);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setError('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [isOpen]);

    if (!isOpen) return null;

    // Helper function to format study time
    const formatStudyTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins}m`;
        }
        
        return `${hours}h ${mins}m`;
    };

    // Function to determine ranking medal/icon
    const RankingIcon = ({ rank }) => {
        switch (rank) {
            case 1:
                return <Medal className="w-5 h-5 text-amber-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-300" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-700" />;
            default:
                return <span className="w-5 h-5 inline-flex items-center justify-center text-gray-400 font-semibold">{rank}</span>;
        }
    };

    // Function to render user avatar
    const UserAvatar = ({ avatar }) => {
        if (avatar && animalAvatars[avatar]) {
            return (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    <img 
                        src={animalAvatars[avatar]} 
                        alt={avatar} 
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }
        
        // Default avatar if none is specified
        return (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-400" />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-gray-200" />
                        <h2 className="text-xl font-bold text-gray-200">Leaderboard</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[calc(80vh-10rem)] overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                            <p className="text-gray-400">Loading leaderboard...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 py-8">
                            {error}
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No data available
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 px-3 py-2 text-sm font-semibold text-gray-400 border-b border-zinc-800">
                                <div className="col-span-1">#</div>
                                <div className="col-span-7">User</div>
                                <div className="col-span-4 text-right">Study Time</div>
                            </div>

                            {/* Leaderboard Entries */}
                            {leaderboard.map((user, index) => (
                                <div 
                                    key={user._id} 
                                    className={`grid grid-cols-12 px-3 py-3 rounded-lg items-center ${
                                        currentUser && user._id === currentUser._id 
                                            ? 'bg-zinc-800/50 border border-zinc-700' 
                                            : 'hover:bg-zinc-900/50'
                                    }`}
                                >
                                    <div className="col-span-1">
                                        <RankingIcon rank={index + 1} />
                                    </div>
                                    <div className="col-span-7 font-medium text-gray-200 flex items-center gap-3">
                                        <UserAvatar avatar={user.avatar} />
                                        <span>{user.username}</span>
                                    </div>
                                    <div className="col-span-4 text-right flex items-center justify-end gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-gray-300">
                                            {formatStudyTime(user.totalTimeStudied)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Current User's Position */}
                {currentUser && !loading && !error && (
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-400">Your Position:</div>
                                <UserAvatar avatar={currentUser.avatar} />
                            </div>
                            <div className="text-gray-300">
                                <span className="font-semibold">{currentUser.rank}</span> 
                                <span className="text-gray-500 mx-1">of</span> 
                                <span>{currentUser.totalUsers}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardModal;