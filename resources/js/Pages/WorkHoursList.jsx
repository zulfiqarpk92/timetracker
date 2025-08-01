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

export default function WorkHoursList({ auth, workHours, flash, filter = 'all', startDate = '', endDate = '', workType = 'all', tracker = 'all', project = 'all', client = 'all' }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || flash?.error || '');
    const [toastType, setToastType] = useState(flash?.success ? 'success' : 'error');
    const [activeFilter, setActiveFilter] = useState(filter);
    const [activeWorkType, setActiveWorkType] = useState(workType);
    const [activeTracker, setActiveTracker] = useState(tracker);
    const [activeProject, setActiveProject] = useState(project);
    const [activeClient, setActiveClient] = useState(client);
    const [customStartDate, setCustomStartDate] = useState(startDate ? new Date(startDate) : null);
    const [customEndDate, setCustomEndDate] = useState(endDate ? new Date(endDate) : null);

    // Search state for filters
    const [trackerSearch, setTrackerSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');

    // Filter panel state
    const [showFilters, setShowFilters] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState({
        date: false,
        workType: false,
        tracker: false,
        project: false,
        client: false
    });
    const [sidebarLayout, setSidebarLayout] = useState(false);

    const toggleFilter = (filterName) => {
        setExpandedFilters(prev => {
            const newState = {
                ...prev,
                [filterName]: !prev[filterName]
            };
            
            // Clear search when closing filters
            if (prev[filterName]) { // If we're closing the filter
                if (filterName === 'tracker') setTrackerSearch('');
                if (filterName === 'project') setProjectSearch('');
                if (filterName === 'client') setClientSearch('');
            }
            
            return newState;
        });
    };

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

    // Helper to get unique values for filters
    const getUniqueTrackers = () => {
        const trackers = [...new Set(workHours.map(entry => entry.tracker).filter(Boolean))];
        return trackers.sort();
    };

    const getUniqueProjects = () => {
        const projects = [...new Set(workHours.map(entry => entry.project?.name).filter(Boolean))];
        return projects.sort();
    };

    const getUniqueClients = () => {
        const clients = [...new Set(workHours.map(entry => entry.project?.client?.name).filter(Boolean))];
        return clients.sort();
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

    const handleFilter = (filter, workTypeFilter = activeWorkType, trackerFilter = activeTracker, projectFilter = activeProject, clientFilter = activeClient) => {
        setActiveFilter(filter);
        
        const params = {};
        
        // Add date filter
        if (filter === 'custom') {
            if (customStartDate && customEndDate) {
                params.filter = 'custom';
                params.startDate = customStartDate.toISOString().slice(0, 10);
                params.endDate = customEndDate.toISOString().slice(0, 10);
            } else {
                return; // Don't proceed if custom dates aren't set
            }
        } else if (filter !== 'all') {
            const { start, end } = getDateRange(filter);
            params.filter = filter;
            params.startDate = start;
            params.endDate = end;
        }
        
        // Add other filters
        if (workTypeFilter && workTypeFilter !== 'all') {
            params.workType = workTypeFilter;
        }
        if (trackerFilter && trackerFilter !== 'all') {
            params.tracker = trackerFilter;
        }
        if (projectFilter && projectFilter !== 'all') {
            params.project = projectFilter;
        }
        if (clientFilter && clientFilter !== 'all') {
            params.client = clientFilter;
        }
        
        // Navigate with filters or to base route if no filters
        if (Object.keys(params).length === 0) {
            router.get(route('work-hours.index'));
        } else {
            router.get(route('work-hours.index'), params);
        }
    };

    const handleWorkTypeFilter = (type) => {
        setActiveWorkType(type);
        handleFilter(activeFilter, type, activeTracker, activeProject, activeClient);
    };

    const handleTrackerFilter = (tracker) => {
        setActiveTracker(tracker);
        setTrackerSearch(''); // Clear search after selection
        handleFilter(activeFilter, activeWorkType, tracker, activeProject, activeClient);
    };

    const handleProjectFilter = (project) => {
        setActiveProject(project);
        setProjectSearch(''); // Clear search after selection
        handleFilter(activeFilter, activeWorkType, activeTracker, project, activeClient);
    };

    const handleClientFilter = (client) => {
        setActiveClient(client);
        setClientSearch(''); // Clear search after selection
        handleFilter(activeFilter, activeWorkType, activeTracker, activeProject, client);
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
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Work Hours</h1>
                                <p className="text-gray-600 mt-2 text-lg">Manage and track your work hours efficiently</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                    </svg>
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>
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
                    </div>

                    {/* Filters Section - Outside main content */}
                    {showFilters && (
                        <div className="mb-6">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSidebarLayout(!sidebarLayout)}
                                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm"
                                            title={sidebarLayout ? 'Switch to grid layout' : 'Switch to sidebar layout'}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarLayout ? "M4 6h16M4 10h16M4 14h16M4 18h16" : "M4 6h16M4 12h16M4 18h7"} />
                                            </svg>
                                            {sidebarLayout ? 'Grid Layout' : 'Sidebar Layout'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setActiveFilter('all');
                                                setActiveWorkType('all');
                                                setActiveTracker('all');
                                                setActiveProject('all');
                                                setActiveClient('all');
                                                setCustomStartDate(null);
                                                setCustomEndDate(null);
                                                setTrackerSearch('');
                                                setProjectSearch('');
                                                setClientSearch('');
                                                setExpandedFilters({
                                                    date: false,
                                                    workType: false,
                                                    tracker: false,
                                                    project: false,
                                                    client: false
                                                });
                                                router.get(route('work-hours.index'));
                                            }}
                                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {/* Active Filters Summary */}
                                {(activeFilter !== 'all' || activeWorkType !== 'all' || activeTracker !== 'all' || activeProject !== 'all' || activeClient !== 'all') && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
                                        <h3 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h3>
                                        <div className="flex gap-2 flex-wrap text-xs">
                                            {activeFilter !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                                    Date: {activeFilter === 'custom' ? `${customStartDate?.toLocaleDateString()} - ${customEndDate?.toLocaleDateString()}` : activeFilter}
                                                </span>
                                            )}
                                            {activeWorkType !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
                                                    Work Type: {formatWorkType(activeWorkType)}
                                                </span>
                                            )}
                                            {activeTracker !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-md capitalize">
                                                    Tracker: {activeTracker}
                                                </span>
                                            )}
                                            {activeProject !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md">
                                                    Project: {activeProject.length > 15 ? `${activeProject.substring(0, 15)}...` : activeProject}
                                                </span>
                                            )}
                                            {activeClient !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 rounded-md">
                                                    Client: {activeClient.length > 15 ? `${activeClient.substring(0, 15)}...` : activeClient}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Filter Controls in Grid or Sidebar Layout */}
                                <div className={`${sidebarLayout ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4' : 'space-y-4'}`}>

                                        {/* Date Range Filter */}
                                        <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200">
                                            <button
                                                onClick={() => toggleFilter('date')}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <h3 className="text-sm font-semibold text-green-800">Filter by Date Range</h3>
                                                <svg className={`w-5 h-5 text-green-600 transform transition-transform ${expandedFilters.date ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {expandedFilters.date && (
                                                <div className="px-4 pb-4">
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
                                            )}
                                        </div>

                                        {/* Work Type Filter */}
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                            <button
                                                onClick={() => toggleFilter('workType')}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <h3 className="text-sm font-semibold text-yellow-800">Filter by Work Type</h3>
                                                <svg className={`w-5 h-5 text-yellow-600 transform transition-transform ${expandedFilters.workType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {expandedFilters.workType && (
                                                <div className="px-4 pb-4">
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
                                            )}
                                        </div>

                                        {/* Tracker Filter */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                            <button
                                                onClick={() => toggleFilter('tracker')}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <h3 className="text-sm font-semibold text-blue-800">Filter by Tracker</h3>
                                                <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${expandedFilters.tracker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {expandedFilters.tracker && (
                                                <div className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Search trackers..."
                                                                className="w-full px-4 py-2 pl-10 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                value={trackerSearch}
                                                                onChange={(e) => setTrackerSearch(e.target.value)}
                                                            />
                                                            <svg className="w-4 h-4 text-blue-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                        </div>
                                                        {trackerSearch && (
                                                            <div className="text-xs text-blue-600">
                                                                {getUniqueTrackers().filter(tracker => tracker.toLowerCase().includes(trackerSearch.toLowerCase())).length} tracker(s) found
                                                            </div>
                                                        )}
                                                        <div className="max-h-48 overflow-y-auto">
                                                            <div className="space-y-1">
                                                                <button 
                                                                    onClick={() => handleTrackerFilter('all')} 
                                                                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeTracker === 'all' ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-blue-50 text-blue-700'}`}
                                                                >
                                                                    All Trackers
                                                                </button>
                                                                {getUniqueTrackers()
                                                                    .filter(tracker => tracker.toLowerCase().includes(trackerSearch.toLowerCase()))
                                                                    .map(tracker => (
                                                                    <button 
                                                                        key={tracker} 
                                                                        onClick={() => handleTrackerFilter(tracker)} 
                                                                        className={`w-full text-left px-3 py-2 rounded-md transition-all capitalize ${activeTracker === tracker ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-blue-50 text-blue-700'}`}
                                                                    >
                                                                        {tracker}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Project Filter */}
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                            <button
                                                onClick={() => toggleFilter('project')}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <h3 className="text-sm font-semibold text-purple-800">Filter by Project</h3>
                                                <svg className={`w-5 h-5 text-purple-600 transform transition-transform ${expandedFilters.project ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {expandedFilters.project && (
                                                <div className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Search projects..."
                                                                className="w-full px-4 py-2 pl-10 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                value={projectSearch}
                                                                onChange={(e) => setProjectSearch(e.target.value)}
                                                            />
                                                            <svg className="w-4 h-4 text-purple-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                        </div>
                                                        {projectSearch && (
                                                            <div className="text-xs text-purple-600">
                                                                {getUniqueProjects().filter(project => project.toLowerCase().includes(projectSearch.toLowerCase())).length} project(s) found
                                                            </div>
                                                        )}
                                                        <div className="max-h-48 overflow-y-auto">
                                                            <div className="space-y-1">
                                                                <button 
                                                                    onClick={() => handleProjectFilter('all')} 
                                                                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeProject === 'all' ? 'bg-purple-100 text-purple-800 font-medium' : 'hover:bg-purple-50 text-purple-700'}`}
                                                                >
                                                                    All Projects
                                                                </button>
                                                                {getUniqueProjects()
                                                                    .filter(project => project.toLowerCase().includes(projectSearch.toLowerCase()))
                                                                    .map(project => (
                                                                    <button 
                                                                        key={project} 
                                                                        onClick={() => handleProjectFilter(project)} 
                                                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeProject === project ? 'bg-purple-100 text-purple-800 font-medium' : 'hover:bg-purple-50 text-purple-700'}`}
                                                                        title={project}
                                                                    >
                                                                        {project}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Client Filter */}
                                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                                            <button
                                                onClick={() => toggleFilter('client')}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <h3 className="text-sm font-semibold text-teal-800">Filter by Client</h3>
                                                <svg className={`w-5 h-5 text-teal-600 transform transition-transform ${expandedFilters.client ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {expandedFilters.client && (
                                                <div className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Search clients..."
                                                                className="w-full px-4 py-2 pl-10 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                                value={clientSearch}
                                                                onChange={(e) => setClientSearch(e.target.value)}
                                                            />
                                                            <svg className="w-4 h-4 text-teal-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                        </div>
                                                        {clientSearch && (
                                                            <div className="text-xs text-teal-600">
                                                                {getUniqueClients().filter(client => client.toLowerCase().includes(clientSearch.toLowerCase())).length} client(s) found
                                                            </div>
                                                        )}
                                                        <div className="max-h-48 overflow-y-auto">
                                                            <div className="space-y-1">
                                                                <button 
                                                                    onClick={() => handleClientFilter('all')} 
                                                                    className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeClient === 'all' ? 'bg-teal-100 text-teal-800 font-medium' : 'hover:bg-teal-50 text-teal-700'}`}
                                                                >
                                                                    All Clients
                                                                </button>
                                                                {getUniqueClients()
                                                                    .filter(client => client.toLowerCase().includes(clientSearch.toLowerCase()))
                                                                    .map(client => (
                                                                    <button 
                                                                        key={client} 
                                                                        onClick={() => handleClientFilter(client)} 
                                                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${activeClient === client ? 'bg-teal-100 text-teal-800 font-medium' : 'hover:bg-teal-50 text-teal-700'}`}
                                                                        title={client}
                                                                    >
                                                                        {client}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area - Separate white container */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-xl border border-gray-200">
                        <div className="p-8 text-gray-900">
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
                                                {workHours.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={auth.user?.role === 'admin' ? 10 : 9} className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No work hours found</h3>
                                                                <p className="text-gray-500 mb-4">No work hours match your current filter criteria.</p>
                                                                <Link 
                                                                    href={route('work-hours.create')}
                                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all"
                                                                >
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                    Add First Entry
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                workHours.map((entry, index) => (
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
                                                )))}
                                            </tbody>
                                            {workHours.length > 0 && (
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
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </AuthenticatedLayout>
    );
}
