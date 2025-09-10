import Gallery from './Gallery';

const Clothes = () => {
    const images = [
        '/images/clothes/01.jpg',
        '/images/clothes/02.jpg',
        '/images/clothes/03.jpg',
        '/images/clothes/04.jpg',
        '/images/clothes/05.jpg',
        '/images/clothes/06.jpg',
        '/images/clothes/07.jpg',
        '/images/clothes/08.jpg',
        '/images/clothes/09.jpg',
        '/images/clothes/10.jpg',
        '/images/clothes/11.jpg',
        '/images/clothes/12.jpg',
        '/images/clothes/13.jpg',
        '/images/clothes/14.jpg',
        '/images/clothes/15.jpg',
        '/images/clothes/16.jpg',
    ];

    return (
        <Gallery
            id="clothes"
            title="Вишивка на одязі"
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити вишивку"
        />
    );
};

export default Clothes;