import Gallery from './Gallery';

const Panel = () => {
    const images = [
        '/images/painted_panel/1.jpg',
        '/images/painted_panel/2.jpg',
        '/images/painted_panel/3.jpg',
        '/images/painted_panel/4.jpg',
        '/images/painted_panel/5.jpg',
        '/images/painted_panel/6.jpg',
    ];

    return (
        <Gallery
            id="panel"
            title="Панно"
            images={images}
            orderLink="https://www.instagram.com/dianych.ua/"
            buttonText="Замовити вишивку"
        />
    );
};

export default Panel;