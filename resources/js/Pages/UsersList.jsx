import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Avatar from "../Components/Avatar";

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center border-l-4 border-yellow-400">
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-yellow-200 font-bold text-lg">&times;</button>
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
    const designationDropdownRef = useRef(null);
    const roleDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (designationDropdownRef.current && !designationDropdownRef.current.contains(event.target)) {
                setDesignationDropdownOpen(false);
            }
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setRoleDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Users
                </h2>
            }
        >
            <Head title="Users List" />
            <Toast message={toast} onClose={closeToast} />
            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-yellow-400">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            Confirm Delete
                        </h2>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this user?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all"
                            >
                                Delete
                            </button>
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
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                        Users List
                                    </h1>
                                    <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
                                </div>
                                <Link
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
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
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="text-sm font-semibold text-green-800 mb-3">Search Users</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            className="w-full px-4 py-3 pl-10 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <svg className="w-5 h-5 text-green-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Filter by Designation */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                        <h3 className="text-sm font-semibold text-yellow-800 mb-3">Filter by Designation</h3>
                                        <div className="relative" ref={designationDropdownRef}>
                                            <button
                                                type="button"
                                                className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm bg-white text-left flex items-center justify-between hover:bg-yellow-50 transition-colors"
                                                onClick={() => setDesignationDropdownOpen(!designationDropdownOpen)}
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
                                            
                                            {designationDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-yellow-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
                                                    <div className="max-h-48 overflow-y-auto">
                                                        <div
                                                            className={`px-4 py-2 cursor-pointer hover:bg-yellow-50 transition-colors flex items-center ${selectedDesignation === 'all' ? 'bg-yellow-50 text-yellow-600 font-medium' : 'text-gray-700'}`}
                                                            onClick={() => {
                                                                setSelectedDesignation('all');
                                                                setDesignationDropdownOpen(false);
                                                            }}
                                                        >
                                                            {selectedDesignation === 'all' && (
                                                                <svg className="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            All Designations
                                                        </div>
                                                        <div
                                                            className={`px-4 py-2 cursor-pointer hover:bg-yellow-50 transition-colors flex items-center ${selectedDesignation === 'no_designation' ? 'bg-yellow-50 text-yellow-600 font-medium' : 'text-gray-700'}`}
                                                            onClick={() => {
                                                                setSelectedDesignation('no_designation');
                                                                setDesignationDropdownOpen(false);
                                                            }}
                                                        >
                                                            {selectedDesignation === 'no_designation' && (
                                                                <svg className="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            No Designation
                                                        </div>
                                                        {getUniqueDesignations().map(designation => (
                                                            <div
                                                                key={designation}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-yellow-50 transition-colors flex items-center ${selectedDesignation === designation ? 'bg-yellow-50 text-yellow-600 font-medium' : 'text-gray-700'}`}
                                                                onClick={() => {
                                                                    setSelectedDesignation(designation);
                                                                    setDesignationDropdownOpen(false);
                                                                }}
                                                            >
                                                                {selectedDesignation === designation && (
                                                                    <svg className="w-4 h-4 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                <span className="truncate">{designation}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filter by Role */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                        <h3 className="text-sm font-semibold text-blue-800 mb-3">Filter by Role</h3>
                                        <div className="relative" ref={roleDropdownRef}>
                                            <button
                                                type="button"
                                                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                                                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
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
                                            
                                            {roleDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
                                                    <div className="max-h-48 overflow-y-auto">
                                                        <div
                                                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors flex items-center ${selectedRole === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                                                            onClick={() => {
                                                                setSelectedRole('all');
                                                                setRoleDropdownOpen(false);
                                                            }}
                                                        >
                                                            {selectedRole === 'all' && (
                                                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            All Roles
                                                        </div>
                                                        {getUniqueRoles().map(role => (
                                                            <div
                                                                key={role}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors flex items-center ${selectedRole === role ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                                                                onClick={() => {
                                                                    setSelectedRole(role);
                                                                    setRoleDropdownOpen(false);
                                                                }}
                                                            >
                                                                {selectedRole === role && (
                                                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                                <span className="truncate capitalize">{role}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Results Summary */}
                                <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
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
                                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto shadow-xl ring-1 ring-black ring-opacity-5 rounded-xl">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                    <thead className="bg-gradient-to-r from-green-600 to-green-700">
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
                                            <th className="w-40 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-gradient-to-r from-green-600 to-green-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="text-gray-500">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v.01M6 8v.01" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                                        <p className="text-gray-500">
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
                                            <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-800">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Avatar user={user} size="md" />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium truncate" title={user.name}>
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 truncate" title={user.email}>
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 truncate">
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                        {user.designation || 'No Designation'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route(
                                                                "users.edit",
                                                                user.id
                                                            )}
                                                            className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-medium rounded-md transition-all"
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
                                                                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-medium rounded-md transition-all"
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
