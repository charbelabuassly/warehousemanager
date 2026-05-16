import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBasket } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove }: CartDrawerProps) {
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-green-600" />
            <h3 className="text-gray-900">Your Cart</h3>
            {itemCount > 0 && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBasket size={32} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm" style={{ fontWeight: 500 }}>Your cart is empty</p>
                <p className="text-gray-400 text-xs mt-1">Add some products to get started!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2 leading-snug" style={{ fontWeight: 500 }}>
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-green-700" style={{ fontWeight: 700 }}>
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-4 text-center" style={{ fontWeight: 600 }}>{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => onRemove(product.id)}
                          className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors ml-1"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600" style={{ fontWeight: 500 }}>Free</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-900" style={{ fontWeight: 600 }}>Total</span>
                <span className="text-gray-900" style={{ fontWeight: 700 }}>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl transition-colors shadow-lg shadow-green-200 text-sm" style={{ fontWeight: 600 }}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
