import Header from './components/Header';
import Brooches from './components/Brooches';
import Clothes from './components/Clothes';
import Panel from './components/Panel';
import Frames from './components/Frames';
import Felting from './components/Felting';
import Contact from './components/Contact';
import PageClientLayout from './components/PageClientLayout';
import Kits from "@/app/components/Kits";

export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <PageClientLayout>
            <main className="bg-white">
                <Header />
                <Brooches />
                <Clothes />
                <Panel />
                <Frames />
                <Felting />
                <Kits />
                <Contact />
            </main>
        </PageClientLayout>
    );
}