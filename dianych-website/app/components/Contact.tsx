'use client';

import Image from 'next/image';
import {useTranslation} from "@/lib/translations";

const contactLinks = [
    {
        href: "https://www.instagram.com/dianych.ua/",
        iconSrc: "/images/contacts/instagram_icon.png",
        alt: "Instagram Icon",
        text: "dianych.ua"
    },
    {
        href: "https://t.me/dianych_now",
        iconSrc: "/images/contacts/telegram_icon.png",
        alt: "Telegram Icon",
        text: "dianych_now"
    },
    {
        href: "https://www.youtube.com/@dianych.ua.",
        iconSrc: "/images/contacts/youtube_icon.png",
        alt: "YouTube Icon",
        text: "Діанич вишиває"
    },
    {
        href: "https://www.facebook.com/profile.php?id=100012871091950",
        iconSrc: "/images/contacts/facebook_icon.png",
        alt: "Facebook Icon",
        text: "Diana"
    },
    {
        href: "https://www.etsy.com/shop/DianychStudio",
        iconSrc: "/images/contacts/etsy_icon.png",
        alt: "Etsy Icon",
        text: "DianychStudio"
    },
    {
        href: "https://www.tiktok.com/@dianych.ua",
        iconSrc: "/images/contacts/tiktok_icon.png",
        alt: "TikTok Icon",
        text: "dianych TikTok"
    },
];

const Contact = () => {
    const t = useTranslation();

    return (
        <section id="contact" className="bg-[#FBEFE1] w-full py-16">
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start px-4">

                {/* --- LEFT COLUMN: Main Image (Desktop Only) --- */}
                <div className="hidden lg:flex justify-center items-start pt-8">
                    <div className="relative w-full max-w-lg aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src="/images/contacts/contacts_photo.jpg"
                            alt="Artistic photo of a woman in a rose garden"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Contact Info --- */}
                <div className="relative flex flex-col items-center text-center space-y-8 lg:bg-gradient-to-br lg:from-[#FFFBF5] lg:to-[#FCEAD7] lg:p-12 lg:rounded-2xl lg:shadow-xl">

                    {/* Branding */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-24 h-24">
                            <Image src="/images/header/main_logo.png"
                                   alt="Dianych Logo"
                                   fill
                                   className="object-contain" />
                        </div>
                        <h1 className="text-6xl color-red font-serifCustom">DIANYCH</h1>
                        <p className="text-xl text-gray-700 -mt-2">{t.petPortraits}</p>
                    </div>

                    {/* Contact Info Title */}
                    <h2 className="text-4xl color-red font-serifCustom">{t.contactInfo}</h2>

                    {/* Links list */}
                    <div className="w-full max-w-sm space-y-4">
                        {contactLinks.map((link) => (
                            <a
                                key={link.text}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full p-3 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors duration-300 transform hover:scale-105"
                            >
                                <div className="relative w-10 h-6">
                                    <Image src={link.iconSrc} alt={link.alt} fill className="object-contain"/>
                                </div>
                                <span className="flex-grow font-semibold text-gray-800 text-lg">{link.text}</span>
                            </a>
                        ))}
                    </div>

                    {/* Phone Image */}
                    <div className="hidden lg:block absolute -bottom-14 right-9 w-48 h-auto aspect-[9/19] transform translate-x-8 translate-y-8 rotate-12">
                        <Image
                            src="/images/contacts/phone_img.png"
                            alt="Phone displaying the Dianych Instagram profile"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;