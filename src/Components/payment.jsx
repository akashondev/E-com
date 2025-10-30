import React, { useState, useEffect } from "react";
import { CreditCard, X, Check } from "lucide-react";

// ✅ Receipt Modal
const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">Thank you for your purchase 🎉</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Receipt ID</span>
              <span className="font-medium text-gray-800">
                {receipt.receiptId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer</span>
              <span className="font-medium text-gray-800">
                {receipt.customerInfo.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-800">
                {receipt.customerInfo.email}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-800">
                {new Date(receipt.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-800">
                {new Date(receipt.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">
                  Total Amount
                </span>
                <span className="font-bold text-xl text-gray-900">
                  ₹{receipt.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            window.location.href = "/";
          }}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

// ✅ Main Payment Page
export default function PaymentPage() {
  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [receipt, setReceipt] = useState(null);

  // ✅ Load checkout data from localStorage
  useEffect(() => {
    const checkoutData = localStorage.getItem("checkoutData");
    if (checkoutData) {
      setCart(JSON.parse(checkoutData));
    } else {
      alert("No checkout data found. Redirecting to cart...");
      window.location.href = "/cart";
    }
  }, []);

  if (!cart) return <p className="text-center mt-20">Loading checkout...</p>;

  const subtotal = cart.subtotal || 0;
  const tax = cart.tax || subtotal * 0.1;
  const total = cart.total || subtotal + tax;

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.cardNumber.trim())
      newErrors.cardNumber = "Card number is required";
    else if (formData.cardNumber.replace(/\s/g, "").length !== 16)
      newErrors.cardNumber = "Must be 16 digits";
    if (!formData.expiryDate.trim())
      newErrors.expiryDate = "Expiry date required";
    else if (formData.expiryDate.length !== 5)
      newErrors.expiryDate = "Invalid expiry";
    if (!formData.cvv.trim()) newErrors.cvv = "CVV required";
    else if (formData.cvv.length !== 3) newErrors.cvv = "Must be 3 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Input Formatting
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cardNumber") {
      formatted = value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    } else if (name === "expiryDate") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2)
        formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
    } else if (name === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 3);
    }

    setFormData((p) => ({ ...p, [name]: formatted }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ✅ Submit Payment
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1500)); // simulate processing

      const receiptData = {
        receiptId: cart.receiptId,
        total,
        timestamp: new Date().toISOString(),
        items: cart.items,
        customerInfo: {
          name: formData.name,
          email: formData.email,
        },
      };

      setReceipt(receiptData);
      localStorage.removeItem("checkoutData");
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Payment Details
                </h2>
              </div>

              {/* Inputs */}
              {["name", "email", "cardNumber", "expiryDate", "cvv"].map(
                (field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field === "cvv"
                        ? "CVV"
                        : field === "expiryDate"
                        ? "Expiry Date"
                        : field === "cardNumber"
                        ? "Card Number"
                        : field === "email"
                        ? "Email Address"
                        : "Full Name"}
                    </label>
                    <input
                      type={
                        field === "email"
                          ? "email"
                          : field === "cvv"
                          ? "password"
                          : "text"
                      }
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none ${
                        errors[field] ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder={
                        field === "cardNumber"
                          ? "1234 5678 9012 3456"
                          : field === "expiryDate"
                          ? "MM/YY"
                          : ""
                      }
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition mt-6 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-gray-800 font-medium text-sm mt-1">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Receipt Modal */}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
