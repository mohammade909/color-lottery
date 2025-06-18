"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../lib/api";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      login(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" text-white mb-8  w-full ">
      <div className="mb-4">
        <h2 className="text-base font-medium ">Log In</h2>
        <p className="text-xs mt-[1px] text-gray-300">
          Please log in with your phone number or email
        </p>
      </div>
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
            value={username}
            placeholder="Enter your Username"
            onChange={(e) => setUsername(e.target.value)}
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
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-[9px] bg-gray-700 text-[14px] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none  transition-all pr-12"
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
          disabled={loading}
          className="w-full bg-[#946a11] text-white py-2 px-4 rounded-md hover:from-[#845e10] hover:to-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
