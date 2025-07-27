import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function UserEdit({ auth, user }) {
    const editForm = useForm({
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'employee',
    });

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put(route('users.update', editForm.data.id), {
            onSuccess: () => {
                editForm.setData('password', '');
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit User</h2>}
        >
            <Head title="Edit User" />
            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Edit User</h1>
                            <form onSubmit={handleEdit} className="mb-4 space-y-2">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={editForm.data.name}
                                        onChange={e => editForm.setData('name', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <div className="text-red-600 text-sm">{editForm.errors.name}</div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={editForm.data.email}
                                        onChange={e => editForm.setData('email', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                    {editForm.errors.email && (
                                        <div className="text-red-600 text-sm">{editForm.errors.email}</div>
                                    )}
                                </div>
                                <div>
                                    <select
                                        value={editForm.data.role}
                                        onChange={e => editForm.setData('role', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {editForm.errors.role && (
                                        <div className="text-red-600 text-sm">{editForm.errors.role}</div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="New Password (leave blank to keep current)"
                                        value={editForm.data.password}
                                        onChange={e => editForm.setData('password', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    {editForm.errors.password && (
                                        <div className="text-red-600 text-sm">{editForm.errors.password}</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                                        Save
                                    </button>
                                    <Link href={route('users.index')} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
