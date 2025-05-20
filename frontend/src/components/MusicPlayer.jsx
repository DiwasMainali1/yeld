import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Music, Volume2, ChevronDown, X } from 'lucide-react';
import focusAudio from '../music/focus-music.mp3';
import classicalAudio from '../music/classical-music.mp3';
import ghibliAudio from '../music/ghibli-music.mp3';
import windRisesAudio from '../music/wind-rises.mp3';
import ambienceAudio from '../music/ambient-music.mp3'; 

const VolumeControl = React.memo(({ volume, onVolumeChange }) => {
  const handleChange = (e) => {
    onVolumeChange(parseFloat(e.target.value));
  };
  
  return (
    <div className="flex items-center gap-4 pt-2">
      <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div className="w-full">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleChange}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>
      <span className="text-sm text-gray-400 w-12 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
});

// Create a separate memoized animations component
const MusicAnimations = React.memo(({ isPlaying, currentTrack }) => {
  if (!isPlaying) return null;
  
  // Animation Components
  const FocusAnimation = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-blue-900/5"></div>
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className={`absolute left-1/2 top-1/2 rounded-full animate-focus-pulse-${i+1}`}
          style={{
            width: `${(i + 1) * 150}px`,
            height: `${(i + 1) * 150}px`,
            background: `radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 50%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.6 - (i * 0.15)
          }}
        />
      ))}
    </div>
  );

  const ClassicalAnimation = () => {
    const notePositions = Array.from({ length: 12 }, (_, i) => ({
      left: `${5 + (i * 8)}%`,
      size: `${20 + Math.floor(i % 3) * 8}px`,
      delay: `${i * 0.8}s`,
      duration: `${12 + (i % 5) * 2}s`
    }));
    
    const noteSymbols = ['♩', '♪', '♫', '♬', '𝄞'];
    
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-800/20 to-yellow-700/5"></div>
        {notePositions.map((pos, i) => (
          <div 
            key={i}
            className="absolute text-yellow-500/80 animate-float-note"
            style={{
              left: pos.left,
              bottom: '-50px',
              fontSize: pos.size,
              animationDelay: pos.delay,
              animationDuration: pos.duration
            }}
          >
            {noteSymbols[i % noteSymbols.length]}
          </div>
        ))}
      </div>
    );
  };

const GhibliAnimation = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-700/10 to-blue-600/10"></div>
        {Array.from({ length: 20 }, (_, i) => {
          const size = 8 + (i % 5) * 3;
          const left = 5 + (i * 4.5) % 90;
          const delay = i * 0.7;
          const duration = 15 + (i % 7) * 2;
          
          return (
            <div 
              key={i}
              className="absolute animate-petal-fall"
              style={{
                left: `${left}%`,
                top: '-20px',
                width: `${size}px`,
                height: `${size / 2}px`,
                backgroundColor: '#f752ea',
                borderRadius: '100% 0',
                transform: 'rotate(45deg)',
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}
      </div>
    );
  };

const WindAnimation = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/5"></div>
    
    {/* Main wind waves - more visible */}
    {[...Array(3)].map((_, i) => (
      <div 
        key={`main-${i}`}
        className="absolute inset-y-0 right-full w-full h-full animate-wind-wave"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(125, 211, 252, ${0.08 - i * 0.02}) 45%, 
            rgba(147, 197, 253, ${0.1 - i * 0.02}) 50%, 
            rgba(125, 211, 252, ${0.08 - i * 0.02}) 55%, 
            transparent 100%)`,
          animationDelay: `${i * 2.5}s`,
          animationDuration: `${10 + i * 3}s`
        }}
      />
    ))}
    
    {/* Subtle secondary waves for depth */}
    {[...Array(4)].map((_, i) => (
      <div 
        key={`secondary-${i}`}
        className="absolute inset-y-0 right-full w-full h-full animate-wind-wave-alt"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(186, 230, 253, ${0.05 - i * 0.01}) 48%, 
            rgba(186, 230, 253, ${0.07 - i * 0.01}) 50%, 
            rgba(186, 230, 253, ${0.05 - i * 0.01}) 52%, 
            transparent 100%)`,
          animationDelay: `${1.5 + i * 2}s`,
          animationDuration: `${15 + i * 2}s`
        }}
      />
    ))}
    
    {/* Wind particles for visual interest */}
    {[...Array(15)].map((_, i) => {
      const size = 3 + (i % 3);
      const startPos = 10 + (i * 5) % 80;
      const speed = 4 + (i % 4) * 1.5;
      
      return (
        <div 
          key={`particle-${i}`}
          className="absolute animate-wind-particle"
          style={{
            width: `${size}px`,
            height: `${1}px`,
            top: `${startPos}%`,
            left: '-10px',
            backgroundColor: 'rgba(186, 230, 253, 0.5)',
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${speed}s`
          }}
        />
      );
    })}
  </div>
);

