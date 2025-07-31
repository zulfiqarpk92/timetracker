import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { timeFormat } from '../helpers';

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white font-bold">&times;</button>
        </div>
    );
}

const getDateRange = (filter) => {
    const today = new Date();
    let start, end;
    if (filter === 'today') {
        start = end = today.toISOString().slice(0, 10);
    } else if (filter === 'week') {
        const first = today.getDate() - today.getDay();
        start = new Date(today.setDate(first)).toISOString().slice(0, 10);
        end = new Date().toISOString().slice(0, 10);
    } else if (filter === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        end = new Date().toISOString().slice(0, 10);
    }
    return { start, end };
};

export default function WorkHoursList({ auth, workHours, users = [], flash, filter = 'all', startDate = '', endDate = '', workType = 'all', userId = 'all' }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || '');
    const [activeFilter, setActiveFilter] = useState(filter);
    const [activeWorkType, setActiveWorkType] = useState(workType);
    const [activeUser, setActiveUser] = useState(userId);
    const [customStartDate, setCustomStartDate] = useState(startDate ? new Date(startDate) : null);
    const [customEndDate, setCustomEndDate] = useState(endDate ? new Date(endDate) : null);
    const [showUserOptions, setShowUserOptions] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // Helper to format work type for display
    const formatWorkType = (workType) => {
        const workTypeMap = {
            'tracker': 'Tracker',
            'manual': 'Manual Time',
            'test_task': 'Test Task',
            'fixed': 'Fixed Project',
            'office_work': 'Office Work',
            'outside_of_upwork': 'Outside of Upwork'
        };
        return workTypeMap[workType] || workType;
    };

    // Helper to convert decimal hours to HH:mm:ss
    const decimalToDuration = (decimal) => {
        if (!decimal && decimal !== 0) return '';
        const totalSeconds = Math.round(Number(decimal) * 3600);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [hours, minutes, seconds]
            .map(v => String(v).padStart(2, '0'))
            .join(':');
    };

    const exportToCSV = () => {
        const data = workHours.map(entry => ({
            User: entry.user.name,
            Designation: entry.user.designation || 'N/A',
            'Work Type': formatWorkType(entry.work_type),
            Tracker: entry.tracker,
            Date: entry.date,
            Project: entry.project?.name || 'No Project',
            Client: entry.project?.client?.name || 'No Client',
            Hours: decimalToDuration(entry.hours),
            Description: entry.description,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkHours');
        XLSX.writeFile(workbook, 'work_hours_report.csv', { bookType: 'csv' });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        router.delete(route('work-hours.destroy', deleteId), {
            onSuccess: () => {
                setToast('Entry deleted successfully.');
                setDeleteId(null);
            },
            onError: () => {
                setToast('Failed to delete entry.');
                setDeleteId(null);
            },
        });
    };

    const closeToast = () => setToast('');

    const handleUserFilter = (id) => {
        setActiveUser(id);
        setUserSearch('');
        setShowUserOptions(false);
        handleFilter(activeFilter, activeWorkType, id);
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleFilter = (filter, workTypeFilter = activeWorkType, userFilter = activeUser) => {
        setActiveFilter(filter);
        const params = { filter };
        if (filter === 'custom') {
            if (customStartDate && customEndDate) {
                params.startDate = customStartDate.toISOString().slice(0, 10);
                params.endDate = customEndDate.toISOString().slice(0, 10);
            }
        } else if (filter !== 'all') {
            const { start, end } = getDateRange(filter);
            params.startDate = start;
            params.endDate = end;
        }
        if (workTypeFilter && workTypeFilter !== 'all') {
            params.workType = workTypeFilter;
        }
        if (userFilter && userFilter !== 'all') {
            params.userId = userFilter;
        }
        router.get(route('work-hours.report'), params);
    };

    const handleWorkTypeFilter = (type) => {
        setActiveWorkType(type);
        handleFilter(activeFilter, type);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Work Hours Report</h2>}>
            <Head title="Work Hours" />
            <Toast message={toast} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this entry?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold mb-4">Work Hours Report</h1>
                                <button
                                    onClick={exportToCSV}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded mb-4"
                                >
                                    Export to CSV
                                </button>
                            </div>
                            <div className="mb-4 flex gap-2 flex-wrap">
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => handleFilter('all')} className={`px-3 py-1 rounded ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All Dates</button>
                                    <button onClick={() => handleFilter('today')} className={`px-3 py-1 rounded ${activeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Today</button>
                                    <button onClick={() => handleFilter('week')} className={`px-3 py-1 rounded ${activeFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>This Week</button>
                                    <button onClick={() => handleFilter('month')} className={`px-3 py-1 rounded ${activeFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>This Month</button>
                                    <button onClick={() => handleFilter('custom')} className={`px-3 py-1 rounded ${activeFilter === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Custom Range</button>
                                </div>
                                {activeFilter === 'custom' && (
                                    <div className="flex gap-2 items-center mb-2">
                                        <span>From:</span>
                                        <DatePicker
                                            selected={customStartDate}
                                            onChange={date => setCustomStartDate(date)}
                                            dateFormat="yyyy-MM-dd"
                                            maxDate={customEndDate || undefined}
                                            className="px-2 py-1 border rounded"
                                        />
                                        <span>To:</span>
                                        <DatePicker
                                            selected={customEndDate}
                                            onChange={date => setCustomEndDate(date)}
                                            dateFormat="yyyy-MM-dd"
                                            minDate={customStartDate || undefined}
                                            className="px-2 py-1 border rounded"
                                        />
                                        <button
                                            onClick={() => handleFilter('custom')}
                                            className="px-3 py-1 bg-blue-600 text-white rounded"
                                            disabled={!customStartDate || !customEndDate}
                                        >Apply</button>
                                    </div>
                                )}
                                <div className="flex gap-2 mb-2">
                                    <button onClick={() => handleWorkTypeFilter('all')} className={`px-3 py-1 rounded ${activeWorkType === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>All Types</button>
                                    <button onClick={() => handleWorkTypeFilter('tracker')} className={`px-3 py-1 rounded ${activeWorkType === 'tracker' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Tracker</button>
                                    <button onClick={() => handleWorkTypeFilter('manual')} className={`px-3 py-1 rounded ${activeWorkType === 'manual' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Manual Time</button>
                                    <button onClick={() => handleWorkTypeFilter('test_task')} className={`px-3 py-1 rounded ${activeWorkType === 'test_task' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Test Task</button>
                                    <button onClick={() => handleWorkTypeFilter('fixed')} className={`px-3 py-1 rounded ${activeWorkType === 'fixed' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Fixed Project</button>
                                    <button onClick={() => handleWorkTypeFilter('office_work')} className={`px-3 py-1 rounded ${activeWorkType === 'office_work' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Office Work</button>
                                    <button onClick={() => handleWorkTypeFilter('outside_of_upwork')} className={`px-3 py-1 rounded ${activeWorkType === 'outside_of_upwork' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Outside of Upwork</button>
                                </div>
                                <div className="flex gap-2 mb-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search or select user..."
                                            className="px-3 py-2 border rounded-md w-48 text-sm"
                                            value={
                                                userSearch ||
                                                (activeUser === 'all' ? '' : users.find(u => u.id == activeUser)?.name || '')
                                            }
                                            onChange={e => {
                                                const val = e.target.value;
                                                setUserSearch(val);
                                                if (val === '') {
                                                    setActiveUser('all');
                                                }
                                                setShowUserOptions(true);
                                            }}
                                            onFocus={() => setShowUserOptions(true)}
                                            onBlur={() => setTimeout(() => setShowUserOptions(false), 100)}
                                        />
                                        {showUserOptions && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                <div
                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${activeUser === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                                                    onClick={() => handleUserFilter('all')}
                                                >
                                                    All Users
                                                </div>
                                                {filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${activeUser == user.id ? 'bg-blue-50 text-blue-600' : ''}`}
                                                        onClick={() => handleUserFilter(user.id)}
                                                    >
                                                        {user.name}
                                                    </div>
                                                ))}
                                                {filteredUsers.length === 0 && userSearch && (
                                                    <div className="px-3 py-2 text-gray-500 text-sm">No users found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Type</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracker</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {workHours.map(entry => (
                                        <tr key={entry.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.user.designation || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatWorkType(entry.work_type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{entry.tracker}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.project?.name || 'No Project'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.project?.client?.name || 'No Client'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{timeFormat(entry.hours)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link href={route('work-hours.edit', entry.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                                                <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={7}></td>
                                        <td className="px-6 py-4 font-bold text-right text-gray-900">
                                            Total: {timeFormat(workHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0).toFixed(2))}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
