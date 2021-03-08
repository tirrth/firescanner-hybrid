import React, { Component } from "react";

class Result extends Component {
  render() {
    const result = this.props.result;

    if (!result) {
      return null;
    }

    return (
      <div className="barcodeResult">
        <div className="barcodeResultNumber">
          <p> ID Number : {result} </p>
        </div>
      </div>
    );
  }
}

export default Result;
