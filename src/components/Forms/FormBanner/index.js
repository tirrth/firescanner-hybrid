import React from "react";
import "./index.css";

function Banner(props) {
  return (
    <div className="Banner">
      <img src={props.banner} alt={props.alt} />
      <h1>{props.banner_header}</h1>
      <p>{props.banner_subheader}</p>
    </div>
  );
}

export default Banner;
