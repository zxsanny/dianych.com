'use client';

import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/lib/translations';

export default function TopBar({ isVisible }: { isVisible: boolean }) {
    const t = useTranslation();

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm shadow-md transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 h-16">
                <Link href="/" className="flex items-center gap-2 sm:gap-4">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image src="/images/header/main_logo.png" alt="Dianych Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl color-red font-bold">DIANYCH</h1>
                        <p className="text-sm text-gray-600 hidden sm:block">{t.petPortraits}</p>
                    </div>
                </Link>

                <div className="flex items-center gap-0 sm:gap-1">
                    <a href="https://www.instagram.com/dianych.ua/" target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 rounded-full hover:bg-black/10">
                        <Image src="/images/contacts/instagram_icon.png" alt="Instagram" width={32} height={32} />
                    </a>
                    <a href="https://www.tiktok.com/@dianych.ua" target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 rounded-full hover:bg-black/10">
                        <Image src="/images/contacts/tiktok_icon.png" alt="TikTok" width={32} height={32} />
                    </a>
                    <a href="https://t.me/dianych_now" target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 rounded-full hover:bg-black/10">
                        <Image src="/images/contacts/telegram_icon.png" alt="Telegram" width={32} height={32} />
                    </a>
                    <div className="ml-2">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}