import React, { useState } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function UserEdit({ auth, user }) {
    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar ? `/storage/${user.avatar}` : null
    );
    
    const editForm = useForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'employee',
        designation: user.designation || '',
        avatar: null,
        _method: 'PUT'
    });

    const handleEdit = (e) => {
        e.preventDefault();
        
        editForm.post(route('users.update', user.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('User updated successfully');
                editForm.setData('password', '');
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            }
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            editForm.setData('avatar', file);
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
                                        type="text"
                                        placeholder="Designation/Job Role"
                                        value={editForm.data.designation}
                                        onChange={e => editForm.setData('designation', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    {editForm.errors.designation && (
                                        <div className="text-red-600 text-sm">{editForm.errors.designation}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Avatar</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                    {editForm.errors.avatar && (
                                        <div className="text-red-600 text-sm">{editForm.errors.avatar}</div>
                                    )}
                                    {avatarPreview && (
                                        <div className="mt-2">
                                            <img 
                                                src={avatarPreview} 
                                                alt="Avatar preview" 
                                                className="w-16 h-16 rounded-full object-cover border"
                                            />
                                        </div>
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
                                    <button 
                                        type="submit" 
                                        className="bg-blue-600 text-white px-3 py-1 rounded disabled:bg-blue-300"
                                        disabled={editForm.processing}
                                        onClick={() => console.log('🔘 Save button clicked!')}
                                    >
                                        {editForm.processing ? 'Saving...' : 'Save'}
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
