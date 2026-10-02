import React, { useState, useEffect } from "react";
import {
  getMenu,
  createOrder,
  getOrders,
  createReservation,
  getReservations,
  createReview,
  getReviews,
  getFoodRecommendations,
  getPopularDishes,
  classifySentiment,
} from "./api";

const dishImages = {
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
  "Mutton Biryani":
    "https://images.unsplash.com/photo-1604908176997-125e7c0d7f0f?auto=format&fit=crop&w=600&q=80",
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  "Veg Fried Rice":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
  "Masala Dosa":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
  "Idli Sambar":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
  "Chicken 65":
    "https://images.unsplash.com/photo-1604908556856-b7a6c479f62d?auto=format&fit=crop&w=600&q=80",
  "Gobi Manchurian":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
  "Gulab Jamun":
    "https://images.unsplash.com/photo-1601055654745-9f7d84fbb0d7?auto=format&fit=crop&w=600&q=80",
  "Filter Coffee":
    "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80",
};

const getDishImage = (name) => {
  return (
    dishImages[name] ||
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  );
};

const isVeg = (name, category) => {
  const nonVegKeywords = ["chicken", "mutton", "fish", "meat", "prawn", "egg"];
  const lower = (name + " " + (category || "")).toLowerCase();
  return !nonVegKeywords.some((kw) => lower.includes(kw));
};

