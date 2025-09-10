import Gallery from './Gallery';

const Panel = () => {
    const images = [
        '/images/painted_panel/01.jpg',
        '/images/painted_panel/02.jpg',
        '/images/painted_panel/03.jpg',
        '/images/painted_panel/04.jpg',
        '/images/painted_panel/05.jpg',
        '/images/painted_panel/06.jpg',
        '/images/painted_panel/07.jpg',
        '/images/painted_panel/08.jpg',
        '/images/painted_panel/09.jpg',
        '/images/painted_panel/10.jpg',
        '/images/painted_panel/11.jpg',
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