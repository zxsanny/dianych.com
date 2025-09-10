import Image from 'next/image';
import Link from 'next/link';

const NavLink = ({ href, imgSrc, label, className = '' }: { href: string; imgSrc: string; label: string; className?: string }) => (
    <div className={`flex flex-col items-center text-center group cursor-pointer ${className}`}>
        <Link href={href} scroll={true}>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-64 lg:h-64 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Image
                    src={imgSrc}
                    alt={`${label} category link`}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <span className="mt-3 font-semibold text-gray-800 text-lg sm:text-xl lg:text-2xl">{label}</span>
        </Link>
    </div>
);

const Header = () => {
    return (
        <header className="bg-[#FBEFE1] w-full overflow-hidden">
            {/* --- DESKTOP-ONLY LAYOUT --- */}
            <div className="hidden lg:grid container mx-auto h-screen grid-cols-3">
                <div className="col-span-2 flex flex-col">
                    <div className="flex-shrink-0 flex flex-col items-center text-center pt-16">
                        <div className="relative w-32 h-32">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" layout="fill" objectFit="contain" />
                        </div>
                        <h1 className="text-7xl red">DIANYCH</h1>
                        <p className="text-2xl text-gray-700 mt-2">Портрети домашніх улюбленців</p>
                    </div>
                    <div className="relative flex-grow w-full">
                        <Image
                            src="/images/header/main_author.png"
                            alt="Author Diana"
                            layout="fill"
                            objectFit="contain"
                            objectPosition="bottom left"
                            priority
                        />
                    </div>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                        <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label="Вишивка" />
                        <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label="Рамки" />
                        <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label="Валяння" />
                        <NavLink href="#contact" imgSrc="/images/header/schemes_kits_link.webp" label="Схеми / набори" />
                    </div>
                </div>
            </div>

            {/* --- MOBILE-ONLY LAYOUT --- */}
            <div className="lg:hidden container mx-auto flex flex-col items-center justify-center px-4 py-8 space-y-8">
                {/* New 2-Column Top Section */}
                <div className="flex w-full items-center">
                    {/* Left Column: Author Image */}
                    <div className="w-2/5 flex-shrink-0">
                        <div className="relative w-full aspect-[2/3]">
                            <Image
                                src="/images/header/main_author.png"
                                alt="Author Diana"
                                layout="fill"
                                objectFit="cover"
                                objectPosition="top"
                                priority
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                    {/* Right Column: Branding */}
                    <div className="w-3/5 flex flex-col items-center text-center pl-4">
                        <div className="relative w-20 h-20">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" layout="fill" objectFit="contain" />
                        </div>
                        <h1 className="text-5xl text-[#A52A2A]">DIANYCH</h1>
                        <p className="text-base text-gray-700 mt-1">Портрети домашніх улюбленців</p>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label="Вишивка" className="w-full" />
                    <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label="Рамки" className="w-full" />
                    <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label="Валяння" className="w-full" />
                    <NavLink href="#contact" imgSrc="/images/header/schemes_kits_link.webp" label="Схеми / набори" className="w-full" />
                </div>

                {/* Mobile Socials */}
                <div className="flex items-center space-x-6">
                    <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/header/instagram_icon.png" alt="Instagram" width={48} height={48} />
                    </a>
                    <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/header/tiktok_icon.png" alt="TikTok" width={48} height={48} />
                    </a>
                    <a href="https://t.me/dianych.now" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/header/telegram_icon.png" alt="Telegram" width={48} height={48} />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;