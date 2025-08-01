import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';


export default function WorkHourCreate({ auth, trackers = [], projects = [] }) {
    const createForm = useForm({
        date: '',
        hours: '',
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

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Work Entry</h2>}>
            <Head title="Add Work Entry" />
            <div className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-xl border-t-4 border-gradient-to-r from-green-600 to-yellow-400">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                                    Add Work Entry
                                </h1>
                                <p className="text-gray-600">Track your work hours and productivity</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Work Type Selection */}
                                <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-6 rounded-xl border border-green-200">
                                    <label className="block text-sm font-semibold text-green-800 mb-4">Work Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {workTypes.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => createForm.setData('work_type', type.value)}
                                                className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                                                    createForm.data.work_type === type.value
                                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                    {createForm.errors.work_type && (
                                        <p className="text-red-600 text-sm mt-2">{createForm.errors.work_type}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Name (Tracker) */}
                                    {!['office_work', 'outside_of_upwork'].includes(createForm.data.work_type) && (
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Profile Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Search or select profile..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                value={createForm.data.trackerSearch || (createForm.data.tracker || '')}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    createForm.setData('trackerSearch', val);
                                                    if (val === '') {
                                                        createForm.setData('tracker', '');
                                                    }
                                                    setShowTrackerOptions(true);
                                                }}
                                                onFocus={() => setShowTrackerOptions(true)}
                                                onBlur={() => setTimeout(() => setShowTrackerOptions(false), 100)}
                                            />
                                            {showTrackerOptions && (
                                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-xl">
                                                    {trackers.filter(tr =>
                                                        !createForm.data.trackerSearch || tr.toLowerCase().includes(createForm.data.trackerSearch.toLowerCase())
                                                    ).map(tr => (
                                                        <div
                                                            key={tr}
                                                            className="px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700 transition-colors"
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
                                                        <div className="px-4 py-2 text-gray-500">No profiles found</div>
                                                    )}
                                                </div>
                                            )}
                                            {createForm.errors.tracker && (
                                                <p className="text-red-600 text-sm mt-1">{createForm.errors.tracker}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tracking Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tracking Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={createForm.data.date}
                                            onChange={e => createForm.setData('date', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                        {createForm.errors.date && (
                                            <p className="text-red-600 text-sm mt-1">{createForm.errors.date}</p>
                                        )}
                                    </div>

                                    {/* Project Name */}
                                    <div className="relative md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Project Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search or select project..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                            onFocus={() => setShowProjectOptions(true)}
                                            onBlur={() => setTimeout(() => setShowProjectOptions(false), 100)}
                                            required
                                        />
                                        {showProjectOptions && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-xl">
                                                {projects.filter(project => {
                                                    const label = `${project.client?.name ?? 'No Client'} -- ${project.name}`;
                                                    return !createForm.data.projectSearch || label.toLowerCase().includes(createForm.data.projectSearch.toLowerCase());
                                                }).map(project => (
                                                    <div
                                                        key={project.id}
                                                        className="px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700 transition-colors"
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
                                                    <div className="px-4 py-2 text-gray-500">No projects found</div>
                                                )}
                                            </div>
                                        )}
                                        {createForm.errors.project_id && (
                                            <p className="text-red-600 text-sm mt-1">{createForm.errors.project_id}</p>
                                        )}
                                    </div>

                                    {/* Hours and Minutes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hours <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            placeholder="0"
                                            value={createForm.data.hours || ''}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '';
                                                else if (num > 24) num = 24;
                                                else if (num < 0) num = 0;
                                                createForm.setData('hours', num === '' ? '' : num.toString());
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Minutes <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            placeholder="0"
                                            value={createForm.data.minutes || ''}
                                            onChange={e => {
                                                let val = e.target.value;
                                                let num = parseInt(val.replace(/[^0-9]/g, ''));
                                                if (isNaN(num)) num = '';
                                                else if (num > 59) num = 59;
                                                else if (num < 0) num = 0;
                                                createForm.setData('minutes', num === '' ? '' : num.toString());
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Total Time Display */}
                                    <div className="md:col-span-2 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-green-700">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Add any notes about this time entry..."
                                        value={createForm.data.description}
                                        onChange={e => createForm.setData('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors min-h-[120px]"
                                        required
                                    />
                                    {createForm.errors.description && (
                                        <p className="text-red-600 text-sm mt-1">{createForm.errors.description}</p>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {createForm.processing ? 'Submitting...' : 'Submit Time Entry'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => createForm.reset()}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-300"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset Form
                                    </button>
                                    <Link
                                        href={route('work-hours.index')}
                                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
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
