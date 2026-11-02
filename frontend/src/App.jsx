import { Suspense, lazy, useEffect, useState } from "react";

import "./App.css";

import {
  getCurrentUser,
  getDashboard,
  getTopDishes,
  getWeeklyRevenue,
  getPublicSettings,
  getAdminSettlementSummary,
  getLowStock,
  getTodayAnalytics,
  setSessionExpiredHandler,
  clearStoredSession,
} from "./api";
import { formatMoney, setCurrency } from "./money";
import AppShell from "./AppShell";

// The sign-in form itself now lives inside the public site's modal
// (components/AuthPanel.jsx), which wraps this same component. App.jsx
// no longer renders it directly.

import Landing from "./Landing";

// ---------------------------------------------------------------------------
// CODE SPLITTING
//
// A public visitor needs the landing page and the menu. They do not need
// the 130 KB customer portal, the admin order manager, or the two AI
// dashboards - together those were most of the bundle.
//
// Every authenticated surface is therefore loaded on demand. A first paint
// for a guest now costs the landing chunk alone, and the admin bundle is
// fetched when an admin actually opens the app.
//
// Nothing about behaviour changes: React.lazy renders the same component,
// just later. `Suspense` below covers the gap.
// ---------------------------------------------------------------------------
const Menu = lazy(() => import("./Menu"));
const Orders = lazy(() => import("./Orders"));
const Reservations = lazy(() => import("./Reservations"));
const Customers = lazy(() => import("./Customers"));
const Inventory = lazy(() => import("./Inventory"));
const Kitchen = lazy(() => import("./Kitchen"));
const Revenue = lazy(() => import("./Revenue"));
const AIInsights = lazy(() => import("./AIInsights"));
const AIChartBoard = lazy(() => import("./AIChartBoard"));
const Reviews = lazy(() => import("./Reviews"));
const Suppliers = lazy(() => import("./Suppliers"));
const Staff = lazy(() => import("./Staff"));
const Waste = lazy(() => import("./Waste"));
const Settings = lazy(() => import("./Settings"));
const Tables = lazy(() => import("./Tables"));
const CustomerEntry = lazy(() => import("./CustomerEntry"));
const CustomerPortal = lazy(() => import("./CustomerPortal"));

// `PaymentsAndBills` is a named export of Orders.jsx, so it needs its own
// lazy wrapper rather than riding along on the default import.
const PaymentsAndBills = lazy(() =>
  import("./Orders").then((module) => ({ default: module.PaymentsAndBills })),
);

/** Shown while a lazily-loaded surface is being fetched. */
function PortalFallback({ label = "Loading" }) {
  return (
    <div className="app-loading" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <p>{label}…</p>
    </div>
  );
}

// The customer entry page is reached by scanning a printed table QR.
// The project has no router, so the path is read directly - Vite's SPA
// fallback already serves index.html for /customer/entry, which means a
// phone camera can open it.
const CUSTOMER_ENTRY_PATH = "/customer/entry";

const isCustomerEntryPath = () =>
  window.location.pathname.replace(/\/+$/, "") === CUSTOMER_ENTRY_PATH;

/* ============================================================================
   ADMIN NAVIGATION AND PAGE HEADINGS

   Grouped rather than one long column, because seventeen unlabelled rows
   read as a settings dump and six named groups read as a room. The heading
   copy follows one shape everywhere - a small gold eyebrow, a display
   title, one line of context - so moving between pages never changes the
   way the page introduces itself.
   ========================================================================= */

