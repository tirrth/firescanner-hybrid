import React, { Component } from "react";
import "./idcard.css";
import ProfilePic from "../../images/profile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "../menu";
import { IonAlert, isPlatform } from "@ionic/react";

import { PDFExport } from "@progress/kendo-react-pdf";

var Barcode = require("react-barcode");

var xDown = null;
var yDown = null;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isToggleHamburger: false,
      authUser: JSON.parse(localStorage.getItem("authUser")),
      showAlertIdCard: false,
    };
  }

  componentDidMount() {
    document.addEventListener("touchstart", this.handleTouchStart, false);
    document.addEventListener("touchmove", this.handleTouchMove, false);
  }

  componentWillUnmount() {
    document.removeEventListener("touchstart", this.handleTouchStart, false);
    document.removeEventListener("touchmove", this.handleTouchMove, false);
  }

  getTouches = (evt) => {
    return (
      evt.touches || evt.originalEvent.touches // browser API
    ); // jQuery
  };

  handleTouchStart = (evt) => {
    const firstTouch = this.getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  };

  handleTouchMove = (evt) => {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        /* left swipe */
        this.setState({ isToggleHamburger: false });
      } else {
        if (xDown <= 40) {
          /* rigth swipe */
          this.setState({ isToggleHamburger: true });
        }
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
      } else {
        /* down swipe */
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  };
  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  onIdCardDownload = () => {
    this.setState({ showAlertIdCard: true });
  };

  render() {
    var splitDept = this.state.authUser.department.split(" ");

    return (
      <div className="IdCardMain">
        <IonAlert
          isOpen={this.state.showAlertIdCard}
          onDidDismiss={() => this.setState({ showAlertIdCard: false })}
          header={"WARNING!"}
          message={"Are you sure you want to download your Id card as a PDF?"}
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Yes",
              handler: () => {
                this.pdfExportComponent.save();
              },
            },
          ]}
        />
        <div className="idCardHamburger" onClick={this.hamburgerToggle}></div>
        <Menu
          hamburgerToggle={this.hamburgerToggle}
          isToggleHamburger={this.state.isToggleHamburger}
          name={`ID Card`}
          NavBarSliderDesktop={!isPlatform("android")}
        />
        <div className="IdCardContainer">
          <div className="id-card-tag"></div>
          <div className="id-card-tag-strip"></div>
          <div className="id-card-hook"></div>
          <div className="id-card-holder">
            <PDFExport
              //es6 way to give reference
              ref={(component) => (this.pdfExportComponent = component)}
              fileName={this.state.authUser.enrolment_no}
            >
              <div className="id-card">
                <div className="header">
                  <div className="profile-info">
                    <div className="profile-picture">
                      <img src={ProfilePic} alt="profile" />
                    </div>
                    <div className="profile-header">
                      <h4>{this.state.authUser.name}</h4>
                    </div>
                  </div>
                </div>
                <div className="student-card">
                  <div className="student-info">
                    <div className="student-info-p">
                      <p className="student-info-header">ID No.</p>
                      <p>: {this.state.authUser.enrolment_no}</p>
                    </div>
                    <div className="student-info-p">
                      <p className="student-info-header">Course</p>
                      <p style={{ textTransform: `uppercase` }}>
                        : B.E -{" "}
                        <span style={{ letterSpacing: `1px` }}>
                          {splitDept.map((i) => i[0])}
                        </span>
                      </p>
                    </div>
                    <div className="student-info-p">
                      <p className="student-info-header">Validity</p>
                      <p>: Till completion of course</p>
                    </div>
                    <div className="student-info-p">
                      <p className="student-info-header">Email</p>
                      <p>: {this.state.authUser.email}</p>
                    </div>
                  </div>

                  <Barcode
                    value={this.state.authUser.enrolment_no}
                    height={30}
                    width={2}
                    displayValue={false}
                    margin={0}
                    marginTop={3}
                  />
                </div>
              </div>
            </PDFExport>
          </div>
        </div>
        <div className="IdCardBtn">
          <div className="id-card-download" onClick={this.onIdCardDownload}>
            <FontAwesomeIcon icon="download" />
            <div>Download</div>
          </div>
        </div>
      </div>
    );
  }
}
