import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { timeFormat } from '../helpers';
import AnimatedBackground from '../Components/AnimatedBackground';

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center backdrop-blur-xl border border-white/20">
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-blue-200 font-bold text-lg transition-colors">&times;</button>
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

export default function WorkHoursList({ auth, workHours, users = [], flash, filter = 'all', startDate = '', endDate = '', workType = 'all', userId = 'all', designation = 'all', tracker = 'all', project = 'all', client = 'all' }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || '');
    const [activeFilter, setActiveFilter] = useState(filter);
    const [activeWorkType, setActiveWorkType] = useState(workType);
    const [activeUser, setActiveUser] = useState(userId);
    const [activeDesignation, setActiveDesignation] = useState(designation);
    const [activeTracker, setActiveTracker] = useState(tracker);
    const [activeProject, setActiveProject] = useState(project);
    const [activeClient, setActiveClient] = useState(client);
    const [customStartDate, setCustomStartDate] = useState(startDate ? new Date(startDate) : null);
    const [customEndDate, setCustomEndDate] = useState(endDate ? new Date(endDate) : null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [designationSearch, setDesignationSearch] = useState('');
    const [trackerSearch, setTrackerSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const userDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
                setUserSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
    const getUniqueDesignations = () => {
        const designations = [...new Set(workHours.map(entry => entry.user?.designation).filter(Boolean))];
        return designations.sort();
    };

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
        setUserDropdownOpen(false);
        setUserSearchTerm('');
        handleFilter(activeFilter, activeWorkType, id);
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    // Get currently selected user name
    const getSelectedUserName = () => {
        if (activeUser === 'all') return 'All Users';
        const user = users.find(u => u.id == activeUser);
        return user ? user.name : 'Select User';
    };

    const handleFilter = (filter, workTypeFilter = activeWorkType, userFilter = activeUser, designationFilter = activeDesignation, trackerFilter = activeTracker, projectFilter = activeProject, clientFilter = activeClient) => {
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
        if (designationFilter && designationFilter !== 'all') {
            params.designation = designationFilter;
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
        router.get(route('work-hours.report'), params);
    };

    const handleWorkTypeFilter = (type) => {
        setActiveWorkType(type);
        handleFilter(activeFilter, type);
    };

    const handleDesignationFilter = (designation) => {
        setActiveDesignation(designation);
        setDesignationSearch('');
        handleFilter(activeFilter, activeWorkType, activeUser, designation);
    };

    const handleTrackerFilter = (tracker) => {
        setActiveTracker(tracker);
        setTrackerSearch('');
        handleFilter(activeFilter, activeWorkType, activeUser, activeDesignation, tracker);
    };

    const handleProjectFilter = (project) => {
        setActiveProject(project);
        setProjectSearch('');
        handleFilter(activeFilter, activeWorkType, activeUser, activeDesignation, activeTracker, project);
    };

    const handleClientFilter = (client) => {
        setActiveClient(client);
        setClientSearch('');
        handleFilter(activeFilter, activeWorkType, activeUser, activeDesignation, activeTracker, activeProject, client);
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    Work Hours Report
                </h2>
            }
        >
            <Head title="Work Hours Report" />
            <AnimatedBackground />
            <Toast message={toast} onClose={closeToast} />
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                        <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
                        <p className="mb-6 text-gray-200">Are you sure you want to delete this entry?</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeleteId(null)} 
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-xl border border-white/20"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white/10 backdrop-blur-xl overflow-hidden shadow-2xl sm:rounded-2xl border border-white/20">
                        <div className="p-8 text-white">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Work Hours Report
                                    </h1>
                                    <p className="text-gray-300 mt-2">Comprehensive analysis of work hours and productivity</p>
                                </div>
                                <button
                                    onClick={exportToCSV}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl backdrop-blur-xl"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export to CSV
                                </button>
                            </div>
                            <div className="mb-6 space-y-4">
                                {/* Main Filters Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Date Range Filter */}
                                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                        <h3 className="text-sm font-semibold text-white mb-3">Filter by Date Range</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => handleFilter('all')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>All Dates</button>
                                            <button onClick={() => handleFilter('today')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === 'today' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Today</button>
                                            <button onClick={() => handleFilter('week')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === 'week' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>This Week</button>
                                            <button onClick={() => handleFilter('month')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === 'month' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>This Month</button>
                                            <button onClick={() => handleFilter('custom')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === 'custom' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Custom Range</button>
                                        </div>
                                        {activeFilter === 'custom' && (
                                            <div className="flex gap-3 items-center mt-4 p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                                                <span className="text-white font-medium">From:</span>
                                                <DatePicker
                                                    selected={customStartDate}
                                                    onChange={date => setCustomStartDate(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    maxDate={customEndDate || undefined}
                                                    className="px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                />
                                                <span className="text-white font-medium">To:</span>
                                                <DatePicker
                                                    selected={customEndDate}
                                                    onChange={date => setCustomEndDate(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    minDate={customStartDate || undefined}
                                                    className="px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                />
                                                <button
                                                    onClick={() => handleFilter('custom')}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
                                                    disabled={!customStartDate || !customEndDate}
                                                >Apply</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Filter */}
                                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                        <h3 className="text-sm font-semibold text-white mb-3">Filter by User</h3>
                                        <div className="relative w-full" ref={userDropdownRef}>
                                            <button
                                                type="button"
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-white text-left flex items-center justify-between hover:bg-white/20 transition-colors"
                                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            >
                                                <span className="truncate">{getSelectedUserName()}</span>
                                                <svg 
                                                    className={`w-4 h-4 transition-transform text-gray-300 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            
                                            {userDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-hidden">
                                                    <div className="p-2 border-b border-white/20">
                                                        <input
                                                            type="text"
                                                            placeholder="Search users..."
                                                            className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                            value={userSearchTerm}
                                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        <div
                                                            className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${activeUser === 'all' ? 'bg-white/20 text-blue-300 font-medium' : 'text-white'}`}
                                                            onClick={() => handleUserFilter('all')}
                                                        >
                                                            {activeUser === 'all' && (
                                                                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            All Users
                                                        </div>
                                                        {filteredUsers.map(user => (
                                                            <div
                                                                key={user.id}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${activeUser == user.id ? 'bg-white/20 text-blue-300 font-medium' : 'text-white'}`}
                                                                onClick={() => handleUserFilter(user.id)}
                                                            >
                                                                {activeUser == user.id && (
                                                                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                <span className="truncate">{user.name}</span>
                                                            </div>
                                                        ))}
                                                        {filteredUsers.length === 0 && userSearchTerm && (
                                                            <div className="px-4 py-2 text-gray-400 text-sm">No users found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Filters Toggle */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl backdrop-blur-xl"
                                    >
                                        <svg className={`w-5 h-5 mr-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                                    </button>
                                </div>

                                {/* Advanced Filters Section */}
                                {showAdvancedFilters && (
                                    <div className="space-y-4">
                                        {/* Work Type Filter */}
                                        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                            <h3 className="text-sm font-semibold text-white mb-3">Filter by Work Type</h3>
                                            <div className="flex gap-2 flex-wrap">
                                                <button onClick={() => handleWorkTypeFilter('all')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>All Types</button>
                                                <button onClick={() => handleWorkTypeFilter('tracker')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'tracker' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Tracker</button>
                                                <button onClick={() => handleWorkTypeFilter('manual')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'manual' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Manual Time</button>
                                                <button onClick={() => handleWorkTypeFilter('test_task')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'test_task' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Test Task</button>
                                                <button onClick={() => handleWorkTypeFilter('fixed')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'fixed' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Fixed Project</button>
                                                <button onClick={() => handleWorkTypeFilter('office_work')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'office_work' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Office Work</button>
                                                <button onClick={() => handleWorkTypeFilter('outside_of_upwork')} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeWorkType === 'outside_of_upwork' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}>Outside of Upwork</button>
                                            </div>
                                        </div>

                                        {/* Secondary Filters Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Designation Filter */}
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                                <h3 className="text-sm font-semibold text-white mb-3">Filter by Designation</h3>
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search designations..."
                                                            className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                            value={designationSearch}
                                                            onChange={(e) => setDesignationSearch(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                        <button 
                                                            onClick={() => handleDesignationFilter('all')} 
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeDesignation === 'all' ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                        >
                                                            All Designations
                                                        </button>
                                                        {getUniqueDesignations()
                                                            .filter(designation => designation.toLowerCase().includes(designationSearch.toLowerCase()))
                                                            .map(designation => (
                                                            <button 
                                                                key={designation} 
                                                                onClick={() => handleDesignationFilter(designation)} 
                                                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeDesignation === designation ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                                title={designation}
                                                            >
                                                                {designation}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tracker Filter */}
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                                <h3 className="text-sm font-semibold text-white mb-3">Filter by Tracker</h3>
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search trackers..."
                                                            className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                            value={trackerSearch}
                                                            onChange={(e) => setTrackerSearch(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                        <button 
                                                            onClick={() => handleTrackerFilter('all')} 
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeTracker === 'all' ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                        >
                                                            All Trackers
                                                        </button>
                                                        {getUniqueTrackers()
                                                            .filter(tracker => tracker.toLowerCase().includes(trackerSearch.toLowerCase()))
                                                            .map(tracker => (
                                                            <button 
                                                                key={tracker} 
                                                                onClick={() => handleTrackerFilter(tracker)} 
                                                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm capitalize ${activeTracker === tracker ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                                title={tracker}
                                                            >
                                                                {tracker}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Filter */}
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                                <h3 className="text-sm font-semibold text-white mb-3">Filter by Project</h3>
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search projects..."
                                                            className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                            value={projectSearch}
                                                            onChange={(e) => setProjectSearch(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                        <button 
                                                            onClick={() => handleProjectFilter('all')} 
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeProject === 'all' ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                        >
                                                            All Projects
                                                        </button>
                                                        {getUniqueProjects()
                                                            .filter(project => project.toLowerCase().includes(projectSearch.toLowerCase()))
                                                            .map(project => (
                                                            <button 
                                                                key={project} 
                                                                onClick={() => handleProjectFilter(project)} 
                                                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeProject === project ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                                title={project}
                                                            >
                                                                {project}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Client Filter */}
                                            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
                                                <h3 className="text-sm font-semibold text-white mb-3">Filter by Client</h3>
                                                <div className="space-y-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search clients..."
                                                            className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-300"
                                                            value={clientSearch}
                                                            onChange={(e) => setClientSearch(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                        <button 
                                                            onClick={() => handleClientFilter('all')} 
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeClient === 'all' ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                        >
                                                            All Clients
                                                        </button>
                                                        {getUniqueClients()
                                                            .filter(client => client.toLowerCase().includes(clientSearch.toLowerCase()))
                                                            .map(client => (
                                                            <button 
                                                                key={client} 
                                                                onClick={() => handleClientFilter(client)} 
                                                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${activeClient === client ? 'bg-white/20 text-blue-300 font-medium' : 'hover:bg-white/10 text-white'}`}
                                                                title={client}
                                                            >
                                                                {client}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Active Filters Summary */}
                                {(activeFilter !== 'all' || activeWorkType !== 'all' || activeUser !== 'all' || activeDesignation !== 'all' || activeTracker !== 'all' || activeProject !== 'all' || activeClient !== 'all') && (
                                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20 mb-4">
                                        <h3 className="text-sm font-semibold text-white mb-2">Active Filters:</h3>
                                        <div className="flex gap-2 flex-wrap text-xs">
                                            {activeFilter !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg backdrop-blur-xl border border-blue-400/20">
                                                    Date: {activeFilter === 'custom' ? `${customStartDate?.toLocaleDateString()} - ${customEndDate?.toLocaleDateString()}` : activeFilter}
                                                </span>
                                            )}
                                            {activeWorkType !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg backdrop-blur-xl border border-purple-400/20">
                                                    Work Type: {formatWorkType(activeWorkType)}
                                                </span>
                                            )}
                                            {activeUser !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg backdrop-blur-xl border border-blue-400/20">
                                                    User: {getSelectedUserName()}
                                                </span>
                                            )}
                                            {activeDesignation !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg backdrop-blur-xl border border-indigo-400/20">
                                                    Designation: {activeDesignation}
                                                </span>
                                            )}
                                            {activeTracker !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg backdrop-blur-xl border border-purple-400/20">
                                                    Tracker: {activeTracker}
                                                </span>
                                            )}
                                            {activeProject !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-300 rounded-lg backdrop-blur-xl border border-green-400/20">
                                                    Project: {activeProject.length > 15 ? `${activeProject.substring(0, 15)}...` : activeProject}
                                                </span>
                                            )}
                                            {activeClient !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-teal-500/20 text-teal-300 rounded-lg backdrop-blur-xl border border-teal-400/20">
                                                    Client: {activeClient.length > 15 ? `${activeClient.substring(0, 15)}...` : activeClient}
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setActiveFilter('all');
                                                setActiveWorkType('all');
                                                setActiveUser('all');
                                                setActiveDesignation('all');
                                                setActiveTracker('all');
                                                setActiveProject('all');
                                                setActiveClient('all');
                                                setCustomStartDate(null);
                                                setCustomEndDate(null);
                                                router.get(route('work-hours.report'));
                                            }}
                                            className="mt-3 inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium transition-all text-xs backdrop-blur-xl"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-x-auto shadow-2xl ring-1 ring-white/20 rounded-2xl">
                                <table className="min-w-full divide-y divide-white/20 table-fixed">
                                    <thead className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-xl">
                                        <tr>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">User</th>
                                            <th className="w-28 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                                            <th className="w-28 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Work Type</th>
                                            <th className="w-24 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tracker</th>
                                            <th className="w-28 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                            <th className="w-36 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Project</th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Client</th>
                                            <th className="w-20 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Hours</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-xl">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/5 divide-y divide-white/10 backdrop-blur-xl">
                                        {workHours.map((entry, index) => (
                                            <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors backdrop-blur-xl`}>
                                                <td className="px-6 py-4 text-sm text-white truncate font-medium">{entry.user.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 truncate">{entry.user.designation || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-white truncate">
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-lg backdrop-blur-xl border border-blue-400/20">
                                                        {formatWorkType(entry.work_type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white capitalize truncate font-medium">{entry.tracker}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{entry.date}</td>
                                                <td className="px-6 py-4 text-sm text-white truncate font-medium" title={entry.project?.name || 'No Project'}>{entry.project?.name || 'No Project'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 truncate" title={entry.project?.client?.name || 'No Client'}>{entry.project?.client?.name || 'No Client'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">{timeFormat(entry.hours)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={entry.description}>{entry.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white/5 backdrop-blur-xl">
                                                    <div className="flex space-x-2">
                                                        <Link 
                                                            href={route('work-hours.edit', entry.id)} 
                                                            className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs font-medium rounded-lg transition-all backdrop-blur-xl"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(entry.id)} 
                                                            className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-lg transition-all backdrop-blur-xl"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                <tfoot className="bg-white/10 backdrop-blur-xl border-t border-white/20">
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4"></td>
                                        <td className="px-6 py-4 font-bold text-right text-blue-300 text-lg">
                                            Total: {timeFormat(workHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0).toFixed(2))}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                        <td className="w-32 px-6 py-4 sticky right-0 bg-white/10 backdrop-blur-xl"></td>
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
