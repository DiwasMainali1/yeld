import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Volume2 } from 'lucide-react';
import audio from '../music/focus-music.mp3';

const BinauralBeats = () => {
    const [isBinauralPlaying, setIsBinauralPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [particles, setParticles] = useState([]);
    const [binauralAudio] = useState(() => {
        const audioInstance = new Audio(audio);
        audioInstance.preload = 'auto';
        audioInstance.loop = true;
        audioInstance.volume = 0.5;
        return audioInstance;
    });

    useEffect(() => {
        return () => {
            binauralAudio.pause();
            binauralAudio.currentTime = 0;
        };
    }, [binauralAudio]);

    useEffect(() => {
        if (isBinauralPlaying) {
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
    }, [isBinauralPlaying]);

    useEffect(() => {
        if (!isBinauralPlaying) return;

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
    }, [isBinauralPlaying]);

    useEffect(() => {
        binauralAudio.volume = volume;
    }, [volume, binauralAudio]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const toggleBinaural = async () => {
        try {
            if (isBinauralPlaying) {
                await binauralAudio.pause();
            } else {
                await binauralAudio.play();
            }
            setIsBinauralPlaying(!isBinauralPlaying);
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    };

    return (
        <div className="relative">
            {isBinauralPlaying && (
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

            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Music className="w-6 h-6 text-gray-400" />
                        <div>
                            <h3 className="text-gray-200 font-semibold">Focus Music</h3>
                            <p className="text-gray-500 text-sm">Binaural Beats</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={toggleBinaural}
                        className="bg-black text-white p-3 rounded-full hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                    >
                        {isBinauralPlaying ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                        }
                    </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Volume2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="w-full">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                    </div>
                    <span className="text-xs text-gray-400 w-8">
                        {Math.round(volume * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BinauralBeats;