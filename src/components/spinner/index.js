import React, { Component } from "react";
import "./spinner.css";

export default class index extends Component {
  render() {
    return (
      <div className="spinner">
        <div
          className="spinnerContainer"
          style={{ height: `${this.props.size}`, width: `${this.props.size}` }}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
          <div className="bar4"></div>
          <div className="bar5"></div>
          <div className="bar6"></div>
          <div className="bar7"></div>
          <div className="bar8"></div>
          <div className="bar9"></div>
          <div className="bar10"></div>
          <div className="bar11"></div>
          <div className="bar12"></div>
        </div>
      </div>
    );
  }
}

index.defaultProps = {
  size: "30px",
};
