import React from "react";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:3000/api";

const ProductCard = ({
  _id,
  title,
  image,
  price,
  originalPrice,
  onAddToCart,
  loading,
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ _id, title, price, image });
    }
  };

  return (
    <div className="group relative overflow-hidden bg-white rounded-lg">
      {/* Product Image */}
      <div className="relative w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="pt-4 pb-2 px-4">
        <h3 className="text-sm text-gray-800 mb-3 line-clamp-2 leading-relaxed">
          {title}
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg font-semibold text-gray-900">₹{price}</span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-sm">
              ₹{originalPrice}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="block text-center w-full py-2 px-4 rounded-md border-2 border-gray-600 text-gray-800 text-xs font-semibold hover:bg-gray-800 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // Generate or get session ID
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Add item to cart via API
  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product._id);
      const sessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "session-id": sessionId,
        },
        body: JSON.stringify({
          productId: product._id,
          qty: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      const data = await response.json();

      // Update cart count in navbar
      const totalItems = data.cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      window.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: { count: totalItems },
        })
      );

      console.log("Item added to cart successfully");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg animate-pulse">
              <div className="w-full h-96 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No products available
          </h3>
          <p className="text-gray-500">Check back later for new items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <ProductCard
            key={item._id}
            {...item}
            onAddToCart={handleAddToCart}
            loading={addingToCart === item._id}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
