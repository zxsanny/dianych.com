'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (lang: 'ua' | 'en') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-gray-700"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span className="font-semibold text-gray-700">{language.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <ul>
                        <li>
                            <button onClick={() => handleLanguageChange('ua')} className="flex items-center w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100">
                                <Image src="/images/flags/ua.svg" alt="Ukrainian Flag" width={24} height={16} className="mr-3" />
                                <span>UA</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleLanguageChange('en')} className="flex items-center w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100">
                                <Image src="/images/flags/gb.svg" alt="British Flag" width={24} height={15} className="mr-3" />
                                <span>EN</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}