const ADMIN_NAV = [
  {
    key: "dashboard",
    label: "Command Center",
    description: "Tonight at a glance",
    icon: "overview",
    group: "Service",
  },
  {
    key: "orders",
    label: "Orders",
    description: "Every order in the room",
    icon: "orders",
    group: "Service",
  },
  {
    key: "kitchen",
    label: "Kitchen",
    description: "The production queue",
    icon: "chef",
    group: "Service",
  },
  {
    key: "tables",
    label: "Tables & QR",
    description: "Floor plan and table codes",
    icon: "table",
    group: "Service",
  },
  {
    key: "menu",
    label: "Menu",
    description: "Dishes, prices, availability",
    icon: "menu",
    group: "Menu & Guests",
  },
  {
    key: "reservations",
    label: "Reservations",
    description: "Bookings and table holds",
    icon: "calendar",
    group: "Menu & Guests",
  },
  {
    key: "customers",
    label: "Customers",
    description: "Guest records and history",
    icon: "users",
    group: "Menu & Guests",
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Guest feedback",
    icon: "star",
    group: "Menu & Guests",
  },
  {
    key: "payments",
    label: "Payments & Bills",
    description: "Bills, settlement, reconciliation",
    icon: "coin",
    group: "Finance",
  },
  {
    key: "revenue",
    label: "Revenue",
    description: "Sales performance",
    icon: "trend",
    group: "Finance",
  },
  {
    key: "ai-board",
    label: "AI Analytics",
    description: "Charts and the assistant",
    icon: "chart",
    group: "Intelligence",
  },
  {
    key: "ai",
    label: "AI Insights",
    description: "Forecasts, pricing, sentiment",
    icon: "spark",
    group: "Intelligence",
  },
  {
    key: "waste",
    label: "Waste",
    description: "Loss and spoilage",
    icon: "leaf",
    group: "Intelligence",
  },
  {
    key: "inventory",
    label: "Inventory",
    description: "Stock, suppliers, thresholds",
    icon: "box",
    group: "Supply",
  },
  {
    key: "suppliers",
    label: "Suppliers",
    description: "Vendor records",
    icon: "truck",
    group: "Supply",
  },
  {
    key: "staff",
    label: "Staff",
    description: "Roster and roles",
    icon: "users",
    group: "Supply",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Restaurant configuration",
    icon: "gear",
    group: "Restaurant",
  },
];

