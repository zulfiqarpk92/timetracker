import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function WorkHourCreate({ auth }) {
    const createForm = useForm({
        date: '',
        hours: '',
        minutes: '',
        description: '',
        work_type: '',
        project: '',
        client: '',
        tracker: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('work-hours.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Work Hour Entry</h2>}>
            <Head title="Add Work Hour Entry" />
            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Add Work Hour Entry</h1>
                            <form onSubmit={handleCreate} className="mb-4 space-y-2">
                                <div>
                                    <span className="block mb-1 font-medium">Work Type</span>
                                    <div className="flex gap-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="tracker"
                                                checked={createForm.data.work_type === 'tracker'}
                                                onChange={e => createForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Tracker
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="fixed"
                                                checked={createForm.data.work_type === 'fixed'}
                                                onChange={e => createForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Fixed
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="manual"
                                                checked={createForm.data.work_type === 'manual'}
                                                onChange={e => createForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Manual
                                        </label>
                                    </div>
                                    {createForm.errors.work_type && <div className="text-red-600 text-sm">{createForm.errors.work_type}</div>}
                                </div>
                                {createForm.data.work_type === 'tracker' && (
                                    <div>
                                        <select value={createForm.data.tracker} onChange={e => createForm.setData('tracker', e.target.value)} className="border rounded px-2 py-1 w-full">
                                            <option value="">Select Tracker</option>
                                            {trackers.map(tr => (
                                                <option key={tr} value={tr}>{tr}</option>
                                            ))}
                                        </select>
                                        {createForm.errors.tracker && <div className="text-red-600 text-sm">{createForm.errors.tracker}</div>}
                                    </div>
                                )}
                                <div>
                                    <input type="date" value={createForm.data.date} onChange={e => createForm.setData('date', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                                    {createForm.errors.date && <div className="text-red-600 text-sm">{createForm.errors.date}</div>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Project" value={createForm.data.project} onChange={e => createForm.setData('project', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {createForm.errors.project && <div className="text-red-600 text-sm">{createForm.errors.project}</div>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Client" value={createForm.data.client} onChange={e => createForm.setData('client', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {createForm.errors.client && <div className="text-red-600 text-sm">{createForm.errors.client}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <input type="number" step="1" min="0" max="24" placeholder="Hours" value={createForm.data.hours} onChange={e => createForm.setData('hours', e.target.value)} className="border rounded px-2 py-1 w-1/2" required />
                                    <input type="number" step="1" min="0" max="59" placeholder="Minutes" value={createForm.data.minutes} onChange={e => createForm.setData('minutes', e.target.value)} className="border rounded px-2 py-1 w-1/2" required />
                                </div>
                                {createForm.errors.hours && <div className="text-red-600 text-sm">{createForm.errors.hours}</div>}
                                {createForm.errors.minutes && <div className="text-red-600 text-sm">{createForm.errors.minutes}</div>}
                                <div>
                                    <textarea placeholder="Description (optional)" value={createForm.data.description} onChange={e => createForm.setData('description', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {createForm.errors.description && <div className="text-red-600 text-sm">{createForm.errors.description}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Create</button>
                                    <Link href={route('work-hours.index')} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
