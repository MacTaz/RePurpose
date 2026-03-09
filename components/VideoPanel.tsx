"use client";
import { useEffect, useRef } from 'react';

const VIDEOS = [
    '/login-reg video 1.mp4',
    '/login-reg video 2.mp4',
    '/login-reg video 3.mp4',
];

// ── Module-level singleton ────────────────────────────────────────────────
// Never resets between client-side navigations.
const vs = {
    index: 0,
    currentTime: 0,
};

export default function VideoPanel() {
    // Two video elements for crossfading — we alternate which is "on top"
    const videoA = useRef<HTMLVideoElement>(null);
    const videoB = useRef<HTMLVideoElement>(null);
    // Which slot is currently the visible/playing one ('a' or 'b')
    const active = useRef<'a' | 'b'>('a');
    const isCrossfading = useRef(false);

    useEffect(() => {
        const va = videoA.current!;
        const vb = videoB.current!;

        // ── Helpers ──────────────────────────────────────────────────────
        const getActive = () => active.current === 'a' ? va : vb;
        const getInactive = () => active.current === 'a' ? vb : va;

        const setOpacity = (el: HTMLVideoElement, val: number, instant = false) => {
            el.style.transition = instant ? 'none' : 'opacity 1s ease-in-out';
            el.style.opacity = String(val);
        };

        // ── Crossfade to next video ───────────────────────────────────────
        const crossfadeTo = (nextIndex: number) => {
            if (isCrossfading.current) return;
            isCrossfading.current = true;

            const incoming = getInactive();

            // Prep the incoming video: load new src, hide it instantly
            incoming.src = VIDEOS[nextIndex];
            setOpacity(incoming, 0, true);

            incoming.load();

            const onReady = () => {
                incoming.currentTime = 0;
                incoming.play().catch(() => { });

                // Fade in incoming, fade out active simultaneously
                const outgoing = getActive();
                setOpacity(incoming, 1);
                setOpacity(outgoing, 0);

                // After transition completes, clean up outgoing
                setTimeout(() => {
                    outgoing.pause();
                    outgoing.src = '';
                    vs.index = nextIndex;
                    vs.currentTime = 0;
                    active.current = active.current === 'a' ? 'b' : 'a';
                    isCrossfading.current = false;
                }, 1050); // slightly over transition duration
            };

            if (incoming.readyState >= 3) {
                onReady();
            } else {
                incoming.addEventListener('canplay', onReady, { once: true });
            }
        };

        // ── onEnded handler — advances to next video ──────────────────────
        const handleEnded = () => {
            const nextIndex = (vs.index + 1) % VIDEOS.length;
            crossfadeTo(nextIndex);
        };

        va.addEventListener('ended', handleEnded);
        vb.addEventListener('ended', handleEnded);

        // ── Persist currentTime continuously ──────────────────────────────
        const trackTime = () => { vs.currentTime = getActive().currentTime; };
        va.addEventListener('timeupdate', trackTime);
        vb.addEventListener('timeupdate', trackTime);

        // ── On mount: restore state without reloading ─────────────────────
        const activeEl = getActive();
        activeEl.src = VIDEOS[vs.index];
        setOpacity(activeEl, 1, true);
        setOpacity(getInactive(), 0, true);

        const startPlayback = () => {
            if (vs.currentTime > 0 && vs.currentTime < activeEl.duration - 0.5) {
                activeEl.currentTime = vs.currentTime;
            }
            activeEl.play().catch(() => { });
        };

        if (activeEl.readyState >= 1) {
            startPlayback();
        } else {
            activeEl.addEventListener('loadedmetadata', startPlayback, { once: true });
        }
        activeEl.load();

        // ── On unmount: save state ────────────────────────────────────────
        return () => {
            vs.index = vs.index; // already tracked
            vs.currentTime = getActive().currentTime;

            va.removeEventListener('ended', handleEnded);
            vb.removeEventListener('ended', handleEnded);
            va.removeEventListener('timeupdate', trackTime);
            vb.removeEventListener('timeupdate', trackTime);
        };
    }, []); // runs once — never remounts video elements

    return (
        <div className="hidden md:block md:w-1/2 h-screen sticky top-0 overflow-hidden bg-black">

            {/* Video A */}
            <video
                ref={videoA}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 1 }}
                muted
                playsInline
            />

            {/* Video B */}
            <video
                ref={videoB}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0 }}
                muted
                playsInline
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        </div>
    );
}
