import React, { Component } from "react";
import "./spinner.css";

export default class index extends Component {
  render() {
    const barArr = new Array(12);
    barArr.fill();
    return (
      <div className="spinner">
        <div
          className="spinnerContainer"
          style={{ height: `${this.props.size}`, width: `${this.props.size}` }}
        >
          {barArr.map((val, index) => (
            <div
              key={index}
              style={{ background: `${this.props.color}` }}
              className={`bar${index + 1}`}
            ></div>
          ))}
        </div>
      </div>
    );
  }
}

index.defaultProps = {
  size: "30px",
  color: "#454545",
};
