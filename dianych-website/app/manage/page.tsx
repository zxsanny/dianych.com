import ManagePageClient from './ManagePageClient';

export default function ManagePage() {
    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center mb-8 color-red">Менеджмент секцій</h1>
            <ManagePageClient />
        </main>
    );
}