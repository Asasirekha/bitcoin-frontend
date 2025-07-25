import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function App() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    fetchPredictions(selectedDate);
  }, [selectedDate]);

  const fetchPredictions = async (date) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/predict?start_date=${date}`);
      setPredictions(res.data);
    } catch (err) {
      console.error("Error fetching predictions", err);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Bitcoin Price Prediction (Next 7 Days)</h1>
      <label className="block mb-4">
        <span className="text-lg font-semibold">Select Date:</span>{' '}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
      </label>

      {predictions.length > 0 && (
        <>
          <ul className="mb-6 list-disc ml-6">
            {predictions.map((item, idx) => (
              <li key={idx} className="text-lg">
                <strong>{item.date}:</strong> ${item.price.toLocaleString()}
              </li>
            ))}
          </ul>

          <LineChart width={800} height={300} data={predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#6366f1" dot={{ r: 4 }} />
          </LineChart>
        </>
      )}
    </div>
  );
}

export default App;
