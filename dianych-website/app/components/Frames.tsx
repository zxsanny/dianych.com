'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import SectionLayout from './SectionLayout';
import Modal from './Modal';
import OrderButton from "@/app/components/OrderButton"; // Import the Modal component

// FrameCard now has its own logic to open a modal
const FrameCard = ({ title, images, size, price }: { title: string, images: string[], size: string, price: string }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setModalIndex(index);
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);
    const handleModalNext = () => setModalIndex((prev) => (prev + 1) % images.length);
    const handleModalPrev = () => setModalIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4 color-red text-center cursor-default">{title}</h3>
                <div className="flex justify-center space-x-4 mb-4">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className="relative w-40 h-40 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => handleImageClick(index)}
                        >
                            <Image src={src} alt={title} fill className="object-cover" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-4 bg-gray-100 p-3 rounded-lg cursor-default">
                    <span className="text-lg font-medium color-red">{size}</span>
                    <span className="text-lg font-bold color-red">{price}</span>
                </div>
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

const Frames = () => {
    const t = useTranslation();

    const frameData = [
        { title: t.smallFrame8, images: ['/images/frames/small_1_1.jpg', '/images/frames/small_1_2.jpg', '/images/frames/small_1_3.jpg'], size: t.hoopSize8, price: "450 UAH" },
        { title: t.smallFrame10, images: ['/images/frames/small_2_1.jpg', '/images/frames/small_2_2.jpg', '/images/frames/small_2_3.jpg'], size: t.hoopSize10, price: "500 UAH" },
        { title: t.mediumFrame14, images: ['/images/frames/medium_1.jpg', '/images/frames/medium_2.jpg', '/images/frames/medium_3.jpg'], size: t.hoopSize14, price: "600 UAH" },
        { title: t.largeFrame19, images: ['/images/frames/large_1.jpg', '/images/frames/large_2.jpg', '/images/frames/large_3.jpg'], size: t.hoopSize19, price: "700 UAH" }
    ];

    return (
        <SectionLayout id="frames" titleKey="framesTitle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {frameData.map((frame, index) => <FrameCard key={index} {...frame} />)}
            </div>
            <div className="text-center mt-12">
                <OrderButton orderText={t.orderFrame} orderLink="https://www.instagram.com/povne.kolo/" />
            </div>
        </SectionLayout>
    );
};

export default Frames;