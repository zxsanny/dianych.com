import './globals.css';
import { vinnytsiaSerif } from './fonts';

export const metadata = {
    title: 'DIANYCH - Pet Portraits',
    description: 'Custom embroidered and felted portraits of your beloved pets.',
};

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${vinnytsiaSerif.variable}`}>
        <body>{children}</body>
        </html>
    );
}
