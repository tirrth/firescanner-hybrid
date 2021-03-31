import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { IonAlert } from "@ionic/react";

import * as ROUTES from "../../constants/routes";

import { compose } from "recompose";

import FacultyImg from "../../images/student.png";

import Ionicon from "react-ionicons";
// import HomeIcon from "react-ionicons/lib/MdCode";
// import ProfileIcon from "react-ionicons/lib/MdHappy";
// import AnalyticsIcon from "react-ionicons/lib/MdInfinite";
// import IdCardIcon from "react-ionicons/lib/MdCard";
// import FeedbackIcon from "react-ionicons/lib/MdGitCommit";
// import LogOutIcon from "react-ionicons/lib/MdLogOut";

import { withFirebase } from "../Configuration";
import "./menu.css";

export class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: JSON.parse(localStorage.getItem("authUser")),
      showAlertLogOut: false,
    };
  }

  onClassroomClick = () => {
    this.props.hamburgerToggle();
    this.props.history.push(ROUTES.CLASSROOM);
  };

  onIdCardClick = () => {
    this.props.hamburgerToggle();
    this.props.history.push(ROUTES.IDCARD);
  };
  onProfileClick = () => {
    this.props.hamburgerToggle();
    this.props.history.push(ROUTES.PROFILE);
    window.location.reload(true);
  };

  onAnalyticsClick = () => {
    this.props.hamburgerToggle();
    this.props.history.push(ROUTES.ANALYTICS);
  };

  onSignOutClick = () => {
    this.setState({ showAlertLogOut: true });
  };

  render() {
    return (
      <div className="NavigationSection">
        <IonAlert
          isOpen={this.state.showAlertLogOut}
          onDidDismiss={() => this.setState({ showAlertLogOut: false })}
          header={"Confirmation"}
          message={"Are you sure you want to Log Out?"}
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Yes",
              handler: () => {
                try {
                  this.props.firebase
                    .doSignOut()
                    .then(() => {
                      this.props.history.push(ROUTES.SIGN_IN);
                      localStorage.removeItem("authUser");
                      window.location.reload(true);
                    })
                    .catch((error) => {
                      this.setState({ error: error.message });
                    });
                } catch (error) {
                  console.log(error);
                }
              },
            },
          ]}
        />
        <div className="SectionhamburgerNav">
          <div
            onClick={this.props.hamburgerToggle}
            className={
              !this.props.isToggleHamburger
                ? "Hamburger"
                : "Hamburger HamburgerOpen"
            }
          >
            <span className="HamburgerLineOne"></span>
            <span className="HamburgerLineTwo"></span>
            <span className="HamburgerLineThree"></span>
          </div>
          <div
            className={
              this.props.isToggleHamburger ? "NavBarSliderFullBody" : null
            }
            onClick={this.props.hamburgerToggle}
          ></div>
          <div
            className={
              !this.props.isToggleHamburger
                ? "NavBarSlider"
                : this.props.NavBarSliderDesktop
                ? "NavBarSlider NavBarSliderDesktop NavBarSliderSlide"
                : "NavBarSlider NavBarSliderSlide"
            }
            style={
              this.props.unClickable
                ? { pointerEvents: `none` }
                : this.props.blur
                ? { display: `none` }
                : null
            }
          >
            <div className="NavBarBanner">
              <div className="NavBarBannerImg">
                <img src={FacultyImg} alt="NavBarBannerImg" />
              </div>
              <div className="NavBarBannerHeader">
                <p>{this.state.authUser.name}</p>
                <p>{this.state.authUser.email}</p>
              </div>
            </div>
            <div className="NavBarNavList">
              <ul>
                <li
                  onClick={this.onClassroomClick}
                  className={
                    this.props.name === "Classroom"
                      ? "NavBarNavListStyle"
                      : null
                  }
                >
                  <Ionicon
                    icon="ion-code"
                    color={
                      this.props.name === "Classroom" ? `#4285f4` : `#454545`
                    }
                    style={{ marginLeft: `12px` }}
                  />
                  <span>Classroom</span>
                </li>

                <li
                  onClick={this.onProfileClick}
                  className={
                    this.props.name === "Profile" ? "NavBarNavListStyle" : null
                  }
                >
                  <Ionicon
                    icon="ion-android-happy"
                    color={
                      this.props.name === "Profile" ? `#4285f4` : `#454545`
                    }
                    style={{ marginLeft: `12px` }}
                  />
                  <span>Profile</span>
                </li>
                <li
                  onClick={this.onAnalyticsClick}
                  className={
                    this.props.name === "Analytics"
                      ? "NavBarNavListStyle"
                      : null
                  }
                >
                  <Ionicon
                    icon="ion-ios-infinite"
                    color={
                      this.props.name === "Analytics" ? `#4285f4` : `#454545`
                    }
                    style={{ marginLeft: `12px` }}
                  />
                  <span>Analytics</span>
                </li>

                {this.state.authUser.role === "Student" && (
                  <li
                    onClick={this.onIdCardClick}
                    className={
                      this.props.name === "ID Card"
                        ? "NavBarNavListStyle"
                        : null
                    }
                  >
                    <Ionicon
                      icon="ion-card"
                      color={
                        this.props.name === "ID Card" ? `#4285f4` : `#454545`
                      }
                      style={{ marginLeft: `12px` }}
                    />
                    <span>ID Card</span>
                  </li>
                )}
                <a
                  href="mailto:tirthpatel5885@gmail.com"
                  style={{
                    textDecoration: `none`,
                    cursor: `default`,
                  }}
                >
                  <Ionicon
                    icon="ion-android-bulb"
                    color={`#454545`}
                    style={{ marginLeft: `12px` }}
                  />
                  <span>Feedback</span>
                </a>
                <li
                  onClick={this.onSignOutClick}
                  style={{ pointerEvents: `visible` }}
                >
                  <Ionicon
                    icon="ion-log-out"
                    color={`#454545`}
                    style={{ marginLeft: `12px` }}
                  />
                  <span>Log Out</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Menu.defaultProps = {
  unClickable: false,
  NavBarSliderDesktop: false,
  blur: false,
};

const MenuMain = compose(withFirebase, withRouter)(Menu);
export default MenuMain;
