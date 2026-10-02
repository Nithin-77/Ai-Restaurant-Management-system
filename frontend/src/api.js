import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 10000,
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("paradise_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Redirect to login or show auth error
      window.dispatchEvent(new Event("authError"));
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (user) => {
  const response = await API.post("/auth/register", user);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

export const getDashboard = async () => {
  const response = await API.get("/dashboard/");
  return response.data;
};

export const getMenu = async () => {
  const response = await API.get("/menu/");
  return response.data;
};

export const createMenu = async (menuItem) => {
  const response = await API.post("/menu/", menuItem);
  return response.data;
};

export const updateMenu = async (id, menuItem) => {
  const response = await API.put(`/menu/${id}`, menuItem);
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await API.delete(`/menu/${id}`);
  return response.data;
};

export const toggleMenuAvailability = async (id) => {
  const response = await API.patch(`/menu/${id}/availability`);
  return response.data;
};

export const getOrders = async () => {
  const response = await API.get("/orders/");
  return response.data;
};

export const createOrder = async (order) => {
  const response = await API.post("/orders/", order);
  return response.data;
};

export const updateOrder = async (id, order) => {
  const response = await API.put(`/orders/${id}`, order);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await API.delete(`/orders/${id}`);
  return response.data;
};

export const getReservations = async () => {
  const response = await API.get("/reservations/");
  return response.data;
};

export const createReservation = async (reservation) => {
  const response = await API.post("/reservations/", reservation);
  return response.data;
};

export const updateReservation = async (id, reservation) => {
  const response = await API.put(`/reservations/${id}`, reservation);
  return response.data;
};

export const deleteReservation = async (id) => {
  const response = await API.delete(`/reservations/${id}`);
  return response.data;
};

export const getCustomers = async () => {
  const response = await API.get("/customers/");
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await API.post("/customers/", customer);
  return response.data;
};

export const updateCustomer = async (id, customer) => {
  const response = await API.put(`/customers/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await API.delete(`/customers/${id}`);
  return response.data;
};

export const getInventory = async () => {
  const response = await API.get("/inventory/");
  return response.data;
};

export const getLowStock = async () => {
  const response = await API.get("/inventory/low-stock");
  return response.data;
};

export const createInventory = async (item) => {
  const response = await API.post("/inventory/", item);
  return response.data;
};

export const updateInventory = async (id, item) => {
  const response = await API.put(`/inventory/${id}`, item);
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await API.delete(`/inventory/${id}`);
  return response.data;
};

export const getKitchenOrders = async () => {
  const response = await API.get("/kitchen/");
  return response.data;
};

export const createKitchenOrder = async (order) => {
  const response = await API.post("/kitchen/", order);
  return response.data;
};

export const updateKitchenOrder = async (id, order) => {
  const response = await API.put(`/kitchen/${id}`, order);
  return response.data;
};

export const deleteKitchenOrder = async (id) => {
  const response = await API.delete(`/kitchen/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await API.get("/analytics/");
  return response.data;
};

export const getAIInsights = async () => {
  const response = await API.get("/ai/insights");
  return response.data;
};

export const getFoodRecommendations = async (customerName, topN = 5) => {
  const response = await API.get(`/ai/recommend/${encodeURIComponent(customerName)}?top_n=${topN}`);
  return response.data;
};

export const getPopularDishes = async (topN = 5) => {
  const response = await API.get(`/ai/popular-dishes?top_n=${topN}`);
  return response.data;
};

export const classifySentiment = async (text) => {
  const response = await API.post("/ai/sentiment", { text });
  return response.data;
};

export const getSentimentSummary = async () => {
  const response = await API.get("/ai/sentiment/summary");
  return response.data;
};

export const getDemandForecast = async (daysAhead = 7, topN = 5) => {
  const response = await API.get(`/ai/demand-forecast?days_ahead=${daysAhead}&top_n=${topN}`);
  return response.data;
};

export const getRevenueForecast = async (daysAhead = 7) => {
  const response = await API.get(`/ai/revenue-forecast?days_ahead=${daysAhead}`);
  return response.data;
};

export const getWasteAnalysisAI = async () => {
  const response = await API.get("/ai/waste-analysis");
  return response.data;
};

export const getDynamicPricing = async () => {
  const response = await API.get("/ai/dynamic-pricing");
  return response.data;
};

export const updateMenuPrice = async (id, price) => {
  const response = await API.patch(`/menu/${id}/price`, { price });
  return response.data;
};

export const updateMenuPriceByName = async (name, price) => {
  const response = await API.patch(`/menu/by-name/${encodeURIComponent(name)}/price`, { price });
  return response.data;
};

export const getReviews = async () => {
  const response = await API.get("/reviews/");
  return response.data;
};

export const createReview = async (review) => {
  const response = await API.post("/reviews/", review);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await API.delete(`/reviews/${id}`);
  return response.data;
};

export const getSuppliers = async () => {
  const response = await API.get("/suppliers/");
  return response.data;
};

export const createSupplier = async (supplier) => {
  const response = await API.post("/suppliers/", supplier);
  return response.data;
};

export const updateSupplier = async (id, supplier) => {
  const response = await API.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await API.delete(`/suppliers/${id}`);
  return response.data;
};

export const getStaff = async () => {
  const response = await API.get("/staff/");
  return response.data;
};

export const createStaff = async (member) => {
  const response = await API.post("/staff/", member);
  return response.data;
};

export const updateStaff = async (id, member) => {
  const response = await API.put(`/staff/${id}`, member);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await API.delete(`/staff/${id}`);
  return response.data;
};

export const getWaste = async () => {
  const response = await API.get("/waste/");
  return response.data;
};

export const getWasteAnalysis = async () => {
  const response = await API.get("/waste/analysis");
  return response.data;
};

export const createWaste = async (record) => {
  const response = await API.post("/waste/", record);
  return response.data;
};

export const deleteWaste = async (id) => {
  const response = await API.delete(`/waste/${id}`);
  return response.data;
};

export const getSettings = async () => {
  const response = await API.get("/settings/");
  return response.data;
};

export const createSettings = async (settings) => {
  const response = await API.post("/settings/", settings);
  return response.data;
};

export const updateSettings = async (id, settings) => {
  const response = await API.put(`/settings/${id}`, settings);
  return response.data;
};

export default API;