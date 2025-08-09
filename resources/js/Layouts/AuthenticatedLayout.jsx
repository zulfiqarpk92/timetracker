import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Avatar from '@/Components/Avatar';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#282a2a' }}>
            <nav className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-xl border-b border-slate-300/30 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="flex items-center space-x-3 group">
                                    <div className="relative">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                                            <ApplicationLogo size="16" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <h1 className="text-xl font-bold text-slate-700">
                                            Sparking Asia
                                        </h1>
                                        <p className="text-sm text-blue-600 font-medium">
                                            Time Tracker
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-2 sm:-my-px sm:ms-10 sm:flex items-center">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    <div className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-blue-200/50">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-300">Dashboard</span>
                                    </div>
                                </NavLink>
                                
                                <NavLink href={route('work-hours.index')} active={['work-hours.index', 'work-hours.create', 'work-hours.edit'].some(r => route().current(r))}>
                                    <div className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-emerald-200/50">
                                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:from-emerald-600 group-hover:to-emerald-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors duration-300">Work diary</span>
                                    </div>
                                </NavLink>
                                
                                {user?.role === 'admin' && (
                                    <NavLink href={route('clients.index')} active={['clients.index', 'clients.create', 'clients.edit'].some(r => route().current(r))}>
                                        <div className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-purple-200/50">
                                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M15 7a3 3 0 11-6 0 3 3 0 616 0z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-slate-700 group-hover:text-purple-700 transition-colors duration-300">Clients</span>
                                        </div>
                                    </NavLink>
                                )}
                                
                                {user?.role === 'admin' && (
                                    <NavLink href={route('users.index')} active={['users.index', 'users.create', 'users.edit'].some(r => route().current(r))}>
                                        <div className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-teal-200/50">
                                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 group-hover:from-teal-600 group-hover:to-teal-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-slate-700 group-hover:text-teal-700 transition-colors duration-300">Users</span>
                                        </div>
                                    </NavLink>
                                )}
                                
                                {user?.role === 'admin' && (
                                    <NavLink href={route('work-hours.report')} active={['work-hours.report'].some(r => route().current(r))}>
                                        <div className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-rose-200/50">
                                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 group-hover:from-rose-600 group-hover:to-rose-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-slate-700 group-hover:text-rose-700 transition-colors duration-300">Report</span>
                                        </div>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6 space-x-4">
                            {/* Quick Action Button */}
                            <Link href={route('work-hours.create')} 
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-lg font-medium text-sm text-white hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out shadow-sm hover:shadow-md">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Start Tracking
                            </Link>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-3 py-2 border border-slate-400 text-sm leading-4 font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                                            <Avatar user={user} size="sm" className="mr-2" />
                                            <span className="hidden lg:block">{user?.name}</span>
                                            <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </div>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 713-3h4a3 3 0 713 3v1" />
                                                </svg>
                                                Log Out
                                            </div>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200 focus:outline-none focus:bg-slate-200 focus:text-slate-900 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-300'}>
                    <div className="pt-2 pb-3 space-y-1 bg-slate-50">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 712-2h2a2 2 0 712 2v2a2 2 0 71-2 2H6a2 2 0 71-2-2V6z" />
                                </svg>
                                <span>Dashboard</span>
                            </div>
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink href={route('work-hours.index')} active={['work-hours.index', 'work-hours.create', 'work-hours.edit'].some(r => route().current(r))}>
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Work diary</span>
                            </div>
                        </ResponsiveNavLink>
                        
                        {user?.role === 'admin' && (
                            <>
                                <ResponsiveNavLink href={route('clients.index')} active={['clients.index', 'clients.create', 'clients.edit'].some(r => route().current(r))}>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M15 7a3 3 0 11-6 0 3 3 0 616 0z" />
                                        </svg>
                                        <span>Clients</span>
                                    </div>
                                </ResponsiveNavLink>
                                
                                <ResponsiveNavLink href={route('users.index')} active={['users.index', 'users.create', 'users.edit'].some(r => route().current(r))}>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                                        </svg>
                                        <span>Users</span>
                                    </div>
                                </ResponsiveNavLink>
                                
                                <ResponsiveNavLink href={route('work-hours.report')} active={['work-hours.report'].some(r => route().current(r))}>
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 712 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
                                        </svg>
                                        <span>Report</span>
                                    </div>
                                </ResponsiveNavLink>
                            </>
                        )}

                        {/* Mobile Quick Action */}
                        <div className="pt-4 border-t border-slate-300 mx-4">
                            <Link href={route('work-hours.create')} className="block">
                                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Start Tracking</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile User Profile Section */}
                    <div className="pt-4 pb-4 border-t border-slate-300 bg-slate-100">
                        <div className="px-4 flex items-center space-x-4 mb-3">
                            <Avatar user={user} size="lg" />
                            <div className="flex-1">
                                <div className="font-semibold text-slate-800">{user?.name ?? ''}</div>
                                <div className="text-sm text-slate-600">{user?.email ?? ''}</div>
                                <div className="text-xs text-blue-600 capitalize font-medium mt-1">{user?.role}</div>
                            </div>
                        </div>

                        <div className="space-y-1 px-4">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 818 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Profile Settings</span>
                                </div>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 71-3 3H6a3 3 0 71-3-3V7a3 3 0 713-3h4a3 3 0 713 3v1" />
                                    </svg>
                                    <span>Log Out</span>
                                </div>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-300/50 shadow-sm">
                    <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-sm">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 712-2h2a2 2 0 712 2v2a2 2 0 71-2 2H6a2 2 0 71-2-2V6z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {typeof header === 'string' ? header : (header?.props?.children || 'Page')}
                            </h1>
                        </div>
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
