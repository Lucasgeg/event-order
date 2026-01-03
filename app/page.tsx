import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          LG Order Register
        </h1>
        <p className="text-gray-600 mb-8">
          Gestion des commandes et menus pour votre établissement.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
