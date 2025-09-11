import Image from 'next/image';

const NavLink = ({ href, imgSrc, label, className = '' }:
                 { href: string; imgSrc: string; label: string; className?: string }) => (
    <div className={`flex flex-col items-center text-center group cursor-pointer ${className}`}>
        <a href={href}>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-4xl overflow-hidden border-2 border-white/50 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Image
                    src={imgSrc}
                    alt={`${label} category link`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="mt-4 font-semibold text-gray-800 text-lg sm:text-xl">{label}</div>
        </a>
    </div>
);

const Header = () => {
    // noinspection HtmlUnknownAnchorTarget
    return (
        <header className="bg-[#FBEFE1] w-full overflow-hidden">
            {/* --- DESKTOP-ONLY LAYOUT --- */}
            <div className="hidden lg:grid container mx-auto h-screen grid-cols-3">
                <div className="col-span-2 flex flex-col">
                    <div className="flex-shrink-0 flex flex-col items-center text-center pt-16">
                        <div className="relative w-32 h-32">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" fill
                                   className="object-contain" />
                        </div>
                        <h1 className="text-8xl color-red">DIANYCH</h1>
                        <p className="text-3xl text-gray-700 mt-2">Портрети домашніх улюбленців</p>
                    </div>
                    <div className="relative w-full h-[80vh] bottom-20">
                        <Image
                            src="/images/header/main_author.png"
                            alt="Author Diana"
                            fill
                            className="object-contain object-bottom-left"
                            priority
                        />
                    </div>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                        <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label="Вишивка 🧵" />
                        <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label="Рамки 🪵" />
                        <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label="Валяння🐩" />
                        <NavLink href="#kits" imgSrc="/images/header/schemes_kits_link.webp" label="Схеми/набори🍂" />
                    </div>
                    <div className="flex items-center space-x-6 gap-x-12 gap-y-16 mt-10">
                        <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer">
                            <Image src="/images/contacts/instagram_icon.png" alt="Instagram" width={96} height={96} />
                        </a>
                        <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer">
                            <Image src="/images/contacts/tiktok_icon.png" alt="TikTok" width={96} height={96} />
                        </a>
                        <a href="https://t.me/dianych.now" target="_blank" rel="noopener noreferrer">
                            <Image src="/images/contacts/telegram_icon.png" alt="Telegram" width={96} height={96} />
                        </a>
                    </div>
                    <a className="color-red mt-3 text-2xl" href="#contact">Всі контакти</a>
                </div>
            </div>

            <div className="lg:hidden container mx-auto flex flex-col items-center justify-center px-4 py-8 space-y-8">
                <div className="flex w-full items-center">
                    <div className="w-2/5 flex-shrink-0">
                        <div className="relative w-full aspect-[2/3]">
                            <Image
                                src="/images/header/main_author.png"
                                alt="Author Diana"
                                fill
                                priority
                                className="rounded-lg object-cover object-top"
                            />
                        </div>
                    </div>
                    <div className="w-3/5 flex flex-col items-center text-center pr-5">
                        <div className="relative w-20 h-20">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" fill className="object-contain" />
                        </div>
                        <h1 className="text-5xl color-red">DIANYCH</h1>
                        <p className="text-base text-gray-700 mt-1">Портрети домашніх улюбленців</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label="Вишивка" className="w-full" />
                    <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label="Рамки" className="w-full" />
                    <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label="Валяння" className="w-full" />
                    <NavLink href="#kits" imgSrc="/images/header/schemes_kits_link.webp" label="Схеми / набори" className="w-full" />
                </div>

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
                <a className="color-red text-2xl" href="#contact">Всі контакти</a>
            </div>
        </header>
    );
};

export default Header;