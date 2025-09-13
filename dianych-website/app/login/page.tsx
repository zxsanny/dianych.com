'use client';

import { useState } from 'react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center color-red">Management Login</h1>
                <form action="/api/login" method="POST" className="space-y-6" onSubmit={() => setIsLoading(true)}>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 block">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none
                            focus:ring-2 focus:ring-pink-500 color-red"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 text-lg font-semibold text-white bg-red rounded-md
                             hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                              focus:ring-pink-500 disabled:bg-gray-400 cursor-pointer"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}