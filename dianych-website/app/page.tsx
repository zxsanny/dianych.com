import Header from './components/Header';
import Brooches from './components/Brooches';
import Clothes from './components/Clothes';
import Panel from './components/Panel';
import Frames from './components/Frames';
import Felting from './components/Felting';
import Contact from './components/Contact';

export default function Home() {
    return (
        <main className="bg-white">
            <Header />
            <Brooches />
            <Clothes />
            <Panel />
            <Frames />
            <Felting />
            <Contact />
        </main>
    );
}