import Image from 'next/image';
import OrderBtn from "@/app/components/OrderBtn";

const Felting = () => {
    return (
        <section id="felting" className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8 color-red">Фелтинг (Вовна)</h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                    Портрет улюбленця, валяний з вовни. Доступний у 2D та 3D форматах.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                        <Image src="/images/felting/felting_main.jpg" alt="Felting example 1" layout="fill" objectFit="cover"/>
                    </div>
                    <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                        <Image src="/images/felting/felting_2d.jpg" alt="Felting example 2" layout="fill" objectFit="cover"/>
                    </div>
                    <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                        <Image src="/images/felting/felting_3d.jpg" alt="Felting example 3" layout="fill" objectFit="cover"/>
                    </div>
                </div>
                <div className="mt-8">
                    <span className="text-xl font-semibold mr-8 color-red">2D</span>
                    <span className="text-xl font-semibold color-red">3D</span>
                </div>
                <div className="text-center mt-8">
                    <OrderBtn orderText="Замовити портрет" orderLink="https://www.instagram.com/dianych.ua" />
                </div>
            </div>
        </section>
    );
};

export default Felting;