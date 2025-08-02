import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ProjectCreate({ auth, clients = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    
    const form = useForm({
        name: '',
        client_id: '',
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
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        const handleScroll = () => {
            if (isOpen && inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Add Project</h2>}>
            <Head title="Add Project" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8 relative">
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    Add Project
                                </h1>
                                <p className="text-white/70 text-lg">Create a new project and assign it to a client</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Project Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-white/90 mb-3">
                                        Project Name <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter project name..." 
                                        value={form.data.name} 
                                        onChange={e => form.setData('name', e.target.value)} 
                                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                        required 
                                    />
                                    {form.errors.name && <div className="text-red-400 text-sm mt-2">{form.errors.name}</div>}
                                </div>

                                {/* Client Selection */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-white/90 mb-3">
                                        Client
                                    </label>
                                    <div className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder={selectedClient ? selectedClient.name : "Search or select client..."}
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onClick={handleInputClick}
                                            className="w-full px-4 py-3 pr-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all cursor-pointer text-white placeholder-white/50"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {form.errors.client_id && <div className="text-red-400 text-sm mt-2">{form.errors.client_id}</div>}
                                </div>

                                {/* Portal for dropdown */}
                                {isOpen && createPortal(
                                    <div 
                                        ref={dropdownRef}
                                        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-auto z-[9999]"
                                        style={{
                                            position: 'absolute',
                                            top: dropdownPosition.top,
                                            left: dropdownPosition.left,
                                            width: dropdownPosition.width,
                                            maxHeight: '240px'
                                        }}
                                    >
                                        {filteredClients.length > 0 ? (
                                            <>
                                                <div
                                                    className="px-4 py-3 hover:bg-white/20 cursor-pointer text-white/70 border-b border-white/10 transition-colors"
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
                                                        className={`px-4 py-3 hover:bg-white/20 cursor-pointer transition-colors ${
                                                            form.data.client_id == client.id ? 'bg-blue-500/30 text-white border-l-4 border-blue-400' : 'text-white/90'
                                                        }`}
                                                        onClick={() => handleClientSelect(client)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                                {client.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium">{client.name}</span>
                                                            {form.data.client_id == client.id && (
                                                                <svg className="w-4 h-4 ml-auto text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-4 py-3 text-white/50 text-center">
                                                <svg className="w-8 h-8 mx-auto mb-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                No clients found
                                            </div>
                                        )}
                                    </div>,
                                    document.body
                                )}

                                {/* Current Selection Display */}
                                {selectedClient && (
                                    <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-white/20">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                                                {selectedClient.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/60 mb-1">Selected Client:</p>
                                                <p className="font-semibold text-white text-lg">{selectedClient.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {form.processing ? 'Creating...' : 'Create Project'}
                                    </button>
                                    <Link
                                        href={route('projects.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-xl"
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