function CustomerPortal({ user, onSwitchToAdmin }) {
  const [activeTab, setActiveTab] = useState("menu"); // menu, cart, tracking, reservations, reviews, loyalty
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState("all"); // all, veg, nonveg

  // Cart & Ordering
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in"); // dine-in, takeaway, delivery
  const [tableNumber, setTableNumber] = useState("4");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Live Orders
  const [myOrders, setMyOrders] = useState([]);

  // Reservations
  const [resForm, setResForm] = useState({
    table_number: 2,
    reservation_date: new Date().toISOString().split("T")[0],
    reservation_time: "19:30",
    guests: 2,
    special_request: "Window table if possible",
  });
  const [resSuccessMsg, setResSuccessMsg] = useState("");
  const [myReservations, setMyReservations] = useState([]);

  // Reviews & Sentiment
  const [reviewForm, setReviewForm] = useState({
    menu_item: "Chicken Biryani",
    rating: 5,
    comment: "The food was delicious, super fresh and served hot!",
  });
  const [liveSentiment, setLiveSentiment] = useState(null);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [recentReviews, setRecentReviews] = useState([]);

  // Loyalty
  const [loyaltyPoints, setLoyaltyPoints] = useState(380);

  const customerName = user?.name || "Nithin";

  useEffect(() => {
    loadInitialData();
  }, []);

  // Live sentiment analysis debounced
  useEffect(() => {
    if (!reviewForm.comment || reviewForm.comment.trim().length < 4) {
      setLiveSentiment(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await classifySentiment(reviewForm.comment);
        setLiveSentiment(res);
      } catch (e) {
        console.error("Live sentiment check error:", e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [reviewForm.comment]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [menuData, ordersData, recData, popData, reviewsData, reservationsData] =
        await Promise.allSettled([
          getMenu(),
          getOrders(),
          getFoodRecommendations(customerName, 4),
          getPopularDishes(4),
          getReviews(),
          getReservations(),
        ]);

      if (menuData.status === "fulfilled") setMenu(menuData.value || []);
      if (ordersData.status === "fulfilled") {
        const allOrders = ordersData.value || [];
        const userOrders = allOrders.filter(
          (o) =>
            o.customer_name?.toLowerCase() === customerName.toLowerCase() ||
            o.customer_name === "Nithin"
        );
        setMyOrders(userOrders.slice(0, 10));
      }
      if (recData.status === "fulfilled") {
        setRecommendations(recData.value?.recommendations || []);
      }
      if (popData.status === "fulfilled") {
        setPopularDishes(popData.value?.popular_dishes || []);
      }
      if (reviewsData.status === "fulfilled") {
        setRecentReviews(reviewsData.value || []);
      }
      if (reservationsData.status === "fulfilled") {
        const allRes = reservationsData.value || [];
        const userRes = allRes.filter(
          (r) =>
            r.customer_name?.toLowerCase() === customerName.toLowerCase() ||
            r.customer_name === "Nithin"
        );
        setMyReservations(userRes);
      }
    } catch (err) {
      console.error("Error loading customer portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartGrandTotal = Math.max(0, cartSubtotal + cartTax - loyaltyDiscount);

  // Submit Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setIsSubmittingOrder(true);
      setOrderSuccessMsg("");

      // Create orders for items in cart
      for (const item of cart) {
        await createOrder({
          customer_name: customerName,
          menu_item: item.name,
          quantity: item.quantity,
          total_price: Number(item.price) * item.quantity,
          status: "Pending",
        });
      }

      // Add loyalty points
      const pointsEarned = Math.floor(cartGrandTotal / 10);
      setLoyaltyPoints((prev) => prev + pointsEarned - loyaltyDiscount);

      setOrderSuccessMsg(
        `🎉 Order successfully placed! Kitchen has received your ticket. You earned +${pointsEarned} loyalty points!`
      );
      setCart([]);
      setLoyaltyDiscount(0);

      // Refresh orders
      const updatedOrders = await getOrders();
      setMyOrders(
        updatedOrders
          .filter(
            (o) =>
              o.customer_name?.toLowerCase() === customerName.toLowerCase() ||
              o.customer_name === "Nithin"
          )
          .slice(0, 10)
      );

      setTimeout(() => {
        setActiveTab("tracking");
      }, 1500);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Submit Reservation
  const handlePlaceReservation = async (e) => {
    e.preventDefault();
    try {
      setResSuccessMsg("");
      await createReservation({
        customer_name: customerName,
        table_number: Number(resForm.table_number),
        reservation_date: resForm.reservation_date,
        reservation_time: resForm.reservation_time,
        guests: Number(resForm.guests),
      });

      setResSuccessMsg("✨ Table reservation confirmed! We look forward to hosting you.");
      const updatedRes = await getReservations();
      setMyReservations(
        updatedRes.filter(
          (r) =>
            r.customer_name?.toLowerCase() === customerName.toLowerCase() ||
            r.customer_name === "Nithin"
        )
      );
    } catch (err) {
      console.error("Reservation error:", err);
      alert("Failed to create reservation.");
    }
  };

  // Submit Review
  const handlePlaceReview = async (e) => {
    e.preventDefault();
    try {
      setReviewSuccessMsg("");
      await createReview({
        customer_name: customerName,
        menu_item: reviewForm.menu_item,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setReviewSuccessMsg("🌟 Thank you! Your review and AI sentiment analysis were saved.");
      setReviewForm({
        menu_item: "Chicken Biryani",
        rating: 5,
        comment: "",
      });
      setLiveSentiment(null);

      const updatedReviews = await getReviews();
      setRecentReviews(updatedReviews);
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to submit review.");
    }
  };

  // Filter Menu
  const categories = ["All", ...new Set(menu.map((m) => m.category).filter(Boolean))];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const itemIsVeg = isVeg(item.name, item.category);
    const matchesDiet =
      dietFilter === "all" ||
      (dietFilter === "veg" && itemIsVeg) ||
      (dietFilter === "nonveg" && !itemIsVeg);
    return matchesCategory && matchesSearch && matchesDiet;
  });

  return (
    <div className="customer-portal">
      {/* =========================================================
          CUSTOMER HERO & ROLE BANNER
      ========================================================= */}
      <header className="customer-header">
        <div className="customer-header-inner">
          <div className="customer-brand">
            <div className="customer-logo-badge">P</div>
            <div>
              <h1>Paradise Bistro & Dining</h1>
              <p className="customer-subtitle">
                AI-Powered Smart Digital Dining & Guest Experience
              </p>
            </div>
          </div>

          <div className="customer-user-badge">
            <div className="user-profile-summary">
              <span className="user-avatar">👤</span>
              <div>
                <strong>{customerName}</strong>
                <span className="loyalty-pill">⭐ {loyaltyPoints} Points (Gold Tier)</span>
              </div>
            </div>

            <button
              className="admin-switch-btn"
              onClick={onSwitchToAdmin}
              title="Open the Admin & Management Decision Support System"
            >
              ⚙️ Switch to Admin Portal
            </button>
          </div>
        </div>

        {/* =========================================================
            NAVIGATION TABS (Slide 5: Customer Module Features)
        ========================================================= */}
        <nav className="customer-nav-tabs">
          <button
            className={activeTab === "menu" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("menu")}
          >
            🍽️ Digital Menu & AI Picks
          </button>
          <button
            className={activeTab === "cart" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("cart")}
          >
            🛒 Cart & Checkout {cartTotalItems > 0 && <span className="cart-badge">{cartTotalItems}</span>}
          </button>
          <button
            className={activeTab === "tracking" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("tracking")}
          >
            📍 Live Order Tracking {myOrders.length > 0 && <span className="info-badge">{myOrders.length}</span>}
          </button>
          <button
            className={activeTab === "reservations" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("reservations")}
          >
            📅 Table Reservation
          </button>
          <button
            className={activeTab === "reviews" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ Reviews & AI Sentiment
          </button>
          <button
            className={activeTab === "loyalty" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("loyalty")}
          >
            🎁 Loyalty & Rewards
          </button>
        </nav>
      </header>

      <main className="customer-content">
        {/* =========================================================
            1. DIGITAL MENU & AI RECOMMENDATIONS TAB
        ========================================================= */}
        {activeTab === "menu" && (
          <div className="menu-tab-view">
            {/* AI Recommendation Showcase */}
            {recommendations.length > 0 && (
              <section className="ai-recommendations-banner">
                <div className="ai-rec-header">
                  <div>
                    <span className="ai-kicker">🤖 PPT MODULE 1: AI RECOMMENDATION ENGINE</span>
                    <h2>Recommended For You, {customerName}</h2>
                    <p>
                      Personalized based on your past orders, category preference, and customer satisfaction ratings.
                    </p>
                  </div>
                  <div className="ai-badge-chip">
                    <span>✨ TF-IDF & Content-Based ML</span>
                  </div>
                </div>

                <div className="ai-rec-grid">
                  {recommendations.map((rec, idx) => (
                    <div className="ai-rec-card" key={idx}>
                      <div className="ai-rec-img-wrap">
                        <img
                          src={getDishImage(rec.menu_item)}
                          alt={rec.menu_item}
                          className="dish-photo"
                        />
                        <span className="ai-match-badge">
                          🎯 {Math.round((rec.score || 0.85) * 100)}% Match
                        </span>
                      </div>
                      <div className="ai-rec-body">
                        <div className="rec-title-row">
                          <h4>{rec.menu_item}</h4>
                          <span className="rec-price">₹{rec.price}</span>
                        </div>
                        <p className="rec-reason">💡 {rec.reason}</p>
                        <button
                          className="add-to-cart-btn-primary"
                          onClick={() =>
                            addToCart({
                              id: rec.id || idx + 100,
                              name: rec.menu_item,
                              price: rec.price,
                              category: rec.category,
                            })
                          }
                        >
                          + Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Search & Filter Controls */}
            <div className="menu-filters-panel">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search dishes, starters, desserts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="diet-toggles">
                <button
                  className={dietFilter === "all" ? "diet-chip active" : "diet-chip"}
                  onClick={() => setDietFilter("all")}
                >
                  All Items
                </button>
                <button
                  className={dietFilter === "veg" ? "diet-chip active veg" : "diet-chip veg"}
                  onClick={() => setDietFilter("veg")}
                >
                  🌱 Veg Only
                </button>
                <button
                  className={dietFilter === "nonveg" ? "diet-chip active nonveg" : "diet-chip nonveg"}
                  onClick={() => setDietFilter("nonveg")}
                >
                  🍗 Non-Veg
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="category-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? "cat-pill active" : "cat-pill"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Digital Menu Grid */}
            <div className="digital-menu-grid">
              {filteredMenu.map((item) => {
                const veg = isVeg(item.name, item.category);
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div className="menu-card" key={item.id}>
                    <div className="card-image-wrap">
                      <img
                        src={getDishImage(item.name)}
                        alt={item.name}
                        className="menu-card-img"
                        loading="lazy"
                      />
                      <span className={`diet-badge ${veg ? "veg" : "non-veg"}`}>
                        {veg ? "🌱 VEG" : "🍗 NON-VEG"}
                      </span>
                      {item.available === false && (
                        <span className="sold-out-overlay">Sold Out</span>
                      )}
                    </div>

                    <div className="menu-card-content">
                      <div className="card-header-row">
                        <h3>{item.name}</h3>
                        <span className="dish-price">₹{Number(item.price).toFixed(0)}</span>
                      </div>

                      <span className="dish-category">{item.category || "Special"}</span>

                      <div className="card-actions">
                        {inCart ? (
                          <div className="cart-stepper">
                            <button onClick={() => updateCartQty(item.id, -1)}>−</button>
                            <span>{inCart.quantity}</span>
                            <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                          </div>
                        ) : (
                          <button
                            className="add-btn"
                            disabled={item.available === false}
                            onClick={() => addToCart(item)}
                          >
                            {item.available === false ? "Unavailable" : "+ Add"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Cart Button */}
            {cartTotalItems > 0 && (
              <div className="floating-cart-bar">
                <div className="floating-cart-info">
                  <span className="count">{cartTotalItems} items</span>
                  <span className="divider">|</span>
                  <span className="price">₹{cartGrandTotal}</span>
                </div>
                <button
                  className="view-cart-btn"
                  onClick={() => setActiveTab("cart")}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            2. CART & ORDERING TAB
        ========================================================= */}
        {activeTab === "cart" && (
          <div className="cart-tab-view">
            <h2>🛒 Your Dining Cart & Order Placement</h2>
            <p className="section-desc">
              Review your selected delicacies, customize dining preference, and place order directly to the kitchen.
            </p>

            {orderSuccessMsg && (
              <div className="success-banner">{orderSuccessMsg}</div>
            )}

            {cart.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🍽️</span>
                <h3>Your cart is empty</h3>
                <p>Explore our AI-recommended dishes and digital menu to add items.</p>
                <button
                  className="primary-btn"
                  onClick={() => setActiveTab("menu")}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items-column">
                  <div className="cart-items-card">
                    <h3>Selected Items ({cartTotalItems})</h3>
                    {cart.map((item) => (
                      <div className="cart-row" key={item.id}>
                        <img
                          src={getDishImage(item.name)}
                          alt={item.name}
                          className="cart-thumb"
                        />
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <span className="cart-unit-price">
                            ₹{Number(item.price).toFixed(0)} each
                          </span>
                        </div>
                        <div className="cart-stepper">
                          <button onClick={() => updateCartQty(item.id, -1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                        </div>
                        <div className="cart-item-total">
                          ₹{Number(item.price) * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dining Options */}
                  <div className="dining-options-card">
                    <h3>Dining Preference</h3>
                    <div className="dining-mode-selector">
                      <label
                        className={orderType === "dine-in" ? "mode-radio active" : "mode-radio"}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          value="dine-in"
                          checked={orderType === "dine-in"}
                          onChange={(e) => setOrderType(e.target.value)}
                        />
                        <span>🍽️ Dine-In (Table Service)</span>
                      </label>
                      <label
                        className={orderType === "takeaway" ? "mode-radio active" : "mode-radio"}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          value="takeaway"
                          checked={orderType === "takeaway"}
                          onChange={(e) => setOrderType(e.target.value)}
                        />
                        <span>🥡 Takeaway (Pickup)</span>
                      </label>
                      <label
                        className={orderType === "delivery" ? "mode-radio active" : "mode-radio"}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          value="delivery"
                          checked={orderType === "delivery"}
                          onChange={(e) => setOrderType(e.target.value)}
                        />
                        <span>🛵 Home Delivery</span>
                      </label>
                    </div>

                    {orderType === "dine-in" && (
                      <div className="field-group">
                        <label>Select Table Number</label>
                        <select
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <option key={num} value={num}>
                              Table #{num} (Indoor Dining)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {orderType === "delivery" && (
                      <div className="field-group">
                        <label>Delivery Address</label>
                        <input
                          type="text"
                          placeholder="House/Street, Landmark, Area..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="field-group">
                      <label>Kitchen / Cooking Instructions (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Medium spice, extra sambar, cutlery requested"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary Checkout Card */}
                <div className="cart-summary-column">
                  <div className="summary-card">
                    <h3>Bill Summary</h3>
                    <div className="summary-line">
                      <span>Item Subtotal</span>
                      <strong>₹{cartSubtotal}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Restaurant Tax (GST 5%)</span>
                      <strong>₹{cartTax}</strong>
                    </div>

                    {loyaltyPoints >= 50 && (
                      <div className="loyalty-redemption-box">
                        <div className="loyalty-info">
                          <span>🎁 Available Loyalty Points: <strong>{loyaltyPoints}</strong></span>
                        </div>
                        {loyaltyDiscount === 0 ? (
                          <button
                            type="button"
                            className="redeem-btn"
                            onClick={() => setLoyaltyDiscount(Math.min(50, loyaltyPoints))}
                          >
                            Redeem ₹50 Voucher (50 Pts)
                          </button>
                        ) : (
                          <div className="discount-applied">
                            <span>Discount Applied: -₹{loyaltyDiscount}</span>
                            <button
                              type="button"
                              className="remove-discount-btn"
                              onClick={() => setLoyaltyDiscount(0)}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="summary-divider" />

                    <div className="summary-line total">
                      <span>Grand Total</span>
                      <strong>₹{cartGrandTotal}</strong>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={handlePlaceOrder}
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? "Routing to Kitchen..." : `Confirm & Place Order (₹${cartGrandTotal})`}
                    </button>

                    <p className="order-guarantee">
                      🔒 Live KDS integration: tickets immediately populate the kitchen display screen.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            3. LIVE ORDER TRACKING TAB
        ========================================================= */}
        {activeTab === "tracking" && (
          <div className="tracking-tab-view">
            <div className="section-title-row">
              <div>
                <h2>📍 Real-Time Order Tracking</h2>
                <p>Live status pipeline connected directly to our Kitchen Display System (KDS).</p>
              </div>
              <button className="secondary-btn" onClick={loadInitialData}>
                🔄 Refresh Status
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <h3>No active orders placed yet</h3>
                <p>Place an order from the digital menu to watch its live preparation lifecycle!</p>
                <button className="primary-btn" onClick={() => setActiveTab("menu")}>
                  Start Dining
                </button>
              </div>
            ) : (
              <div className="orders-timeline-grid">
                {myOrders.map((ord) => {
                  const status = ord.status || "Pending";
                  const stages = ["Pending", "Confirmed", "Preparing", "Ready", "Completed"];
                  const currentIndex = stages.indexOf(status) >= 0 ? stages.indexOf(status) : 1;

                  return (
                    <div className="order-track-card" key={ord.id}>
                      <div className="track-header">
                        <div>
                          <span className="order-tag">Order #{ord.id}</span>
                          <h3>{ord.menu_item}</h3>
                          <span className="order-meta">
                            Qty: {ord.quantity} | Total: ₹{ord.total_price} | Customer: {ord.customer_name}
                          </span>
                        </div>
                        <div className={`status-pill ${status.toLowerCase()}`}>
                          {status}
                        </div>
                      </div>

                      {/* Visual Stepper */}
                      <div className="stepper-track">
                        <div className={`step-item ${currentIndex >= 0 ? "active" : ""}`}>
                          <div className="step-circle">1</div>
                          <span className="step-label">Placed</span>
                        </div>
                        <div className={`step-line ${currentIndex >= 1 ? "active" : ""}`} />
                        <div className={`step-item ${currentIndex >= 1 ? "active" : ""}`}>
                          <div className="step-circle">2</div>
                          <span className="step-label">Confirmed</span>
                        </div>
                        <div className={`step-line ${currentIndex >= 2 ? "active" : ""}`} />
                        <div className={`step-item ${currentIndex >= 2 ? "active" : ""}`}>
                          <div className="step-circle">3</div>
                          <span className="step-label">Kitchen Prep</span>
                        </div>
                        <div className={`step-line ${currentIndex >= 3 ? "active" : ""}`} />
                        <div className={`step-item ${currentIndex >= 3 ? "active" : ""}`}>
                          <div className="step-circle">4</div>
                          <span className="step-label">Ready / Served</span>
                        </div>
                      </div>

                      <div className="tracker-footer">
                        {status === "Preparing" && (
                          <div className="live-prep-indicator">
                            <span className="flame-icon">🔥</span>
                            <span>Chef is preparing this dish now (~8-12 mins)</span>
                          </div>
                        )}
                        {status === "Ready" && (
                          <div className="live-ready-indicator">
                            <span>🔔 Ready for service! Server is delivering to your table.</span>
                          </div>
                        )}
                        {status === "Completed" && (
                          <div className="live-completed-indicator">
                            <span>✅ Served & Completed. Enjoy your meal!</span>
                          </div>
                        )}
                        {status === "Pending" && (
                          <div className="live-pending-indicator">
                            <span>⏳ Queued in system, kitchen will confirm shortly.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            4. TABLE RESERVATION TAB
        ========================================================= */}
        {activeTab === "reservations" && (
          <div className="reservation-tab-view">
            <div className="reservation-layout">
              <div className="reservation-form-column">
                <h2>📅 Book a Table Reservation</h2>
                <p>
                  Reserve your table in advance with instant digital confirmation.
                </p>

                {resSuccessMsg && (
                  <div className="success-banner">{resSuccessMsg}</div>
                )}

                <form onSubmit={handlePlaceReservation} className="res-card-form">
                  <div className="form-row">
                    <div className="field-group">
                      <label>Guest Name</label>
                      <input
                        type="text"
                        value={customerName}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                    <div className="field-group">
                      <label>Party Size (Number of Guests)</label>
                      <select
                        value={resForm.guests}
                        onChange={(e) =>
                          setResForm({ ...resForm, guests: Number(e.target.value) })
                        }
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                          <option key={g} value={g}>
                            {g} {g === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label>Reservation Date</label>
                      <input
                        type="date"
                        value={resForm.reservation_date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setResForm({ ...resForm, reservation_date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Time Slot</label>
                      <select
                        value={resForm.reservation_time}
                        onChange={(e) =>
                          setResForm({ ...resForm, reservation_time: e.target.value })
                        }
                      >
                        <option value="12:30">12:30 PM (Lunch)</option>
                        <option value="13:30">01:30 PM (Lunch)</option>
                        <option value="14:00">02:00 PM (Lunch)</option>
                        <option value="19:00">07:00 PM (Dinner)</option>
                        <option value="19:30">07:30 PM (Dinner)</option>
                        <option value="20:30">08:30 PM (Dinner)</option>
                        <option value="21:15">09:15 PM (Late Dinner)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label>Preferred Table Area</label>
                      <select
                        value={resForm.table_number}
                        onChange={(e) =>
                          setResForm({ ...resForm, table_number: Number(e.target.value) })
                        }
                      >
                        <option value={2}>Table #2 (Window View)</option>
                        <option value={4}>Table #4 (Center Garden)</option>
                        <option value={6}>Table #6 (Private Booth)</option>
                        <option value={8}>Table #8 (Family Long Table)</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Special Requests</label>
                      <input
                        type="text"
                        placeholder="e.g. Birthday celebration, High chair"
                        value={resForm.special_request}
                        onChange={(e) =>
                          setResForm({ ...resForm, special_request: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button type="submit" className="primary-btn submit-btn">
                    Confirm Reservation
                  </button>
                </form>
              </div>

              {/* My Reservations List */}
              <div className="reservations-list-column">
                <h3>Your Active Reservations ({myReservations.length})</h3>
                {myReservations.length === 0 ? (
                  <p className="subtle-text">No previous bookings found. Book one now!</p>
                ) : (
                  <div className="res-cards-list">
                    {myReservations.map((res) => (
                      <div className="res-pass-card" key={res.id}>
                        <div className="pass-header">
                          <span className="pass-brand">PARADISE DINING PASS</span>
                          <span className="pass-status">Confirmed</span>
                        </div>
                        <div className="pass-body">
                          <div>
                            <span className="pass-label">Date</span>
                            <strong>{res.reservation_date}</strong>
                          </div>
                          <div>
                            <span className="pass-label">Time</span>
                            <strong>{res.reservation_time}</strong>
                          </div>
                          <div>
                            <span className="pass-label">Table</span>
                            <strong>#{res.table_number}</strong>
                          </div>
                          <div>
                            <span className="pass-label">Guests</span>
                            <strong>{res.guests}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. FEEDBACK & REAL-TIME AI SENTIMENT TAB
        ========================================================= */}
        {activeTab === "reviews" && (
          <div className="reviews-tab-view">
            <div className="reviews-layout">
              <div className="review-form-column">
                <div className="ai-module-badge">
                  <span>🤖 PPT MODULE 2: REAL-TIME NLP SENTIMENT ANALYSIS</span>
                </div>
                <h2>Feedback & Customer Reviews</h2>
                <p>
                  Share your dining experience. As you type, our Natural Language Processing model evaluates your feedback sentiment in real-time.
                </p>

                {reviewSuccessMsg && (
                  <div className="success-banner">{reviewSuccessMsg}</div>
                )}

                <form onSubmit={handlePlaceReview} className="review-form-card">
                  <div className="field-group">
                    <label>Menu Item / Experience</label>
                    <select
                      value={reviewForm.menu_item}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, menu_item: e.target.value })
                      }
                    >
                      {menu.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.category})
                        </option>
                      ))}
                      <option value="Overall Experience">Overall Restaurant Experience</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Rating (1 to 5 Stars)</label>
                    <div className="star-picker">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={reviewForm.rating >= star ? "star-btn active" : "star-btn"}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          ★
                        </button>
                      ))}
                      <span className="star-rating-text">{reviewForm.rating} of 5 Stars</span>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Your Review & Comments</label>
                    <textarea
                      rows="4"
                      placeholder="Write your honest thoughts about taste, speed, service, or freshness..."
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Real-Time Sentiment Feedback Box */}
                  {liveSentiment && (
                    <div className={`live-sentiment-box ${liveSentiment.sentiment.toLowerCase()}`}>
                      <div className="sentiment-box-header">
                        <span className="ai-chip-tag">⚡ Live AI Sentiment Detection</span>
                        <strong className="sentiment-result-text">
                          {liveSentiment.sentiment === "Positive"
                            ? "Positive 😊"
                            : liveSentiment.sentiment === "Negative"
                            ? "Negative 🙁"
                            : "Neutral 😐"}
                        </strong>
                      </div>
                      <p className="sentiment-detail-text">
                        Sentiment Score: <strong>{Number(liveSentiment.score).toFixed(2)}</strong> |
                        Confidence: <strong>{Math.round(Math.abs(liveSentiment.score) * 100)}%</strong>
                      </p>
                    </div>
                  )}

                  <button type="submit" className="primary-btn submit-btn">
                    Submit Verified Review
                  </button>
                </form>
              </div>

              {/* Feed of Recent Reviews */}
              <div className="reviews-feed-column">
                <h3>Customer Reviews Feed ({recentReviews.length})</h3>
                <div className="reviews-scroll-list">
                  {recentReviews.slice(0, 8).map((rev) => (
                    <div className="review-item-card" key={rev.id}>
                      <div className="rev-head">
                        <div>
                          <strong>{rev.customer_name}</strong>
                          <span className="rev-dish-tag">{rev.menu_item}</span>
                        </div>
                        <div className="rev-stars">
                          {"★".repeat(rev.rating || 5)}
                          <span className={`sentiment-badge-sm ${(rev.sentiment || "neutral").toLowerCase()}`}>
                            {rev.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="rev-comment">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            6. LOYALTY & REWARDS TAB
        ========================================================= */}
        {activeTab === "loyalty" && (
          <div className="loyalty-tab-view">
            <h2>🎁 Guest Loyalty & Rewards Program</h2>
            <p className="section-desc">
              Earn 10 points for every ₹100 spent. Redeem points directly for instant bill discounts and free delicacies!
            </p>

            <div className="loyalty-hero-card">
              <div className="loyalty-balance-stat">
                <span className="kicker">Available Rewards Balance</span>
                <h1 className="points-display">{loyaltyPoints} <span>Points</span></h1>
                <p className="equiv-text">Equivalent to ₹{loyaltyPoints} discount value</p>
              </div>

              <div className="tier-progress-card">
                <div className="tier-header">
                  <span>Current Status: <strong>Gold VIP Member</strong></span>
                  <span>Next Tier: <strong>Platinum (600 Pts)</strong></span>
                </div>
                <div className="tier-bar-track">
                  <div
                    className="tier-bar-fill"
                    style={{ width: `${Math.min(100, (loyaltyPoints / 600) * 100)}%` }}
                  />
                </div>
                <p className="tier-perks">
                  ✨ Perks: 10% faster table seating, priority weekend reservations, and exclusive chef tastings.
                </p>
              </div>
            </div>

            <h3 className="rewards-section-title">Redeemable Rewards Vouchers</h3>
            <div className="rewards-vouchers-grid">
              <div className="voucher-card">
                <div className="voucher-icon">🍗</div>
                <h4>₹50 Off Biryani Feast</h4>
                <p>Get ₹50 off on any Chicken or Mutton Biryani order.</p>
                <div className="voucher-footer">
                  <span className="pts-cost">50 Points</span>
                  <button
                    className="redeem-action-btn"
                    disabled={loyaltyPoints < 50}
                    onClick={() => {
                      setLoyaltyDiscount(50);
                      setActiveTab("cart");
                    }}
                  >
                    Apply in Cart
                  </button>
                </div>
              </div>

              <div className="voucher-card">
                <div className="voucher-icon">☕</div>
                <h4>Free Filter Coffee</h4>
                <p>Enjoy an authentic piping hot South Indian Filter Coffee.</p>
                <div className="voucher-footer">
                  <span className="pts-cost">40 Points</span>
                  <button
                    className="redeem-action-btn"
                    disabled={loyaltyPoints < 40}
                    onClick={() => {
                      setLoyaltyDiscount(40);
                      setActiveTab("cart");
                    }}
                  >
                    Apply in Cart
                  </button>
                </div>
              </div>

              <div className="voucher-card">
                <div className="voucher-icon">🍯</div>
                <h4>Free Gulab Jamun Dessert</h4>
                <p>Two warm melt-in-the-mouth gulab jamuns with your meal.</p>
                <div className="voucher-footer">
                  <span className="pts-cost">70 Points</span>
                  <button
                    className="redeem-action-btn"
                    disabled={loyaltyPoints < 70}
                    onClick={() => {
                      setLoyaltyDiscount(70);
                      setActiveTab("cart");
                    }}
                  >
                    Apply in Cart
                  </button>
                </div>
              </div>

              <div className="voucher-card">
                <div className="voucher-icon">👑</div>
                <h4>15% Weekend VIP Discount</h4>
                <p>Exclusive 15% reduction on your entire family table bill.</p>
                <div className="voucher-footer">
                  <span className="pts-cost">150 Points</span>
                  <button
                    className="redeem-action-btn"
                    disabled={loyaltyPoints < 150}
                    onClick={() => {
                      setLoyaltyDiscount(150);
                      setActiveTab("cart");
                    }}
                  >
                    Apply in Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Presentation Credits */}
      <footer className="customer-footer">
        <div className="footer-credits">
          <strong>An Integrated AI-Powered Restaurant Management and Decision Support System</strong>
          <span>
            Team Members: 99240040668 - Y.Nithin | 99240040660 - N.Sasidharreddy | 99240040667 - N.Lakshmi Charan | 99240040659 - Y.Sri Sai Teja
          </span>
        </div>
      </footer>
    </div>
  );
}

export default CustomerPortal;
