import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

function Header({ username, isTimerActive, isOwnProfile, onChangePassword }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isProfilePage = location.pathname.startsWith('/profile/');

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

    return (
        <nav className="w-full h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-black">
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
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200 font-medium">Welcome back, {username}</span>
                </div>
            </div>
            <div className='flex flex-row gap-4'>
                {isProfilePage && isOwnProfile && (
                    <ChangePasswordModal />
                )}

                <button
                    className="flex items-center gap-2 bg-black text-white py-2 px-4 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                    onClick={handleProfile}
                >
                    <User size={20} />
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
    );
}

export default Header;