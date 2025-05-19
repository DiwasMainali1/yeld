import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import LeaderboardModal from './LeaderboardModal';

// Import animal avatar images
import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';

const animalAvatars = {
  fox: foxImage,
  owl: owlImage,
  panda: pandaImage,
  penguin: penguinImage,
  koala: koalaImage
};

function Header({ username, isTimerActive }) {
    const navigate = useNavigate();
    const [userAvatar, setUserAvatar] = useState('fox');
    const [showLeaderboard, setShowLeaderboard] = useState(false);

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
        navigate('/login');
    };
    
    const handleProfile = () => {
        if (isTimerActive) {
            const confirmed = window.confirm('You have an active session. Are you sure you want to leave this page?');
            if (!confirmed) return;
        }
        navigate(`/profile/${username}`);
    };

    const toggleLeaderboard = () => {
        setShowLeaderboard(!showLeaderboard);
    };

    return (
        <>
            <nav className="w-full h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/30">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => {
                            if (isTimerActive) {
                                const confirmed = window.confirm('You have an active session. Are you sure you want to leave this page?');
                                if (!confirmed) return;
                            }
                            navigate('/dashboard');
                        }}
                        className="hover:scale-105 transition-transform"
                    >
                        <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-4xl font-bold tracking-tight">
                            Yeld
                        </h1>
                    </button>
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
                </div>
                <div className='flex flex-row gap-4'>
                    <button
                        className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900/30 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                        onClick={toggleLeaderboard}
                    >
                        <Trophy className="w-5 h-5 text-gray-300" />
                        Leaderboard
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
                        className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </nav>

            {/* Leaderboard Modal */}
            <LeaderboardModal 
                isOpen={showLeaderboard} 
                onClose={() => setShowLeaderboard(false)} 
            />
        </>
    );
}

export default Header;