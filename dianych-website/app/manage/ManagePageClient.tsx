'use client';

import { useState } from 'react';
import GalleryManager from './GalleryManager';
import PricesManager from './PricesManager';

const folders = [
    { key: 'brooches', name: 'Вишивка: Брошки / Шеврони' },
    { key: 'clothes', name: 'Вишивка на одязі' },
    { key: 'panel', name: 'Панно' },
    { key: 'felting', name: 'Фелтінг' },
    { key: 'kits', name: 'Схеми/Набори' },
    { key: 'prices', name: 'Ціни рамок' },
];

export default function ManagePageClient() {
    const [selectedFolder, setSelectedFolder] = useState<{ key: string, name: string } | null>(null);

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg self-start">
                <h2 className="text-2xl font-bold mb-4 color-red">Секції</h2>
                <ul className="space-y-2">
                    {folders.map((folder) => (
                        <li key={folder.key}>
                            <button
                                onClick={() => setSelectedFolder(folder)}
                                className={`w-full text-left px-4 py-2 cursor-pointer
                                rounded-md transition-colors text-gray-700
                                 ${selectedFolder?.key === folder.key ? 'bg-pink-100 font-semibold' : 'hover:bg-gray-100'}`}
                            >
                                {folder.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            <section className="md:col-span-3">
                {selectedFolder ? (
                    selectedFolder.key === 'prices' ? (
                        <PricesManager />
                    ) : (
                        <GalleryManager folder={selectedFolder.key} folderName={selectedFolder.name} />
                    )
                ) : (
                    <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-lg">
                        <p className="text-xl text-gray-500">Оберіть секцію зліва, щоб почати.</p>
                    </div>
                )}
            </section>
        </div>
    );
}