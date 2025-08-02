import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ClientEdit({ auth, client }) {
    const form = useForm({
        name: client.name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.put(route('clients.update', client.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Edit Client</h2>}>
            <Head title="Edit Client" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    Edit Client
                                </h1>
                                <p className="text-white/70 text-lg">Update client information and details</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Client Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-white/90 mb-3">
                                        Client Name <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter client name..." 
                                        value={form.data.name} 
                                        onChange={e => form.setData('name', e.target.value)} 
                                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                        required 
                                    />
                                    {form.errors.name && <div className="text-red-400 text-sm mt-2">{form.errors.name}</div>}
                                </div>

                                {/* Current Client Display */}
                                <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-white/20">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/60 mb-1">Editing Client:</p>
                                            <p className="font-semibold text-white text-lg">{client.name}</p>
                                        </div>
                                    </div>
                                </div>

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
                                        {form.processing ? 'Updating...' : 'Update Client'}
                                    </button>
                                    <Link
                                        href={route('clients.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Clients
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
