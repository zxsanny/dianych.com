import { getImagePaths } from '@/lib/galleryUtils';
import GalleryCarousel from './GalleryCarousel';

interface GalleryProps {
    id: string;
    titleKey: string; // Changed from 'title' to 'titleKey'
    buttonTextKey: string; // Changed from 'buttonText' to 'buttonTextKey'
    orderLink: string;
}

const Gallery = ({ id, titleKey, buttonTextKey, orderLink }: GalleryProps) => {
    // This server-side code runs perfectly fine here
    const images = getImagePaths(id);

    return (
        <section id={id} className="py-12 bg-gray-50/50">
            <div className="container mx-auto px-4">
                {/* The Carousel is the client part, so we pass it the data and keys */}
                <GalleryCarousel
                    images={images}
                    titleKey={titleKey}
                    buttonTextKey={buttonTextKey}
                    orderLink={orderLink}
                />
            </div>
        </section>
    );
};

export default Gallery;