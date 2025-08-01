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
        designation: '',
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
            <div className="py-12 bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-visible shadow-xl sm:rounded-xl border-t-4 border-gradient-to-r from-green-600 to-yellow-400">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent mb-2">
                                    Add User
                                </h1>
                                <p className="text-gray-600">Create a new user account with role and avatar</p>
                            </div>
                            
                            <form onSubmit={handleCreate} className="space-y-6">
                                {/* Avatar Upload Section */}
                                <div className="flex flex-col items-center p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200">
                                    <div className="mb-4">
                                        {avatarPreview ? (
                                            <div className="relative">
                                                <img 
                                                    src={avatarPreview} 
                                                    alt="Avatar preview" 
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        createForm.setData('avatar', null);
                                                        setAvatarPreview(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer">
                                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Upload Avatar
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {createForm.errors.avatar && (
                                        <div className="text-red-600 text-sm mt-2">{createForm.errors.avatar}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter full name..."
                                            value={createForm.data.name}
                                            onChange={e => createForm.setData('name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <div className="text-red-600 text-sm mt-1">{createForm.errors.name}</div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Enter email address..."
                                            value={createForm.data.email}
                                            onChange={e => createForm.setData('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                        {createForm.errors.email && (
                                            <div className="text-red-600 text-sm mt-1">{createForm.errors.email}</div>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Enter password..."
                                            value={createForm.data.password}
                                            onChange={e => createForm.setData('password', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                        {createForm.errors.password && (
                                            <div className="text-red-600 text-sm mt-1">{createForm.errors.password}</div>
                                        )}
                                    </div>

                                    {/* Designation */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Designation
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter job title/designation..."
                                            value={createForm.data.designation}
                                            onChange={e => createForm.setData('designation', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        />
                                        {createForm.errors.designation && (
                                            <div className="text-red-600 text-sm mt-1">{createForm.errors.designation}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                                        User Role <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => createForm.setData('role', 'employee')}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                createForm.data.role === 'employee'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center mb-2">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="font-medium">Employee</div>
                                            <div className="text-sm opacity-70">Standard user access</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => createForm.setData('role', 'admin')}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                createForm.data.role === 'admin'
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-yellow-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center mb-2">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div className="font-medium">Admin</div>
                                            <div className="text-sm opacity-70">Full system access</div>
                                        </button>
                                    </div>
                                    {createForm.errors.role && (
                                        <div className="text-red-600 text-sm mt-2">{createForm.errors.role}</div>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        {createForm.processing ? 'Creating User...' : 'Create User'}
                                    </button>
                                    <Link
                                        href={route('users.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Users
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
