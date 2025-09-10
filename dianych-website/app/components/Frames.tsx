import Image from 'next/image';

const FrameCard = ({ title, images, size, price }: { title: string, images: string[], size: string, price: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 red text-center">{title}</h3>
        <div className="flex justify-center space-x-4 mb-4">
            {images.map((src, index) => (
                <div key={index} className="relative w-40 h-40 rounded-lg overflow-hidden">
                    <Image src={src} alt={title} layout="fill" objectFit="cover" />
                </div>
            ))}
        </div>
        <div className="flex justify-between items-center mt-4 bg-gray-100 p-3 rounded-lg">
            <span className="text-lg font-medium">{size}</span>
            <span className="text-lg font-bold text-pink-600">{price}</span>
        </div>
    </div>
);

const Frames = () => {
    const frameData = [
        { title: "Маленька рама 8см", images: ['/images/frames/small_1_1.jpg', '/images/frames/small_1_2.jpg', '/images/frames/small_1_3.jpg'], size: "під п'яльця 8 см", price: "450 UAH" },
        { title: "Маленька рама 10см", images: ['/images/frames/small_2_1.jpg', '/images/frames/small_2_2.jpg', '/images/frames/small_2_3.jpg'], size: "під п'яльця 10 см", price: "500 UAH" },
        { title: "Середня рама 14см", images: ['/images/frames/medium_1.jpg', '/images/frames/medium_2.jpg', '/images/frames/medium_3.jpg'], size: "під п'яльця 14 см", price: "600 UAH" },
        { title: "Велика рама 19см", images: ['/images/frames/large_1.jpg', '/images/frames/large_2.jpg', '/images/frames/large_3.jpg'], size: "під п'яльця 19 см", price: "700 UAH" }
    ];

    return (
        <section id="frames" className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 red">Рамки</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {frameData.map((frame, index) => <FrameCard key={index} {...frame} />)}
                </div>
                <div className="text-center mt-12">
                    <a href="https://www.instagram.com/povne.kolo/" target="_blank" rel="noopener noreferrer" className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors duration-300 text-lg">
                        Замовити рамку
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Frames;