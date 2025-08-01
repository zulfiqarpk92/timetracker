import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ProjectEdit({ auth, project, clients = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    
    const form = useForm({
        name: project.name || '',
        client_id: project.client_id || '',
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedClient = clients.find(client => client.id == form.data.client_id);

    const handleClientSelect = (client) => {
        form.setData('client_id', client.id);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleInputClick = () => {
        setIsOpen(!isOpen);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Project</h2>}>
            <Head title="Edit Project" />
            <div className="py-12 bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-visible shadow-xl sm:rounded-xl border-t-4 border-gradient-to-r from-green-600 to-yellow-400">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent mb-2">
                                    Edit Project
                                </h1>
                                <p className="text-gray-600">Update project details and reassign client if needed</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Project Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter project name..." 
                                        value={form.data.name} 
                                        onChange={e => form.setData('name', e.target.value)} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        required 
                                    />
                                    {form.errors.name && <div className="text-red-600 text-sm mt-1">{form.errors.name}</div>}
                                </div>

                                {/* Client Selection */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Client
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <input
                                            type="text"
                                            placeholder={selectedClient ? selectedClient.name : "Search or select client..."}
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onClick={handleInputClick}
                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors cursor-pointer"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        
                                        {isOpen && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto">
                                                {filteredClients.length > 0 ? (
                                                    <>
                                                        <div
                                                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-500 border-b border-gray-100 transition-colors"
                                                            onClick={() => {
                                                                form.setData('client_id', '');
                                                                setSearchTerm('');
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Clear selection
                                                            </div>
                                                        </div>
                                                        {filteredClients.map(client => (
                                                            <div
                                                                key={client.id}
                                                                className={`px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors ${
                                                                    form.data.client_id == client.id ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'text-gray-700'
                                                                }`}
                                                                onClick={() => handleClientSelect(client)}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                                        {client.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium">{client.name}</span>
                                                                    {form.data.client_id == client.id && (
                                                                        <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <div className="px-4 py-3 text-gray-500 text-center">
                                                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        No clients found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {form.errors.client_id && <div className="text-red-600 text-sm mt-1">{form.errors.client_id}</div>}
                                </div>

                                {/* Current Selection Display */}
                                {selectedClient && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                {selectedClient.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Selected Client:</p>
                                                <p className="font-semibold text-green-700">{selectedClient.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {form.processing ? 'Updating...' : 'Update Project'}
                                    </button>
                                    <Link
                                        href={route('projects.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Projects
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
