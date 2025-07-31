import React, { useState } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Avatar from "../Components/Avatar";

function Toast({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white font-bold">
                &times;
            </button>
        </div>
    );
}

export default function UsersList({ auth, users, flash }) {
    const [deleteId, setDeleteId] = useState(null);
    const [toast, setToast] = useState(flash?.success || "");

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
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">
                            Confirm Delete
                        </h2>
                        <p className="mb-4">
                            Are you sure you want to delete this user?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold mb-4">
                                    Users List
                                </h1>
                                <Link
                                    className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded"
                                    href={route("users.create")}
                                >
                                    Add User
                                </Link>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avatar
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Designation
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Avatar user={user} size="md" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.designation || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                {user.role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <Link
                                                    href={route(
                                                        "users.edit",
                                                        user.id
                                                    )}
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
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
                                                        className="bg-red-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
