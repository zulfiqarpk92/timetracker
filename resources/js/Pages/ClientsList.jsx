import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { Head, Link, router } from '@inertiajs/react';
import { TraditionalPagination } from '../Components/Pagination';

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-green-500/90 to-blue-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-2xl flex items-center border border-white/20">
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-300 font-bold text-lg">&times;</button>
        </div>
    );
}

export default function ClientsList({ auth, clients, flash, filters = {} }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || '');
    const [selectedPerPage, setSelectedPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const confirmDelete = (id) => setDeleteId(id);
    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(route('clients.destroy', deleteId), {
            onSuccess: () => {
                setToast('Client deleted.');
                setDeleteId(null);
            },
            onError: () => {
                setToast('Failed to delete client.');
                setDeleteId(null);
            },
        });
    };
    const closeToast = () => setToast('');

    const handlePerPageChange = (newPerPage) => {
        setSelectedPerPage(newPerPage);
        router.get(route('clients.index'), { 
            perPage: newPerPage,
            search: searchTerm 
        });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Debounce search - only search after user stops typing for 300ms
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            router.get(route('clients.index'), {
                search: value,
                perPage: selectedPerPage
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('clients.index'), {
            perPage: selectedPerPage
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Clients</h2>}>
            <Head title="Clients" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <Toast message={toast} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                        <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
                        <p className="mb-6 text-white/70">Are you sure you want to delete this client?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-xl border border-white/20">Cancel</button>
                            <button onClick={handleDelete} className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8 text-white">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">Clients</h1>
                                    <p className="text-white/70 text-lg">Manage your client relationships and contacts</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Per Page Selector */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-white/70 text-sm font-medium">Show:</label>
                                        <select 
                                            value={selectedPerPage} 
                                            onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                            className="px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white text-sm"
                                        >
                                            <option value={10} className="bg-slate-800 text-white">10</option>
                                            <option value={25} className="bg-slate-800 text-white">25</option>
                                            <option value={50} className="bg-slate-800 text-white">50</option>
                                            <option value={100} className="bg-slate-800 text-white">100</option>
                                        </select>
                                        <span className="text-white/70 text-sm">entries</span>
                                    </div>
                                    
                                    <Link href={route('clients.create')} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Client
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Search Section */}
                            <div className="mb-6">
                                <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                    <h3 className="text-sm font-semibold text-white mb-3">Search Clients</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name or tags..."
                                            className="w-full px-4 py-3 pl-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-white/50 text-sm"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        <svg className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {searchTerm && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {searchTerm && (
                                        <div className="mt-2 text-sm text-white/70">
                                            Searching for: <span className="text-blue-300 font-medium">"{searchTerm}"</span>
                                            <button onClick={clearSearch} className="ml-2 text-red-300 hover:text-red-200 underline">
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10 table-fixed">
                                    <thead className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">
                                        <tr>
                                            <th className="w-16 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                            <th className="w-48 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tags</th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Projects</th>
                                            <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {clients?.data?.map((client, index) => (
                                            <tr key={client.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-all duration-200`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">{client.id}</td>
                                                <td className="px-6 py-4 text-sm text-white font-medium">{client.name}</td>
                                                <td className="px-6 py-4 text-sm text-white">
                                                    <div className="flex flex-wrap gap-1">
                                                        {client.tags && client.tags.length > 0 ? (
                                                            client.tags.map((tag, tagIndex) => (
                                                                <span
                                                                    key={tagIndex}
                                                                    className="inline-flex px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-md backdrop-blur-xl border border-green-400/30"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-white/50 text-xs">No tags</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full backdrop-blur-xl border border-purple-400/30">
                                                        {client.projects_count ?? 0} Projects
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white/10 backdrop-blur-xl">
                                                    <div className="flex space-x-2">
                                                        <Link href={route('clients.edit', client.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => confirmDelete(client.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-md transition-all">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!clients?.data || clients.data.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-12 h-12 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-white mb-2">No clients found</h3>
                                                        <p className="text-white/60 mb-4">Get started by adding your first client.</p>
                                                        <Link 
                                                            href={route('clients.create')}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Add First Client
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {clients?.data && clients.data.length > 0 && (
                                <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                                    <TraditionalPagination 
                                        pagination={clients}
                                        className="justify-between items-center"
                                        preserveState={true}
                                        preserveScroll={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
