"use client";
import { useEffect, useRef, useState } from 'react';

const VIDEOS = [
    '/login-reg video 1.mp4',
    '/login-reg video 2.mp4',
    '/login-reg video 3.mp4',
];

export default function VideoPanel() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    // When index changes, fade in and play the new video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        setVisible(false);
        const fadeInTimer = setTimeout(() => {
            video.load();
            video.play().catch(() => {});
            setVisible(true);
        }, 300); // wait for fade-out before swapping src
        return () => clearTimeout(fadeInTimer);
    }, [index]);

    const handleEnded = () => {
        setVisible(false);
        setTimeout(() => {
            setIndex(prev => (prev + 1) % VIDEOS.length);
        }, 300);
    };

    return (
        <div className="hidden md:flex md:w-1/2 items-center justify-center px-10">
            <div className="w-[85%] h-[80%] my-10 rounded-3xl overflow-hidden relative bg-black shadow-2xl">
                <video
                    ref={videoRef}
                    key={index}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: visible ? 1 : 0 }}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleEnded}
                >
                    <source src={VIDEOS[index]} type="video/mp4" />
                </video>
            </div>
        </div>
    );
}