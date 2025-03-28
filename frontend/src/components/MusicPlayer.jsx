import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Volume2, ChevronDown } from 'lucide-react';
import focusAudio from '../music/focus-music.mp3';
import classicalAudio from '../music/classical-music.mp3';
import ghibliAudio from '../music/ghibli-music.mp3';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [particles, setParticles] = useState([]);
    const [currentTrack, setCurrentTrack] = useState('focus');
    const [showTrackMenu, setShowTrackMenu] = useState(false);

    const tracks = {
        focus: { title: 'Focus Music', subtitle: 'Binaural Beats', src: focusAudio },
        classical: { title: 'Classical', subtitle: 'Relaxing Classics', src: classicalAudio },
        ghibli: { title: 'Studio Ghibli', subtitle: 'Peaceful Melodies', src: ghibliAudio }
    };

    const [audio] = useState(() => {
        const audioInstance = new Audio(tracks.focus.src);
        audioInstance.preload = 'auto';
        audioInstance.loop = true;
        audioInstance.volume = 0.5;
        return audioInstance;
    });

    useEffect(() => {
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [audio]);

    useEffect(() => {
        audio.volume = volume;
    }, [volume, audio]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const togglePlay = async () => {
        try {
            if (isPlaying) {
                await audio.pause();
            } else {
                await audio.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    };

    const changeTrack = async (trackKey) => {
        const wasPlaying = !audio.paused;
        audio.pause();
        audio.src = tracks[trackKey].src;
        setCurrentTrack(trackKey);
        setShowTrackMenu(false);
        if (wasPlaying) {
            try {
                await audio.play();
            } catch (error) {
                console.error('Error playing new track:', error);
            }
        }
    };

    useEffect(() => {
        if (isPlaying) {
            const newParticles = Array.from({ length: 80 }, () => ({
                id: Math.random(),
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => ({
                ...particle,
                y: particle.y - particle.speed,
                x: particle.x + Math.sin(particle.y * 0.1) * 0.2,
            })).filter(p => p.y > -10));

            if (Math.random() < 0.3) {
                setParticles(prev => [...prev, {
                    id: Math.random(),
                    x: Math.random() * 100,
                    y: 100,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 1 + 0.5,
                }]);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="relative">
            {isPlaying && (
                <div className="fixed inset-0 pointer-events-none z-10">
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className="absolute rounded-full bg-white opacity-20"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Music className="w-8 h-8 text-gray-400" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-200 text-xl font-semibold">
                                    {tracks[currentTrack].title}
                                </h3>
                                <button 
                                    onClick={() => setShowTrackMenu(!showTrackMenu)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronDown className={`w-5 h-5 transform transition-transform ${showTrackMenu ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <p className="text-gray-500">{tracks[currentTrack].subtitle}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={togglePlay}
                        className="bg-black text-white p-4 rounded-full hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                    >
                        {isPlaying ? 
                            <Pause className="w-6 h-6" /> : 
                            <Play className="w-6 h-6" />
                        }
                    </button>
                </div>

                {showTrackMenu && (
                    <div className="absolute left-0 right-0 mt-2 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl z-20">
                        {Object.entries(tracks).map(([key, track]) => (
                            <button
                                key={key}
                                onClick={() => changeTrack(key)}
                                className={`w-full p-4 text-left hover:bg-zinc-800 transition-colors duration-200 ${
                                    currentTrack === key ? 'bg-zinc-800 text-white' : 'text-gray-300'
                                } first:rounded-t-xl last:rounded-b-xl`}
                            >
                                <div className="font-medium">{track.title}</div>
                                <div className="text-sm text-gray-500">{track.subtitle}</div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="w-full">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                        {Math.round(volume * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;