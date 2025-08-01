import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { timeFormat } from '../helpers';

function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;
    
    const bgClass = type === 'error' 
        ? 'bg-gradient-to-r from-red-600 to-red-700' 
        : 'bg-gradient-to-r from-green-600 to-green-700';
    
    const borderClass = type === 'error' 
        ? 'border-red-400' 
        : 'border-yellow-400';

    return (
        <div className={`fixed top-5 right-5 z-50 ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg flex items-center border-l-4 ${borderClass}`}>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-yellow-200 font-bold text-lg">&times;</button>
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

export default function WorkHoursList({ auth, workHours, flash, filter = 'all', startDate = '', endDate = '', workType = 'all' }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || flash?.error || '');
    const [toastType, setToastType] = useState(flash?.success ? 'success' : 'error');
    const [activeFilter, setActiveFilter] = useState(filter);
    const [activeWorkType, setActiveWorkType] = useState(workType);
    const [customStartDate, setCustomStartDate] = useState(startDate ? new Date(startDate) : null);
    const [customEndDate, setCustomEndDate] = useState(endDate ? new Date(endDate) : null);

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
            ID: entry.id,
            'Work Type': formatWorkType(entry.work_type),
            Tracker: entry.tracker,
            Date: entry.date,
            Project: entry.project?.name,
            Client: entry.project?.client?.name,
            Hours: decimalToDuration(entry.hours),
            Description: entry.description,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkHours');
        XLSX.writeFile(workbook, 'work_hours_list.csv', { bookType: 'csv' });
    };

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            setToastType('success');
        } else if (flash?.error) {
            setToast(flash.error);
            setToastType('error');
        }
    }, [flash?.success, flash?.error]);

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

    const handleFilter = (filter, workTypeFilter = activeWorkType) => {
        setActiveFilter(filter);
        if (filter === 'all' && (workTypeFilter === 'all' || !workTypeFilter)) {
            router.get(route('work-hours.index'));
        } else if (filter === 'custom') {
            if (customStartDate && customEndDate) {
                const params = {
                    filter: 'custom',
                    startDate: customStartDate.toISOString().slice(0, 10),
                    endDate: customEndDate.toISOString().slice(0, 10)
                };
                if (workTypeFilter && workTypeFilter !== 'all') {
                    params.workType = workTypeFilter;
                }
                router.get(route('work-hours.index'), params);
            }
        } else {
            const { start, end } = getDateRange(filter);
            const params = { filter };
            if (filter !== 'all') {
                params.startDate = start;
                params.endDate = end;
            }
            if (workTypeFilter && workTypeFilter !== 'all') {
                params.workType = workTypeFilter;
            }
            router.get(route('work-hours.index'), params);
        }
    };

    const handleWorkTypeFilter = (type) => {
        setActiveWorkType(type);
        handleFilter(activeFilter, type);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Work Hours</h2>}>
            <Head title="Work Hours" />
            <Toast message={toast} type={toastType} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-yellow-400">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
                        <p className="mb-6 text-gray-600">Are you sure you want to delete this entry?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-xl border-t-4 border-gradient-to-r from-green-600 to-yellow-400">
                        <div className="p-8 text-gray-900">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Work Hours</h1>
                                    <p className="text-gray-600 mt-2">Manage and track your work hours efficiently</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <Link 
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl" 
                                        href={route('work-hours.create')}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Entry
                                    </Link>
                                    <button
                                        onClick={exportToCSV}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export to CSV
                                    </button>
                                </div>
                            </div>
                            <div className="mb-6 space-y-4">
                                <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-sm font-semibold text-green-800 mb-3">Filter by Date Range</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => handleFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'all' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}>All Dates</button>
                                        <button onClick={() => handleFilter('today')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'today' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}>Today</button>
                                        <button onClick={() => handleFilter('week')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'week' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}>This Week</button>
                                        <button onClick={() => handleFilter('month')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'month' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}>This Month</button>
                                        <button onClick={() => handleFilter('custom')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'custom' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}>Custom Range</button>
                                    </div>
                                    {activeFilter === 'custom' && (
                                        <div className="flex gap-3 items-center mt-4 p-3 bg-white rounded-lg border border-green-200">
                                            <span className="text-green-700 font-medium">From:</span>
                                            <DatePicker
                                                selected={customStartDate}
                                                onChange={date => setCustomStartDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                maxDate={customEndDate || undefined}
                                                className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                            <span className="text-green-700 font-medium">To:</span>
                                            <DatePicker
                                                selected={customEndDate}
                                                onChange={date => setCustomEndDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                minDate={customStartDate || undefined}
                                                className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                            <button
                                                onClick={() => handleFilter('custom')}
                                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
                                                disabled={!customStartDate || !customEndDate}
                                            >Apply</button>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                    <h3 className="text-sm font-semibold text-yellow-800 mb-3">Filter by Work Type</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => handleWorkTypeFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'all' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>All Types</button>
                                        <button onClick={() => handleWorkTypeFilter('tracker')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'tracker' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Tracker</button>
                                        <button onClick={() => handleWorkTypeFilter('manual')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'manual' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Manual Time</button>
                                        <button onClick={() => handleWorkTypeFilter('test_task')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'test_task' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Test Task</button>
                                        <button onClick={() => handleWorkTypeFilter('fixed')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'fixed' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Fixed Project</button>
                                        <button onClick={() => handleWorkTypeFilter('office_work')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'office_work' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Office Work</button>
                                        <button onClick={() => handleWorkTypeFilter('outside_of_upwork')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeWorkType === 'outside_of_upwork' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}>Outside of Upwork</button>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto shadow-xl ring-1 ring-black ring-opacity-5 rounded-xl">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                    <thead className="bg-gradient-to-r from-green-600 to-green-700">
                                        <tr>
                                            <th className="w-16 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                            {auth.user?.role === 'admin' && (
                                                <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                                            )}
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Work Type</th>
                                            <th className="w-24 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tracker</th>
                                            <th className="w-28 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                            <th className="w-36 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Project</th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Client</th>
                                            <th className="w-20 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Hours</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-green-600 to-green-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {workHours.map((entry, index) => (
                                            <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-800">{entry.id}</td>
                                                {auth.user?.role === 'admin' && (
                                                    <td className="px-6 py-4 text-sm text-gray-900 truncate font-medium" title={entry.user?.name}>
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            {entry.user?.name}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-sm text-gray-900 truncate">
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                        {formatWorkType(entry.work_type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 capitalize truncate font-medium">{entry.tracker}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.date}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 truncate font-medium" title={entry.project?.name}>{entry.project?.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 truncate" title={entry.project?.client?.name}>{entry.project?.client?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">{timeFormat(entry.hours)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={entry.description}>{entry.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky right-0 bg-white">
                                                    <div className="flex space-x-2">
                                                        {(auth.user?.role === 'admin' || entry.user_id === auth.user?.id) && (
                                                            <>
                                                                <Link href={route('work-hours.edit', entry.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-medium rounded-md transition-all">
                                                                    Edit
                                                                </Link>
                                                                <button onClick={() => handleDelete(entry.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-medium rounded-md transition-all">
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                        {auth.user?.role === 'employee' && entry.user_id !== auth.user?.id && (
                                                            <span className="text-xs text-gray-500 italic">View Only</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                <tfoot className="bg-gradient-to-r from-gray-50 to-green-50">
                                    <tr>
                                        <td colSpan={auth.user?.role === 'admin' ? 7 : 6} className="px-6 py-4"></td>
                                        <td className="px-6 py-4 font-bold text-right text-green-800 text-lg">
                                            Total: {timeFormat(workHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0).toFixed(2))}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                        <td className="w-32 px-6 py-4 sticky right-0 bg-gradient-to-r from-gray-50 to-green-50"></td>
                                    </tr>
                                </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
