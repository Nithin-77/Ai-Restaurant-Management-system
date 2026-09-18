import React, { useEffect, useState } from "react";

import {
  getKitchenOrders,
  updateKitchenOrder,
  deleteKitchenOrder,
} from "./api";

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKitchenOrders();
  }, []);

  const loadKitchenOrders = async () => {
    try {
      setLoading(true);

      const data = await getKitchenOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load kitchen orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    order,
    newStatus
  ) => {
    try {
      await updateKitchenOrder(order.id, {
        status: newStatus,
        priority: order.priority,
        notes: order.notes,
      });

      loadKitchenOrders();
    } catch (err) {
      console.error(err);
      setError("Failed to update order.");
    }
  };

  const updatePriority = async (
    order,
    priority
  ) => {
    try {
      await updateKitchenOrder(order.id, {
        status: order.status,
        priority: priority,
        notes: order.notes,
      });

      loadKitchenOrders();
    } catch (err) {
      console.error(err);
      setError("Failed to update priority.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this kitchen order?"
      )
    ) {
      return;
    }

    try {
      await deleteKitchenOrder(id);
      loadKitchenOrders();
    } catch (err) {
      console.error(err);
      setError(
        "Failed to delete kitchen order."
      );
    }
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter(
          (order) => order.status === filter
        );

  return (
    <div className="page-container">

      <div className="page-header">

        <div>
          <h1>Kitchen Display System</h1>
          <p>
            Monitor and manage kitchen orders
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadKitchenOrders}
        >
          Refresh
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filter-buttons">

        {[
          "All",
          "Pending",
          "Preparing",
          "Ready",
          "Completed",
        ].map((status) => (
          <button
            key={status}
            className={
              filter === status
                ? "primary-btn"
                : "secondary-btn"
            }
            onClick={() =>
              setFilter(status)
            }
          >
            {status}
          </button>
        ))}

      </div>

      {loading ? (
        <p>Loading kitchen orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <h3>No Kitchen Orders</h3>
          <p>
            There are no orders in this category.
          </p>
        </div>
      ) : (
        <div className="kitchen-grid">

          {filteredOrders.map(
            (order, index) => (
              <div
                className="kitchen-card"
                key={order.id}
              >

                <div className="kitchen-card-header">

                  <div>
                    <h3>
                      Order #{index + 1}
                    </h3>

                    <small>
                      Backend ID: {order.id}
                    </small>
                  </div>

                  <span
                    className={`priority-${String(
                      order.priority
                    ).toLowerCase()}`}
                  >
                    {order.priority}
                  </span>

                </div>

                <div className="kitchen-info">

                  <p>
                    <strong>
                      Customer:
                    </strong>{" "}
                    {order.customer_name ||
                      "Walk-in Customer"}
                  </p>

                  <p>
                    <strong>Item:</strong>{" "}
                    {order.menu_item}
                  </p>

                  <p>
                    <strong>Quantity:</strong>{" "}
                    {order.quantity}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {order.status}
                  </p>

                  {order.notes && (
                    <p>
                      <strong>Notes:</strong>{" "}
                      {order.notes}
                    </p>
                  )}

                </div>

                <div className="kitchen-actions">

                  <select
                    value={
                      order.priority ||
                      "Normal"
                    }
                    onChange={(e) =>
                      updatePriority(
                        order,
                        e.target.value
                      )
                    }
                  >
                    <option value="Low">
                      Low Priority
                    </option>

                    <option value="Normal">
                      Normal Priority
                    </option>

                    <option value="High">
                      High Priority
                    </option>
                  </select>

                  <select
                    value={
                      order.status ||
                      "Pending"
                    }
                    onChange={(e) =>
                      updateStatus(
                        order,
                        e.target.value
                      )
                    }
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
                  </select>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        order.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Kitchen;