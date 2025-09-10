import Image from 'next/image';

interface GalleryProps {
    id: string;
    title: string;
    images: string[];
    orderLink: string;
    buttonText: string;
}

const Gallery = ({ id, title, images, orderLink, buttonText }: GalleryProps) => {
    return (
        <section id={id} className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
                {/* Контейнер для галереї з горизонтальною прокруткою */}
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {images.map((src, index) => (
                        <div key={index} className="flex-shrink-0 w-64 h-64 relative rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={src}
                                alt={`${title} image ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <a
                        href={orderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors duration-300 text-lg"
                    >
                        {buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Gallery;