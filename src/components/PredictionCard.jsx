import React from "react";
import "./PredictionCard.css";

const PredictionCard = ({ date, price }) => {
  return (
    <div className="card">
      <h3 className="card-date">📅 {date}</h3>
      <p className="card-price">Predicted Price: <strong>${price.toLocaleString()}</strong></p>
    </div>
  );
};

export default PredictionCard;
