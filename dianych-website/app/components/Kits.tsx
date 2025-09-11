import Gallery from './Gallery';

const Kits = () => {
    const images = [
        '/images/kits/kits_01.jpg',
        '/images/kits/kits_02.png',
        '/images/kits/kits_03.png'
    ];

    return (
        <Gallery
            id="kits"
            title="Схеми/Набори"
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити схеми"
        />
    );
};

export default Kits;