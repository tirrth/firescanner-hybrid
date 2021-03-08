import React, { Component } from "react";

import { Link, withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

import { compose } from "recompose";
import { withAuthorization, withEmailVerification } from "../Session";
import ChecklistImg from "../../images/checklist_hand.png";
import "./home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isToggle: false,
    };
  }

  hamburgerToggle = () => {
    this.setState({ isToggle: !this.state.isToggle });
  };

  ReloadRedirect = () => {
    this.props.history.push(ROUTES.CLASSROOM);
    window.location.reload(true);
  };

  render() {
    return (
      <div className="homeMainDesktop">
        <div className="homeMain">
          <header>
            <nav className="hamburgerNav">
              <Link
                to={ROUTES.PROFILE}
                className="LinkProfile"
                style={{ textDecoration: `none` }}
              >
                <div
                  className={
                    !this.state.isToggle ? "hamburgerBtn" : "hamburgerBtn open"
                  }
                >
                  Profile
                </div>
              </Link>

              <div
                onClick={this.hamburgerToggle}
                className={
                  !this.state.isToggle ? "hamburger" : "hamburger open"
                }
              >
                <span></span>
              </div>
              <div
                onClick={this.props.firebase.doSignOut}
                className={
                  !this.state.isToggle ? "hamburgerBtn" : "hamburgerBtn open"
                }
              >
                Log Out
              </div>
            </nav>
          </header>
          <div className="headerParagraph">
            <p className="headerParaHeader">
              Record and Manage your Attendance Easily
            </p>
            <p className="headerParaSubHeader">
              Mark your attendance for all subjects or according to your
              timetable
            </p>

            <div className="headerParaButton" onClick={this.ReloadRedirect}>
              <div className="headerParaButton_para">
                Get into the Classroom
              </div>
              <div className="headerParaButton_icon_div">
                <FontAwesomeIcon
                  icon="arrow-right"
                  className="headerParaButton_icon"
                />
              </div>
            </div>
          </div>
          <div className="checklistImage">
            <img src={ChecklistImg} alt="Attendance Checklist" />
          </div>
        </div>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default compose(
  withRouter,
  withEmailVerification,
  withAuthorization(condition)
)(HomePage);
