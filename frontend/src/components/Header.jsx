import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

function Header({ username }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };
    
    const handleProfile = () => {
        navigate('/profile');
    }

    return (
        <nav className="w-full h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-black">
            <div className="flex items-center gap-8">
                <a href="/dashboard">
                    <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-4xl font-bold tracking-tight hover:scale-105 transition-transform">
                        Yeld
                    </h1>
                </a>
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200 font-medium">Welcome back, {username}</span>
                </div>
            </div>
            <div className='flex flex-row space-x-10'>
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