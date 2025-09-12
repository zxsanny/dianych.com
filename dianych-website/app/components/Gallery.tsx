import { getImagePaths } from '@/lib/galleryUtils';
import GalleryCarousel from './GalleryCarousel';

interface GalleryProps {
    id: string;
    titleKey: string;
    descriptionKey?: string;
    buttonTextKey?: string;
    orderLink?: string;
}

const Gallery = ({ id, titleKey, descriptionKey, buttonTextKey, orderLink }: GalleryProps) => {
    const images = getImagePaths(id);

    return (
        <section id={id} className="py-12 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <GalleryCarousel
                    images={images}
                    titleKey={titleKey}
                    descriptionKey={descriptionKey}
                    buttonTextKey={buttonTextKey}
                    orderLink={orderLink}
                />
            </div>
        </section>
    );
};

export default Gallery;