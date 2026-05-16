"use client"

import { useState } from "react";
import { ShoppingBasket, Eye, EyeOff } from "lucide-react";
import { UserRole } from "../types";

 const roles: { key: string; label: string }[] = [
    { key: "customer", label: "Customer" },
    { key: "admin", label: "Admin" },
    { key: "delivery", label: "Delivery" },
  ];

export default function(){
  const [role, setRole] = useState(roles[0].key)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [error, setError] = useState("");
  //const [comingSoon, setComingSoon] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password !== passwordCheck){
      setError("The passwords don't match")
      return;
    }
    //save in local storage here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-200">
                <ShoppingBasket className="text-white" size={26} strokeWidth={2.5} />
              </div>
              <span className="text-3xl text-gray-900" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                QuickBasket
              </span>
            </div>
            <p className="text-center text-gray-500 text-sm mb-8">Your everyday marketplace</p>

            {/* Role selector */}
            <div className="flex rounded-2xl bg-gray-100 p-1 mb-6 gap-1">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                    role === r.key
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent pr-12 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Re-enter password</label>
                <div className="relative">
                  <input
                    type={showPasswordCheck ? "text" : "password"}
                    value={passwordCheck}
                    onChange={(e) => { setPasswordCheck(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent pr-12 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordCheck ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="text-sm text-gray-700 flex justify-end">
                <span>Don't have an account?</span>
                <button 
                  className="text-green-600 underline"
                  // onClick={() =>}
                  >
                    Sign up.
                    </button>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3.5 rounded-xl transition-colors shadow-lg shadow-green-200"
                style={{ fontWeight: 600 }}
              >
                Sign In
              </button>

              <p className="text-center text-xs text-gray-400 pt-1">
                By signing in you agree to our Terms & Privacy Policy
              </p>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 QuickBasket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