const AmbientAnimation = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-purple-900/5"></div>
        {/* Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }, (_, i) => {
            const size = 1 + Math.floor(i % 4) * 0.5;
            const x = 5 + (i * 3.3) % 90;
            const y = 5 + (i * 5.7) % 90;
            const opacity = 0.1 + (i % 5) * 0.05;
            const duration = 3 + (i % 5) * 2;
            
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-white animate-pulse-star"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${x}%`,
                  top: `${y}%`,
                  opacity: opacity,
                  animationDuration: `${duration}s`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            );
          })}
        </div>
        
        {/* Rain drops */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }, (_, i) => {
            const width = 1 + (i % 3) * 0.5;
            const height = 10 + (i % 5) * 3;
            const x = 2 + (i * 2.4) % 96;
            const delay = (i * 0.15) % 5;
            const duration = 0.8 + (i % 4) * 0.3;
            const opacity = 0.2 + (i % 4) * 0.1;
            
            return (
              <div 
                key={i}
                className="absolute bg-blue-100 animate-rain-drop"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  left: `${x}%`,
                  top: '-20px',
                  opacity: opacity,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  animationIterationCount: 'infinite'
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <>
      {currentTrack === 'focus' && <FocusAnimation />}
      {currentTrack === 'classical' && <ClassicalAnimation />}
      {currentTrack === 'ghibli' && <GhibliAnimation />}
      {currentTrack === 'windRises' && <WindAnimation />}
      {currentTrack === 'ambience' && <AmbientAnimation />}
    </>
  );
});

