'use client';

import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { uploadImages, deleteImage, getGalleryImages, FormState } from '@/app/actions';
import { RemoveButton } from './RemoveButton';

const initialState: FormState = { message: '', status: 'idle' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending}
                className="w-full px-6 py-3 bg-[#E11D48] text-white font-semibold rounded-lg
                 hover:bg-pink-700 disabled:bg-gray-400 transition-colors cursor-pointer">
            {pending ? 'Завантаження...' : 'Завантажити картинки'}
        </button>
    );
}

export default function GalleryManager({ folder, folderName }: { folder: string, folderName: string }) {
    const [uploadState, uploadAction] = useActionState(uploadImages, initialState);
    const [deleteState, deleteAction] = useActionState(deleteImage, initialState);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        formRef.current?.reset();
    }, [folder]);

    useEffect(() => {
        async function fetchImages() {
            setIsLoading(true);
            const imagePaths = await getGalleryImages(folder);
            setImages(imagePaths);
            setIsLoading(false);
        }
        fetchImages();
    }, [folder, uploadState, deleteState]);

    return (
        <div className="space-y-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 color-red">Додати до: {folderName}</h2>
                <form ref={formRef} action={uploadAction} className="space-y-6">
                    <input type="hidden" name="folder" value={folder} />
                    <div>
                        <label htmlFor="files" className="block text-lg font-medium text-gray-700 mb-2">Оберіть картинки</label>
                        <input type="file" id="files" name="files" multiple required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                    </div>
                    <SubmitButton />
                </form>
                {uploadState.message && (
                    <p className={`mt-4 text-center text-sm font-medium ${uploadState.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {uploadState.message}
                    </p>
                )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 color-red">Керування: {folderName}</h2>
                {isLoading && <p className="text-center text-gray-500">Завантаження картинок...</p>}
                {!isLoading && images.length === 0 && <p className="text-center text-gray-500">У цій секції ще немає картинок.</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((src) => (
                        <div key={src} className="relative aspect-square group">
                            <Image src={src} alt={src} fill className="object-cover rounded-lg" unoptimized />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <RemoveButton imagePath={src} formAction={deleteAction} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}