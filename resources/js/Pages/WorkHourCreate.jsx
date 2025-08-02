import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { Head, useForm, Link, router } from '@inertiajs/react';


export default function WorkHourCreate({ auth, trackers = [], projects = [] }) {
    const createForm = useForm({
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        hours: '0',
        minutes: '0',
        description: '',
        work_type: 'tracker',
        project_id: '',
        tracker: '',
        trackerSearch: '',
        projectSearch: '',
    });
    const [showTrackerOptions, setShowTrackerOptions] = React.useState(false);
    const [showProjectOptions, setShowProjectOptions] = React.useState(false);
    const trackerRef = React.useRef(null);
    const projectRef = React.useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('work-hours.store'));
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
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Add Work Entry</h2>}>
            <Head title="Add Work Entry" />
            
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
                                    Add Work Entry
                                </h1>
                                <p className="text-white/70 text-lg">Track your work hours and productivity</p>
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
                                                onClick={() => createForm.setData('work_type', type.value)}
                                                className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                                                    createForm.data.work_type === type.value
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    {createForm.errors.work_type && (
                                        <p className="text-red-400 text-sm mt-2">{createForm.errors.work_type}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Name (Tracker) */}
                                    {!['office_work', 'outside_of_upwork'].includes(createForm.data.work_type) && (
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-white/90 mb-3">
                                                Profile Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                ref={trackerRef}
                                                type="text"
                                                placeholder="Search or select profile..."
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
                                                value={createForm.data.trackerSearch || (createForm.data.tracker || '')}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    createForm.setData('trackerSearch', val);
                                                    if (val === '') {
                                                        createForm.setData('tracker', '');
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
                                                        !createForm.data.trackerSearch || tr.toLowerCase().includes(createForm.data.trackerSearch.toLowerCase())
                                                    ).map(tr => (
                                                        <div
                                                            key={tr}
                                                            className="px-4 py-2 cursor-pointer hover:bg-white/20 text-white transition-colors"
                                                            onMouseDown={() => {
                                                                createForm.setData('tracker', tr);
                                                                createForm.setData('trackerSearch', tr);
                                                                setShowTrackerOptions(false);
                                                            }}
                                                        >
                                                            {tr}
                                                        </div>
                                                    ))}
                                                    {trackers.filter(tr =>
                                                        !createForm.data.trackerSearch || tr.toLowerCase().includes(createForm.data.trackerSearch.toLowerCase())
                                                    ).length === 0 && (
                                                        <div className="px-4 py-2 text-white/60">No profiles found</div>
                                                    )}
                                                </div>
                                            )}
                                            {createForm.errors.tracker && (
                                                <p className="text-red-400 text-sm mt-2">{createForm.errors.tracker}</p>
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
                                            value={createForm.data.date}
                                            onChange={e => createForm.setData('date', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white"
                                            required
                                        />
                                        {createForm.errors.date && (
                                            <p className="text-red-400 text-sm mt-2">{createForm.errors.date}</p>
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
                                                createForm.data.projectSearch ||
                                                (createForm.data.project_id
                                                    ? ((() => {
                                                        const project = projects.find(p => p.id == createForm.data.project_id);
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
                                                createForm.setData('projectSearch', val);
                                                if (val === '') {
                                                    createForm.setData('project_id', '');
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
                                                    return !createForm.data.projectSearch || label.toLowerCase().includes(createForm.data.projectSearch.toLowerCase());
                                                }).map(project => (
                                                    <div
                                                        key={project.id}
                                                        className="px-4 py-2 cursor-pointer hover:bg-white/20 text-white transition-colors"
                                                        onMouseDown={() => {
                                                            createForm.setData('project_id', project.id);
                                                            createForm.setData('projectSearch', `${project.client?.name ?? 'No Client'} -- ${project.name}`);
                                                            setShowProjectOptions(false);
                                                        }}
                                                    >
                                                        {project.client?.name ?? 'No Client'} -- {project.name}
                                                    </div>
                                                ))}
                                                {projects.filter(project => {
                                                    const label = `${project.client?.name ?? 'No Client'} -- ${project.name}`;
                                                    return !createForm.data.projectSearch || label.toLowerCase().includes(createForm.data.projectSearch.toLowerCase());
                                                }).length === 0 && (
                                                    <div className="px-4 py-2 text-white/60">No projects found</div>
                                                )}
                                            </div>
                                        )}
                                        {createForm.errors.project_id && (
                                            <p className="text-red-400 text-sm mt-2">{createForm.errors.project_id}</p>
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
                                            value={createForm.data.hours || '0'}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '0';
                                                else if (num > 24) num = 24;
                                                else if (num < 0) num = 0;
                                                createForm.setData('hours', num === '' ? '0' : num.toString());
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
                                            value={createForm.data.minutes || '0'}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '';
                                                else if (num > 59) num = 59;
                                                else if (num < 0) num = 0;
                                                createForm.setData('minutes', num === '' ? '' : num.toString());
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
                                                    const h = parseInt(createForm.data.hours || 0, 10);
                                                    const m = parseInt(createForm.data.minutes || 0, 10);
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
                                        value={createForm.data.description}
                                        onChange={e => createForm.setData('description', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all min-h-[120px] text-white placeholder-white/50"
                                        required
                                    />
                                    {createForm.errors.description && (
                                        <p className="text-red-400 text-sm mt-2">{createForm.errors.description}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {createForm.processing ? 'Submitting...' : 'Submit Time Entry'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => createForm.reset()}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 backdrop-blur-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset Form
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
