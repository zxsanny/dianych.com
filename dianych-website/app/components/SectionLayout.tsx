'use client';

import { useTranslation } from "@/lib/translations";

interface SectionLayoutProps {
    id: string;
    titleKey: string;
    children: React.ReactNode;
}

const SectionLayout = ({ id, titleKey, children }: SectionLayoutProps) => {
    const t = useTranslation();
    const title = t[titleKey as keyof typeof t] || titleKey;

    return (
        <section id={id} className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 color-red">{title}</h2>
                {children}
            </div>
        </section>
    );
};

export default SectionLayout;