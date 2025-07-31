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

    // Custom styles for the glowing effect and dark background (logo color scheme)
    const bgClass = "min-h-screen flex items-center justify-center bg-[#0a0f13] bg-[radial-gradient(circle_at_50%_0%,rgba(0,153,51,0.10)_0%,rgba(0,0,0,1)_100%)]";
    const cardClass = "w-full max-w-2xl rounded-2xl shadow-2xl p-8 bg-[#181f23] border border-[#009933]/40";
    const labelClass = "text-[#009933] font-semibold text-sm mb-1 flex items-center gap-1";
    const inputClass = "w-full rounded-lg px-4 py-2 bg-[#10171b] border border-[#009933]/40 text-[#009933] focus:outline-none focus:ring-2 focus:ring-[#FFC300]/60 placeholder:text-[#FFC300]/60";
    const selectClass = inputClass;
    const errorClass = "text-red-500 text-xs mt-1";
    const buttonClass = "flex-1 bg-[#FFC300] hover:bg-[#FFD700] transition text-[#006622] font-semibold py-3 rounded-lg shadow-lg text-lg flex items-center justify-center gap-2";
    const resetClass = "flex-1 bg-[#222c2f] hover:bg-[#2a393c] transition text-[#009933] font-semibold py-3 rounded-lg shadow-lg text-lg flex items-center justify-center gap-2 border border-[#009933]/40";

    // Tab style for work type (logo color scheme)
    const tabClass = (active) => `flex-1 text-center py-3 rounded-lg font-semibold cursor-pointer transition border-2 ${active ? 'bg-[#FFC300] text-[#006622] border-[#009933] shadow-lg' : 'bg-[#10171b] text-[#009933] border-transparent hover:bg-[#009933]/10'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Project Time Tracking" />
            <div className={bgClass}>
                <div className={cardClass}>
                    <div className="flex flex-col items-center mb-6">
                        <div className="text-5xl font-extrabold" style={{ color: '#FFC300', textShadow: '0 2px 8px #00993399' }}>Sparking<span style={{ color: '#009933' }}>Asia</span></div>
                        <div className="text-xl font-semibold text-[#009933] mb-2 flex items-center gap-2"><span className="text-2xl">📝</span>Project Time Tracking</div>
                        <div className="text-[#FFC300] text-sm mb-2">Please fill in the details below to record your time</div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Work Type Tabs */}
                        <div className="mb-2 bg-[#10171b] p-2 rounded-xl border border-teal-700/40">
                            <div className="flex gap-2 mb-2">
                                {[
                                    { label: 'Tracker', value: 'tracker' },
                                    { label: 'Manual Time', value: 'manual' },
                                    { label: 'Test Task', value: 'test_task' },
                                ].map(tab => (
                                    <div
                                        key={tab.value}
                                        className={tabClass(createForm.data.work_type === tab.value)}
                                        onClick={() => createForm.setData('work_type', tab.value)}
                                    >
                                        {tab.label}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { label: 'Fixed Project', value: 'fixed' },
                                    { label: 'Office Work', value: 'office_work' },
                                    { label: 'Outside of Upwork', value: 'outside_of_upwork' },
                                ].map(tab => (
                                    <div
                                        key={tab.value}
                                        className={tabClass(createForm.data.work_type === tab.value)}
                                        onClick={() => createForm.setData('work_type', tab.value)}
                                    >
                                        {tab.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {createForm.errors.work_type && <div className={errorClass}>{createForm.errors.work_type}</div>}

                        {/* Grid for fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Name (Tracker) ComboBox */}
                            {!['office_work', 'outside_of_upwork'].includes(createForm.data.work_type) && (
                                <div className="relative">
                                    <div className={labelClass}>Profile Name<span className="text-teal-400">*</span></div>
                                    <input
                                        type="text"
                                        placeholder="Search or select profile..."
                                        className={inputClass}
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
                                        <div className="absolute z-10 w-full bg-[#10171b] border border-teal-700/40 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                            {trackers.filter(tr =>
                                                !createForm.data.trackerSearch || tr.toLowerCase().includes(createForm.data.trackerSearch.toLowerCase())
                                            ).map(tr => (
                                                <div
                                                    key={tr}
                                                    className="px-4 py-2 cursor-pointer hover:bg-teal-700/20 text-teal-100"
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
                                                <div className="px-4 py-2 text-teal-400">No profiles found</div>
                                            )}
                                        </div>
                                    )}
                                    {createForm.errors.tracker && <div className={errorClass}>{createForm.errors.tracker}</div>}
                                </div>
                            )}
                            {/* Tracking Date */}
                            <div>
                                <div className={labelClass}>Tracking Date<span className="text-teal-400">*</span></div>
                                <input type="date" value={createForm.data.date} onChange={e => createForm.setData('date', e.target.value)} className={inputClass} required />
                                {createForm.errors.date && <div className={errorClass}>{createForm.errors.date}</div>}
                            </div>
                            {/* Project Name ComboBox */}
                            <div className="relative">
                                <div className={labelClass}>Project Name<span className="text-teal-400">*</span></div>
                                <input
                                    type="text"
                                    placeholder="Search or select project..."
                                    className={inputClass}
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
                                    <div className="absolute z-10 w-full bg-[#10171b] border border-teal-700/40 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        {projects.filter(project => {
                                            const label = `${project.client?.name ?? 'No Client'} -- ${project.name}`;
                                            return !createForm.data.projectSearch || label.toLowerCase().includes(createForm.data.projectSearch.toLowerCase());
                                        }).map(project => (
                                            <div
                                                key={project.id}
                                                className="px-4 py-2 cursor-pointer hover:bg-teal-700/20 text-teal-100"
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
                                            <div className="px-4 py-2 text-teal-400">No projects found</div>
                                        )}
                                    </div>
                                )}
                                {createForm.errors.project_id && <div className={errorClass}>{createForm.errors.project_id}</div>}
                            </div>
                            {/* Hours & Minutes (side by side) */}
                            <div className="col-span-1 md:col-span-2 flex gap-4">
                            <div className="w-1/2">
                                <div className={labelClass}>Hours<span className="text-teal-400">*</span></div>
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    placeholder="HH"
                                    value={createForm.data.hours || ''}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (val.length > 2) val = val.slice(0, 2);
                                        // Clamp value to 0-24
                                        let num = parseInt(val.replace(/[^0-9]/g, ''));
                                        if (isNaN(num)) num = '';
                                        else if (num > 24) num = 24;
                                        else if (num < 0) num = 0;
                                        createForm.setData('hours', num === '' ? '' : num.toString());
                                    }}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <div className={labelClass}>Minutes<span className="text-teal-400">*</span></div>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="MM"
                                    value={createForm.data.minutes || ''}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (val.length > 2) val = val.slice(0, 2);
                                        // Clamp value to 0-59
                                        let num = parseInt(val.replace(/[^0-9]/g, ''));
                                        if (isNaN(num)) num = '';
                                        else if (num > 59) num = 59;
                                        else if (num < 0) num = 0;
                                        createForm.setData('minutes', num === '' ? '' : num.toString());
                                    }}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            </div>
                            {/* Total Time */}
                            <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-[#009933] font-semibold text-lg">
                                <span className="text-[#FFC300]">🕒</span> Total Time: {
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
                        
                        {/* Memo */}
                        <div>
                            <div className={labelClass}>Memo<span className="text-teal-400">*</span></div>
                            <textarea placeholder="Add any notes about this time entry..." value={createForm.data.description} onChange={e => createForm.setData('description', e.target.value)} className={inputClass + ' min-h-[70px]'} required />
                            {createForm.errors.description && <div className={errorClass}>{createForm.errors.description}</div>}
                        </div>
                        {/* Buttons */}
                        <div className="flex gap-4 mt-4">
                            <button type="submit" className={buttonClass}><span>🚀</span> Submit Time Entry</button>
                            <button type="reset" className={resetClass} onClick={() => createForm.reset()}><span>↺</span> Reset Form</button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
