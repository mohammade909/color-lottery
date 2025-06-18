"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../lib/api";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.register(username, email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/?login=true");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-white max-w-md">
      {/* <h2 className="text-2xl font-bold mb-6 text-center">Register</h2> */}
      <div className="mb-4">
        <h2 className="text-base font-medium ">Sign Up</h2>
        <p className="text-xs mt-[1px] text-gray-300">
          Please log in with your phone number or email
        </p>
      </div>
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Registration successful! Redirecting to login...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-300 text-sm mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-[9px] bg-gray-700 text-[14px] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none  transition-all pr-12"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-[9px] bg-gray-700 text-[14px] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none  transition-all pr-12"
            required
          />
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="password"
            className="block text-gray-300 text-sm mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-[9px] bg-gray-700 text-[14px] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none  transition-all pr-12"
            minLength={6}
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[40px] text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-[#946a11] text-white py-2 px-4 rounded-md hover:from-[#845e10] hover:to-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
