import ManagePageClient from './ManagePageClient';
import LogoutButton from '../logout/LogoutButton';

export default function ManagePage() {
    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="text-center mb-8 relative">
                <h1 className="text-4xl font-bold color-red">Менеджмент секцій</h1>
                <div className="absolute top-0 right-0">
                    <LogoutButton />
                </div>
            </div>
            <ManagePageClient />
        </main>
    );
}