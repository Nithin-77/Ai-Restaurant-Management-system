import { useEffect, useState } from "react";

import "./App.css";

import { getDashboard } from "./api";

import Menu from "./Menu";
import Orders from "./Orders";
import Reservations from "./Reservations";
import Customers from "./Customers";
import Inventory from "./Inventory";
import Kitchen from "./Kitchen";
import Revenue from "./Revenue";
import AIInsights from "./AIInsights";
import Settings from "./Settings";

function App() {
  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data =
        await getDashboard();

      setDashboard(data);
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (confirmed) {
      alert(
        "Logout functionality will be connected to authentication."
      );
    }
  };

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          

          <h2>
            Paradise
          </h2>

          <span>
            AI Restaurant
          </span>

        </div>

        <nav>

          <button
            className={
              currentPage === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            className={
              currentPage === "menu"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage("menu")
            }
          >
            Menu
          </button>

          <button
            className={
              currentPage === "orders"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage("orders")
            }
          >
            Orders
          </button>

          <button
            className={
              currentPage === "reservations"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "reservations"
              )
            }
          >
            Reservations
          </button>

          <button
            className={
              currentPage === "customers"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "customers"
              )
            }
          >
            Customers
          </button>

          <button
            className={
              currentPage === "inventory"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "inventory"
              )
            }
          >
            Inventory
          </button>

          <button
            className={
              currentPage === "kitchen"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "kitchen"
              )
            }
          >
            Kitchen
          </button>

          <button
            className={
              currentPage === "revenue"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "revenue"
              )
            }
          >
            Revenue & Analytics
          </button>

          <button
            className={
              currentPage === "ai"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage("ai")
            }
          >
            AI Insights
          </button>

          <button
            className={
              currentPage === "settings"
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentPage(
                "settings"
              )
            }
          >
            Settings
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </nav>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">
<div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

  <aside className="sidebar">

    {/* Your existing sidebar */}

  </aside>

  <main className="main-content">

    <button
      className="sidebar-toggle"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label="Toggle sidebar"
    >
      ☰
    </button>

    {/* Existing dashboard content */}

  </main>

</div>


        {/* DASHBOARD */}

        {currentPage ===
          "dashboard" && (
          <div className="page-container">

            <div className="page-header">

              <div>
                <h1>
                  Dashboard
                </h1>

                <p>
                  Paradise Restaurant
                  Management System
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={
                  loadDashboard
                }
              >
                Refresh
              </button>

            </div>

            {loading ? (
              <p>
                Loading dashboard...
              </p>
            ) : dashboard ? (
              <div className="stats-grid">

                <div className="stat-card">
                  <h3>
                    Menu Items
                  </h3>

                  <strong>
                    {dashboard.total_menu_items ??
                      dashboard.menu_items ??
                      0}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    Orders
                  </h3>

                  <strong>
                    {dashboard.total_orders ??
                      dashboard.orders ??
                      0}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    Reservations
                  </h3>

                  <strong>
                    {dashboard.total_reservations ??
                      dashboard.reservations ??
                      0}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    Customers
                  </h3>

                  <strong>
                    {dashboard.total_customers ??
                      dashboard.customers ??
                      0}
                  </strong>
                </div>

                <div className="stat-card">
                  <h3>
                    Revenue
                  </h3>

                  <strong>
                    ₹
                    {Number(
                      dashboard.total_revenue ??
                        dashboard.revenue ??
                        0
                    ).toFixed(2)}
                  </strong>
                </div>

              </div>
            ) : (
              <div className="empty-state">
                <h3>
                  Dashboard data unavailable
                </h3>

                <p>
                  Check that the FastAPI
                  backend is running.
                </p>
              </div>
            )}

          </div>
        )}

        {/* MENU */}

        {currentPage === "menu" && (
          <Menu />
        )}

        {/* ORDERS */}

        {currentPage === "orders" && (
          <Orders />
        )}

        {/* RESERVATIONS */}

        {currentPage ===
          "reservations" && (
          <Reservations />
        )}

        {/* CUSTOMERS */}

        {currentPage ===
          "customers" && (
          <Customers />
        )}

        {/* INVENTORY */}

        {currentPage ===
          "inventory" && (
          <Inventory />
        )}

        {/* KITCHEN */}

        {currentPage ===
          "kitchen" && (
          <Kitchen />
        )}

        {/* REVENUE */}

        {currentPage ===
          "revenue" && (
          <Revenue />
        )}

        {/* AI */}

        {currentPage === "ai" && (
          <AIInsights />
        )}

        {/* SETTINGS */}

        {currentPage ===
          "settings" && (
          <Settings />
        )}

      </main>

    </div>
  );
}

export default App;