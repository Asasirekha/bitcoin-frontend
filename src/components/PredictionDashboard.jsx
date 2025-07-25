import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const formatCurrency = (value, currency) => {
  return currency === "USD"
    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : `₹${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const usd = payload.find((p) => p.dataKey === "price_usd")?.value;
    const inr = payload.find((p) => p.dataKey === "price_inr")?.value;
    return (
      <div className="bg-white border p-2 rounded shadow-md">
        <p className="font-semibold">{label}</p>
        <p>USD: {formatCurrency(usd, "USD")}</p>
        <p>INR: {formatCurrency(inr, "INR")}</p>
      </div>
    );
  }
  return null;
};

const PredictionDashboard = () => {
  const [predictions, setPredictions] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/predict?start_date=${selectedDate}`);
        setPredictions(res.data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchPredictions();
  }, [selectedDate]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Bitcoin Price Prediction</h1>

      <div className="flex justify-center mb-6">
        <label className="flex items-center gap-2">
          <span className="text-lg font-medium">Select Date:</span>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {!predictions ? (
        <p className="text-center">Loading predictions...</p>
      ) : predictions.error ? (
        <p className="text-red-500 text-center">{predictions.error}</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-center">
            {predictions.map((item, index) => (
              <li key={index} className="bg-gray-100 p-3 rounded shadow">
                <strong>{item.date}</strong><br />
                USD: {formatCurrency(item.price_usd, "USD")}<br />
                INR: {formatCurrency(item.price_inr, "INR")}
              </li>
            ))}
          </ul>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={predictions} margin={{ top: 10, right: 50, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="usd"
                orientation="left"
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                label={{ value: "USD", angle: -90, position: "insideLeft", offset: 10 }}
              />
              <YAxis
                yAxisId="inr"
                orientation="right"
                tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                label={{ value: "INR", angle: -90, position: "insideRight", offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" />
              <Line
                yAxisId="usd"
                type="monotone"
                dataKey="price_usd"
                stroke="#3b82f6"
                strokeWidth={2}
                name="USD"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="inr"
                type="monotone"
                dataKey="price_inr"
                stroke="#10b981"
                strokeWidth={2}
                name="INR"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default PredictionDashboard;
