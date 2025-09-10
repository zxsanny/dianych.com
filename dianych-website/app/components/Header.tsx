// app/components/Header.tsx
import Image from 'next/image';
import Link from 'next/link';

const NavLink = ({ href, imgSrc, label }: { href: string; imgSrc: string; label: string }) => (
    <Link href={href} scroll={true}>
        <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Image
                    src={imgSrc}
                    alt={`${label} category link`}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <span className="mt-3 font-semibold text-gray-800 text-lg">{label}</span>
        </div>
    </Link>
);

const Header = () => {
    return (
        <header className="bg-[#FBEFE1] w-full">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center min-h-screen px-4 py-8">

                <div className="w-full md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-10">
                    <div className="relative w-[300px] h-[450px] sm:w-[400px] sm:h-[600px]">
                        <Image
                            src="/images/header/main_author.JPG"
                            alt="Author Diana"
                            layout="fill"
                            objectFit="contain"
                            priority
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-4 md:space-y-6 mt-8 md:mt-0">

                    <div className="relative w-32 h-32">
                        <Image src="/images/header/main_logo.PNG" alt="Dianych Logo" layout="fill" objectFit="contain" />
                    </div>
                    <h1 className="text-6xl md:text-7xl text-[#A52A2A] font-serifCustom">DIANYCH</h1>
                    <p className="text-xl md:text-2xl text-gray-700 -mt-2">Портрети домашніх улюбленців</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4">
                        <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label="Вишивка" />
                        <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label="Рамки" />
                        <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label="Валяння" />
                        <NavLink href="#contact" imgSrc="/images/header/schemes_kits_link.webp" label="Схеми / набори" />
                    </div>

                    <div className="flex items-center space-x-6 pt-4">
                        <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer" className="transition-transform duration-300 hover:scale-110">
                            <Image src="/images/header/instagram_icon.png" alt="Instagram" width={48} height={48} />
                        </a>
                        <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer" className="transition-transform duration-300 hover:scale-110">
                            <Image src="/images/header/tiktok_icon.png" alt="TikTok" width={48} height={48} />
                        </a>
                        <a href="https://t.me/dianych_now" target="_blank" rel="noopener noreferrer" className="transition-transform duration-300 hover:scale-110">
                            <Image src="/images/header/telegram_icon.png" alt="Telegram" width={48} height={48} />
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;