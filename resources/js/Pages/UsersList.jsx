import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import AnimatedBackground from "../Components/AnimatedBackground";
import { Head, Link, router } from "@inertiajs/react";
import Avatar from "../Components/Avatar";

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-2xl flex items-center border border-white/20">
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-white/70 font-bold text-lg">&times;</button>
        </div>
    );
}

export default function UsersList({ auth, users, flash }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || "");
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDesignation, setSelectedDesignation] = useState("all");
    const [selectedRole, setSelectedRole] = useState("all");
    const [designationDropdownOpen, setDesignationDropdownOpen] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [designationDropdownPosition, setDesignationDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [roleDropdownPosition, setRoleDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const designationDropdownRef = useRef(null);
    const roleDropdownRef = useRef(null);
    const designationButtonRef = useRef(null);
    const roleButtonRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (designationDropdownRef.current && !designationDropdownRef.current.contains(event.target) &&
                designationButtonRef.current && !designationButtonRef.current.contains(event.target)) {
                setDesignationDropdownOpen(false);
            }
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target) &&
                roleButtonRef.current && !roleButtonRef.current.contains(event.target)) {
                setRoleDropdownOpen(false);
            }
        };

        const handleScroll = () => {
            if (designationDropdownOpen && designationButtonRef.current) {
                const rect = designationButtonRef.current.getBoundingClientRect();
                setDesignationDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
            if (roleDropdownOpen && roleButtonRef.current) {
                const rect = roleButtonRef.current.getBoundingClientRect();
                setRoleDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [designationDropdownOpen, roleDropdownOpen]);

    // Get unique designations from users
    const getUniqueDesignations = () => {
        const designations = users
            .map(user => user.designation)
            .filter(designation => designation && designation.trim() !== "");
        return [...new Set(designations)].sort();
    };

    // Get unique roles from users
    const getUniqueRoles = () => {
        const roles = users.map(user => user.role);
        return [...new Set(roles)].sort();
    };

    // Handle designation dropdown toggle
    const handleDesignationDropdownToggle = () => {
        if (designationButtonRef.current) {
            const rect = designationButtonRef.current.getBoundingClientRect();
            setDesignationDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setDesignationDropdownOpen(!designationDropdownOpen);
        setRoleDropdownOpen(false); // Close other dropdown
    };

    // Handle role dropdown toggle
    const handleRoleDropdownToggle = () => {
        if (roleButtonRef.current) {
            const rect = roleButtonRef.current.getBoundingClientRect();
            setRoleDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setRoleDropdownOpen(!roleDropdownOpen);
        setDesignationDropdownOpen(false); // Close other dropdown
    };

    // Filter users based on search criteria
    const filteredUsers = users.filter(user => {
        const matchesName = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDesignation = selectedDesignation === "all" || 
                                 (selectedDesignation === "no_designation" && (!user.designation || user.designation.trim() === "")) ||
                                 user.designation === selectedDesignation;
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        
        return matchesName && matchesDesignation && matchesRole;
    });

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        router.delete(route("users.destroy", deleteId), {
            onSuccess: () => {
                setToast("User deleted successfully.");
                setDeleteId(null);
            },
            onError: () => {
                setToast("Failed to delete user.");
                setDeleteId(null);
            },
        });
    };

    const closeToast = () => setToast("");

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-slate-100 leading-tight">
                    Users
                </h2>
            }
        >
            <Head title="Users List" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{background: '#282a2a'}}>
                <AnimatedBackground />
            </div>
            
            <Toast message={toast} onClose={closeToast} />
            
            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                        <h2 className="text-xl font-bold mb-4 text-white">
                            Confirm Delete
                        </h2>
                        <p className="mb-6 text-white/80">
                            Are you sure you want to delete this user?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/20 backdrop-blur-xl"
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
            
            <div className="py-12 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl border border-white/10">
                        <div className="p-8 text-white">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-4xl font-bold text-white">
                                        Users List
                                    </h1>
                                    <p className="text-white/70 mt-2 text-lg">Manage user accounts and permissions</p>
                                </div>
                                <Link
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                                    href={route("users.create")}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add User
                                </Link>
                            </div>

                            {/* Filters Section */}
                            <div className="mb-6 space-y-4">
                                {/* Search by Name/Email */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl p-6 rounded-xl border border-white/20">
                                    <h3 className="text-sm font-semibold text-white mb-3">Search Users</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            className="w-full px-4 py-3 pl-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-white/50 text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <svg className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Filter by Designation */}
                                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl p-6 rounded-xl border border-white/20">
                                        <h3 className="text-sm font-semibold text-white mb-3">Filter by Designation</h3>
                                        <div className="relative">
                                            <button
                                                ref={designationButtonRef}
                                                type="button"
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm text-white text-left flex items-center justify-between hover:bg-white/20 transition-all"
                                                onClick={handleDesignationDropdownToggle}
                                            >
                                                <span className="truncate">
                                                    {selectedDesignation === "all" ? "All Designations" : 
                                                     selectedDesignation === "no_designation" ? "No Designation" : 
                                                     selectedDesignation}
                                                </span>
                                                <svg 
                                                    className={`w-4 h-4 transition-transform ${designationDropdownOpen ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Portal for Designation Dropdown */}
                                    {designationDropdownOpen && createPortal(
                                        <div 
                                            ref={designationDropdownRef}
                                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-hidden z-[9999]"
                                            style={{
                                                position: 'absolute',
                                                top: designationDropdownPosition.top,
                                                left: designationDropdownPosition.left,
                                                width: designationDropdownPosition.width,
                                                maxHeight: '240px'
                                            }}
                                        >
                                            <div className="max-h-48 overflow-y-auto">
                                                <div
                                                    className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${selectedDesignation === 'all' ? 'bg-green-500/20 text-green-300 font-medium' : 'text-white'}`}
                                                    onClick={() => {
                                                        setSelectedDesignation('all');
                                                        setDesignationDropdownOpen(false);
                                                    }}
                                                >
                                                    {selectedDesignation === 'all' && (
                                                        <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    All Designations
                                                </div>
                                                <div
                                                    className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${selectedDesignation === 'no_designation' ? 'bg-green-500/20 text-green-300 font-medium' : 'text-white'}`}
                                                    onClick={() => {
                                                        setSelectedDesignation('no_designation');
                                                        setDesignationDropdownOpen(false);
                                                    }}
                                                >
                                                    {selectedDesignation === 'no_designation' && (
                                                        <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    No Designation
                                                </div>
                                                {getUniqueDesignations().map(designation => (
                                                    <div
                                                        key={designation}
                                                        className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${selectedDesignation === designation ? 'bg-green-500/20 text-green-300 font-medium' : 'text-white'}`}
                                                        onClick={() => {
                                                            setSelectedDesignation(designation);
                                                            setDesignationDropdownOpen(false);
                                                        }}
                                                    >
                                                        {selectedDesignation === designation && (
                                                            <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        <span className="truncate">{designation}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>,
                                        document.body
                                    )}

                                    {/* Filter by Role */}
                                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-6 rounded-xl border border-white/20">
                                        <h3 className="text-sm font-semibold text-white mb-3">Filter by Role</h3>
                                        <div className="relative">
                                            <button
                                                ref={roleButtonRef}
                                                type="button"
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm text-white text-left flex items-center justify-between hover:bg-white/20 transition-all"
                                                onClick={handleRoleDropdownToggle}
                                            >
                                                <span className="truncate capitalize">
                                                    {selectedRole === "all" ? "All Roles" : selectedRole}
                                                </span>
                                                <svg 
                                                    className={`w-4 h-4 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Portal for Role Dropdown */}
                                    {roleDropdownOpen && createPortal(
                                        <div 
                                            ref={roleDropdownRef}
                                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-hidden z-[9999]"
                                            style={{
                                                position: 'absolute',
                                                top: roleDropdownPosition.top,
                                                left: roleDropdownPosition.left,
                                                width: roleDropdownPosition.width,
                                                maxHeight: '240px'
                                            }}
                                        >
                                            <div className="max-h-48 overflow-y-auto">
                                                <div
                                                    className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${selectedRole === 'all' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-white'}`}
                                                    onClick={() => {
                                                        setSelectedRole('all');
                                                        setRoleDropdownOpen(false);
                                                    }}
                                                >
                                                    {selectedRole === 'all' && (
                                                        <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    All Roles
                                                </div>
                                                {getUniqueRoles().map(role => (
                                                    <div
                                                        key={role}
                                                        className={`px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors flex items-center ${selectedRole === role ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-white'}`}
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setRoleDropdownOpen(false);
                                                        }}
                                                    >
                                                        {selectedRole === role && (
                                                            <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        <span className="truncate capitalize">{role}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>

                                {/* Results Summary */}
                                <div className="flex justify-between items-center text-sm text-white/80 bg-white/10 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/20">
                                    <span>
                                        Showing {filteredUsers.length} of {users.length} users
                                        {searchTerm && ` matching "${searchTerm}"`}
                                        {selectedDesignation !== "all" && ` with designation "${selectedDesignation === "no_designation" ? "No Designation" : selectedDesignation}"`}
                                        {selectedRole !== "all" && ` with role "${selectedRole}"`}
                                    </span>
                                    {(searchTerm || selectedDesignation !== "all" || selectedRole !== "all") && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedDesignation("all");
                                                setSelectedRole("all");
                                            }}
                                            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md transition-all border border-white/20"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto shadow-2xl ring-1 ring-white/10 rounded-xl">
                                <table className="min-w-full divide-y divide-white/10 table-fixed">
                                    <thead className="bg-gradient-to-r from-blue-500/30 to-purple-600/30 backdrop-blur-xl border-b border-white/20">
                                        <tr>
                                            <th className="w-16 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="w-24 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                Avatar
                                            </th>
                                            <th className="w-48 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="w-32 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                Designation
                                            </th>
                                            <th className="w-24 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-blue-500/30 to-purple-600/30 backdrop-blur-xl">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="text-white/60">
                                                        <svg className="mx-auto h-12 w-12 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v.01M6 8v.01" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                                                        <p className="text-white/60">
                                                            {searchTerm || selectedDesignation !== "all" || selectedRole !== "all" 
                                                                ? "Try adjusting your filters to see more results."
                                                                : "No users available in the system."
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user, index) => (
                                            <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-blue-500/20 transition-colors backdrop-blur-xl`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-300">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Avatar user={user} size="md" />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white font-medium truncate" title={user.name}>
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white/80 truncate" title={user.email}>
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white truncate">
                                                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full border border-green-400/30">
                                                        {user.designation || 'No Designation'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize border ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' 
                                                            : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white/5 backdrop-blur-xl border-l border-white/10">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route(
                                                                "users.edit",
                                                                user.id
                                                            )}
                                                            className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all shadow-lg"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {user.id > 1 && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-md transition-all shadow-lg"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
