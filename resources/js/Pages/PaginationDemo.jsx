import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import AnimatedBackground from '../Components/AnimatedBackground';
import Pagination, { LoadMorePagination, TraditionalPagination, VirtualScrollPagination } from '../Components/Pagination';
import { Head } from '@inertiajs/react';

// Sample data generator
const generateSampleData = (count = 50) => {
    const workTypes = ['tracker', 'manual', 'test_task', 'fixed', 'office_work'];
    const trackers = ['upwork', 'local', 'freelancer', 'manual'];
    const projects = ['Website Redesign', 'Mobile App', 'API Development', 'Database Migration', 'UI/UX Design'];
    const clients = ['Tech Corp', 'Startup Inc', 'Enterprise LLC', 'Digital Agency', 'E-commerce Co'];
    
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        work_type: workTypes[Math.floor(Math.random() * workTypes.length)],
        tracker: trackers[Math.floor(Math.random() * trackers.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        project: {
            name: projects[Math.floor(Math.random() * projects.length)],
            client: {
                name: clients[Math.floor(Math.random() * clients.length)]
            }
        },
        hours: (Math.random() * 8 + 0.5).toFixed(2),
        description: `Working on ${projects[Math.floor(Math.random() * projects.length)].toLowerCase()} tasks and implementing new features.`
    }));
};

