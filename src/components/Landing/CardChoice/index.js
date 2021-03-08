import React from "react";
import "./index.css";

function ChoiceCard(props) {
  return (
    <div className="ChoiceCard">
      <img src={`${props.image}`} alt={props.alt} />
      <p>{props.choice}</p>
    </div>
  );
}

export default ChoiceCard;
