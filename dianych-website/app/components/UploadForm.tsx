'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { uploadImages, FormState } from '@/app/actions';

const initialState: FormState = {
    message: '',
    status: 'idle',
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full px-6 py-3 bg-[#E11D48] text-white font-semibold rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
            {pending ? 'Додавання...' : 'Додати фотки'}
        </button>
    );
}

export default function UploadForm() {
    const [state, formAction] = useFormState(uploadImages, initialState);

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6 color-red">Додавання фоток</h1>
            <form action={formAction} className="space-y-6">
                <div className="color-red">
                    <label htmlFor="folder" className="block text-lg font-medium text-gray-700 mb-2">
                        Оберіть розділ
                    </label>
                    <select
                        id="folder"
                        name="folder"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                    >
                        <option value="" disabled selected>Choose a gallery...</option>
                        <option value="brooches">Вишивка: Брошки / Шеврони</option>
                        <option value="clothes">Вишивка на одязі</option>
                        <option value="panel">Панно</option>
                        <option value="felting">Фелтінг</option>
                        <option value="kits">Схеми/Набори</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="files" className="block text-lg font-medium text-gray-700 mb-2">
                        Choose Images
                    </label>
                    <input
                        type="file"
                        id="files"
                        name="files"
                        multiple
                        required
                        className="w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-pink-50 file:text-pink-700
                                   hover:file:bg-pink-100"
                    />
                </div>

                <SubmitButton />
            </form>

            {state.message && (
                <p className={`mt-4 text-center text-sm font-medium ${state.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </div>
    );
}