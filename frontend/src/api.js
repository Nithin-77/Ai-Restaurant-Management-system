import axios from "axios";


const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// =========================
// DASHBOARD
// =========================

export const getDashboard = async () => {
  const response = await API.get("/dashboard/");
  return response.data;
};

// =========================
// MENU
// =========================

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
  const response = await API.patch(`/menu/${id}/toggle`);
  return response.data;
};

// =========================
// ORDERS
// =========================

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

// =========================
// RESERVATIONS
// =========================

export const getReservations = async () => {
  const response = await API.get("/reservations/");
  return response.data;
};

export const createReservation = async (reservation) => {
  const response = await API.post(
    "/reservations/",
    reservation
  );
  return response.data;
};

export const updateReservation = async (
  id,
  reservation
) => {
  const response = await API.put(
    `/reservations/${id}`,
    reservation
  );
  return response.data;
};

export const deleteReservation = async (id) => {
  const response = await API.delete(
    `/reservations/${id}`
  );
  return response.data;
};

// =========================
// CUSTOMERS
// =========================

export const getCustomers = async () => {
  const response = await API.get("/customers/");
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await API.post(
    "/customers/",
    customer
  );
  return response.data;
};

export const updateCustomer = async (
  id,
  customer
) => {
  const response = await API.put(
    `/customers/${id}`,
    customer
  );
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await API.delete(
    `/customers/${id}`
  );
  return response.data;
};

// =========================
// INVENTORY
// =========================

export const getInventory = async () => {
  const response = await API.get("/inventory/");
  return response.data;
};

export const getLowStock = async () => {
  const response = await API.get(
    "/inventory/low-stock"
  );
  return response.data;
};

export const createInventory = async (item) => {
  const response = await API.post(
    "/inventory/",
    item
  );
  return response.data;
};

export const updateInventory = async (
  id,
  item
) => {
  const response = await API.put(
    `/inventory/${id}`,
    item
  );
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await API.delete(
    `/inventory/${id}`
  );
  return response.data;
};

// =========================
// KITCHEN
// =========================
export const getKitchenOrders = async () => {
  const response = await API.get("/kitchen/");
  return response.data;
};

export const createKitchenOrder = async (order) => {
  const response = await API.post(
    "/kitchen/",
    order
  );
  return response.data;
};

export const updateKitchenOrder = async (
  id,
  order
) => {
  const response = await API.put(
    `/kitchen/${id}`,
    order
  );
  return response.data;
};

export const deleteKitchenOrder = async (id) => {
  const response = await API.delete(
    `/kitchen/${id}`
  );
  return response.data;
};

// =========================
// ANALYTICS
// =========================

export const getAnalytics = async () => {
  const response = await API.get("/analytics/");
  return response.data;
};

// =========================
// AI INSIGHTS
// =========================

export const getAIInsights = async () => {
  const response = await API.get("/ai/insights");
  return response.data;
};

// =========================
// SETTINGS
// =========================

export const getSettings = async () => {
  const response = await API.get("/settings/");
  return response.data;
};

export const createSettings = async (settings) => {
  const response = await API.post(
    "/settings/",
    settings
  );
  return response.data;
};

export const updateSettings = async (
  id,
  settings
) => {
  const response = await API.put(
    `/settings/${id}`,
    settings
  );
  return response.data;
};

export default API;