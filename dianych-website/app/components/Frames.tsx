import OrderBtn from "@/app/components/OrderBtn";
import Gallery from "@/app/components/Gallery";

const FrameCard = ({ title, id, size, price }: { title: string, id: string, size: string, price: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <Gallery title={title} id={id} />
        <div className="flex justify-between items-center mt-4 bg-gray-100 p-3 rounded-lg">
            <span className="text-lg font-medium color-red">{size}</span>
            <span className="text-lg font-bold color-red">{price}</span>
        </div>
    </div>
);

const Frames = () => {
    const frameData = [
        { title: "Маленька рама 8см", id: "frames_small_1", size: "під п'яльця 8 см", price: "450 UAH" },
        { title: "Маленька рама 10см", id: "frames_small_2", size: "під п'яльця 10 см", price: "500 UAH" },
        { title: "Середня рама 14см", id: "frames_medium", size: "під п'яльця 14 см", price: "600 UAH" },
        { title: "Велика рама 19см", id: "frames_large", size: "під п'яльця 19 см", price: "700 UAH" }
    ];

    return (
        <section id="frames" className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 color-red cursor-default">Рамки</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {frameData.map((frame, index) => <FrameCard key={index} {...frame} />)}
                </div>
                <div className="text-center mt-12">
                    <OrderBtn orderText="Замовити рамку" orderLink="https://www.instagram.com/povne.kolo/" />
                </div>
            </div>
        </section>
    );
};

export default Frames;