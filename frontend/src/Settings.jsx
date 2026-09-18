import React, { useEffect, useState } from "react";

import {
  getSettings,
  createSettings,
  updateSettings,
} from "./api";

function Settings() {
  const [settingsId, setSettingsId] =
    useState(null);

  const [form, setForm] = useState({
    restaurant_name:
      "Paradise Restaurant",

    restaurant_address: "",

    phone: "",

    email: "",

    currency: "INR",

    tax_percentage: 5,

    service_charge_percentage: 0,

    opening_time: "",

    closing_time: "",

    notifications_enabled: true,

    ai_enabled: true,
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const data = await getSettings();

      if (
        data &&
        !data.message &&
        data.id
      ) {
        setSettingsId(data.id);

        setForm({
          restaurant_name:
            data.restaurant_name ||
            "Paradise Restaurant",

          restaurant_address:
            data.restaurant_address ||
            "",

          phone:
            data.phone || "",

          email:
            data.email || "",

          currency:
            data.currency || "INR",

          tax_percentage:
            data.tax_percentage ?? 5,

          service_charge_percentage:
            data.service_charge_percentage ??
            0,

          opening_time:
            data.opening_time || "",

          closing_time:
            data.closing_time || "",

          notifications_enabled:
            data.notifications_enabled ??
            true,

          ai_enabled:
            data.ai_enabled ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const settingsData = {
        ...form,

        tax_percentage: Number(
          form.tax_percentage
        ),

        service_charge_percentage:
          Number(
            form.service_charge_percentage
          ),
      };

      if (settingsId) {
        await updateSettings(
          settingsId,
          settingsData
        );
      } else {
        const created =
          await createSettings(
            settingsData
          );

        setSettingsId(created.id);
      }

      setMessage(
        "Settings saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Settings</h1>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">

        <div>
          <h1>Settings</h1>

          <p>
            Configure restaurant preferences
          </p>
        </div>

      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-card">

        <form onSubmit={handleSubmit}>

          <h2>
            Restaurant Information
          </h2>

          <div className="form-grid">

            <div className="form-group">
              <label>
                Restaurant Name
              </label>

              <input
                name="restaurant_name"
                value={
                  form.restaurant_name
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Restaurant Address
              </label>

              <input
                name="restaurant_address"
                value={
                  form.restaurant_address
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Currency</label>

              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="INR">
                  INR - ₹
                </option>

                <option value="USD">
                  USD - $
                </option>

                <option value="EUR">
                  EUR - €
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Tax Percentage
              </label>

              <input
                type="number"
                step="0.01"
                name="tax_percentage"
                value={
                  form.tax_percentage
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Service Charge %
              </label>

              <input
                type="number"
                step="0.01"
                name="service_charge_percentage"
                value={
                  form.service_charge_percentage
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Opening Time
              </label>

              <input
                type="time"
                name="opening_time"
                value={
                  form.opening_time
                }
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Closing Time
              </label>

              <input
                type="time"
                name="closing_time"
                value={
                  form.closing_time
                }
                onChange={handleChange}
              />
            </div>

          </div>

          <h2>
            System Preferences
          </h2>

          <div className="settings-options">

            <label className="checkbox-row">

              <input
                type="checkbox"
                name="notifications_enabled"
                checked={
                  form.notifications_enabled
                }
                onChange={handleChange}
              />

              <span>
                Enable Notifications
              </span>

            </label>

            <label className="checkbox-row">

              <input
                type="checkbox"
                name="ai_enabled"
                checked={
                  form.ai_enabled
                }
                onChange={handleChange}
              />

              <span>
                Enable AI Features
              </span>

            </label>

          </div>

          <div className="form-actions">

            <button
              className="primary-btn"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Settings;