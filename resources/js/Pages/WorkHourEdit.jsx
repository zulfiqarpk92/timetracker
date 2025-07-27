import React from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function WorkHourEdit({ auth, workHour, trackers = [] }) {
    const editForm = useForm({
        id: workHour.id,
        date: workHour.date,
        hours: workHour.hours ? Math.floor(Number(workHour.hours)) : '',
        minutes: workHour.hours ? Math.round((Number(workHour.hours) % 1) * 60) : '',
        description: workHour.description || '',
        work_type: workHour.work_type || '',
        project: workHour.project || '',
        client: workHour.client || '',
        tracker: workHour.tracker || '',
    });

    const handleEdit = (e) => {
        e.preventDefault();
        const totalHours = Number(editForm.data.hours) + Number(editForm.data.minutes) / 60;
        editForm.put(route('work-hours.update', { id: editForm.data.id, hours: totalHours }));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Work Hour Entry</h2>}>
            <Head title="Edit Work Hour Entry" />
            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-bold mb-4">Edit Work Hour Entry</h1>
                            <form onSubmit={handleEdit} className="mb-4 space-y-2">
                                <div>
                                    <span className="block mb-1 font-medium">Work Type</span>
                                    <div className="flex gap-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="tracker"
                                                checked={editForm.data.work_type === 'tracker'}
                                                onChange={e => editForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Tracker
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="fixed"
                                                checked={editForm.data.work_type === 'fixed'}
                                                onChange={e => editForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Fixed
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="work_type"
                                                value="manual"
                                                checked={editForm.data.work_type === 'manual'}
                                                onChange={e => editForm.setData('work_type', e.target.value)}
                                                className="mr-1"
                                            />
                                            Manual
                                        </label>
                                    </div>
                                    {editForm.errors.work_type && <div className="text-red-600 text-sm">{editForm.errors.work_type}</div>}
                                </div>
                                {editForm.data.work_type === 'tracker' && (
                                    <div>
                                        <select value={editForm.data.tracker} onChange={e => editForm.setData('tracker', e.target.value)} className="border rounded px-2 py-1 w-full">
                                            <option value="">Select Tracker</option>
                                            {trackers.map(tr => (
                                                <option key={tr} value={tr}>{tr}</option>
                                            ))}
                                        </select>
                                        {editForm.errors.tracker && <div className="text-red-600 text-sm">{editForm.errors.tracker}</div>}
                                    </div>
                                )}
                                <div>
                                    <input type="date" value={editForm.data.date} onChange={e => editForm.setData('date', e.target.value)} className="border rounded px-2 py-1 w-full" required />
                                    {editForm.errors.date && <div className="text-red-600 text-sm">{editForm.errors.date}</div>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Project" value={editForm.data.project} onChange={e => editForm.setData('project', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {editForm.errors.project && <div className="text-red-600 text-sm">{editForm.errors.project}</div>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Client" value={editForm.data.client} onChange={e => editForm.setData('client', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {editForm.errors.client && <div className="text-red-600 text-sm">{editForm.errors.client}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <input type="number" step="1" min="0" max="24" placeholder="Hours" value={editForm.data.hours} onChange={e => editForm.setData('hours', e.target.value)} className="border rounded px-2 py-1 w-1/2" required />
                                    <input type="number" step="1" min="0" max="59" placeholder="Minutes" value={editForm.data.minutes} onChange={e => editForm.setData('minutes', e.target.value)} className="border rounded px-2 py-1 w-1/2" required />
                                </div>
                                {editForm.errors.hours && <div className="text-red-600 text-sm">{editForm.errors.hours}</div>}
                                {editForm.errors.minutes && <div className="text-red-600 text-sm">{editForm.errors.minutes}</div>}
                                <div>
                                    <textarea placeholder="Description (optional)" value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} className="border rounded px-2 py-1 w-full" />
                                    {editForm.errors.description && <div className="text-red-600 text-sm">{editForm.errors.description}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
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
