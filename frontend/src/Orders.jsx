import React, { useEffect, useState } from "react";

import {
  getOrders,
  getMenu,
  createOrder,
  updateOrder,
  deleteOrder,
} from "./api";


function Orders() {

  // =========================
  // STATE
  // =========================

  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedMenuId, setSelectedMenuId] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    menu_item: "",
    quantity: 1,
    total_price: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    loadOrders();
    loadMenu();
  }, []);


  const loadOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getOrders();

      setOrders(data);

    } catch (err) {

      console.error(err);

      setError("Failed to load orders.");

    } finally {

      setLoading(false);

    }
  };


  const loadMenu = async () => {

    try {

      const data = await getMenu();

      setMenu(data);

    } catch (err) {

      console.error("Menu loading error:", err);

    }
  };


  // =========================
  // CALCULATE TOTAL
  // =========================

  const calculateTotal = () => {

    const selectedItem = menu.find(
      (item) => item.id === Number(selectedMenuId)
    );

    if (!selectedItem) {
      return 0;
    }

    return (
      Number(selectedItem.price) *
      Number(form.quantity)
    );
  };


  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

  };


  // =========================
  // MENU CHANGE
  // =========================

  const handleMenuChange = (e) => {

    const menuId = e.target.value;

    setSelectedMenuId(menuId);

    const selectedItem = menu.find(
      (item) => item.id === Number(menuId)
    );

    setForm({
      ...form,
      menu_item: selectedItem
        ? selectedItem.name
        : "",
    });

  };


  // =========================
  // SUBMIT ORDER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const orderData = {

        customer_name: form.customer_name,

        menu_item: form.menu_item,

        quantity: Number(form.quantity),

        total_price: calculateTotal(),

        status: form.status,

      };


      if (editingId) {

        await updateOrder(
          editingId,
          orderData
        );

        alert("Order updated successfully!");

      } else {

        await createOrder(orderData);

        alert("Order created successfully!");

      }


      resetForm();

      await loadOrders();

    } catch (err) {

      console.error(err);

      alert("Failed to save order.");

    }

  };


  // =========================
  // EDIT ORDER
  // =========================

  const handleEdit = (order) => {

    setEditingId(order.id);


    // Find menu item by name
    const selectedItem = menu.find(
      (item) => item.name === order.menu_item
    );


    setSelectedMenuId(
      selectedItem
        ? String(selectedItem.id)
        : ""
    );


    setForm({

      customer_name:
        order.customer_name || "",

      menu_item:
        order.menu_item || "",

      quantity:
        order.quantity || 1,

      total_price:
        order.total_price || "",

      status:
        order.status || "Pending",

    });


    setShowForm(true);

  };


  // =========================
  // DELETE ORDER
  // =========================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this order?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      await deleteOrder(id);

      alert("Order deleted successfully!");

      await loadOrders();

    } catch (err) {

      console.error(err);

      alert("Failed to delete order.");

    }

  };


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setForm({

      customer_name: "",

      menu_item: "",

      quantity: 1,

      total_price: "",

      status: "Pending",

    });


    setSelectedMenuId("");

    setEditingId(null);

    setShowForm(false);

  };


  // =========================
  // OPEN ADD ORDER
  // =========================

  const openAddOrder = () => {

    resetForm();

    setShowForm(true);

  };


  // =========================
  // UI
  // =========================

  return (

    <div
      style={{
        padding: "30px",
      }}
    >

      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >

        <div>

          <h1>
            🛒 Order Management
          </h1>

          <p>
            Manage your restaurant orders.
          </p>

        </div>


        <button
          onClick={openAddOrder}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Add Order
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (

        <div
          style={{
            padding: "25px",
            marginBottom: "25px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#fff",
          }}
        >

          <h2>

            {editingId
              ? "✏️ Edit Order"
              : "➕ Add New Order"}

          </h2>


          <form onSubmit={handleSubmit}>


            {/* =========================
                CUSTOMER NAME
            ========================= */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >

              <label>
                Customer Name
              </label>


              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required

                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />

            </div>


            {/* =========================
                MENU ITEM
            ========================= */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >

              <label>
                Menu Item
              </label>


              <select
                name="menu_item"
                value={selectedMenuId}
                onChange={handleMenuChange}
                required

                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              >

                <option value="">
                  Select Menu Item
                </option>


                {menu
                  .filter(
                    (item) => item.available
                  )
                  .map((item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >

                      {item.name}
                      {" - ₹"}
                      {Number(item.price).toFixed(2)}

                    </option>

                  ))}

              </select>

            </div>


            {/* =========================
                QUANTITY
            ========================= */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >

              <label>
                Quantity
              </label>


              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                required

                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />

            </div>


            {/* =========================
                TOTAL PRICE
            ========================= */}

            <div
              style={{
                marginBottom: "15px",
              }}
            >

              <label>
                Total Price
              </label>


              <input
                type="number"
                name="total_price"
                value={calculateTotal()}
                readOnly

                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                  boxSizing: "border-box",
                }}
              />

            </div>


            {/* =========================
                STATUS
            ========================= */}

            <div
              style={{
                marginBottom: "20px",
              }}
            >

              <label>
                Status
              </label>


              <select
                name="status"
                value={form.status}
                onChange={handleChange}

                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Preparing">
                  Preparing
                </option>

                <option value="Ready">
                  Ready
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

              </select>

            </div>


            {/* =========================
                BUTTONS
            ========================= */}

            <button
              type="submit"
              style={{
                padding: "10px 18px",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >

              {editingId
                ? "Update Order"
                : "Save Order"}

            </button>


            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 18px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>


          </form>

        </div>

      )}


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>

      )}


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <p>
          Loading orders...
        </p>
      )}


      {/* =========================
          ORDERS TABLE
      ========================= */}

      {!loading && !error && (

        <>

          {orders.length === 0 ? (

            <div
              style={{
                padding: "30px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >

              <h2>
                📭 No Orders Yet
              </h2>

              <p>
                Click{" "}
                <b>+ Add Order</b>{" "}
                to create your first order.
              </p>

            </div>

          ) : (

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >

              <thead>

                <tr>

                  <th>ID</th>

                  <th>
                    Customer Name
                  </th>

                  <th>
                    Menu Item
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Total Price
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (order, index) => (

                    <tr key={order.id}>

                      <td>
                        #{index + 1}
                      </td>


                      <td>
                        {order.customer_name}
                      </td>


                      <td>
                        {order.menu_item}
                      </td>


                      <td>
                        {order.quantity}
                      </td>


                      <td>
                        ₹
                        {Number(
                          order.total_price
                        ).toFixed(2)}
                      </td>


                      <td>
                        {order.status ||
                          "Pending"}
                      </td>


                      <td>

                        <button
                          onClick={() =>
                            handleEdit(order)
                          }
                          style={{
                            marginRight: "8px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>


                        <button
                          onClick={() =>
                            handleDelete(
                              order.id
                            )
                          }
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </>

      )}

    </div>

  );
}


export default Orders;