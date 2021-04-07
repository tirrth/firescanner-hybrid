import React, { Component } from "react";

import { IonAlert, isPlatform } from "@ionic/react";

import { Link } from "react-router-dom";
import * as ROUTES from "../../../constants/routes";
import { withRouter } from "react-router-dom";

import * as ROLES from "../../../constants/role";

import AuthUserContext from "../../Session/context";
import SignInPage from "../SignIn";

import { compose } from "recompose";
import { withFirebase } from "../../Configuration";

import Banner from "../../Forms/FormBanner";
import StuSignUpBanner from "../../../images/stud_banner.png";

import "../index.css";
import "./profile.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Menu from "../../menu";

const condition = (authUser) => !!authUser;

class ProfilePageCondition extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (condition(authUser) ? <Profile /> : <SignInPage />)}
      </AuthUserContext.Consumer>
    );
  }
}

var xDown = null;
var yDown = null;

class ProfilePageBase extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      authUser: JSON.parse(localStorage.getItem("authUser")),
      error: "",
      onClickAccountDel: false,
      isToggleHamburger: false,
      showAlertLogOut: false,
      showAlertAccountDel: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    document.addEventListener("touchstart", this.handleTouchStart, false);
    document.addEventListener("touchmove", this.handleTouchMove, false);
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

  _onClickAccountDel = () => {
    this.setState({ showAlertAccountDel: true });
  };

  onClickSignOut = () => {
    this.setState({ showAlertLogOut: true });
  };

  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  componentWillUnmount() {
    this._isMounted = false;

    document.removeEventListener("touchstart", this.handleTouchStart, false);
    document.removeEventListener("touchmove", this.handleTouchMove, false);
  }

  render() {
    return (
      <div>
        <IonAlert
          isOpen={this.state.showAlertAccountDel}
          onDidDismiss={() => this.setState({ showAlertAccountDel: false })}
          header={"Confirmation"}
          message={"Are you surely want to Delete your Account?"}
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Yes, Delete it.",
              handler: () => {
                if (this.state.authUser.role === "Student") {
                  if (this._isMounted) {
                    try {
                      this.props.firebase
                        .doAccountDelete()
                        .then(() => {
                          if (this._isMounted) {
                            this.props.firebase
                              .studentSubjects(this.state.authUser.college)
                              .on("child_added", (snapshot) => {
                                if (this._isMounted) {
                                  var facKey = snapshot.key;
                                  this.props.firebase
                                    .faculty(
                                      this.state.authUser.college,
                                      facKey
                                    )
                                    .child(`subjects`)
                                    .on("child_added", (snapshot) => {
                                      if (this._isMounted) {
                                        var subKey = snapshot.key;

                                        this.props.firebase
                                          .studentLengthAttendance(
                                            this.state.authUser.college,
                                            facKey,
                                            subKey,
                                            this.state.authUser.uid
                                          )
                                          .remove()
                                          .catch((error) => {
                                            this.setState({
                                              error: error.message,
                                            });
                                          });
                                      }
                                    });
                                }
                              });
                          }
                          if (this._isMounted) {
                            this.props.firebase
                              .student(
                                this.state.authUser.college,
                                this.state.authUser.uid
                              )
                              .remove();
                          }
                          if (this._isMounted) {
                            this.props.firebase
                              .userAuthorization(this.state.authUser.uid)
                              .remove();
                          }
                        })
                        .then(() => {
                          if (this._isMounted) {
                            this.props.history.push(ROUTES.LANDING);
                            window.location.reload(true);
                          }
                        })
                        .catch((error) => {
                          this.setState({ error: error.message });
                        });
                    } catch (error) {
                      this.setState({ error: error });
                    }
                  }
                } else if (this.state.authUser.role === "Faculty") {
                  if (this._isMounted) {
                    try {
                      this.props.firebase
                        .doAccountDelete()
                        .then(() => {
                          if (this._isMounted) {
                            this.props.firebase
                              .faculty(
                                this.state.authUser.college,
                                this.state.authUser.uid
                              )
                              .remove();
                          }
                          if (this._isMounted) {
                            this.props.firebase
                              .userAuthorization(this.state.authUser.uid)
                              .remove();
                          }
                        })
                        .then(() => {
                          if (this._isMounted) {
                            this.props.history.push(ROUTES.LANDING);
                            window.location.reload(true);
                          }
                        })
                        .catch((error) => {
                          this.setState({ error: error.message });
                        });
                    } catch (error) {
                      this.setState({ error: error });
                    }
                  }
                }
              },
            },
          ]}
        />
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
                      console.log(error);
                    });
                } catch (error) {
                  this.setState({ error: error });
                }
              },
            },
          ]}
        />
        <div className="profileHamburger" onClick={this.hamburgerToggle}></div>
        <Menu
          hamburgerToggle={this.hamburgerToggle}
          isToggleHamburger={this.state.isToggleHamburger}
          name={`Profile`}
          NavBarSliderDesktop={!isPlatform("android")}
        />
        <div
          className={
            this.state.onClickAccountDel
              ? "profilePageBaseMain visibleProfilePageBaseMain"
              : "profilePageBaseMain"
          }
        >
          <Banner
            banner={StuSignUpBanner}
            alt="FcaulLoginBanner"
            banner_header="Your Profile"
          />
          <div>
            <form className="profileForm">
              <div className="flex-grp">
                <div className="group">
                  <div className="inputProfile input">
                    {this.state.authUser.name}
                    <label
                      className={
                        this.state.authUser.name !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      Name
                    </label>
                  </div>
                </div>
                <div className="group">
                  <div className="inputProfile input">
                    {this.state.authUser.email}
                    <label
                      className={
                        this.state.authUser.email !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      Email ID
                    </label>
                  </div>
                </div>
              </div>
              <br />
              <div className="flex-grp">
                {this.state.authUser.role === ROLES.STUDENT && (
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.enrolment_no}
                      <label
                        className={
                          this.state.authUser.enrolment_no !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Enrolment No.
                      </label>
                    </div>
                  </div>
                )}
                <div className="group">
                  <div
                    className="inputProfile input"
                    style={{
                      textTransform: `capitalize`,
                    }}
                  >
                    {this.state.authUser.college.toLowerCase()}
                    <label
                      className={
                        this.state.authUser.college !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      College
                    </label>
                  </div>
                </div>
                {this.state.authUser.role === ROLES.FACULTY && (
                  <div className="group grp-last">
                    <div className="inputProfile input">
                      {this.state.authUser.access_code}
                      <label
                        className={
                          this.state.authUser.college !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Access Code
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <br />

              {this.state.authUser.role === ROLES.STUDENT && (
                <div className="flex-grp">
                  <div className="group">
                    <div
                      className="inputProfile input"
                      style={{
                        textTransform: `capitalize`,
                      }}
                    >
                      {this.state.authUser.department.toLowerCase()}
                      <label
                        className={
                          this.state.authUser.department !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Department
                      </label>
                    </div>
                  </div>
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.division}
                      <label
                        className={
                          this.state.authUser.division !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Division
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <br />

              {this.state.authUser.role === ROLES.STUDENT && (
                <div className="flex-grp">
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.semester}
                      <label
                        className={
                          this.state.authUser.semester !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Semester
                      </label>
                    </div>
                  </div>
                  <div className="group grp-last">
                    <div className="inputProfile input">
                      {this.state.authUser.shift}
                      <label
                        className={
                          this.state.authUser.shift !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Shift
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {this.state.authUser.role === "Student" && <br />}
              {this.state.authUser.role === "Student" && <br />}

              <div className="ProfileEditDelBtn">
                <Link to={ROUTES.PASSWORD_UPDATE}>
                  <div className="editFontawesomeBtn">
                    <FontAwesomeIcon icon="undo" />
                  </div>
                </Link>
                <div
                  className="deleteFontawesomeBtn"
                  onClick={this._onClickAccountDel}
                >
                  <FontAwesomeIcon icon="trash-alt" />
                </div>
                <div
                  className="signOutFontawesomeBtn"
                  onClick={this.onClickSignOut}
                >
                  <FontAwesomeIcon icon="sign-out-alt" />
                </div>
              </div>

              {this.state.error !== "" ? (
                <div className="error-text">
                  <p style={{ color: `#ff0000` }}>*{this.state.error}*</p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const Profile = compose(withRouter, withFirebase)(ProfilePageBase);

export default ProfilePageCondition;

export { Profile };
