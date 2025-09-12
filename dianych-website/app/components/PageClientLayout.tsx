'use client';

import { useState, useEffect } from 'react';
import TopBar from './TopBar';

export default function PageClientLayout({ children }: { children: React.ReactNode }) {
    const [isTopBarVisible, setIsTopBarVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show top bar after scrolling down 400px
            if (window.scrollY > 400) {
                setIsTopBarVisible(true);
            } else {
                setIsTopBarVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Cleanup function to remove the event listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <TopBar isVisible={isTopBarVisible} />
            {children}
        </>
    );
}