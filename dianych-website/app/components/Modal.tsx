'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

const Modal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }: ModalProps) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') onNext();
            if (event.key === 'ArrowLeft') onPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    if (!isOpen) return null;

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
                    <Image
                        src={images[currentIndex]}
                        alt={`Full size view of image ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                    />
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