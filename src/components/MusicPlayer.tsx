import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const MusicPlayer = () => {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element
        const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'); // A placeholder jazz track
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.play().catch(() => console.log("Audio play blocked until interaction"));
            } else {
                audioRef.current.pause();
            }
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="music-control" onClick={toggleMute} title={isMuted ? "Play Music" : "Mute Music"}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </div>
    );
};
