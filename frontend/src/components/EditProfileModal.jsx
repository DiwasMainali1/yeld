import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { X, Loader2 } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, profileData, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: profileData?.username || '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:5000/profile/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }

            onUpdate(data);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl w-full max-w-md overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-zinc-900">
                    <h2 className="text-xl font-bold text-gray-200">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Username 
                                {profileData?.usernameChanges < 1 && (
                                    <span className="text-zinc-500 text-xs ml-2">
                                        (1 change remaining)
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                disabled={profileData?.usernameChanges >= 1}
                                className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {profileData?.usernameChanges >= 1 && (
                                <p className="text-zinc-500 text-xs mt-1">
                                    Username can only be changed once.
                                </p>
                            )}
                        </div>

                        <div className="border-t border-zinc-900 pt-6">
                            <h3 className="text-gray-300 font-medium mb-4">Change Password</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.newPassword || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full bg-black rounded-lg p-3 text-gray-200 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;