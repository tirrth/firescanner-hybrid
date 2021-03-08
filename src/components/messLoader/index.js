import React, { Component } from "react";
import "./messLoader.css";

export default class index extends Component {
  render() {
    return (
      <div>
        <div className="mesh-loader">
          <div className="set-one">
            <div className="circle" style={{ background: `#4885ed` }}></div>
            <div className="circle" style={{ background: `#db3236` }}></div>
          </div>
          <div className="set-two">
            <div className="circle" style={{ background: `#f4c20d` }}></div>
            <div className="circle" style={{ background: `#3cba54` }}></div>
          </div>
        </div>
      </div>
    );
  }
}
