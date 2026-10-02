import { useEffect, useState } from "react";

import { getWaste, getWasteAnalysis, createWaste, deleteWaste } from "./api";

function Waste() {
  const [wasteRecords, setWasteRecords] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    item_name: "",
    quantity: 0,
    unit: "kg",
    reason: "",
    cost: 0,
  });

  useEffect(() => {
    loadWaste();
  }, []);

  const loadWaste = async () => {
    try {
      setLoading(true);
      const [records, wasteAnalysis] = await Promise.all([
        getWaste(),
        getWasteAnalysis(),
      ]);
      setWasteRecords(records);
      setAnalysis(wasteAnalysis);
    } catch (err) {
      console.error(err);
      setError("Failed to load waste data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createWaste({
        ...form,
        quantity: Number(form.quantity),
        cost: Number(form.cost),
      });

      setForm({
        item_name: "",
        quantity: 0,
        unit: "kg",
        reason: "",
        cost: 0,
      });

      await loadWaste();
    } catch (err) {
      console.error(err);
      setError("Failed to save waste record.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWaste(id);
      await loadWaste();
    } catch (err) {
      console.error(err);
      setError("Failed to delete waste record.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Food Waste</h1>
          <p>Track wastage, reasons, and cost impact</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {analysis && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Waste Qty</h3>
            <strong>
              {Number(analysis.total_waste_quantity || 0).toFixed(1)}
            </strong>
          </div>
          <div className="stat-card">
            <h3>Waste Cost</h3>
            <strong>
              ₹{Number(analysis.total_waste_cost || 0).toFixed(2)}
            </strong>
          </div>
          <div className="stat-card">
            <h3>Next Week</h3>
            <strong>
              {Number(analysis.predicted_next_week_quantity || 0).toFixed(1)}
            </strong>
          </div>
        </div>
      )}

      <div className="form-card">
        <h2>Add Waste Record</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="text"
            name="item_name"
            value={form.item_name}
            onChange={handleChange}
            placeholder="Item name"
            required
          />
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            step="0.1"
            required
          />
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="Unit"
          />
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Reason"
          />
          <input
            type="number"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            placeholder="Cost"
            step="0.01"
          />
          <div className="form-actions">
            <button type="submit" className="primary-btn">
              Add Waste
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2>Waste Records</h2>
        {loading ? (
          <p>Loading waste records...</p>
        ) : wasteRecords.length === 0 ? (
          <p>No waste records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wasteRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.item_name}</td>
                  <td>
                    {record.quantity} {record.unit || "kg"}
                  </td>
                  <td>{record.reason || "-"}</td>
                  <td>₹{Number(record.cost || 0).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Waste;
