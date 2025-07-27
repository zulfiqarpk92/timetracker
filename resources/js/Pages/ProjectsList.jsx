import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function ProjectsList({ auth, projects, flash }) {
    const [deleteId, setDeleteId] = React.useState(null);
    const [toast, setToast] = React.useState(flash?.success || '');

    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(route('projects.destroy', deleteId), {
            onSuccess: () => {
                setToast('Project deleted.');
                setDeleteId(null);
            },
            onError: () => {
                setToast('Failed to delete project.');
                setDeleteId(null);
            },
        });
    };
    const closeToast = () => setToast('');

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Projects</h2>}>
            <Head title="Projects" />
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
                    <span>{toast}</span>
                    <button onClick={closeToast} className="ml-4 text-white font-bold">&times;</button>
                </div>
            )}
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this project?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">Projects</h1>
                                <Link href={route('projects.create')} className="px-4 py-2 bg-blue-600 text-white rounded">Add Project</Link>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.map(project => (
                                        <tr key={project.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.client}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <Link href={route('projects.edit', project.id)} className="text-blue-600 hover:underline mr-2">Edit</Link>
                                                <button onClick={() => confirmDelete(project.id)} className="text-red-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
