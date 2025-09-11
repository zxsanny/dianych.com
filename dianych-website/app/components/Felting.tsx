import Gallery from "@/app/components/Gallery";

const Felting = () => {
    const images = [
        '/images/felting/felting_2d.jpg',
        '/images/felting/felting_3d.jpg'
    ];

    return (
        <Gallery
            id="felting"
            title="Фелтінг (Вовна)"
            description="Портрет улюбленця, валяний з вовни. Доступний у 2D та 3D форматах."
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити вишивку"
        />
    );
};

export default Felting;