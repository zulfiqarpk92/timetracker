import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import { TraditionalPagination } from '../Components/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { timeFormat } from '../helpers';

function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;
    
    const bgClass = type === 'error' 
        ? 'bg-gradient-to-r from-red-500/90 to-red-600/90' 
        : 'bg-gradient-to-r from-green-500/90 to-blue-500/90';

    return (
        <div className={`fixed top-5 right-5 z-50 ${bgClass} backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-2xl flex items-center border border-white/20`}>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-300 font-bold text-lg">&times;</button>
        </div>
    );
}

const getDateRange = (filter) => {
    const today = new Date();
    let start, end;
    if (filter === 'today') {
        start = end = today.toISOString().slice(0, 10);
    } else if (filter === 'week') {
        // Get Monday as the first day of the current week
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, Monday was 6 days ago
        
        // Calculate Monday of current week using local date methods
        const monday = new Date(today);
        monday.setDate(monday.getDate() - daysFromMonday);
        
        // Calculate Sunday of current week (6 days after Monday)
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        
        start = monday.toISOString().slice(0, 10);
        end = sunday.toISOString().slice(0, 10);
    } else if (filter === 'month') {
        // First day of current month
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        // Last day of current month
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    }
    return { start, end };
};

export default function WorkHoursList({ auth, workHours, flash, filter = 'week', startDate = '', endDate = '', workType = 'all', tracker = 'all', project = 'all', client = 'all', perPage = 15 }) {
    // If workHours is not available or malformed, show loading state
    if (!workHours || typeof workHours !== 'object') {
        return (
            <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Work Hours</h2>}>
                <Head title="Work Hours" />
                <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                    <AnimatedBackground />
                </div>
                <div className="py-12 min-h-screen relative z-10 flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Loading work hours...</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }
    
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || flash?.error || '');
    const [toastType, setToastType] = useState(flash?.success ? 'success' : 'error');
    const [activeFilter, setActiveFilter] = useState(filter);
    const [activeWorkType, setActiveWorkType] = useState(workType);
    const [activeTracker, setActiveTracker] = useState(tracker);
    const [activeProject, setActiveProject] = useState(project);
    const [activeClient, setActiveClient] = useState(client);
    const [activePerPage, setActivePerPage] = useState(perPage);
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

    // Helper to get unique values for filters - work with paginated data
    const getUniqueTrackers = () => {
        if (!workHours?.data || !Array.isArray(workHours.data)) return [];
        const trackers = [...new Set(workHours.data.map(entry => entry.tracker).filter(Boolean))];
        return trackers.sort();
    };

    // Helper to get user context for display - now everyone sees their own work diary
    const getUserRoleContext = () => {
        return {
            title: 'My Work Hours',
            description: 'View and manage your personal work diary',
            showUserColumn: false // No one needs to see user column since it's always their own data
        };
    };

    const getUniqueProjects = () => {
        if (!workHours?.data || !Array.isArray(workHours.data)) return [];
        const projects = [...new Set(workHours.data.map(entry => entry.project?.name).filter(Boolean))];
        return projects.sort();
    };

    const getUniqueClients = () => {
        if (!workHours?.data || !Array.isArray(workHours.data)) return [];
        const clients = [...new Set(workHours.data.map(entry => entry.project?.client?.name).filter(Boolean))];
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
        if (!workHours?.data || !Array.isArray(workHours.data)) {
            setToast('No data available to export.');
            setToastType('error');
            return;
        }
        
        const data = workHours.data.map(entry => ({
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MyWorkHours');
        XLSX.writeFile(workbook, 'my_work_hours.csv', { bookType: 'csv' });
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
        
        // Add perPage parameter
        if (activePerPage && activePerPage !== 15) {
            params.perPage = activePerPage;
        }
        
        // Navigate with filters or to base route if no filters
        if (Object.keys(params).length === 0) {
            router.get(route('work-hours.index'), {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['workHours', 'flash']
            });
        } else {
            router.get(route('work-hours.index'), params, {
                preserveState: true,
                preserveScroll: true,
                only: ['workHours', 'flash']
            });
        }
    };

    const handleWorkTypeFilter = (type) => {
        setActiveWorkType(type);
        // Close the expanded filter after selection
        setExpandedFilters(prev => ({
            ...prev,
            workType: false
        }));
        handleFilter(activeFilter, type, activeTracker, activeProject, activeClient);
    };

    const handleTrackerFilter = (tracker) => {
        setActiveTracker(tracker);
        setTrackerSearch(''); // Clear search after selection
        // Close the expanded filter after selection
        setExpandedFilters(prev => ({
            ...prev,
            tracker: false
        }));
        handleFilter(activeFilter, activeWorkType, tracker, activeProject, activeClient);
    };

    const handleProjectFilter = (project) => {
        setActiveProject(project);
        setProjectSearch(''); // Clear search after selection
        // Close the expanded filter after selection
        setExpandedFilters(prev => ({
            ...prev,
            project: false
        }));
        handleFilter(activeFilter, activeWorkType, activeTracker, project, activeClient);
    };

    const handleClientFilter = (client) => {
        setActiveClient(client);
        setClientSearch(''); // Clear search after selection
        // Close the expanded filter after selection
        setExpandedFilters(prev => ({
            ...prev,
            client: false
        }));
        handleFilter(activeFilter, activeWorkType, activeTracker, activeProject, client);
    };

    const handlePerPageChange = (newPerPage) => {
        setActivePerPage(newPerPage);
        
        const params = {};
        
        // Add current filters
        if (activeFilter !== 'all') {
            if (activeFilter === 'custom') {
                if (customStartDate && customEndDate) {
                    params.filter = 'custom';
                    params.startDate = customStartDate.toISOString().slice(0, 10);
                    params.endDate = customEndDate.toISOString().slice(0, 10);
                }
            } else {
                const dateRange = getDateRange(activeFilter);
                params.filter = activeFilter;
                params.startDate = dateRange.start;
                params.endDate = dateRange.end;
            }
        }
        
        if (activeWorkType && activeWorkType !== 'all') {
            params.workType = activeWorkType;
        }
        if (activeTracker && activeTracker !== 'all') {
            params.tracker = activeTracker;
        }
        if (activeProject && activeProject !== 'all') {
            params.project = activeProject;
        }
        if (activeClient && activeClient !== 'all') {
            params.client = activeClient;
        }
        
        // Add perPage parameter
        params.perPage = newPerPage;
        
        router.visit(route('work-hours.index'), {
            data: params,
            preserveScroll: true,
            preserveState: true,
            only: ['workHours', 'flash']
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Work Hours</h2>}>
            <Head title="Work Hours" />
            
            {/* Custom DatePicker Styles */}
            <style jsx global>{`
                .react-datepicker-wrapper {
                    z-index: 99999 !important;
                    position: relative !important;
                }
                .react-datepicker-popper {
                    z-index: 99999 !important;
                    position: fixed !important;
                }
                .react-datepicker {
                    z-index: 99999 !important;
                    background-color: white !important;
                    border: 1px solid #d1d5db !important;
                    border-radius: 0.5rem !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                    position: relative !important;
                }
                .react-datepicker__header {
                    background-color: #f3f4f6 !important;
                    border-bottom: 1px solid #d1d5db !important;
                    border-top-left-radius: 0.5rem !important;
                    border-top-right-radius: 0.5rem !important;
                }
                .react-datepicker__current-month,
                .react-datepicker__day-name,
                .react-datepicker__day {
                    color: #1f2937 !important;
                }
                .react-datepicker__day:hover {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                .react-datepicker__day--selected {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                .react-datepicker__day--today {
                    background-color: #fef3c7 !important;
                    color: #92400e !important;
                }
                .react-datepicker__triangle {
                    display: none !important;
                }
            `}</style>
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <Toast message={toast} type={toastType} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                        <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
                        <p className="mb-6 text-white/70">Are you sure you want to delete this entry?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-xl border border-white/20">Cancel</button>
                            <button onClick={confirmDelete} className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {getUserRoleContext().title}
                                </h1>
                                <p className="text-white/70 text-lg">{getUserRoleContext().description}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-xl"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                    </svg>
                                    {showFilters ? 'Hide Additional Filters' : 'Show Additional Filters'}
                                </button>
                                <Link 
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl" 
                                    href={route('work-hours.create')}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Entry
                                </Link>
                                <button
                                    onClick={exportToCSV}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export to CSV
                                </button>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
                                    <span className="text-white text-sm font-medium">Show:</span>
                                    <select
                                        value={activePerPage}
                                        onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                        className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={15} className="bg-slate-800 text-white">15 entries</option>
                                        <option value={25} className="bg-slate-800 text-white">25 entries</option>
                                        <option value={50} className="bg-slate-800 text-white">50 entries</option>
                                        <option value={100} className="bg-slate-800 text-white">100 entries</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range Filter - Always Visible */}
                    <div className="mb-6">
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">Date Range</h2>
                            </div>

                            <div className="flex gap-3 flex-wrap items-center">
                                <button onClick={() => handleFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'all' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>All Dates</button>
                                <button onClick={() => handleFilter('today')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'today' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>Today</button>
                                <button onClick={() => handleFilter('week')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'week' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>This Week</button>
                                <button onClick={() => handleFilter('month')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'month' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>This Month</button>
                                <button onClick={() => handleFilter('custom')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'custom' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>Custom Range</button>
                                
                                {activeFilter === 'custom' && (
                                    <>
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className="text-white font-medium">From:</span>
                                            <div className="relative z-[99999]">
                                                <DatePicker
                                                    selected={customStartDate}
                                                    onChange={date => setCustomStartDate(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    maxDate={customEndDate || undefined}
                                                    className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-xl"
                                                    placeholderText="Start date"
                                                    popperClassName="!z-[99999]"
                                                    calendarClassName="bg-white border border-gray-300 rounded-lg shadow-lg"
                                                    wrapperClassName="relative z-[99999]"
                                                    popperPlacement="bottom-start"
                                                    popperModifiers={[
                                                        {
                                                            name: 'offset',
                                                            options: {
                                                                offset: [0, 5],
                                                            },
                                                        },
                                                        {
                                                            name: 'preventOverflow',
                                                            options: {
                                                                rootBoundary: 'viewport',
                                                                tether: false,
                                                                altAxis: true,
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </div>
                                            <span className="text-white font-medium">To:</span>
                                            <div className="relative z-[99999]">
                                                <DatePicker
                                                    selected={customEndDate}
                                                    onChange={date => setCustomEndDate(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    minDate={customStartDate || undefined}
                                                    className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-xl"
                                                    placeholderText="End date"
                                                    popperClassName="!z-[99999]"
                                                    calendarClassName="bg-white border border-gray-300 rounded-lg shadow-lg"
                                                    wrapperClassName="relative z-[99999]"
                                                    popperPlacement="bottom-start"
                                                    popperModifiers={[
                                                        {
                                                            name: 'offset',
                                                            options: {
                                                                offset: [0, 5],
                                                            },
                                                        },
                                                        {
                                                            name: 'preventOverflow',
                                                            options: {
                                                                rootBoundary: 'viewport',
                                                                tether: false,
                                                                altAxis: true,
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleFilter('custom')}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                                                disabled={!customStartDate || !customEndDate}
                                            >Apply</button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Active Date Filter Display */}
                            {activeFilter !== 'week' && (
                                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                                    <span className="text-blue-200 text-sm font-medium">
                                        Active filter: {activeFilter === 'custom' 
                                            ? `${customStartDate?.toLocaleDateString()} - ${customEndDate?.toLocaleDateString()}` 
                                            : activeFilter === 'all'
                                                ? 'All Dates'
                                                : activeFilter === 'month'
                                                    ? 'This Month'
                                                    : activeFilter === 'today'
                                                        ? 'Today'
                                                        : activeFilter
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Filters Section */}
                    {showFilters && (
                        <div className="mb-6">
                            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-white">Additional Filters</h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSidebarLayout(!sidebarLayout)}
                                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg text-sm backdrop-blur-xl border border-white/20"
                                            title={sidebarLayout ? 'Switch to grid layout' : 'Switch to sidebar layout'}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarLayout ? "M4 6h16M4 10h16M4 14h16M4 18h16" : "M4 6h16M4 12h16M4 18h7"} />
                                            </svg>
                                            {sidebarLayout ? 'Grid Layout' : 'Sidebar Layout'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setActiveWorkType('all');
                                                setActiveTracker('all');
                                                setActiveProject('all');
                                                setActiveClient('all');
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
                                                handleFilter(activeFilter, 'all', 'all', 'all', 'all');
                                            }}
                                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg text-sm backdrop-blur-xl border border-white/20"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Clear Additional Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Active Additional Filters Summary */}
                                {(activeWorkType !== 'all' || activeTracker !== 'all' || activeProject !== 'all' || activeClient !== 'all') && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
                                        <h3 className="text-sm font-semibold text-blue-800 mb-2">Active Additional Filters:</h3>
                                        <div className="flex gap-2 flex-wrap text-xs">
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

                                {/* Additional Filter Controls in Grid or Sidebar Layout */}
                                <div className={`${sidebarLayout ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}`}>

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

                    {/* Main Content Area - Separate container */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8 text-white">
                            <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                                        <table className="min-w-full divide-y divide-white/10 table-fixed">
                                            <thead className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">
                                                <tr>
                                                    <th className="w-16 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                                    {getUserRoleContext().showUserColumn && (
                                                        <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                                                    )}
                                                    <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Work Type</th>
                                                    <th className="w-24 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tracker</th>
                                                    <th className="w-28 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                                    <th className="w-36 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Project</th>
                                                    <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Client</th>
                                                    <th className="w-20 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Hours</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                                                    <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-lg">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {!workHours?.data || !Array.isArray(workHours.data) || workHours.data.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <svg className="w-12 h-12 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <h3 className="text-lg font-medium text-white mb-2">No work hours found</h3>
                                                                <p className="text-white/60 mb-4">No work hours match your current filter criteria.</p>
                                                                <Link 
                                                                    href={route('work-hours.create')}
                                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
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
                                                workHours.data.map((entry, index) => (
                                                    <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-all duration-200`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">{entry.id}</td>
                                                        {getUserRoleContext().showUserColumn && (
                                                            <td className="px-6 py-4 text-sm text-white truncate font-medium" title={entry.user?.name}>
                                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-200 rounded-full backdrop-blur-xl border border-blue-400/30">
                                                                    {entry.user?.name}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 text-sm text-white truncate">
                                                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full backdrop-blur-xl border border-purple-400/30">
                                                                {formatWorkType(entry.work_type)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-white capitalize truncate font-medium">{entry.tracker}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{entry.date}</td>
                                                        <td className="px-6 py-4 text-sm text-white truncate font-medium" title={entry.project?.name}>{entry.project?.name}</td>
                                                        <td className="px-6 py-4 text-sm text-white/70 truncate" title={entry.project?.client?.name}>{entry.project?.client?.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">{timeFormat(entry.hours)}</td>
                                                        <td className="px-6 py-4 text-sm text-white/80 max-w-xs" title={entry.description}>
                                                            <div className="truncate">
                                                                {entry.description && entry.description.length > 50 ? (
                                                                    <span>
                                                                        {entry.description.substring(0, 50)}...
                                                                        <button 
                                                                            className="ml-1 text-blue-400 hover:text-blue-300 text-xs underline"
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(entry.description);
                                                                                setToast('Description copied to clipboard!');
                                                                                setToastType('success');
                                                                            }}
                                                                        >
                                                                            copy
                                                                        </button>
                                                                    </span>
                                                                ) : (
                                                                    entry.description
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white sticky right-0 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-lg">
                                                            <div className="flex space-x-2">
                                                                <Link href={route('work-hours.edit', entry.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all shadow-md hover:shadow-lg">
                                                                    Edit
                                                                </Link>
                                                                <button onClick={() => handleDelete(entry.id)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-md transition-all shadow-md hover:shadow-lg">
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )))}
                                            </tbody>
                                            {workHours?.data && Array.isArray(workHours.data) && workHours.data.length > 0 && (
                                            <tfoot className="bg-gradient-to-r from-white/5 to-green-500/20 backdrop-blur-xl">
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4"></td>
                                                    <td className="px-6 py-4 font-bold text-right text-green-400 text-lg">
                                                        Total: {timeFormat(workHours.data.reduce((sum, entry) => sum + Number(entry.hours || 0), 0).toFixed(2))}
                                                    </td>
                                                    <td className="px-6 py-4"></td>
                                                    <td className="w-32 px-6 py-4 sticky right-0 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-lg"></td>
                                                </tr>
                                            </tfoot>
                                            )}
                                        </table>
                                    </div>
                                
                                    {/* Traditional Pagination */}
                                    {workHours?.data && Array.isArray(workHours.data) && workHours.data.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-white/70 text-sm">
                                                    Showing {workHours.from || 0} to {workHours.to || 0} of {workHours.total || 0} entries
                                                </div>
                                                <div className="text-white/70 text-sm">
                                                    {activePerPage} entries per page
                                                </div>
                                            </div>
                                            <TraditionalPagination 
                                                pagination={workHours}
                                                preserveState={true}
                                                preserveScroll={false}
                                                className="pagination-controls"
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
