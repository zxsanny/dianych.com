'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslation } from '@/lib/translations';
import OrderButton from './OrderButton'; // Reusing OrderButton
import Modal from './Modal'; // Reusing Modal

interface GalleryCarouselProps {
    images: string[];
    titleKey: string;
    buttonTextKey: string;
    orderLink: string;
}

const GalleryCarousel = ({ images, titleKey, buttonTextKey, orderLink }: GalleryCarouselProps) => {
    const t = useTranslation();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [scrollProgress, setScrollProgress] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onScroll = useCallback(() => {
        if (!emblaApi) return;
        const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
        setScrollProgress(progress * 100);
    }, [emblaApi, setScrollProgress]);

    useEffect(() => {
        if (!emblaApi) return;
        onScroll();
        emblaApi.on('scroll', onScroll).on('reInit', onScroll);
    }, [emblaApi, onScroll]);

    const handleImageClick = (index: number) => {
        setModalIndex(index);
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);
    const handleModalNext = () => setModalIndex((prev) => (prev + 1) % images.length);
    const handleModalPrev = () => setModalIndex((prev) => (prev - 1 + images.length) % images.length);

    const title = t[titleKey as keyof typeof t] || titleKey;
    const buttonText = t[buttonTextKey as keyof typeof t] || buttonTextKey;

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <>
            <h2 className="text-4xl color-red text-center mb-8">{title}</h2>
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {images.map((src, index) => (
                            <div key={index} className="flex-grow-0 flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 pl-4" onClick={() => handleImageClick(index)}>
                                <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105">
                                    <Image src={src} alt={`${title} image ${index + 1}`} fill className="object-cover" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={scrollPrev} className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-4 bg-white/80 hover:bg-white rounded-full p-3 shadow-md z-10" aria-label="Previous slide">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={scrollNext} className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 bg-white/80 hover:bg-white rounded-full p-3 shadow-md z-10" aria-label="Next slide">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="w-full h-2 bg-gray-300 rounded-full mt-6">
                <div className="h-full bg-gray-600 rounded-full" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className="text-center mt-8">
                <OrderButton orderText={buttonText} orderLink={orderLink} />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                images={images}
                currentIndex={modalIndex}
                onNext={handleModalNext}
                onPrev={handleModalPrev}
            />
        </>
    );
};

export default GalleryCarousel;