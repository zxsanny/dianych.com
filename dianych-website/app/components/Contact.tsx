import Image from 'next/image';

const Contact = () => {
    return (
        <section id="contact" className="py-12 bg-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8 red">Контактна інформація</h2>
                <div className="flex justify-center items-center space-x-4">
                    <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/instagram_icon.png" alt="Instagram" width={32} height={32} />
                        <span className="ml-2">dianych.ua</span>
                    </a>
                    <a href="https://t.me/dianych_now" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/telegram_icon.png" alt="Telegram" width={32} height={32} />
                        <span className="ml-2">dianych_now</span>
                    </a>
                    <a href="https://www.youtube.com/@dianych.ua." target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/youtube_icon.png" alt="YouTube" width={32} height={32} />
                        <span className="ml-2">Діанич вишиває</span>
                    </a>
                    <a href="https://www.etsy.com/shop/DianychStudio" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/etsy_icon.png" alt="Etsy" width={32} height={32} />
                        <span className="ml-2">DianychStudio</span>
                    </a>
                    <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/tiktok_icon.png" alt="TikTok" width={32} height={32} />
                        <span className="ml-2">dianych.ua</span>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=100012871091950" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/facebook_icon.png" alt="Facebook" width={32} height={32} />
                        <span className="ml-2">Diana</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;