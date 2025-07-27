import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ClientCreate({ auth }) {
    const form = useForm({
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('clients.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Client</h2>}>
            <Head title="Add Client" />
            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Add Client</h1>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input type="text" placeholder="Client Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                                    {form.errors.name && <div className="text-red-600 text-sm">{form.errors.name}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                                    <Link href={route('clients.index')} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
