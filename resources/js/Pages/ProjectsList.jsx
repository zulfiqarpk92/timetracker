import React from 'react';
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

export default function ProjectsList({ auth, projects, flash }) {
    const [deleteId, setDeleteId] = React.useState(null);
    const [toast, setToast] = React.useState(flash?.success || '');
    const [selectedPerPage, setSelectedPerPage] = React.useState(10);

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

    const handlePerPageChange = (newPerPage) => {
        setSelectedPerPage(newPerPage);
        router.get(route('projects.index'), { perPage: newPerPage });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Projects</h2>}>
            <Head title="Projects" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <Toast message={toast} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                        <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
                        <p className="mb-6 text-white/70">Are you sure you want to delete this project?</p>
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
                                    <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
                                    <p className="text-white/70 text-lg">Manage your projects and track progress</p>
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
                                    
                                    <Link href={route('projects.create')} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Project
                                    </Link>
                                </div>
                            </div>
                            <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                                <table className="min-w-full divide-y divide-white/10 table-fixed">
                                    <thead className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">
                                        <tr>
                                            <th className="w-16 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                            <th className="w-48 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Client</th>
                                            <th className="w-48 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Client Tags</th>
                                            <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(!projects?.data || projects.data.length === 0) ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-12 h-12 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                                                        <p className="text-white/60 mb-4">Get started by adding your first project.</p>
                                                        <Link 
                                                            href={route('projects.create')}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Add First Project
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            projects.data.map((project, index) => (
                                                <tr key={project.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-all duration-200`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">{project.id}</td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium truncate" title={project.name}>{project.name}</td>
                                                    <td className="px-6 py-4 text-sm text-white truncate" title={project.client?.name}>
                                                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full backdrop-blur-xl border border-purple-400/30">
                                                            {project.client?.name || 'No Client'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white">
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.client?.tags && project.client.tags.length > 0 ? (
                                                                project.client.tags.map((tag, tagIndex) => (
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white/10 backdrop-blur-xl">
                                                        <div className="flex space-x-2">
                                                            <Link href={route('projects.edit', project.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all">
                                                                Edit
                                                            </Link>
                                                            <button onClick={() => confirmDelete(project.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-md transition-all">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {projects?.data && projects.data.length > 0 && (
                                <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                                    <TraditionalPagination 
                                        pagination={projects}
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
