import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ProjectEdit({ auth, project, clients = [] }) {
    const form = useForm({
        name: project.name || '',
        client_id: project.client_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Project</h2>}>
            <Head title="Edit Project" />
            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input type="text" placeholder="Project Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                                    {form.errors.name && <div className="text-red-600 text-sm">{form.errors.name}</div>}
                                </div>

                                <div>
                                    <select name="client_id" value={form.data.client_id} onChange={e => form.setData('client_id', e.target.value)} className="border rounded px-2 py-1 w-full">
                                        <option value="">Select Client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>

                                    {form.errors.client_id && <div className="text-red-600 text-sm">{form.errors.client_id}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                                    <Link href={route('projects.index')} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