export default function PaginationDemo({ auth }) {
    const [sampleData] = useState(generateSampleData(100));
    const [paginationType, setPaginationType] = useState('traditional');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loadMoreItems, setLoadMoreItems] = useState([]);
    const [loadMorePage, setLoadMorePage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Helper functions
    const formatWorkType = (workType) => {
        const workTypeMap = {
            'tracker': 'Tracker',
            'manual': 'Manual Time',
            'test_task': 'Test Task',
            'fixed': 'Fixed Project',
            'office_work': 'Office Work'
        };
        return workTypeMap[workType] || workType;
    };

    const timeFormat = (hours) => {
        const totalMinutes = Math.round(parseFloat(hours) * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hrs}h ${mins}m`;
    };

    // Pagination functions
    const initializeLoadMoreDemo = () => {
        const initialItems = sampleData.slice(0, itemsPerPage);
        setLoadMoreItems(initialItems);
        setLoadMorePage(1);
    };

    const handleLoadMore = () => {
        setLoading(true);
        setTimeout(() => {
            const nextPage = loadMorePage + 1;
            const startIndex = (nextPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const newItems = sampleData.slice(startIndex, endIndex);
            
            setLoadMoreItems(prev => [...prev, ...newItems]);
            setLoadMorePage(nextPage);
            setLoading(false);
        }, 800);
    };

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = sampleData.slice(startIndex, endIndex);
        
        return {
            data: paginatedItems,
            pagination: {
                current_page: currentPage,
                last_page: Math.ceil(sampleData.length / itemsPerPage),
                per_page: itemsPerPage,
                total: sampleData.length,
                from: startIndex + 1,
                to: Math.min(endIndex, sampleData.length),
                links: generatePaginationLinks(currentPage, Math.ceil(sampleData.length / itemsPerPage))
            }
        };
    };

    const generatePaginationLinks = (current, total) => {
        const links = [];
        
        links.push({
            url: current > 1 ? '#' : null,
            label: '&laquo; Previous',
            active: false
        });
        
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                links.push({
                    url: '#',
                    label: i.toString(),
                    active: i === current
                });
            } else if (i === current - 2 || i === current + 2) {
                links.push({
                    url: null,
                    label: '...',
                    active: false
                });
            }
        }
        
        links.push({
            url: current < total ? '#' : null,
            label: 'Next &raquo;',
            active: false
        });
        
        return links;
    };

    // Initialize demo data
    useEffect(() => {
        initializeLoadMoreDemo();
    }, []);

    // Handle pagination clicks
    useEffect(() => {
        const handleDemoPaginationClick = (e) => {
            if (e.target.closest('.demo-pagination')) {
                e.preventDefault();
                const link = e.target.closest('a, span');
                if (link && link.textContent) {
                    const text = link.textContent.trim();
                    if (text === '« Previous' && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else if (text === 'Next »' && currentPage < Math.ceil(sampleData.length / itemsPerPage)) {
                        setCurrentPage(currentPage + 1);
                    } else if (!isNaN(parseInt(text))) {
                        setCurrentPage(parseInt(text));
                    }
                }
            }
        };

        document.addEventListener('click', handleDemoPaginationClick);
        return () => document.removeEventListener('click', handleDemoPaginationClick);
    }, [currentPage, sampleData.length, itemsPerPage]);

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-semibold text-xl text-slate-100 leading-tight">Pagination Demo</h2>}
        >
            <Head title="Pagination Demo" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Pagination Types Demo</h1>
                        <p className="text-white/70 text-lg">Explore different pagination approaches for your time tracker</p>
                    </div>

                    {/* Pagination Type Selector */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Choose Pagination Type</h2>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => {
                                        setPaginationType('traditional');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                        paginationType === 'traditional'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                    📄 Traditional Pagination
                                </button>
                                <button
                                    onClick={() => {
                                        setPaginationType('loadMore');
                                        initializeLoadMoreDemo();
                                    }}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                        paginationType === 'loadMore'
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                    ⬇️ Load More
                                </button>
                                <button
                                    onClick={() => setPaginationType('virtual')}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                        paginationType === 'virtual'
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                                >
                                    🚀 Virtual Scroll
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Demo Content */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {paginationType === 'traditional' && '📄 Traditional Pagination Demo'}
                                {paginationType === 'loadMore' && '⬇️ Load More Demo'}
                                {paginationType === 'virtual' && '🚀 Virtual Scroll Demo'}
                            </h3>
                            <p className="text-white/70">
                                {paginationType === 'traditional' && 'Classic numbered pagination with page navigation. Perfect for reports and data analysis where users need to jump to specific pages.'}
                                {paginationType === 'loadMore' && 'Load additional content on demand. Provides seamless browsing experience, ideal for feeds and modern applications.'}
                                {paginationType === 'virtual' && 'Efficiently renders only visible items for large datasets. Provides smooth scrolling performance with unlimited data.'}
                            </p>
                        </div>

                        {/* Traditional Pagination */}
                        {paginationType === 'traditional' && (
                            <div>
                                <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 mb-6">
                                    <table className="min-w-full divide-y divide-white/10">
                                        <thead className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Work Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tracker</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Project</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Client</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {getPaginatedData().data.map((entry, index) => (
                                                <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-all duration-200`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">{entry.id}</td>
                                                    <td className="px-6 py-4 text-sm text-white">
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full">
                                                            {formatWorkType(entry.work_type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white capitalize font-medium">{entry.tracker}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{entry.date}</td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium">{entry.project.name}</td>
                                                    <td className="px-6 py-4 text-sm text-white/70">{entry.project.client.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">{timeFormat(entry.hours)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <TraditionalPagination 
                                    pagination={getPaginatedData().pagination}
                                    className="demo-pagination bg-white/5 p-4 rounded-lg border border-white/10"
                                />
                            </div>
                        )}

                        {/* Load More Pagination */}
                        {paginationType === 'loadMore' && (
                            <div>
                                <div className="space-y-4 mb-6">
                                    {loadMoreItems.map((entry, index) => (
                                        <div key={entry.id} className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:shadow-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-blue-400 font-bold text-lg">#{entry.id}</span>
                                                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-purple-500/30 text-purple-200 rounded-full">
                                                            {formatWorkType(entry.work_type)}
                                                        </span>
                                                        <span className="text-white/60">{entry.date}</span>
                                                    </div>
                                                    <h4 className="text-white font-semibold text-lg mb-2">{entry.project.name}</h4>
                                                    <p className="text-white/80 mb-3">{entry.description}</p>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <span className="text-white/60">
                                                            <span className="font-medium">Client:</span> {entry.project.client.name}
                                                        </span>
                                                        <span className="text-green-400 font-bold text-lg">{timeFormat(entry.hours)}</span>
                                                        <span className="text-white/60 capitalize">
                                                            <span className="font-medium">Tracker:</span> {entry.tracker}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <LoadMorePagination 
                                    items={[]}
                                    hasMore={loadMoreItems.length < sampleData.length}
                                    loading={loading}
                                    onLoadMore={handleLoadMore}
                                />
                            </div>
                        )}

                        {/* Virtual Scroll */}
                        {paginationType === 'virtual' && (
                            <VirtualScrollPagination
                                items={sampleData}
                                itemHeight={80}
                                containerHeight={500}
                                renderItem={(entry, index) => (
                                    <div className="px-6 py-4 border-b border-white/10 hover:bg-white/10 transition-all flex items-center w-full">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-blue-400 font-bold">#{entry.id}</span>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full">
                                                    {formatWorkType(entry.work_type)}
                                                </span>
                                                <span className="text-green-400 font-bold">{timeFormat(entry.hours)}</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <span className="text-white font-medium">{entry.project.name}</span>
                                                <span className="text-white/60">{entry.project.client.name}</span>
                                                <span className="text-white/60">{entry.date}</span>
                                                <span className="text-white/60 capitalize">{entry.tracker}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        )}

                        {/* Performance Comparison */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
                                <h4 className="text-green-400 font-bold mb-2">🚀 Performance</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Virtual Scroll:</span>
                                        <span className="text-green-400 font-bold">Excellent</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Load More:</span>
                                        <span className="text-blue-400 font-bold">Good</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Traditional:</span>
                                        <span className="text-yellow-400 font-bold">Fair</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                                <h4 className="text-blue-400 font-bold mb-2">👤 User Experience</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Load More:</span>
                                        <span className="text-green-400 font-bold">Excellent</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Traditional:</span>
                                        <span className="text-blue-400 font-bold">Good</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Virtual Scroll:</span>
                                        <span className="text-yellow-400 font-bold">Fair</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                                <h4 className="text-purple-400 font-bold mb-2">📊 Data Analysis</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Traditional:</span>
                                        <span className="text-green-400 font-bold">Excellent</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Virtual Scroll:</span>
                                        <span className="text-blue-400 font-bold">Good</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Load More:</span>
                                        <span className="text-yellow-400 font-bold">Fair</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className="mt-8 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-3">💡 Recommendation for Your Time Tracker</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-green-400 font-semibold mb-2">✅ For Work Hours Lists:</h4>
                                <p className="text-white/80 text-sm mb-2">Use <strong>Load More</strong> pagination for better user experience and performance.</p>
                                <ul className="text-white/70 text-sm space-y-1 ml-4">
                                    <li>• Seamless scrolling experience</li>
                                    <li>• Faster initial page loads</li>
                                    <li>• Mobile-friendly interaction</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-blue-400 font-semibold mb-2">📊 For Reports & Analytics:</h4>
                                <p className="text-white/80 text-sm mb-2">Use <strong>Traditional</strong> pagination for data analysis and navigation.</p>
                                <ul className="text-white/70 text-sm space-y-1 ml-4">
                                    <li>• Easy navigation to specific pages</li>
                                    <li>• Better for printing and exporting</li>
                                    <li>• Professional appearance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
