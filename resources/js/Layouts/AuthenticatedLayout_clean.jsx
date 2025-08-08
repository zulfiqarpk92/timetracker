import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Avatar from '@/Components/Avatar';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#282a2a' }}>
            <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 shadow-2xl" style={{ 
                background: 'linear-gradient(135deg, rgba(40, 42, 42, 0.98) 0%, rgba(31, 32, 32, 0.99) 50%, rgba(25, 27, 27, 0.99) 100%)'
            }}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="flex items-center space-x-3 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg blur-lg opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                                        <div className="relative p-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl group-hover:shadow-2xl group-hover:border-white/30 transition-all duration-300">
                                            <ApplicationLogo size="16" className="filter brightness-0 invert" />
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <h1 className="text-lg font-bold">
                                            <span className="bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                                                Sparking Asia
                                            </span>
                                        </h1>
                                        <p className="text-xs bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-medium">
                                            Time Tracker
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-6 sm:-my-px sm:ms-10 sm:flex items-center">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                
                                <NavLink href={route('work-hours.index')} active={['work-hours.index', 'work-hours.create', 'work-hours.edit'].some(r => route().current(r))}>
                                    Work diary
                                </NavLink>
                                
                                {user?.role === 'admin' && (
                                    <>
                                        <NavLink href={route('clients.index')} active={['clients.index', 'clients.create', 'clients.edit'].some(r => route().current(r))}>
                                            Clients
                                        </NavLink>
                                        
                                        <NavLink href={route('projects.index')} active={['projects.index', 'projects.create', 'projects.edit'].some(r => route().current(r))}>
                                            Projects
                                        </NavLink>
                                        
                                        <NavLink href={route('work-hours.report')} active={['work-hours.report'].some(r => route().current(r))}>
                                            Report
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6 space-x-3">
                            {/* Quick Action Button - Clean */}
                            <Link href={route('work-hours.create')} className="group" title="Start Tracking">
                                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-green-500/25 to-green-600/25 backdrop-blur-md rounded-lg border border-green-400/30 hover:border-green-400/60 text-white hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            </Link>

                            {/* User Profile Dropdown - Clean */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex">
                                            <button
                                                type="button"
                                                className="inline-flex items-center space-x-2 px-3 py-1.5 border border-white/15 text-sm font-medium rounded-lg text-white bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl hover:bg-white/15 focus:outline-none transition-all ease-in-out duration-300 hover:border-white/30 group"
                                            >
                                                <Avatar user={user} size="sm" className="ring-1 ring-white/20" />
                                                <span className="hidden md:block font-medium">{user?.name}</span>
                                                <svg
                                                    className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:text-white transition duration-150 ease-in-out backdrop-blur-md border border-white/10"
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
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-white/5'}>
                    <div className="pt-3 pb-3 space-y-1 px-4 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-xl">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink href={route('work-hours.index')} active={['work-hours.index', 'work-hours.create', 'work-hours.edit'].some(r => route().current(r))}>
                            Work diary
                        </ResponsiveNavLink>
                        
                        {user?.role === 'admin' && (
                            <>
                                <ResponsiveNavLink href={route('clients.index')} active={['clients.index', 'clients.create', 'clients.edit'].some(r => route().current(r))}>
                                    Clients
                                </ResponsiveNavLink>
                                
                                <ResponsiveNavLink href={route('projects.index')} active={['projects.index', 'projects.create', 'projects.edit'].some(r => route().current(r))}>
                                    Projects
                                </ResponsiveNavLink>
                                
                                <ResponsiveNavLink href={route('work-hours.report')} active={['work-hours.report'].some(r => route().current(r))}>
                                    Report
                                </ResponsiveNavLink>
                            </>
                        )}

                        {/* Mobile Quick Action */}
                        <div className="pt-3 border-t border-white/10">
                            <Link href={route('work-hours.create')} className="block">
                                <div className="flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-md rounded-lg border border-green-400/30 text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm font-medium">Start Tracking</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile User Profile Section */}
                    <div className="pt-3 pb-3 border-t border-white/5 bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-xl">
                        <div className="px-4 flex items-center space-x-3 mb-3">
                            <Avatar user={user} size="md" className="ring-1 ring-white/20" />
                            <div className="flex-1">
                                <div className="font-medium text-white">{user?.name ?? ''}</div>
                                <div className="text-sm text-white/60">{user?.email ?? ''}</div>
                            </div>
                        </div>

                        <div className="space-y-1 px-4">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile Settings
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="sticky top-16 z-40 backdrop-blur-2xl border-b border-white/5" style={{ 
                    background: 'linear-gradient(135deg, rgba(40, 42, 42, 0.95) 0%, rgba(31, 32, 32, 0.98) 100%)'
                }}>
                    <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                                {header}
                            </h1>
                        </div>
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
