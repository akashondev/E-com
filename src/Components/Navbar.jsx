import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";


export const Navbar = () => {

  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.count);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    // localStorage.removeItem("cart");
    setCartCount(0);

    // Initialize cart count
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const count = Object.values(cart).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setCartCount(count);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  return (
    <nav className="bg-black stiky text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">MyShop</span>
        </div>
        <ul className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-300">
            About
          </Link>
        </ul>
        <div className="relative">
          <Link to="/cart">
            <ShoppingCart className="w-6 h-6 cursor-pointer" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};
