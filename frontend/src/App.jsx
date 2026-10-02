import { useEffect, useState } from "react";

import "./App.css";

import { getDashboard } from "./api";
import Auth from "./Auth";

import Menu from "./Menu";
import Orders from "./Orders";
import Reservations from "./Reservations";
import Customers from "./Customers";
import Inventory from "./Inventory";
import Kitchen from "./Kitchen";
import Revenue from "./Revenue";
import AIInsights from "./AIInsights";
import Reviews from "./Reviews";
import Suppliers from "./Suppliers";
import Staff from "./Staff";
import Waste from "./Waste";
import Settings from "./Settings";
import CustomerPortal from "./CustomerPortal";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("paradise_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [portalMode, setPortalMode] = useState(() => {
    const savedUser = localStorage.getItem("paradise_user");
    const parsed = savedUser ? JSON.parse(savedUser) : null;
    return parsed?.role === "customer" ? "customer" : "admin";
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAuthenticated = (authenticatedUser) => {
    localStorage.setItem("paradise_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    if (authenticatedUser?.role === "customer") {
      setPortalMode("customer");
    } else {
      setPortalMode("admin");
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && portalMode === "admin") loadDashboard();
  }, [user, portalMode]);

  const handleLogout = () => {
    localStorage.removeItem("paradise_user");
    setUser(null);
    setDashboard(null);
    setCurrentPage("dashboard");
    setPortalMode("admin");
  };

  if (!user) return <Auth onAuthenticated={handleAuthenticated} />;

  if (portalMode === "customer") {
    return (
      <CustomerPortal
        user={user}
        onSwitchToAdmin={() => setPortalMode("admin")}
      />
    );
  }


  const quickButtons = [
    { key: "dashboard", label: "Dashboard" },
    { key: "menu", label: "Menu" },
    { key: "orders", label: "Orders" },
  ];

  const navigationItems = [
    { key: "dashboard", label: "Dashboard", icon: "⌂" },
    { key: "menu", label: "Menu", icon: "◈" },
    { key: "orders", label: "Orders", icon: "▤" },
    { key: "reservations", label: "Reservations", icon: "◷" },
    { key: "customers", label: "Customers", icon: "◎" },
    { key: "inventory", label: "Inventory", icon: "▣" },
    { key: "kitchen", label: "Kitchen", icon: "✦" },
    { key: "revenue", label: "Revenue & Analytics", icon: "◒" },
    { key: "ai", label: "AI Insights", icon: "✧" },
    { key: "reviews", label: "Reviews", icon: "☆" },
    { key: "suppliers", label: "Suppliers", icon: "◇" },
    { key: "staff", label: "Staff", icon: "♙" },
    { key: "waste", label: "Waste", icon: "△" },
    { key: "settings", label: "Settings", icon: "⚙" },
  ];

  const handleQuickNav = (page) => {
    setCurrentPage(page);
    setSidebarOpen(true);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);

    if (window.innerWidth <= 700) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* =========================
          SIDEBAR
      ========================= */}

      <button
        type="button"
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close navigation"
      />

      <aside className="sidebar" aria-label="Restaurant navigation">
        <div className="sidebar-top-row">
          <div className="sidebar-brand">
            <h2>Paradise</h2>

            <span>AI Restaurant</span>
          </div>

          <button
            type="button"
            className="sidebar-mini-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        <div className="sidebar-portal-switch-box">
          <button
            type="button"
            className="portal-switch-btn"
            onClick={() => setPortalMode("customer")}
          >
            🍽️ Switch to Customer Portal
          </button>
        </div>

        <nav aria-label="Restaurant navigation">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={currentPage === item.key ? "active" : ""}
              onClick={() => handleNavigation(item.key)}
              title={item.label}
              aria-label={item.label}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <span className="nav-icon" aria-hidden="true">
              ↪
            </span>

            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">
        {/* Project Attribution Header */}
        <div className="admin-project-banner">
          <div className="project-banner-info">
            <span className="project-banner-tag">🎓 FINAL YEAR / CAPSTONE PROJECT</span>
            <strong className="project-banner-title">
              An Integrated AI-Powered Restaurant Management and Decision Support System
            </strong>
            <span className="project-banner-team">
              Team: 99240040668 - Y.Nithin | 99240040660 - N.Sasidharreddy | 99240040667 - N.Lakshmi Charan | 99240040659 - Y.Sri Sai Teja
            </span>
          </div>
          <button
            className="header-switch-customer-btn"
            onClick={() => setPortalMode("customer")}
          >
            🍽️ View Customer Experience Portal
          </button>
        </div>

        {/* DASHBOARD */}

        {currentPage === "dashboard" && (
          <div className="page-container dashboard-page">
            <div className="dashboard-hero">
              <div className="dashboard-hero-copy">
                <div className="dashboard-top-row">
                  <span className="eyebrow">Restaurant Decision Support</span>

                  <button
                    type="button"
                    className="sidebar-mini-toggle dashboard-toggle"
                    onClick={() => setSidebarOpen((open) => !open)}
                    aria-label="Toggle sidebar"
                  >
                    ☰
                  </button>
                </div>

                <h1>Paradise Dining Operations</h1>

                <p>
                  Centralized platform combining restaurant operations, kitchen KDS, AI predictions, and decision support.
                </p>

                <div className="dashboard-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setCurrentPage("ai")}
                  >
                    🤖 AI Decision Engine (6 Modules)
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => setPortalMode("customer")}
                  >
                    🍽️ Customer Experience Portal
                  </button>
                  {quickButtons.map((button) => (
                    <button
                      key={button.key}
                      className="secondary-btn"
                      onClick={() => handleQuickNav(button.key)}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>


              <div className="dashboard-hero-panel">
                <div className="hero-chip">
                  <span className="status-dot" />
                  Live service
                </div>

                <div className="hero-metric">
                  <strong>
                    ₹
                    {Number(
                      dashboard?.total_revenue ?? dashboard?.revenue ?? 0,
                    ).toFixed(2)}
                  </strong>

                  <span>Revenue this period</span>
                </div>

                <div className="mini-grid">
                  <div className="mini-metric">
                    <span>Orders</span>
                    <strong>{dashboard?.total_orders ?? 0}</strong>
                  </div>

                  <div className="mini-metric">
                    <span>Guests</span>
                    <strong>{dashboard?.total_users ?? 0}</strong>
                  </div>

                  <div className="mini-metric">
                    <span>Seats</span>
                    <strong>{dashboard?.total_reservations ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-panel">Loading dashboard...</div>
            ) : dashboard ? (
              <>
                <div className="stats-grid dashboard-stats">
                  <div className="stat-card">
                    <h3>Menu Items</h3>

                    <strong>
                      {dashboard.total_menu_items ?? dashboard.menu_items ?? 0}
                    </strong>

                    <small>+12% this month</small>
                  </div>

                  <div className="stat-card">
                    <h3>Orders</h3>

                    <strong>
                      {dashboard.total_orders ?? dashboard.orders ?? 0}
                    </strong>

                    <small>+8% vs last week</small>
                  </div>

                  <div className="stat-card">
                    <h3>Reservations</h3>

                    <strong>
                      {dashboard.total_reservations ??
                        dashboard.reservations ??
                        0}
                    </strong>

                    <small>Peak at 8:00 PM</small>
                  </div>

                  <div className="stat-card">
                    <h3>Customers</h3>

                    <strong>
                      {dashboard.total_users ??
                        dashboard.total_customers ??
                        dashboard.customers ??
                        0}
                    </strong>

                    <small>New loyalty growth</small>
                  </div>

                  <div className="stat-card">
                    <h3>Revenue</h3>

                    <strong>
                      ₹
                      {Number(
                        dashboard.total_revenue ?? dashboard.revenue ?? 0,
                      ).toFixed(2)}
                    </strong>

                    <small>Strong weekend trend</small>
                  </div>
                </div>

                <div className="dashboard-panels">
                  <div className="panel chart-panel">
                    <div className="panel-header">
                      <h2>Weekly sales</h2>
                      <span className="panel-tag success">+18.4%</span>
                    </div>

                    <div className="chart-heading">
                      <span>Revenue by day</span>
                      <strong>
                        ₹{Number(dashboard.total_revenue ?? 0).toFixed(2)}
                      </strong>
                    </div>

                    <div className="bar-chart" aria-label="Weekly sales chart">
                      {[52, 68, 85, 61, 93, 118, 96].map((value, index) => (
                        <div className="bar-column" key={index}>
                          <span
                            className="bar"
                            style={{ height: `${value}%` }}
                            title={`${value}% of weekly peak`}
                          />
                          <strong className="bar-value">{value}</strong>
                          <small>
                            {"SMTWTFS".charAt(index) === "S" && index === 0
                              ? "S"
                              : index === 6
                                ? "S"
                                : "SMTWTFS".charAt(index)}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel summary-panel">
                    <div className="panel-header">
                      <h2>Service snapshot</h2>
                    </div>

                    <div className="status-list">
                      <div className="status-item">
                        <span className="status-label">Prep time</span>
                        <strong>18 min</strong>
                      </div>

                      <div className="status-item">
                        <span className="status-label">Avg. ticket</span>
                        <strong>
                          ₹
                          {Number(
                            dashboard.total_revenue && dashboard.total_orders
                              ? dashboard.total_revenue / dashboard.total_orders
                              : 0,
                          ).toFixed(2)}
                        </strong>
                      </div>

                      <div className="status-item">
                        <span className="status-label">Kitchen load</span>
                        <strong>82%</strong>
                      </div>

                      <div className="status-item">
                        <span className="status-label">Guest rating</span>
                        <strong>4.8/5</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-panels lower-panels">
                  <div className="panel menu-panel">
                    <div className="panel-header">
                      <h2>Top dishes</h2>
                    </div>

                    <div className="dish-list">
                      {[
                        { name: "Chicken Biryani", price: 220, trend: "+24%" },
                        {
                          name: "Paneer Butter Masala",
                          price: 180,
                          trend: "+18%",
                        },
                        { name: "Masala Dosa", price: 90, trend: "+11%" },
                        { name: "Filter Coffee", price: 40, trend: "+9%" },
                      ].map((dish) => (
                        <div className="dish-item" key={dish.name}>
                          <div>
                            <strong>{dish.name}</strong>
                            <small>₹{dish.price}</small>
                          </div>

                          <span className="panel-tag success">
                            {dish.trend}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel operations-panel">
                    <div className="panel-header">
                      <h2>Operations</h2>
                    </div>

                    <div className="ops-list">
                      <div className="op-item">
                        <span className="op-title">Inventory watch</span>
                        <span className="op-value warn">Low stock alert</span>
                      </div>

                      <div className="op-item">
                        <span className="op-title">Staff coverage</span>
                        <span className="op-value good">On schedule</span>
                      </div>

                      <div className="op-item">
                        <span className="op-title">Waste trend</span>
                        <span className="op-value">-7% this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>Dashboard data unavailable</h3>

                <p>Check that the FastAPI backend is running.</p>
              </div>
            )}
          </div>
        )}

        {/* MENU */}

        {currentPage === "menu" && <Menu />}

        {/* ORDERS */}

        {currentPage === "orders" && <Orders />}

        {/* RESERVATIONS */}

        {currentPage === "reservations" && <Reservations />}

        {/* CUSTOMERS */}

        {currentPage === "customers" && <Customers />}

        {/* INVENTORY */}

        {currentPage === "inventory" && <Inventory />}

        {/* KITCHEN */}

        {currentPage === "kitchen" && <Kitchen />}

        {/* REVENUE */}

        {currentPage === "revenue" && <Revenue />}

        {/* AI */}

        {currentPage === "ai" && <AIInsights />}

        {/* REVIEWS */}

        {currentPage === "reviews" && <Reviews />}

        {/* SUPPLIERS */}

        {currentPage === "suppliers" && <Suppliers />}

        {/* STAFF */}

        {currentPage === "staff" && <Staff />}

        {/* WASTE */}

        {currentPage === "waste" && <Waste />}

        {/* SETTINGS */}

        {currentPage === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;
