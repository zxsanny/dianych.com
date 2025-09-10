import './globals.css';
import localFont from 'next/font/local'

const vinnytsiaSerif = localFont({
    src: './fonts/vinnytsia_serif.woff2',
});

export const metadata = {
    title: 'DIANYCH - Pet Portraits',
    description: 'Custom embroidered and felted portraits of your beloved pets.',
};

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={vinnytsiaSerif.className}>
        <body>{children}</body>
        </html>
    );
}
