'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

// Define modal image target width and storage version
const MODAL_IMAGE_WIDTH = 1200; // px
const MODAL_IMAGE_VERSION = 1;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

function parseGalleryInfo(src: string): { galleryId: string | null; name: string | null } {
    // Expecting paths like /images/<galleryId>/<filename>
    const parts = src.split('/').filter(Boolean);
    const idx = parts.indexOf('images');
    const galleryId = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
    const name = parts.length > 0 ? parts[parts.length - 1] : null;
    return { galleryId, name };
}

const Modal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }: ModalProps) => {
    const [resized, setResized] = useState<(string | null)[]>([]);
    const [, setLoading] = useState<boolean[]>([]);
    const [, setErrors] = useState<(string | null)[]>([]);
    const initDone = useRef(false);

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') onNext();
            if (event.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    // Reset arrays when images change or modal opens
    useEffect(() => {
        if (!isOpen) return;
        if (!initDone.current) {
            setResized(Array(images.length).fill(null));
            setLoading(Array(images.length).fill(false));
            setErrors(Array(images.length).fill(null));
            initDone.current = true;
        }
    }, [isOpen, images.length]);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            initDone.current = false;
            setResized([]);
            setLoading([]);
            setErrors([]);
        }
    }, [isOpen]);

    // Helper to get or fetch resized dataUrl for a given index
    const fetchResized = useMemo(() => {
        return async (index: number) => {
            const src = images[index];
            const { galleryId, name } = parseGalleryInfo(src);
            if (!galleryId || !name) {
                // Not a gallery image; nothing to fetch
                return null;
            }
            const storageKey = `gallery-image-${galleryId}-${name}-w${MODAL_IMAGE_WIDTH}-v${MODAL_IMAGE_VERSION}`;
            try {
                const cached = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
                if (cached) {
                    const { dataUrl } = JSON.parse(cached) as { dataUrl: string };
                    return dataUrl;
                }
            } catch {}

            try {
                const res = await fetch(`/api/image?galleryId=${encodeURIComponent(galleryId)}&name=${encodeURIComponent(name)}&width=${MODAL_IMAGE_WIDTH}&ts=${Date.now()}`, { cache: 'no-store' });
                if (!res.ok) {
                    const msg = `HTTP ${res.status}`;
                    setErrors(prev => {
                        const arr = prev.slice();
                        arr[index] = msg;
                        return arr;
                    });
                    return null;
                }
                const payload = await res.json() as { dataUrl: string };
                try {
                    window.localStorage.setItem(storageKey, JSON.stringify(payload));
                } catch {}
                return payload.dataUrl;
            } catch (e) {
                const msg = (e instanceof Error && e.message) ? e.message : String(e);
                setErrors(prev => {
                    const arr = prev.slice();
                    arr[index] = msg;
                    return arr;
                });
                return null;
            }
        };
    }, [images]);

    // Load current image and prefetch neighbors when index changes
    useEffect(() => {
        if (!isOpen || images.length === 0) return;

        const loadIndex = async (idx: number) => {
            if (idx < 0 || idx >= images.length) return;
            const src = images[idx];
            const { galleryId } = parseGalleryInfo(src);
            if (!galleryId) {
                // Not a gallery image; no fetching required
                setResized(prev => {
                    const arr = prev.slice();
                    arr[idx] = src;
                    return arr;
                });
                return;
            }
            setLoading(prev => { const arr = prev.slice(); arr[idx] = true; return arr; });
            const dataUrl = await fetchResized(idx);
            setResized(prev => {
                const arr = prev.slice();
                arr[idx] = dataUrl; // may be null on error
                return arr;
            });
            setLoading(prev => { const arr = prev.slice(); arr[idx] = false; return arr; });
        };

        void loadIndex(currentIndex);
        // Prefetch neighbors best-effort
        void loadIndex((currentIndex + 1) % images.length);
        void loadIndex((currentIndex - 1 + images.length) % images.length);
    }, [isOpen, currentIndex, images, fetchResized]);

    if (!isOpen) return null;

    const currentSrcInfo = parseGalleryInfo(images[currentIndex]);
    const isGallery = !!currentSrcInfo.galleryId;
    const displaySrc = isGallery ? resized[currentIndex] : images[currentIndex];

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="relative w-[90vw] h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Previous Button */}
                <button
                    onClick={onPrev}
                    className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 sm:p-4 text-black transition-colors z-10 -translate-x-12 lg:-translate-x-20"
                    aria-label="Previous image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Image Display */}
                <div className="relative w-full h-full">
                    {(!isGallery) || displaySrc ? (
                        <Image
                            src={displaySrc || images[currentIndex]}
                            alt={`Full size view of image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                        />
                    ) : (
                        <div className="absolute inset-0 animate-pulse bg-gray-600/40" />
                    )}
                </div>

                {/* Next Button */}
                <button
                    onClick={onNext}
                    className="absolute right-10 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 sm:p-4 text-black transition-colors z-10 translate-x-12 lg:translate-x-20"
                    aria-label="Next image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-25 right-5 bg-white/50 hover:bg-white/80 rounded-full p-3 sm:p-4 text-black transition-colors z-10 translate-x-1/2 -translate-y-1/2"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Modal;