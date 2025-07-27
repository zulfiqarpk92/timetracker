import { Link, Head } from "@inertiajs/react";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-end">
                    {auth.user ? (
                        <Link
                            href={route("dashboard")}
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Log in
                            </Link>
                        </>
                    )}
                </div>

                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <div className="flex justify-center">
                        <img src="https://www.sparkingasia.com/wp-content/uploads/2022/03/sa.png" className="w-40" />
                    </div>
                    <div className="flex flex-col items-center justify-center mt-8">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                            Welcome to Sparking Asia Time Tracker
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-2xl">
                            Easily track your work hours and productivity with
                            our time tracker application, built specifically for
                            Sparking Asia team members.
                        </p>
                    </div>

                </div>
            </div>

       
        </>
    );
}
