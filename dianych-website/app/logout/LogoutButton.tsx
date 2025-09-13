'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        // Refresh the page. Middleware will catch this and redirect to /login
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
        >
            Logout
        </button>
    );
}