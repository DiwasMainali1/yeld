import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import LeaderboardModal from './custom-components/LeaderboardModal';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Fetch user avatar from API
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
        // Add your silver egg functionality here
        console.log('Silver egg clicked!');
        // Example: navigate to rewards or special feature
        // navigate('/rewards');
    };

    return (
        <>
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
                    <button
                        onClick={handleSilverEgg}
                        className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                    >
                    </button>
                )}
                
                {!isMobile && (
                    <div className="flex flex-row gap-4 items-center">
                        <button
                        onClick={handleSilverEgg}
                        className="flex gap-2 w-6 h-7 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200"
                        >
                        </button>
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

            {/* Leaderboard Modal */}
            <LeaderboardModal 
                isOpen={showLeaderboard} 
                onClose={() => setShowLeaderboard(false)} 
            />
        </>
    );
}

export default Header;