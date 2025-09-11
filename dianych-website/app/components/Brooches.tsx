import Gallery from './Gallery';

const Brooches = () => {
    const images = [
        '/images/brooches/01.jpg',
        '/images/brooches/02.jpg',
        '/images/brooches/03.jpg',
        '/images/brooches/04.jpg',
        '/images/brooches/05.jpg',
        '/images/brooches/06.jpg',
        '/images/brooches/07.jpg',
        '/images/brooches/08.jpg',
        '/images/brooches/09.jpg',
        '/images/brooches/10.jpg',
        '/images/brooches/11.jpg',
        '/images/brooches/12.jpg',
        '/images/brooches/13.jpg'
    ];

    return (
        <Gallery
            id="brooches"
            title="Вишивка: Брошки / Шеврони"
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити вишивку"
        />
    );
};

export default Brooches;