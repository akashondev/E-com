import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api";

export const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("session-id");
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("session-id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const sessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          "session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error("Error loading cart:", err);
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(productId);
      const sessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "session-id": sessionId,
        },
        body: JSON.stringify({ qty: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const data = await response.json();
      setCart(data.cart);

      const totalItems = data.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { count: totalItems } })
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const increaseQuantity = (item) => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(productId);
      const sessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "session-id": sessionId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const data = await response.json();
      setCart(data.cart);

      // Update navbar count
      const totalItems = data.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { count: totalItems } })
      );
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const sessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "session-id": sessionId,
        },
        body: JSON.stringify({
          cartItems: cart.items,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      const data = await response.json();

      // Prepare order summary for payment page
      const orderData = {
        receiptId: data.receipt?.receiptId || `R-${Date.now()}`,
        date: new Date().toISOString(),
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.total,
        tax: cart.total * 0.1,
        total: cart.total + cart.total * 0.1,
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          itemTotal: item.price * item.quantity,
        })),
      };

      localStorage.setItem("checkoutData", JSON.stringify(orderData));
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { count: 0 } })
      );

      window.location.href = "/payment";
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const cartItems = cart.items || [];
  const subtotal = cart.total || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 h-40"></div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500">
                  Start shopping to add items to your cart
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 bg-gray-100 rounded flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-2xl font-semibold text-gray-900 mb-4">
                          ₹{item.price}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              Quantity:
                            </span>
                            <div className="flex items-center gap-2 border rounded-lg">
                              <button
                                onClick={() => decreaseQuantity(item)}
                                disabled={
                                  updating === item.productId ||
                                  item.quantity <= 1
                                }
                                className="p-2 hover:bg-gray-100 rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item)}
                                disabled={updating === item.productId}
                                className="p-2 hover:bg-gray-100 rounded-r-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span>
                              {updating === item.productId
                                ? "Removing..."
                                : "Remove"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
