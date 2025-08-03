import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

// Load More Button Pagination Component
export const LoadMorePagination = ({ 
    items = [], 
    hasMore = false, 
    loading = false, 
    onLoadMore, 
    itemsPerPage = 10,
    className = "" 
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Render items */}
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id || index}>
                        {/* Items will be rendered by parent component */}
                        {item}
                    </div>
                ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pt-8">
                    <button 
                        onClick={onLoadMore}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl border border-white/20"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                Load More
                            </div>
                        )}
                    </button>
                </div>
            )}
            
            {!hasMore && items.length > itemsPerPage && (
                <div className="text-center pt-4">
                    <p className="text-white/60 text-sm">
                        You've reached the end of the list
                    </p>
                </div>
            )}
        </div>
    );
};

// Traditional Pagination Component
export const TraditionalPagination = ({ 
    pagination, 
    className = "",
    preserveState = true,
    preserveScroll = false 
}) => {
    if (!pagination) return null;
    
    const { links, current_page, last_page, from, to, total } = pagination;
    
    return (
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
            {/* Results Info */}
            <div className="text-white/70 text-sm">
                Showing <span className="font-medium text-white">{from}</span> to{' '}
                <span className="font-medium text-white">{to}</span> of{' '}
                <span className="font-medium text-white">{total}</span> results
            </div>
            
            {/* Pagination Links */}
            <div className="flex items-center space-x-1">
                {links?.map((link, index) => {
                    if (!link.url && !link.active) {
                        return (
                            <span
                                key={index}
                                className="px-3 py-2 text-white/40 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    
                    if (link.active) {
                        return (
                            <span
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium shadow-lg"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveState={preserveState}
                            preserveScroll={preserveScroll}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg backdrop-blur-xl border border-white/20 hover:border-white/40"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// Infinite Scroll Hook
export const useInfiniteScroll = (callback, hasMore) => {
    React.useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop 
                !== document.documentElement.offsetHeight || !hasMore) {
                return;
            }
            callback();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [callback, hasMore]);
};

// Virtual Scroll Component for large datasets
export const VirtualScrollPagination = ({ 
    items = [], 
    itemHeight = 60, 
    containerHeight = 400,
    renderItem,
    className = "" 
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState(null);
    
    const visibleItems = React.useMemo(() => {
        if (!items.length) return [];
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + 1,
            items.length
        );
        
        return items.slice(startIndex, endIndex).map((item, index) => ({
            ...item,
            index: startIndex + index
        }));
    }, [items, scrollTop, itemHeight, containerHeight]);
    
    const totalHeight = items.length * itemHeight;
    const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;
    
    return (
        <div className={className}>
            <div
                ref={setContainerRef}
                style={{ height: containerHeight, overflow: 'auto' }}
                onScroll={(e) => setScrollTop(e.target.scrollTop)}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    <div style={{ transform: `translateY(${offsetY}px)` }}>
                        {visibleItems.map((item) => (
                            <div
                                key={item.id || item.index}
                                style={{ height: itemHeight }}
                                className="flex items-center"
                            >
                                {renderItem(item, item.index)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-4 text-center text-white/60 text-sm">
                Showing {visibleItems.length} of {items.length} items
            </div>
        </div>
    );
};

// Cursor-based Pagination Component
export const CursorPagination = ({ 
    hasNextPage = false, 
    hasPreviousPage = false,
    nextCursor = null,
    previousCursor = null,
    onNext,
    onPrevious,
    loading = false,
    className = "" 
}) => {
    return (
        <div className={`flex justify-between items-center ${className}`}>
            <button
                onClick={onPrevious}
                disabled={!hasPreviousPage || loading}
                className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white disabled:text-white/40 rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed backdrop-blur-xl border border-white/20 disabled:border-white/10"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
            </button>
            
            <div className="text-white/60 text-sm">
                {loading && (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                    </div>
                )}
            </div>
            
            <button
                onClick={onNext}
                disabled={!hasNextPage || loading}
                className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white disabled:text-white/40 rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed backdrop-blur-xl border border-white/20 disabled:border-white/10"
            >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

// Main Pagination Component that can switch between types
export default function Pagination({ 
    type = 'traditional', 
    data = {},
    onLoadMore,
    loading = false,
    className = "",
    ...props 
}) {
    switch (type) {
        case 'loadMore':
            return (
                <LoadMorePagination 
                    items={data.items || []}
                    hasMore={data.hasMore || false}
                    loading={loading}
                    onLoadMore={onLoadMore}
                    className={className}
                    {...props}
                />
            );
            
        case 'virtual':
            return (
                <VirtualScrollPagination 
                    items={data.items || []}
                    renderItem={data.renderItem}
                    className={className}
                    {...props}
                />
            );
            
        case 'cursor':
            return (
                <CursorPagination 
                    hasNextPage={data.hasNextPage || false}
                    hasPreviousPage={data.hasPreviousPage || false}
                    nextCursor={data.nextCursor}
                    previousCursor={data.previousCursor}
                    onNext={data.onNext}
                    onPrevious={data.onPrevious}
                    loading={loading}
                    className={className}
                    {...props}
                />
            );
            
        case 'traditional':
        default:
            return (
                <TraditionalPagination 
                    pagination={data}
                    className={className}
                    {...props}
                />
            );
    }
}
