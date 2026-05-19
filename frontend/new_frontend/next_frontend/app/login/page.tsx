"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBasket, Eye, EyeOff, LogIn } from "lucide-react";
import api from "@/app/lib/api.js"
import Loading from "../components/Loading"

 const roles: { key: string; label: string }[] = [
    { key: "customer", label: "Customer" },
    { key: "admin", label: "Admin" },
    { key: "delivery", label: "Delivery" },
  ];

export default function(){
  // const [role, setRole] = useState(roles[0].key)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [error, setError] = useState("");
  //const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!email || !password) {
      setLoading(false)
      setError("Please enter your email and password.");
      return;
    }
    if (!isLogin){
      if (password !== passwordCheck){
        setLoading(false)
        setError("The passwords don't match")
        return;
      }
    }
    
    try {
      const endpoint = isLogin ? '/Access/login' : '/Access/signup';
      const payload = isLogin ? { email, password } : { 
        email, 
        password, 
        firstName, 
        lastName,
        address: { street, city, country }
      };
      console.log(endpoint)
      console.log(payload)
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if(data.role == 1)
        router.push("/store")
      else if (data.role == 2)
        router.push("/admin")
      else
        router.push("/delivery")
    } catch (err: any) {
        if (err.response?.data?.errors) {
          const validationErrors = Object.values(err.response.data.errors).flat() as string[];
          setError(validationErrors[0]);
        } else {
          setError(
            err.response?.data?.message ||
            err.response?.data?.Message ||
            'Authentication failed. Please check your credentials.'
          );
        }
    } finally {
      setLoading(false);
    }
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
            {/* <div className="flex rounded-2xl bg-gray-100 p-1 mb-6 gap-1">
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
            </div> */}
            {isLogin ? (
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

              <div className="text-sm text-gray-700 flex justify-end">
                <span>Don't have an account? </span>
                <button 
                  type="button"
                  className="
                    text-green-600 underline font-medium
                    transition-all duration-200
                    hover:text-green-700 
                    active:scale-95
                    hover:tracking-wide
                    cursor-pointer
                    pl-1
                   "
                  onClick={handleToggleMode} 
                  >
                    Sign up.
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              {loading && (
              <div className="fixed inset-0 w-screen h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                    
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>

                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800">
                        Processing...
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Please wait a moment
                      </p>
                    </div>

                  </div>
                </div>
              )}

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
            ) :
            (
              <>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      First Name
                    </label>

                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Last Name
                    </label>

                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">Street address</label>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />

                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              <div className="text-sm text-gray-700 flex justify-end">
                <span>Already have an account? </span>

                <button
                  type="button"
                  className="
                    text-green-600 underline font-medium
                    transition-all duration-200
                    hover:text-green-700
                    active:scale-95
                    hover:tracking-wide
                    cursor-pointer
                    pl-1
                  "
                  onClick={handleToggleMode}
                >
                  Sign in.
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              {loading && <Loading/>}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3.5 rounded-xl transition-colors shadow-lg shadow-green-200"
                style={{ fontWeight: 600 }}
              >
                Sign Up
              </button>
              </form>
              <p className="text-center text-xs text-gray-400 pt-1 mt-3">
                By signing in you agree to our Terms & Privacy Policy
              </p>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 QuickBasket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
