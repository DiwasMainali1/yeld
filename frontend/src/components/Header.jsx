import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, User, Menu, X, Home } from 'lucide-react';
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

function Header({ username, isTimerActive, isMobile }) {
    const navigate = useNavigate();
    const [userAvatar, setUserAvatar] = useState('fox');
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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

    const toggleLeaderboard = () => {
        setMobileMenuOpen(false);
        setShowLeaderboard(!showLeaderboard);
    };

    const handleDashboard = () => {
        if (isTimerActive) {
            const confirmed = window.confirm('You have an active session. Are you sure you want to leave this page?');
            if (!confirmed) return;
        }
        setMobileMenuOpen(false);
        navigate('/dashboard');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        // We're no longer calling the external onToggleMenu
        // as we're handling the menu entirely within this component
    };

    // Responsive sizing classes
    const isExtraSmallScreen = windowWidth < 640;
    const buttonClasses = `flex items-center gap-2 bg-black text-white py-1 sm:py-2 px-2 sm:px-4 rounded-xl font-semibold hover:bg-zinc-900/30 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${isExtraSmallScreen ? 'text-xs' : 'text-sm'}`;
    const iconSize = isExtraSmallScreen ? 16 : 20;

    return (
        <>
            <nav className="w-full h-16 sm:h-16 md:h-20 border-b border-zinc-800 flex items-center justify-between px-2 sm:px-4 md:px-8 bg-zinc-950/30 backdrop-blur-sm">
                <div className="ml-2 flex items-center gap-2 sm:gap-4 md:gap-8">
                    {isMobile && (
                        <button 
                            onClick={toggleMobileMenu}
                            className="mr-2 text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    
                    <button 
                        onClick={handleDashboard}
                        className="hover:scale-105 transition-transform"
                    >
                        <h1 className="ml-1 px-2 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                            Yeld
                        </h1>
                    </button>

                    {!isExtraSmallScreen && (
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden">
                                <img 
                                    src={animalAvatars[userAvatar]} 
                                    alt={userAvatar} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-gray-200 text-xs sm:text-sm md:font-medium">Welcome back, {username}</span>
                        </div>
                    )}
                </div>
                
                {!isMobile && (
                    <div className='flex flex-row gap-2 sm:gap-4'>
                        <button
                            className={buttonClasses}
                            onClick={toggleLeaderboard}
                        >
                            <Trophy className={`w-${iconSize/4} h-${iconSize/4} text-gray-300`} />
                            {!isExtraSmallScreen && "Leaderboard"}
                        </button>
                        <button
                            className={buttonClasses}
                            onClick={handleProfile}
                        >
                            <div className={`w-${iconSize/4} h-${iconSize/4} rounded-full overflow-hidden`}>
                                <img 
                                    src={animalAvatars[userAvatar]} 
                                    alt={userAvatar} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {!isExtraSmallScreen && "Profile"}
                        </button>

                        <button
                            onClick={handleLogout}
                            className={buttonClasses}
                        >
                            <LogOut className={`w-${iconSize/5} h-${iconSize/5}`} />
                            {!isExtraSmallScreen && "Logout"}
                        </button>
                    </div>
                )}
            </nav>

            {/* Mobile Menu */}
            {isMobile && mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-zinc-900 border-l border-zinc-800 flex flex-col">
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
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 p-4">
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
                                <User className="w-5 h-5" />
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
                isSmallScreen={isExtraSmallScreen}
            />
        </>
    );
}

export default Header;