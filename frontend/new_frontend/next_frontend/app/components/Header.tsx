import { useState, useRef, useEffect } from "react";
import { ShoppingBasket, Search, ShoppingCart, User, LogOut, ChevronDown, X } from "lucide-react";
import { CartItem } from "../types";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: String;
  cartItems: CartItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCartOpen: () => void;
}

export function Header({ userName, cartItems, searchQuery, onSearchChange, onCartOpen }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  function LogOutClicked() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/")
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-green-600 p-2 rounded-xl">
            <ShoppingBasket className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl text-gray-900 hidden sm:block" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            QuickBasket
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-auto relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:bg-white focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-200 text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={20} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ fontWeight: 700, fontSize: "10px" }}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm" style={{ fontWeight: 600 }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 hidden sm:block" style={{ fontWeight: 500 }}>
                {userName}
              </span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{userName}</p>
                  <p className="text-xs text-gray-500">Customer account</p>
                </div>
                <button
                  onClick={ LogOutClicked }
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
