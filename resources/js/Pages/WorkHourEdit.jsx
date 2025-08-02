import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { Head, useForm, Link } from '@inertiajs/react';

export default function WorkHourEdit({ auth, workHour, trackers = [], projects = [] }) {
    const editForm = useForm({
        id: workHour.id,
        date: workHour.date || '',
        hours: workHour.hours ? Math.floor(Number(workHour.hours)) : '',
        minutes: workHour.hours ? Math.round((Number(workHour.hours) % 1) * 60) : '0',
        description: workHour.description || '',
        work_type: workHour.work_type || 'tracker',
        project_id: workHour.project_id || '',
        tracker: workHour.tracker || '',
        trackerSearch: '',
        projectSearch: '',
    });
    const [showTrackerOptions, setShowTrackerOptions] = React.useState(false);
    const [showProjectOptions, setShowProjectOptions] = React.useState(false);
    const trackerRef = React.useRef(null);
    const projectRef = React.useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalHours = Number(editForm.data.hours) + Number(editForm.data.minutes) / 60;
        editForm.put(route('work-hours.update', { id: editForm.data.id, hours: totalHours }));
    };

    const workTypes = [
        { label: 'Tracker', value: 'tracker' },
        { label: 'Manual Time', value: 'manual' },
        { label: 'Test Task', value: 'test_task' },
        { label: 'Fixed Project', value: 'fixed' },
        { label: 'Office Work', value: 'office_work' },
        { label: 'Outside of Upwork', value: 'outside_of_upwork' },
    ];

    const handleTrackerFocus = () => {
        setShowTrackerOptions(true);
        setShowProjectOptions(false);
    };

    const handleProjectFocus = () => {
        setShowProjectOptions(true);
        setShowTrackerOptions(false);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Edit Work Entry</h2>}>
            <Head title="Edit Work Hour Entry" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    Edit Work Entry
                                </h1>
                                <p className="text-white/70 text-lg">Update your time entry details</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Work Type Selection */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl p-6 rounded-xl border border-white/20">
                                    <label className="block text-sm font-semibold text-white mb-4">Work Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {workTypes.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => editForm.setData('work_type', type.value)}
                                                className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                                    editForm.data.work_type === type.value
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    {editForm.errors.work_type && (
                                        <p className="text-red-400 text-sm mt-2">{editForm.errors.work_type}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Name (Tracker) */}
                                    {!['office_work', 'outside_of_upwork'].includes(editForm.data.work_type) && (
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-white/90 mb-3">
                                                Profile Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                ref={trackerRef}
                                                type="text"
                                                placeholder="Search or select profile..."
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                                value={editForm.data.trackerSearch || (editForm.data.tracker || '')}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    editForm.setData('trackerSearch', val);
                                                    if (val === '') {
                                                        editForm.setData('tracker', '');
                                                    }
                                                    setShowTrackerOptions(true);
                                                }}
                                                onFocus={handleTrackerFocus}
                                                onBlur={() => setTimeout(() => setShowTrackerOptions(false), 150)}
                                            />
                                            {showTrackerOptions && (
                                                <div 
                                                    className="absolute z-[99999] bg-slate-800/95 backdrop-blur-xl border border-white/30 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl w-full"
                                                >
                                                    {trackers.filter(tr =>
                                                        !editForm.data.trackerSearch || tr.toLowerCase().includes(editForm.data.trackerSearch.toLowerCase())
                                                    ).map(tr => (
                                                        <div
                                                            key={tr}
                                                            className="px-4 py-2 cursor-pointer hover:bg-white/20 text-white transition-colors"
                                                            onMouseDown={() => {
                                                                editForm.setData('tracker', tr);
                                                                editForm.setData('trackerSearch', tr);
                                                                setShowTrackerOptions(false);
                                                            }}
                                                        >
                                                            {tr}
                                                        </div>
                                                    ))}
                                                    {trackers.filter(tr =>
                                                        !editForm.data.trackerSearch || tr.toLowerCase().includes(editForm.data.trackerSearch.toLowerCase())
                                                    ).length === 0 && (
                                                        <div className="px-4 py-2 text-white/60">No profiles found</div>
                                                    )}
                                                </div>
                                            )}
                                            {editForm.errors.tracker && (
                                                <p className="text-red-400 text-sm mt-2">{editForm.errors.tracker}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tracking Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-3">
                                            Tracking Date <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.data.date}
                                            onChange={e => editForm.setData('date', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white"
                                            required
                                        />
                                        {editForm.errors.date && (
                                            <p className="text-red-400 text-sm mt-2">{editForm.errors.date}</p>
                                        )}
                                    </div>

                                    {/* Project Name */}
                                    <div className="relative md:col-span-2">
                                        <label className="block text-sm font-semibold text-white/90 mb-3">
                                            Project Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            ref={projectRef}
                                            type="text"
                                            placeholder="Search or select project..."
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                            value={
                                                editForm.data.projectSearch ||
                                                (editForm.data.project_id
                                                    ? ((() => {
                                                        const project = projects.find(p => p.id == editForm.data.project_id);
                                                        if (!project) return '';
                                                        const clientName = project.client?.name || 'No Client';
                                                        const projectName = project.name || '';
                                                        return `${clientName}${projectName ? ' -- ' + projectName : ''}`;
                                                    })())
                                                    : ''
                                                )
                                            }
                                            onChange={e => {
                                                const val = e.target.value;
                                                editForm.setData('projectSearch', val);
                                                if (val === '') {
                                                    editForm.setData('project_id', '');
                                                }
                                                setShowProjectOptions(true);
                                            }}
                                            onFocus={handleProjectFocus}
                                            onBlur={() => setTimeout(() => setShowProjectOptions(false), 150)}
                                            required
                                        />
                                        {showProjectOptions && (
                                            <div 
                                                className="absolute z-[99999] bg-slate-800/95 backdrop-blur-xl border border-white/30 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl w-full"
                                            >
                                                {projects.filter(project => {
                                                    const label = `${project.client?.name ?? 'No Client'} -- ${project.name}`;
                                                    return !editForm.data.projectSearch || label.toLowerCase().includes(editForm.data.projectSearch.toLowerCase());
                                                }).map(project => (
                                                    <div
                                                        key={project.id}
                                                        className="px-4 py-2 cursor-pointer hover:bg-white/20 text-white transition-colors"
                                                        onMouseDown={() => {
                                                            editForm.setData('project_id', project.id);
                                                            editForm.setData('projectSearch', `${project.client?.name ?? 'No Client'} -- ${project.name}`);
                                                            setShowProjectOptions(false);
                                                        }}
                                                    >
                                                        {project.client?.name ?? 'No Client'} -- {project.name}
                                                    </div>
                                                ))}
                                                {projects.filter(project => {
                                                    const label = `${project.client?.name ?? 'No Client'} -- ${project.name}`;
                                                    return !editForm.data.projectSearch || label.toLowerCase().includes(editForm.data.projectSearch.toLowerCase());
                                                }).length === 0 && (
                                                    <div className="px-4 py-2 text-white/60">No projects found</div>
                                                )}
                                            </div>
                                        )}
                                        {editForm.errors.project && (
                                            <p className="text-red-400 text-sm mt-2">{editForm.errors.project}</p>
                                        )}
                                    </div>

                                    {/* Hours and Minutes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-3">
                                            Hours <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            placeholder="0"
                                            value={editForm.data.hours || '0'}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '';
                                                else if (num > 24) num = 24;
                                                else if (num < 0) num = 0;
                                                editForm.setData('hours', num === '' ? '' : num.toString());
                                            }}
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-3">
                                            Minutes <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            placeholder="0"
                                            value={editForm.data.minutes || '0'}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '';
                                                else if (num > 59) num = 59;
                                                else if (num < 0) num = 0;
                                                editForm.setData('minutes', num === '' ? '' : num.toString());
                                            }}
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                            required
                                        />
                                    </div>

                                    {/* Total Time Display */}
                                    <div className="md:col-span-2 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl border border-white/20">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Total Time: {
                                                (() => {
                                                    const h = parseInt(editForm.data.hours || 0, 10);
                                                    const m = parseInt(editForm.data.minutes || 0, 10);
                                                    const pad = n => n.toString().padStart(2, '0');
                                                    if (isNaN(h) && isNaN(m)) return '00:00';
                                                    if (isNaN(h)) return `00:${pad(m)}`;
                                                    if (isNaN(m)) return `${pad(h)}:00`;
                                                    return `${pad(h)}:${pad(m)}`;
                                                })()
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-white/90 mb-3">
                                        Description <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Add any notes about this time entry..."
                                        value={editForm.data.description}
                                        onChange={e => editForm.setData('description', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[120px] text-white placeholder-white/50"
                                        required
                                    />
                                    {editForm.errors.description && (
                                        <p className="text-red-400 text-sm mt-2">{editForm.errors.description}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {editForm.processing ? 'Updating...' : 'Update Entry'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editForm.reset()}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset Changes
                                    </button>
                                    <Link
                                        href={route('work-hours.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to List
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
