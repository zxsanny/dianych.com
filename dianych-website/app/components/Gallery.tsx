import { getImagePaths } from '../lib/galleryUtils';
import GalleryCarousel from './GalleryCarousel';

interface GalleryProps {
    id: string;
    title: string;
    description?: string;
    orderLink?: string;
    buttonText?: string;
}

const Gallery = ({ id, title, description, orderLink, buttonText }: GalleryProps) => {
    const images = getImagePaths(id);

    return (
        <section id={id} className="py-12 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl red text-center mb-8 color-red cursor-default">{title}</h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                    {description}
                </p>
                <GalleryCarousel
                    images={images}
                    orderLink={orderLink}
                    buttonText={buttonText}
                    title={title}
                />
            </div>
        </section>
    );
};

export default Gallery;