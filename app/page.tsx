"use client";

import { useState, useEffect } from "react";
import { useApp } from "./context/AppContext";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const { user } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("toto@gmail.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Connexion
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Comptes de test :</p>
          <p>Admin: toto@gmail.com / password</p>
          <p>User: user@gmail.com / password</p>
        </div>
      </div>
    </div>
  );
}
