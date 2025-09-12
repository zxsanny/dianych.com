'use client';

import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/lib/translations';

const NavLink = ({ href, imgSrc, label, className = '' }: { href: string; imgSrc: string; label: string; className?: string }) => (
    <div className={`flex flex-col items-center text-center group cursor-pointer ${className}`}>
        <Link href={href} scroll={true}>
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Image src={imgSrc} alt={`${label} category link`} fill className="object-cover" />
            </div>
            <div className="mt-2 font-semibold text-gray-800 text-lg sm:text-xl">{label}</div>
        </Link>
    </div>
);

const Header = () => {
    const t = useTranslation();

    // noinspection HtmlUnknownAnchorTarget
    return (
        <header className="bg-[#FBEFE1] w-full overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher />
            </div>

            <div className="hidden lg:grid container mx-auto h-screen grid-cols-2 items-center gap-8">
                <div className="relative w-full h-full">
                    <Image src="/images/header/main_author.png" alt="Author Diana" fill className="object-contain object-bottom"
                           priority />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="relative w-32 h-32">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" fill className="object-contain" />
                        </div>
                        <h1 className="text-7xl color-red cursor-default">DIANYCH</h1>
                        <p className="text-2xl text-gray-700 mt-2 cursor-default">{t.petPortraits}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                        <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label={t.embroidery} />
                        <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label={t.frames} />
                        <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label={t.felting} />
                        <NavLink href="#kits" imgSrc="/images/header/schemes_kits_link.webp" label={t.schemesKits} />
                    </div>
                    <div className="flex items-center space-x-6 mt-8">
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
                    <a className="color-red text-2xl" href="#contact">Всі контакти</a>
                </div>
            </div>

            <div className="lg:hidden container mx-auto flex flex-col items-center justify-center px-4 py-8 space-y-8 pt-20">
                <div className="flex w-full items-center gap-1">
                    <div className="w-2/5 flex-shrink-0">
                        <div className="relative w-full aspect-[2/3]">
                            <Image src="/images/header/main_author.png" alt="Author Diana" fill
                                   className="object-cover rounded-lg object-top" priority />
                        </div>
                    </div>
                    <div className="w-3/5 flex flex-col items-center text-center">
                        <div className="relative w-20 h-20">
                            <Image src="/images/header/main_logo.png" alt="Dianych Logo" fill className="object-contain" />
                        </div>
                        <h1 className="text-4xl color-red">DIANYCH</h1>
                        <p className="text-base text-gray-700 mt-1">{t.petPortraits}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <NavLink href="#brooches" imgSrc="/images/header/embroidery_link.webp" label={t.embroidery} className="w-full" />
                    <NavLink href="#frames" imgSrc="/images/header/frames_link.webp" label={t.frames} className="w-full" />
                    <NavLink href="#felting" imgSrc="/images/header/felting_link.jpg" label={t.felting} className="w-full" />
                    <NavLink href="#kits" imgSrc="/images/header/schemes_kits_link.webp" label={t.schemesKits} className="w-full" />
                </div>
                <div className="flex items-center space-x-6">
                    <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/instagram_icon.png" alt="Instagram" width={48} height={48} />
                    </a>
                    <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/tiktok_icon.png" alt="TikTok" width={48} height={48} />
                    </a>
                    <a href="https://t.me/dianych.now" target="_blank" rel="noopener noreferrer">
                        <Image src="/images/contacts/telegram_icon.png" alt="Telegram" width={48} height={48} />
                    </a>
                </div>
                <a className="color-red text-2xl" href="#contact">Всі контакти</a>
            </div>
        </header>
    );
};

export default Header;