const ADMIN_PAGES = {
  dashboard: {
    eyebrow: "Paradise Intelligence",
    title: "Command Center",
    subtitle:
      "Tonight at a glance - the pass, the floor and the till in one place.",
  },
  orders: {
    eyebrow: "Service",
    title: "Orders",
    subtitle: "Every order in the room, and where it is in the kitchen.",
  },
  kitchen: {
    eyebrow: "The Pass",
    title: "Kitchen",
    subtitle: "The production queue, from placed to served.",
  },
  tables: {
    eyebrow: "The Room",
    title: "Tables & QR",
    subtitle: "The floor plan, and the code printed on every table.",
  },
  menu: {
    eyebrow: "Menu & Guests",
    title: "The Menu",
    subtitle:
      "Every dish, its price, and whether it can be ordered right now.",
  },
  reservations: {
    eyebrow: "Menu & Guests",
    title: "Reservations",
    subtitle: "Bookings, table holds and covers.",
  },
  customers: {
    eyebrow: "Menu & Guests",
    title: "Customers",
    subtitle: "Guest records and their history with the restaurant.",
  },
  reviews: {
    eyebrow: "Menu & Guests",
    title: "Reviews",
    subtitle: "What guests said, and how it reads.",
  },
  payments: {
    eyebrow: "Finance",
    title: "Payments & Bills",
    subtitle:
      "What was billed, what has been collected, and what is still owed.",
  },
  revenue: {
    eyebrow: "Finance",
    title: "Revenue",
    subtitle: "How the period is performing.",
  },
  "ai-board": {
    eyebrow: "Paradise Intelligence",
    title: "AI Analytics",
    subtitle: "Ask a question of the restaurant, or read the charts.",
  },
  ai: {
    eyebrow: "Paradise Intelligence",
    title: "AI Insights",
    subtitle: "Forecasts, pricing suggestions and guest sentiment.",
  },
  waste: {
    eyebrow: "Paradise Intelligence",
    title: "Waste",
    subtitle: "What was lost, and what is worth changing.",
  },
  inventory: {
    eyebrow: "Supply",
    title: "Inventory",
    subtitle: "Stock on hand, and what is running low.",
  },
  suppliers: {
    eyebrow: "Supply",
    title: "Suppliers",
    subtitle: "Who the restaurant buys from.",
  },
  staff: {
    eyebrow: "Supply",
    title: "Staff",
    subtitle: "Who is on, and who owns what.",
  },
  settings: {
    eyebrow: "Restaurant",
    title: "Settings",
    subtitle: "How the restaurant is configured.",
  },
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("restaurant_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);

  // Real figures from GET /api/dashboard/top-dishes.
  const [topDishes, setTopDishes] = useState([]);

  // Real 7-day revenue series for the dashboard chart.
  const [weekly, setWeekly] = useState(null);

  // Outstanding is a real figure from the settlement summary, and the stock
  // alert count comes from the low-stock list. Neither is estimated here: if
  // the call fails the figure is left undefined and the card says so.
  const [outstanding, setOutstanding] = useState(undefined);
  const [lowStockCount, setLowStockCount] = useState(undefined);

  // Today's detailed analytics for the command center
  const [todayAnalytics, setTodayAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [verifyingSession, setVerifyingSession] = useState(
    () => Boolean(localStorage.getItem("restaurant_token"))
  );

  // The signed-in role decides the portal, and the two portals are
  // completely separate - there is no way to cross from one to the other.
  const isCustomer = user?.role === "customer";

  const handleAuthenticated = (authenticatedUser) => {
    localStorage.setItem("restaurant_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const loadDashboard = async () => {
    try {
      const [data, dishes, weeklyData, todayData] = await Promise.all([
        getDashboard(),
        getTopDishes(4),
        getWeeklyRevenue(7),
        getTodayAnalytics(),
      ]);

      setDashboard(data);
      setTopDishes(dishes?.top_dishes || []);
      setWeekly(weeklyData);
      setTodayAnalytics(todayData);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }

    // Two more figures for the command centre, each in its own request so a
    // failure here cannot take the rest of the dashboard down with it.
    getAdminSettlementSummary("last_30_days")
      .then((summary) => {
        setOutstanding(summary?.outstanding ?? undefined);
      })
      .catch((error) => {
        console.error("Settlement summary error:", error);
      });

    getLowStock()
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : (data?.items || data?.low_stock || []);

        setLowStockCount(items.length);
      })
      .catch((error) => {
        console.error("Low stock error:", error);
      });
  };

  // A 401 anywhere in the app drops the guest back to the login page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearStoredSession();
      setUser(null);
      setDashboard(null);
      setCurrentPage("dashboard");
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  // The role used to pick a portal always comes back from the server.
  // A cached role in localStorage is never trusted on its own, so a
  // deactivated account or a changed role cannot keep its old view.
  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");

    // Without a token the lazy initialiser already left
    // verifyingSession false, so there is nothing to update here.
    if (!token) {
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const { user: confirmed } = await getCurrentUser();

        if (cancelled) return;

        localStorage.setItem(
          "restaurant_user",
          JSON.stringify(confirmed)
        );
        setUser(confirmed);
      } catch (error) {
        if (cancelled) return;

        // /auth/me answered 401, so the interceptor already cleared
        // the session; anything else (backend down) leaves the cached
        // user in place rather than logging them out.
        if (error.response?.status !== 401) {
          console.error("Session check failed:", error);
        }
      } finally {
        if (!cancelled) {
          setVerifyingSession(false);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user && !isCustomer) loadDashboard();
  }, [user, isCustomer]);

// Take the display currency from the backend settings row, so the
// symbol on screen follows the database rather than a hardcoded
// literal. Formatter only; it never decides an amount. The public
// endpoint needs no token, so guests and customers both get it.
  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        if (settings?.currency) {
          setCurrency(settings.currency);
        }
      })
      .catch(() => {
        // Public settings unavailable; currency stays at its default.
      });
  }, []);

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    setDashboard(null);
    setCurrentPage("dashboard");
  };

  if (verifyingSession) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Restoring your session…</p>
      </div>
    );
  }

  if (!user)
    // Not signed in. A scanned table QR still leads to the entry page -
    // that path is checked first - and everything else leads to the public
    // site, which carries its own sign-in panel.
    return isCustomerEntryPath() ? (
      <Suspense fallback={<PortalFallback label="Opening the table" />}>
        <CustomerEntry
          user={user}
          onAuthenticated={handleAuthenticated}
        />
      </Suspense>
    ) : (
      <Landing
        user={null}
        onAuthenticated={handleAuthenticated}
      />
    );

  // Scanned a table QR. Checked before the role split, so an existing
  // customer who scans a code is offered "Continue to Table N" instead of
  // being dropped into the portal with no idea which table they are at.
  if (isCustomerEntryPath()) {
    return (
      <Suspense fallback={<PortalFallback label="Opening the table" />}>
        <CustomerEntry
          user={user}
          onAuthenticated={handleAuthenticated}
        />
      </Suspense>
    );
  }

  if (isCustomer) {
    return (
      <Suspense fallback={<PortalFallback label="Opening your menu" />}>
        <CustomerPortal user={user} onLogout={handleLogout} />
      </Suspense>
    );
  }


  const quickButtons = [
    { key: "orders", label: "Open orders" },
    { key: "kitchen", label: "Open the pass" },
  ];

  // The page heading comes from the same table the sidebar is built from, so
  // the title can never describe a different page than the one on screen.
  const activePage = ADMIN_PAGES[currentPage] || ADMIN_PAGES.dashboard;

  return (
    <AppShell
      user={user}
      role="admin"
      navItems={ADMIN_NAV}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      sectionLabel="Command Center"
      pageEyebrow={activePage.eyebrow}
      pageTitle={activePage.title}
      pageSubtitle={activePage.subtitle}
    >
      {/* =========================
          MAIN CONTENT
      ========================= */}
        {/* DASHBOARD */}

        {currentPage === "dashboard" && (
          <div className="dashboard-page">
            <div className="dashboard-hero">
              <div className="dashboard-hero-copy">
                <span className="eyebrow">Restaurant Decision Support</span>

                <h1>Service, from the pass to the pass</h1>

                <p>
                  Floor, kitchen, stock and takings in one room. Every figure
                  below is read live from the restaurant, not estimated.
                </p>

                <div className="dashboard-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setCurrentPage("ai")}
                  >
                    AI Decision Engine
                  </button>
                  {quickButtons.map((button) => (
                    <button
                      key={button.key}
                      className="secondary-btn"
                      onClick={() => setCurrentPage(button.key)}
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
                    {formatMoney(
                      dashboard?.total_revenue ?? dashboard?.revenue ?? 0,
                    )}
                  </strong>

                  <span>Revenue on record</span>
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
                {/* ============================================================
                    TODAY COMMAND CENTER
                    ============================================================ */}
                {todayAnalytics && (
                  <div className="today-command-center">
                    <div className="today-header">
                      <div className="today-title-row">
                        <span className="today-eyebrow">TODAY AT PARADISE</span>
                        <h2>{todayAnalytics.date}</h2>
                        <span className="today-badge live">LIVE</span>
                      </div>
                    </div>

                    <div className="today-stats-grid">
                      {/* SALES */}
                      <div className="today-stat-card today-sales">
                        <div className="today-stat-header">
                          <h3>SALES</h3>
                          <span className="today-stat-label">Gross</span>
                        </div>
                        <div className="today-stat-value gold">
                          {formatMoney(todayAnalytics.sales.gross)}
                        </div>
                        <div className="today-stat-breakdown">
                          <div className="breakdown-item">
                            <span className="breakdown-label">Subtotal</span>
                            <span className="breakdown-value">{formatMoney(todayAnalytics.sales.subtotal)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Tax</span>
                            <span className="breakdown-value">{formatMoney(todayAnalytics.sales.tax)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Paid</span>
                            <span className="breakdown-value collected">{formatMoney(todayAnalytics.sales.paid)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Unpaid</span>
                            <span className="breakdown-value outstanding">{formatMoney(todayAnalytics.sales.unpaid)}</span>
                          </div>
                        </div>
                      </div>

                      {/* ORDERS */}
                      <div className="today-stat-card today-orders">
                        <div className="today-stat-header">
                          <h3>ORDERS</h3>
                          <span className="today-stat-label">Total: {todayAnalytics.orders.total}</span>
                        </div>
                        <div className="today-lifecycle">
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Placed</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.placed}</span>
                          </div>
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Confirmed</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.confirmed}</span>
                          </div>
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Preparing</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.preparing}</span>
                          </div>
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Ready</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.ready}</span>
                          </div>
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Served</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.served}</span>
                          </div>
                          <div className="lifecycle-item">
                            <span className="lifecycle-label">Cancelled</span>
                            <span className="lifecycle-count">{todayAnalytics.orders.cancelled}</span>
                          </div>
                        </div>
                      </div>

                      {/* RESERVATIONS */}
                      <div className="today-stat-card today-reservations">
                        <div className="today-stat-header">
                          <h3>RESERVATIONS</h3>
                          <span className="today-stat-label">Total: {todayAnalytics.reservations.total}</span>
                        </div>
                        <div className="today-reservation-status">
                          <div className="res-status-item">
                            <span className="res-status-label">Pending</span>
                            <span className="res-status-count">{todayAnalytics.reservations.pending}</span>
                          </div>
                          <div className="res-status-item">
                            <span className="res-status-label">Confirmed</span>
                            <span className="res-status-count">{todayAnalytics.reservations.confirmed}</span>
                          </div>
                          <div className="res-status-item">
                            <span className="res-status-label">Completed</span>
                            <span className="res-status-count">{todayAnalytics.reservations.completed}</span>
                          </div>
                          <div className="res-status-item">
                            <span className="res-status-label">Cancelled</span>
                            <span className="res-status-count">{todayAnalytics.reservations.cancelled}</span>
                          </div>
                        </div>
                      </div>

                      {/* CUSTOMERS */}
                      <div className="today-stat-card today-customers">
                        <div className="today-stat-header">
                          <h3>CUSTOMERS</h3>
                          <span className="today-stat-label">New Today</span>
                        </div>
                        <div className="today-customer-metrics">
                          <div className="customer-metric">
                            <span className="customer-label">New</span>
                            <span className="customer-count">{todayAnalytics.customers.new_today}</span>
                          </div>
                          <div className="customer-metric">
                            <span className="customer-label">Active</span>
                            <span className="customer-count">{todayAnalytics.customers.active_today}</span>
                          </div>
                          <div className="customer-metric">
                            <span className="customer-label">Unpaid Bills</span>
                            <span className="customer-count">{todayAnalytics.customers.with_unpaid_bills}</span>
                          </div>
                        </div>
                      </div>

                      {/* POPULAR DISHES */}
                      <div className="today-stat-card today-popular">
                        <div className="today-stat-header">
                          <h3>POPULAR TODAY</h3>
                        </div>
                        <div className="today-popular-list">
                          {todayAnalytics.popular_dishes.length > 0 ? (
                            todayAnalytics.popular_dishes.slice(0, 5).map((dish, idx) => (
                              <div key={idx} className="popular-dish-row">
                                <span className="popular-rank">#{idx + 1}</span>
                                <span className="popular-name">{dish.dish}</span>
                                <span className="popular-qty">{dish.quantity_sold} sold</span>
                                <span className="popular-rev">{formatMoney(dish.revenue)}</span>
                              </div>
                            ))
                          ) : (
                            <span className="empty-note">No dishes sold today</span>
                          )}
                        </div>
                      </div>

                      {/* PAYMENTS */}
                      <div className="today-stat-card today-payments">
                        <div className="today-stat-header">
                          <h3>PAYMENTS</h3>
                        </div>
                        <div className="today-payment-status">
                          <div className="payment-status-item paid">
                            <span className="payment-label">Paid</span>
                            <span className="payment-count">{todayAnalytics.payments.paid}</span>
                          </div>
                          <div className="payment-status-item pending">
                            <span className="payment-label">Pending</span>
                            <span className="payment-count">{todayAnalytics.payments.pending}</span>
                          </div>
                          <div className="payment-status-item failed">
                            <span className="payment-label">Failed</span>
                            <span className="payment-count">{todayAnalytics.payments.failed}</span>
                          </div>
                        </div>
                      </div>

                      {/* INVENTORY */}
                      <div className="today-stat-card today-inventory">
                        <div className="today-stat-header">
                          <h3>INVENTORY</h3>
                        </div>
                        <div className="today-inventory-status">
                          <div className="inv-status-item ok">
                            <span className="inv-label">Available</span>
                            <span className="inv-count">{todayAnalytics.inventory.low_stock + todayAnalytics.inventory.out_of_stock}</span>
                          </div>
                          <div className="inv-status-item warn">
                            <span className="inv-label">Low Stock</span>
                            <span className="inv-count">{todayAnalytics.inventory.low_stock}</span>
                          </div>
                          <div className="inv-status-item danger">
                            <span className="inv-label">Out of Stock</span>
                            <span className="inv-count">{todayAnalytics.inventory.out_of_stock}</span>
                          </div>
                        </div>
                      </div>

                      {/* REVIEWS */}
                      <div className="today-stat-card today-reviews">
                        <div className="today-stat-header">
                          <h3>REVIEWS</h3>
                        </div>
                        <div className="today-review-summary">
                          <div className="review-metric">
                            <span className="review-label">Today</span>
                            <span className="review-count">{todayAnalytics.reviews.today}</span>
                          </div>
                          <div className="review-metric">
                            <span className="review-label">Avg Sentiment</span>
                            <span className="review-count">{todayAnalytics.reviews.average_sentiment.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="stats-grid dashboard-stats">
<div className="stat-card is-focus">
                    <h3>Revenue</h3>

                    <strong className="gold">
                      {formatMoney(
                        dashboard.total_revenue ?? dashboard.revenue ?? 0,
                      )}
                    </strong>

                    <small>
                      {weekly?.total_revenue
                        ? `${formatMoney(weekly.total_revenue)} in the last 7 days`
                        : "No revenue in the last 7 days"}
                    </small>
                  </div>

                  <div className="stat-card">
                    <h3>Orders</h3>

                    <strong>
                      {dashboard.total_orders ?? dashboard.orders ?? 0}
                    </strong>

                    <small>
                      {dashboard.kitchen_open ?? 0} of{" "}
                      {dashboard.kitchen_total ?? 0} kitchen tickets open
                    </small>
                  </div>

                  <div className="stat-card">
                    <h3>Outstanding</h3>

                    <strong className={outstanding ? "money" : undefined}>
                      {outstanding === undefined
                        ? "—"
                        : formatMoney(outstanding)}
                    </strong>

                    <small>
                      {outstanding === undefined
                        ? "The settlement summary could not be read."
                        : "Still owed across unpaid bills"}
                    </small>
                  </div>

                  <div className="stat-card">
                    <h3>Reservations</h3>

                    <strong>
                      {dashboard.total_reservations ??
                        dashboard.reservations ??
                        0}
                    </strong>

                    <small>All bookings on record</small>
                  </div>

                  <div className="stat-card">
                    <h3>Customers</h3>

                    <strong>
                      {dashboard.total_users ??
                        dashboard.total_customers ??
                        dashboard.customers ??
                        0}
                    </strong>

                    <small>Registered accounts</small>
                  </div>

                  <div
                    className={
                      lowStockCount > 0 ? "stat-card is-warn" : "stat-card"
                    }
                  >
                    <h3>Inventory alerts</h3>

                    <strong>
                      {lowStockCount === undefined ? "—" : lowStockCount}
                    </strong>

                    <small>
                      {lowStockCount === undefined
                        ? "The stock list could not be read."
                        : lowStockCount === 0
                          ? "Every item is above its reorder point"
                          : "Items at or below their reorder point"}
                    </small>
                  </div>
                </div>


                <div className="dashboard-panels">
                  <div className="panel chart-panel">
                    <div className="panel-header">
                      <h2>Weekly sales</h2>
                      <span className="panel-tag success">Last 7 days</span>
                    </div>

<div className="chart-heading">
                        <span>Revenue, last 7 days</span>
                        <strong>
                          {formatMoney(weekly?.total_revenue ?? 0)}
                        </strong>
                      </div>

                      <div className="bar-chart" aria-label="Weekly sales chart">
                        {(() => {
                          const series = weekly?.series || [];
                          const peak = Math.max(
                            ...series.map((row) => row.revenue),
                            1,
                          );

                          if (series.length === 0) {
                            return (
                              <p className="empty-note">
                                No sales recorded in this period.
                              </p>
                            );
                          }

                          return series.map((row) => (
                            <div className="bar-column" key={row.date}>
                              <span
                                className="bar"
                                style={{
                                  height: `${Math.max(
                                    4,
                                    Math.round(
                                      (row.revenue / peak) * 100,
                                    ),
                                  )}%`,
                                }}
                                title={`${formatMoney(row.revenue)} on ${row.date}`}
                              />
                              <strong className="bar-value">
                                {formatMoney(row.revenue, undefined, 0)}
                              </strong>
                              <small>
                                {row.date.slice(5)}
                              </small>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="panel summary-panel">
                      <div className="panel-header">
                        <h2>Service snapshot</h2>
                      </div>

                      <div className="status-list">
                        <div className="status-item">
                          <span className="status-label">
                            Avg. prep time
                          </span>
                          <strong>
                            {dashboard.avg_prep_minutes === null
                              ? "—"
                              : `${dashboard.avg_prep_minutes} min`}
                          </strong>
                        </div>

                      <div className="status-item">
                        <span className="status-label">Avg. ticket</span>
                        <strong>
                          {formatMoney(
                            dashboard.total_revenue && dashboard.total_orders
                              ? dashboard.total_revenue / dashboard.total_orders
                              : 0,
                          )}
                        </strong>
                      </div>

                      <div className="status-item">
                        <span className="status-label">Kitchen load</span>
                        <strong>
                          {dashboard.kitchen_open ?? 0}/
                          {dashboard.kitchen_total ?? 0} open (
                          {dashboard.kitchen_load_pct ?? 0}%)
                        </strong>
                      </div>

                      <div className="status-item">
                        <span className="status-label">Guest rating</span>
                        <strong>
                          {dashboard.avg_rating === null
                            ? "—"
                            : `${dashboard.avg_rating}/5 (${
                                dashboard.review_count
                              } reviews)`}
                        </strong>
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
                      {topDishes.length === 0 ? (
                        <p className="empty-note">
                          No orders recorded yet.
                        </p>
                      ) : (
                        topDishes.map((dish) => (
                          <div className="dish-item" key={dish.menu_item}>
                            <div>
                              <strong>{dish.menu_item}</strong>
                              <small>
                                {dish.price === null
                                  ? "No longer on the menu"
                                  : formatMoney(dish.price)}
                              </small>
                            </div>

                          <span className="panel-tag success">
                            {dish.times_ordered} ordered
                          </span>
                        </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="panel operations-panel">
                    <div className="panel-header">
                      <h2>Operations</h2>
                    </div>

                    <div className="ops-list">
                      <div className="op-item">
                        <span className="op-title">Kitchen queue</span>
                        <span className="op-value">
                          {dashboard.kitchen_open ?? 0} open of{" "}
                          {dashboard.kitchen_total ?? 0}
                        </span>
                      </div>

                      <div className="op-item">
                        <span className="op-title">Guest rating</span>
                        <span className="op-value good">
                          {dashboard.avg_rating === null
                            ? "No reviews yet"
                            : `${dashboard.avg_rating} / 5`}
                        </span>
                      </div>

                      <div className="op-item">
                        <span className="op-title">Avg. prep time</span>
                        <span className="op-value">
                          {dashboard.avg_prep_minutes === null
                            ? "No menu data"
                            : `${dashboard.avg_prep_minutes} min`}
                        </span>
                      </div>

                      <div className="op-item">
                        <span className="op-title">Busiest day</span>
                        <span className="op-value">
                          {weekly?.peak_day || "No sales yet"}
                        </span>
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

        {/* Every page below is lazily loaded, so this boundary covers
            all of them at once rather than wrapping each in turn. */}
        <Suspense fallback={<PortalFallback label="Loading" />}>
          {/* MENU */}

          {currentPage === "menu" && <Menu />}

          {/* ORDERS */}

          {currentPage === "orders" && <Orders />}

          {/* PAYMENTS & BILLS  (Phase 6E) */}

          {currentPage === "payments" && <PaymentsAndBills />}

          {/* RESERVATIONS */}

          {currentPage === "reservations" && <Reservations />}

          {/* CUSTOMERS */}

          {currentPage === "customers" && <Customers />}

          {/* INVENTORY */}

          {currentPage === "inventory" && <Inventory />}

          {/* KITCHEN */}

          {currentPage === "kitchen" && <Kitchen />}

          {/* TABLES & QR */}

          {currentPage === "tables" && <Tables />}

          {/* REVENUE */}

          {currentPage === "revenue" && <Revenue />}

          {/* PHASE 5 - AI ANALYTICS / CHART BOARD */}

          {currentPage === "ai-board" && <AIChartBoard />}

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
        </Suspense>
    </AppShell>
  );
}

export default App;
