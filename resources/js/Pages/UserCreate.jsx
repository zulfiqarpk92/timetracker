import React, { useState } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function UserCreate({ auth }) {
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        avatar: null,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        
        console.log('Form submission started');
        console.log('Form data:', createForm.data);
        console.log('Has avatar:', !!createForm.data.avatar);
        
        createForm.post(route('users.store'), {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => {
                console.log('Request started');
            },
            onSuccess: (response) => {
                console.log('Success response:', response);
                createForm.reset();
                setAvatarPreview(null);
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
            onFinish: () => {
                console.log('Request finished');
            }
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        console.log('Avatar file selected:', file);
        
        if (file) {
            console.log('Setting avatar file:', file.name, file.size, file.type);
            createForm.setData('avatar', file);
            
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
                console.log('Avatar preview set');
            };
            reader.readAsDataURL(file);
        } else {
            console.log('No file selected, clearing avatar');
            createForm.setData('avatar', null);
            setAvatarPreview(null);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add User</h2>}
        >
            <Head title="Add User" />
            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Add User</h1>
                            <form onSubmit={handleCreate} className="mb-4 space-y-2">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={createForm.data.name}
                                        onChange={e => createForm.setData('name', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <div className="text-red-600 text-sm">{createForm.errors.name}</div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={createForm.data.email}
                                        onChange={e => createForm.setData('email', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <div className="text-red-600 text-sm">{createForm.errors.email}</div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={createForm.data.password}
                                        onChange={e => createForm.setData('password', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    />
                                    {createForm.errors.password && (
                                        <div className="text-red-600 text-sm">{createForm.errors.password}</div>
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
                                    {createForm.errors.avatar && (
                                        <div className="text-red-600 text-sm">{createForm.errors.avatar}</div>
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
                                    <label className="block mb-1 font-medium">Role</label>
                                    <select
                                        value={createForm.data.role}
                                        onChange={e => createForm.setData('role', e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {createForm.errors.role && (
                                        <div className="text-red-600 text-sm">{createForm.errors.role}</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="submit" 
                                        className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-green-300"
                                        disabled={createForm.processing}
                                    >
                                        {createForm.processing ? 'Creating...' : 'Create'}
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
