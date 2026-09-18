import React, { useEffect, useState } from "react";

import {
  getAIInsights,
} from "./api";

function AIInsights() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      const result =
        await getAIInsights();

      setData(result);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load AI insights."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>AI Insights</h1>
        <p>
          Analyzing restaurant data...
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">

        <div>
          <h1>AI Insights</h1>

          <p>
            Intelligent analysis of restaurant
            performance
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadInsights}
        >
          Refresh Analysis
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {data && (
        <>

          <div className="stats-grid">

            <div className="stat-card">
              <h3>Revenue</h3>

              <strong>
                ₹
                {Number(
                  data.revenue || 0
                ).toFixed(2)}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Orders</h3>

              <strong>
                {data.orders || 0}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Customers</h3>

              <strong>
                {data.customers || 0}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Reservations</h3>

              <strong>
                {data.reservations || 0}
              </strong>
            </div>

            <div className="stat-card">
              <h3>Low Stock Items</h3>

              <strong>
                {data.low_stock_count || 0}
              </strong>
            </div>

          </div>

          <div className="ai-insights-container">

            <h2>
              🤖 Restaurant AI Analysis
            </h2>

            {data.insights &&
              data.insights.map(
                (insight, index) => (
                  <div
                    className="ai-insight-card"
                    key={index}
                  >
                    <div className="ai-icon">
                      💡
                    </div>

                    <div>
                      <h3>
                        Insight {index + 1}
                      </h3>

                      <p>
                        {insight}
                      </p>
                    </div>
                  </div>
                )
              )}

          </div>

        </>
      )}

    </div>
  );
}

export default AIInsights;