// Create a separate memoized card animation component
const CardAnimation = React.memo(({ isPlaying, currentTrack }) => {
  if (!isPlaying) return null;
  
  return (
    <div className="absolute inset-0 z-0">
      {currentTrack === 'focus' && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`absolute left-1/2 top-1/2 rounded-full animate-focus-pulse-${i+1}`}
              style={{
                width: `${(i + 1) * 100}px`,
                height: `${(i + 1) * 100}px`,
                background: `radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(79, 70, 229, 0.1) 50%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.8 - (i * 0.15)
              }}
            />
          ))}
        </div>
      )}
      {currentTrack === 'classical' && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-700/20 to-yellow-800/5"></div>
      )}
      {currentTrack === 'ghibli' && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 to-blue-900/5"></div>
      )}
      {currentTrack === 'windRises' && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/5"></div>
      )}
      {currentTrack === 'ambience' && (
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-purple-900/5"></div>
      )}
    </div>
  );
});

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState('focus');
    const [showModal, setShowModal] = useState(false);
    
    // Use refs for stable audio instance that persists across renders
    const audioRef = useRef(null);
    
    const tracks = {
        focus: { 
            title: 'Focus Music', 
            subtitle: 'Binaural Beats', 
            src: focusAudio,
            theme: 'focus'
        },
        classical: { 
            title: 'Classical', 
            subtitle: 'Relaxing Classics', 
            src: classicalAudio,
            theme: 'classical'
        },
        ghibli: { 
            title: 'Studio Ghibli', 
            subtitle: 'Peaceful Melodies', 
            src: ghibliAudio,
            theme: 'ghibli'
        },
        windRises: { 
            title: 'Wind Rises', 
            subtitle: 'Gentle Breezes', 
            src: windRisesAudio,
            theme: 'wind'
        },
        ambience: { 
            title: 'Rain Sounds', 
            subtitle: 'Ethereal Atmosphere', 
            src: ambienceAudio,
            theme: 'ambient'
        }
    };

    // Initialize audio only once using useRef
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(tracks.focus.src);
            audioRef.current.preload = 'auto';
            audioRef.current.loop = true;
            audioRef.current.volume = volume;
        }
        
        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // Update volume when it changes (with useCallback to ensure stability)
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Use useCallback for event handlers to prevent them from changing on every render
    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
    }, []);

    const togglePlay = useCallback(async () => {
        try {
            if (isPlaying) {
                await audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    }, [isPlaying]);

    // Sync isPlaying state with actual audio state
    useEffect(() => {
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        
        if (audioRef.current) {
            audioRef.current.addEventListener('play', handlePlay);
            audioRef.current.addEventListener('pause', handlePause);
            
            return () => {
                audioRef.current.removeEventListener('play', handlePlay);
                audioRef.current.removeEventListener('pause', handlePause);
            };
        }
    }, []);

    const changeTrack = useCallback(async (trackKey) => {
        if (!audioRef.current) return;
        
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.pause();
        audioRef.current.src = tracks[trackKey].src;
        setCurrentTrack(trackKey);
        setShowModal(false);
        
        if (wasPlaying) {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (error) {
                console.error('Error playing new track:', error);
                setIsPlaying(false);
            }
        }
    }, [tracks]);

    // Close modal if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                setShowModal(false);
            }
        };
        
        if (showModal) {
            document.addEventListener('click', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showModal]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                setShowModal(false);
            }
        };
        
        if (showModal) {
            document.addEventListener('keydown', handleEscKey);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showModal]);

    // Memoized Track Selection Modal component
    const TrackSelectionModal = React.memo(() => {
        if (!showModal) return null;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div 
                    className="relative bg-zinc-950 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">Select Music</h3>
                        <button 
                            onClick={() => setShowModal(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {Object.entries(tracks).map(([key, track]) => (
                            <button
                                key={key}
                                onClick={() => changeTrack(key)}
                                className={`w-full p-6 text-left border-b border-zinc-800/30 hover:bg-zinc-900 transition-colors duration-200 flex items-start gap-4 ${
                                    currentTrack === key ? 'bg-zinc-900/30 text-white' : 'text-gray-300'
                                } last:border-b-0`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    currentTrack === key 
                                        ? 'bg-white text-black' 
                                        : 'bg-zinc-800 text-gray-400'
                                }`}>
                                    {currentTrack === key ? (
                                        <Music className="w-6 h-6" />
                                    ) : (
                                        <Play className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-lg">{track.title}</div>
                                    <div className="text-sm text-gray-500">{track.subtitle}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="relative">
            {/* Global animations */}
            <MusicAnimations isPlaying={isPlaying} currentTrack={currentTrack} />
    
            {/* Animation keyframes */}
            <style jsx global>{`
                /* Animation keyframes remain unchanged */
                @keyframes focusPulse1 {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
                    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                }
                @keyframes focusPulse2 {
                    0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.45; }
                    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.25; }
                    100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.45; }
                }
                @keyframes focusPulse3 {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.15; }
                    100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.3; }
                }
                
                .animate-focus-pulse-1 {
                    animation: focusPulse1 8s infinite ease-in-out;
                }
                .animate-focus-pulse-2 {
                    animation: focusPulse2 10s infinite ease-in-out;
                }
                .animate-focus-pulse-3 {
                    animation: focusPulse3 12s infinite ease-in-out;
                }
                
                /* Classical notes animation */
                @keyframes floatNote {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.7; }
                    90% { opacity: 0.5; }
                    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
                }
                
                .animate-float-note {
                    animation: floatNote 15s linear infinite;
                    will-change: transform, opacity;
                }
                /* Ghibli petals animation */
                @keyframes petalFall {
                    0% { transform: translateY(0) rotate(45deg); opacity: 0; }
                    10% { opacity: 0.7; }
                    30% { transform: translate(10px, 30vh) rotate(75deg); opacity: 0.6; }
                    60% { transform: translate(-5px, 70vh) rotate(135deg); opacity: 0.5; }
                    100% { transform: translate(8px, 120vh) rotate(180deg); opacity: 0; }
                }

                .animate-petal-fall {
                    animation: petalFall 20s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                
                /* Enhanced Wind animations */
                @keyframes windWave {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }

                @keyframes windWaveAlt {
                    0% { transform: translateX(-5%); }
                    100% { transform: translateX(105%); }
                }

                @keyframes windParticle {
                    0% { transform: translateX(0) scaleX(1); opacity: 0; }
                    5% { opacity: 0.7; }
                    80% { opacity: 0.5; }
                    100% { transform: translateX(100vw) scaleX(1.5); opacity: 0; }
                }

                .animate-wind-wave {
                    animation: windWave 12s linear infinite;
                    will-change: transform;
                }

                .animate-wind-wave-alt {
                    animation: windWaveAlt 15s linear infinite;
                    will-change: transform;
                }

                .animate-wind-particle {
                    animation: windParticle 5s linear infinite;
                    will-change: transform, opacity;
                }
                                
                /* Ambient stars animation */
                @keyframes pulseStar {
                    0% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 0.1; }
                }
                
                .animate-pulse-star {
                    animation: pulseStar 4s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                /* Rain animation */
                @keyframes rainDrop {
                    0% { transform: translateY(-10px) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(105vh) translateX(-5px); opacity: 0; }
                }

                .animate-rain-drop {
                    animation: rainDrop 1s linear infinite;
                    will-change: transform, opacity;
                }
            `}</style>
    
            {/* Main player UI with card-specific animation */}
            <div className="rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
                {/* Card-specific animation */}
                <CardAnimation isPlaying={isPlaying} currentTrack={currentTrack} />
                
                {/* Content with background blur */}
                <div className="bg-zinc-950/30 backdrop-blur-sm p-8 space-y-6 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Music className="w-4 text-gray-400 xlg:w-8" />
                            <div className="relative"> {/* Track selection with modal trigger */}
                                <div 
                                    className="cursor-pointer group" 
                                    onClick={() => setShowModal(true)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-gray-200 text-md font-semibold group-hover:text-white transition-colors xlg:text-xl">
                                            {tracks[currentTrack].title}
                                        </h3>
                                        <ChevronDown className="w-3 text-gray-400 group-hover:text-white transition-colors xlg:w-5" />
                                    </div>
                                    <p className="text-gray-500">{tracks[currentTrack].subtitle}</p>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={togglePlay}
                            className="bg-black text-white p-3 rounded-full hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
                        >
                            {isPlaying ? 
                                <Pause className="w-6 h-6" /> : 
                                <Play className="w-6 h-6" />
                            }
                        </button>
                    </div>
    
                    {/* Separate volume control component */}
                    <VolumeControl 
                      volume={volume} 
                      onVolumeChange={handleVolumeChange} 
                    />
                </div>
            </div>
            
            {/* Track Selection Modal */}
            <TrackSelectionModal />
        </div>
    );
};

export default React.memo(MusicPlayer);