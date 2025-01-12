import React, { useState, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';
import audio from '../music/focus-music.mp3'

const BinauralBeats = () => {
    const [isBinauralPlaying, setIsBinauralPlaying] = useState(false);
    const [binauralAudio] = useState(new Audio(audio));
    const [particles, setParticles] = useState([]);

    // Create particles when audio starts
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

    // Animate particles
    useEffect(() => {
        if (!isBinauralPlaying) return;

        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => ({
                ...particle,
                y: particle.y - particle.speed,
                x: particle.x + Math.sin(particle.y * 0.1) * 0.2,
            })).filter(p => p.y > -10));

            // Add new particles at the bottom
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

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            binauralAudio.pause();
            binauralAudio.currentTime = 0;
        };
    }, [binauralAudio]);

    const toggleBinaural = () => {
        if (isBinauralPlaying) {
            binauralAudio.pause();
        } else {
            binauralAudio.play();
        }
        setIsBinauralPlaying(!isBinauralPlaying);
    };

    return (
        <>
            {/* Particle overlay */}
            {isBinauralPlaying && (
                <div className="fixed inset-0 pointer-events-none">
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

            {/* Control panel */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl flex items-center gap-4">
                <Music className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                    <h3 className="text-gray-200 font-semibold">Focus Music</h3>
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
        </>
    );
};

export default BinauralBeats;