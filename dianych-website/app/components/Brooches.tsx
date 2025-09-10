import Gallery from './Gallery';

const Brooches = () => {
    const images = [
        '/images/brooches/1.jpg',
        '/images/brooches/2.jpg',
        '/images/brooches/3.jpg',
        '/images/brooches/4.jpg',
        '/images/brooches/5.jpg',
        '/images/brooches/6.jpg',
    ];

    return (
        <Gallery
            id="brooches"
            title="Вишивка: Брошки/Шеврони"
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити вишивку"
        />
    );
};

export default Brooches;