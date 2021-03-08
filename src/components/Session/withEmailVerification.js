import React from "react";

import AuthUserContext from "./context";

import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as ROUTES from "../../constants/routes";
import { IonAlert } from "@ionic/react";

import Spinner from "../spinner";

const needsEmailVerification = (authUser) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData
    .map((provider) => provider.providerId)
    .includes("password");

const buttonVerificationRegularCss = {
  marginTop: `10px`,
  cursor: `default`,
  backgroundColor: `#ffffff`,
  color: `#000000`,
  fontSize: `13px`,
  width: `200px`,
  height: `30px`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
  borderRadius: `6px`,
};

const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: JSON.parse(localStorage.getItem("authUser")),
        isSent: false,
        showAlertLogOut: false,
        showAlertDelete: false,
        showAlertNext: false,
        error: "",
        isToggleSpinner: false,
      };
    }

    onSendEmailVerification = () => {
      this.setState({ isSent: false, isToggleSpinner: true });
      try {
        this.props.firebase
          .doSendEmailVerification()
          .then(() => this.setState({ isSent: true, isToggleSpinner: false }))
          .catch((error) => {
            this.setState({ error: error.message });
          });
      } catch (error) {
        this.setState({
          error: "Something went wrong! Kindly try again later.",
        });
      }
    };

    doLogOut = () => {
      this.setState({ showAlertLogOut: true });
    };

    doDeleteAccount = () => {
      this.setState({ showAlertDelete: true });
    };

    doRefreshNext = () => {
      this.setState({ showAlertNext: true });
    };

    render() {
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            needsEmailVerification(authUser) ? (
              <div
                style={{
                  position: `absolute`,
                  top: `50%`,
                  left: `50%`,
                  transform: `translate(-50%,-50%)`,
                }}
              >
                <div
                  className="needsEmailVerification"
                  style={{
                    backgroundColor: `#4885ed`,
                    width: `280px`,
                    borderRadius: "10px",
                    padding: `15px 10px`,
                    display: `flex`,
                    flexDirection: `column`,
                    justifyContent: `center`,
                    alignItems: `center`,
                    color: `#ffffff`,
                    textAlign: `center`,
                  }}
                >
                  <IonAlert
                    isOpen={this.state.showAlertLogOut}
                    onDidDismiss={() =>
                      this.setState({ showAlertLogOut: false })
                    }
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
                  <IonAlert
                    isOpen={this.state.showAlertDelete}
                    onDidDismiss={() =>
                      this.setState({ showAlertDelete: false })
                    }
                    header={"Confirmation"}
                    message={"Are you sure you want to Delete your Account?"}
                    buttons={[
                      {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary",
                      },
                      {
                        text: "Yes, Delete It.",
                        handler: () => {
                          if (this.state.authUser.role === "Student") {
                            this.props.firebase
                              .doAccountDelete()
                              .then(() => {
                                this.props.firebase
                                  .studentSubjects(this.state.authUser.college)
                                  .on("child_added", (snapshot) => {
                                    var facKey = snapshot.key;

                                    this.props.firebase
                                      .faculty(
                                        this.state.authUser.college,
                                        facKey
                                      )
                                      .child(`subjects`)
                                      .on("child_added", (snapshot) => {
                                        var subKey = snapshot.key;

                                        this.props.firebase
                                          .studentLengthAttendance(
                                            this.state.authUser.college,
                                            facKey,
                                            subKey,
                                            this.state.authUser.uid
                                          )
                                          .remove();
                                      });
                                  });
                                this.props.firebase
                                  .student(
                                    this.state.authUser.college,
                                    this.state.authUser.uid
                                  )
                                  .remove();
                                this.props.firebase
                                  .userAuthorization(this.state.authUser.uid)
                                  .remove();
                              })
                              .then(() => {
                                this.props.history.push(ROUTES.LANDING);
                                window.location.reload(true);
                              })
                              .catch((error) => {
                                this.setState({ error: error.message });
                              });
                          } else if (this.state.authUser.role === "Faculty") {
                            this.props.firebase
                              .doAccountDelete()
                              .then(() => {
                                this.props.firebase
                                  .faculty(
                                    this.state.authUser.college,
                                    this.state.authUser.uid
                                  )
                                  .remove();
                                this.props.firebase
                                  .userAuthorization(this.state.authUser.uid)
                                  .remove();
                              })
                              .then(() => {
                                this.props.history.push(ROUTES.LANDING);
                                window.location.reload(true);
                              })
                              .catch((error) => {
                                this.setState({ error: error.message });
                              });
                          }
                        },
                      },
                    ]}
                  />
                  <IonAlert
                    isOpen={this.state.showAlertNext}
                    onDidDismiss={() => this.setState({ showAlertNext: false })}
                    header={"Alert"}
                    message={
                      this.state.isSent
                        ? "Make sure to verify your Account before going ahead by clicking on the link sent to your registered Email."
                        : "You've not verified your Account yet! Kindly do that first."
                    }
                    buttons={
                      this.state.isSent
                        ? [
                            {
                              text: "Cancel",
                              role: "cancel",
                              cssClass: "secondary",
                            },
                            {
                              text: "Next",
                              handler: () => {
                                this.setState({ isToggleSpinner: true });
                                this.props.history.push(ROUTES.CLASSROOM);
                                window.location.reload(true);
                              },
                            },
                          ]
                        : [
                            {
                              text: "Okay",
                              role: "cancel",
                              cssClass: "secondary",
                            },
                          ]
                    }
                  />
                  {this.state.isSent ? (
                    this.state.error !== "" ? (
                      <span
                        style={{
                          margin: `0px`,
                          padding: `0px`,
                          fontSize: `15px`,
                          fontWeight: `500`,
                        }}
                      >
                        {this.state.error}
                      </span>
                    ) : (
                      <p
                        style={{
                          margin: `0px`,
                          padding: `0px`,
                          fontSize: `15px`,
                          fontWeight: `300`,
                        }}
                      >
                        <span style={{ fontWeight: `600` }}>
                          E-Mail confirmation sent:
                        </span>{" "}
                        Check your E-Mail (Spam folder included) for a
                        confirmation E-Mail. Click on the 'Next' Icon once you
                        confirm your E-Mail Address. Click on the below button
                        to again send a confirmation email.
                      </p>
                    )
                  ) : this.state.error !== "" ? (
                    <span
                      style={{
                        margin: `0px`,
                        padding: `0px`,
                        fontSize: `15px`,
                        fontWeight: `500`,
                      }}
                    >
                      {this.state.error}
                    </span>
                  ) : (
                    <p
                      style={{
                        margin: `0px`,
                        padding: `0px`,
                        fontSize: `15px`,
                        fontWeight: `300`,
                      }}
                    >
                      <span style={{ fontWeight: `700` }}>
                        Verify your E-Mail :
                      </span>{" "}
                      Click on the below button to send a confirmation E-Mail to
                      your registered mail address.
                    </p>
                  )}

                  <div
                    onClick={this.onSendEmailVerification}
                    style={
                      this.state.error !== ""
                        ? { display: `none` }
                        : buttonVerificationRegularCss
                    }
                  >
                    {!this.state.isSent &&
                    this.state.isToggleSpinner &&
                    this.state.error === "" ? (
                      <Spinner size="25px" />
                    ) : null}
                    {this.state.isSent && this.state.error === ""
                      ? `Confirmation Mail Sent!`
                      : !this.state.isToggleSpinner
                      ? `Send confirmation E-Mail`
                      : null}
                  </div>

                  <div
                    style={{
                      marginTop: `15px`,
                      display: `flex`,
                      justifyContent: `center`,
                      alignItems: `center`,
                    }}
                  >
                    <div
                      style={{
                        cursor: `default`,
                        backgroundColor: `#3cba54`,
                        width: `35px`,
                        height: `35px`,
                        color: `#ffffff`,
                        display: `flex`,
                        justifyContent: `center`,
                        alignItems: `center`,
                        borderRadius: `50%`,
                        transform: `rotate(180deg)`,
                      }}
                      onClick={this.doLogOut}
                    >
                      <FontAwesomeIcon icon="sign-out-alt" />
                    </div>
                    <div
                      style={{
                        cursor: `default`,
                        backgroundColor: `#db3236`,
                        width: `35px`,
                        height: `35px`,
                        color: `#ffffff`,
                        display: `flex`,
                        justifyContent: `center`,
                        alignItems: `center`,
                        borderRadius: `50%`,
                        margin: `0 18px`,
                      }}
                      onClick={this.doDeleteAccount}
                    >
                      <FontAwesomeIcon icon="trash-alt" />
                    </div>
                    <div
                      style={{
                        cursor: `default`,
                        backgroundColor: `#3cba54`,
                        width: `35px`,
                        height: `35px`,
                        color: `#ffffff`,
                        display: `flex`,
                        justifyContent: `center`,
                        alignItems: `center`,
                        borderRadius: `50%`,
                      }}
                      onClick={this.doRefreshNext}
                    >
                      <FontAwesomeIcon icon="arrow-right" />
                    </div>
                  </div>
                </div>

                {this.state.isToggleSpinner && this.state.isSent ? (
                  <div style={{ marginTop: `12px` }}>
                    <Spinner />
                  </div>
                ) : null}
              </div>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(withRouter, withFirebase)(WithEmailVerification);
};

export default withEmailVerification;
