import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
} from "recharts";

const formatCurrency = (value, currency) => {
  if (!value && value !== 0) return "-";
  return currency === "USD"
    ? `$${Number(value).toLocaleString()}`
    : `₹${Number(value).toLocaleString()}`;
};

const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getDayOfWeek = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: "long" });
};

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    const usd = payload.find((p) => p.dataKey === "price_usd")?.value;
    const inr = payload.find((p) => p.dataKey === "price_inr")?.value;
    return (
      <div className="bg-white border p-2 rounded shadow-md">
        <p className="font-semibold">{label} ({getDayOfWeek(label)})</p>
        {currency === "USD" ? (
          <p>USD: {formatCurrency(usd, "USD")}</p>
        ) : (
          <p>INR: {formatCurrency(inr, "INR")}</p>
        )}
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
  const [currency, setCurrency] = useState("USD");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (isWeekend(selectedDate)) {
      setWarning("Warning: The selected date is a weekend. Markets may be closed.");
    } else {
      setWarning("");
    }

    const fetchPredictions = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/predict?start_date=${selectedDate}`
        );
        setPredictions(res.data);
      } catch (err) {
        setPredictions({ error: "Failed to fetch predictions." });
        console.error("Error:", err);
      }
    };
    fetchPredictions();
  }, [selectedDate]);

  // For demo: split predictions into historical and predicted
let historicalLength = 0;
if (Array.isArray(predictions) && predictions.length > 7) {
  historicalLength = 7;
}

// Merge for chart: add a "type" field
const chartData = Array.isArray(predictions)
  ? predictions.map((item, idx) => ({
      ...item,
      type:
        historicalLength && idx < historicalLength
          ? "historical"
          : "predicted",
    }))
  : [];


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Bitcoin Price Prediction</h1>
      <p className="text-center text-gray-600 mb-6 text-sm">
        <span className="font-semibold">Model:</span> Linear Regression on historical daily closing prices (2020–present)
      </p>
      <div className="flex justify-center mb-6">
        <label className="flex items-center gap-2">
          <span className="text-lg font-medium">Select Date:</span>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <div className="ml-6 flex items-center gap-2">
          <span className="text-lg font-medium">Currency:</span>
          <select
            className="border px-2 py-1 rounded"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>
      {warning && (
        <p className="text-yellow-600 text-center mb-4">{warning}</p>
      )}
      {!predictions ? (
        <p className="text-center">Loading predictions...</p>
      ) : predictions.error ? (
        <p className="text-red-500 text-center">{predictions.error}</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-center">
            {chartData.map((item, index) => (
              <li key={index} className="bg-gray-100 p-3 rounded shadow">
                <strong>{item.date} ({getDayOfWeek(item.date)})</strong>
                <br />
                {currency === "USD"
                  ? `USD: ${formatCurrency(item.price_usd, "USD")}`
                  : `INR: ${formatCurrency(item.price_inr, "INR")}`}
                <br />
                <span className={item.type === "historical" ? "text-blue-600" : "text-green-600"}>
                  {item.type === "historical" ? "Historical" : "Predicted"}
                </span>
              </li>
            ))}
          </ul>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 50, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId={currency.toLowerCase()}
                orientation="left"
                tickFormatter={(value) =>
                  currency === "USD"
                    ? `$${(value / 1000).toFixed(1)}k`
                    : `₹${(value / 100000).toFixed(1)}L`
                }
                label={{
                  value: currency,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend verticalAlign="top" />
              {/* Historical Line */}
              <Line
                yAxisId={currency.toLowerCase()}
                type="monotone"
                dataKey={currency === "USD" ? "price_usd" : "price_inr"}
                stroke="#3b82f6"
                strokeWidth={2}
                name="Historical"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                data={chartData.filter((d) => d.type === "historical")}
                isAnimationActive={false}
              />
              {/* Predicted Line */}
              <Line
                yAxisId={currency.toLowerCase()}
                type="monotone"
                dataKey={currency === "USD" ? "price_usd" : "price_inr"}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Predicted"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                data={chartData.filter((d) => d.type === "predicted")}
                isAnimationActive={false}
              />
              <Brush dataKey="date" height={30} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default PredictionDashboard;