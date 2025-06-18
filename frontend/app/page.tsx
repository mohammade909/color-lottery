"use client";
// import "@/styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (searchParams?.get("login") === "true") {
      setIsLogin(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "user") {
        router.replace("/dashboard");
      } else if (user.role === "admin") {
        router.replace("/manager");
      } else {
        console.log("Unknown role:", user.role);
      }
    } else {
      console.log(
        "Not redirecting - isAuthenticated:",
        isAuthenticated,
        "user:",
        user
      );
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 w-full bg-[#292727] text-white fixed w-full z-40">
        <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
          Welcome Back!
        </h1>
        <p className="text-xs mt-[1px] text-gray-300">
          Log in or <span className="text-blue-400 font-medium">sign up</span>{" "}
          to access your{" "}
          <span className="text-green-400 font-medium">dashboard</span>
        </p>
      </div>
      <div className="h-[76px]"></div>
      <div className="w-full max-w-md bg-[#1f1f1f] overflow-hidden">
        <div className="flex mb-6 px-4 pt-4 gap-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              isLogin
                ? "bg-gradient-to-r from-amber-600 to-red-700 text-white shadow-md"
                : "bg-[#2c2c2c] text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              !isLogin
                ? "bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-md"
                : "bg-[#2c2c2c] text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        <div className="px-4 pb-6">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
