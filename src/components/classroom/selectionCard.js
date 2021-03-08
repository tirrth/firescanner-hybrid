import React, { Component } from "react";
import "./classroom.css";

const queCardSelectionOptionsCSS = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: `22px`,
};

const queCardSelectionOptionCSS = {
  cursor: `pointer`,
  height: `40px`,
  width: `90px`,
  borderRadius: `12px`,
  border: `1px solid #ffffff`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: `0 15px`,
  fontSize: `16px`,
  fontWeight: `600`,
  transition: `all 250ms ease-in-out`,
};

const queCardSelectionOptionORCSS = {
  margin: `0`,
  padding: `0`,
  fontSize: `10px`,
  fontWeight: `600`,
  height: `30px`,
  width: `30px`,
  borderRadius: `50%`,
  backgroundColor: `#db3236`,
  color: `#ffffff`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default class selectionCard extends Component {
  render() {
    return (
      <div>
        <div className={"quesCardSelectionCard"}>
          <p style={{ margin: `0`, padding: `0` }}>Which One?</p>
          <div
            className="queCardSelectionOptions"
            style={queCardSelectionOptionsCSS}
          >
            <div
              className="queCardSelectionOption"
              style={queCardSelectionOptionCSS}
              onClick={this.props.queCardSelectionOptionClassPass}
            >
              Class
            </div>
            <div style={queCardSelectionOptionORCSS}>OR</div>
            <div
              className="queCardSelectionOption"
              style={queCardSelectionOptionCSS}
              onClick={this.props.queCardSelectionOptionLabPass}
            >
              Lab
            </div>
          </div>
        </div>
      </div>
    );
  }
}
