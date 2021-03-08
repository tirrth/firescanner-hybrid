import React, { Component } from "react";
import Banner from "../FormBanner";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import AuthUserContext from "../../Session/context";
import Classroom from "../../classroom";

import "../index.css";

import StuLoginBanner from "../../../images/loginbanner.png";

import { withFirebase } from "../../Configuration";
import * as ROUTES from "../../../constants/routes";

import Spinner from "../../spinner";

const condition = (authUser) => !!authUser;

const LoginPageCondition = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (condition(authUser) ? <Classroom /> : <SignInPage />)}
  </AuthUserContext.Consumer>
);

const SignInPage = () => (
  <div style={{ backgroundColor: `#FCFCFC`, height: `100vh` }}>
    <Banner
      banner={StuLoginBanner}
      alt="FcaulLoginBanner"
      banner_header="Welcome"
      banner_subheader="Please Login to your Account"
    />
    <SignInForm />
    <SignUpLink />
    <PasswordForgetLink />
  </div>
);

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE, isToggleSpinner: false };
  }

  onSubmit = (event) => {
    this.setState({ error: null, isToggleSpinner: true });
    event.preventDefault();

    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.CLASSROOM);
      })
      .catch((error) => {
        this.setState({ isToggleSpinner: false, error: error.message });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <div className="flex-grp">
          <div className="group">
            <input
              type="email"
              name="email"
              className="input"
              value={email}
              onChange={this.onChange}
              required
            />
            <label
              className={email !== "" ? "placeholder above" : "placeholder"}
            >
              Email ID
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              type="password"
              name="password"
              className="input"
              value={password}
              onChange={this.onChange}
              required
            />
            <label
              className={password !== "" ? "placeholder above" : "placeholder"}
            >
              Password
            </label>
          </div>
        </div>
        <br />

        <button type="submit" className="SubmitBut">
          Log In
        </button>
        {this.state.isToggleSpinner &&
        error === null &&
        email !== "" &&
        password !== "" ? (
          <div className="SpinnerDesktop">
            <Spinner />
          </div>
        ) : null}

        {!this.state.isToggleSpinner && (
          <div
            className={
              error !== null ? "error-text-login error-text" : "error-text"
            }
          >
            {error !== null ? (
              <p style={{ color: `#ff0000` }}>*{error}*</p>
            ) : null}
          </div>
        )}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p style={{ textAlign: `center`, marginTop: `50px`, cursor: `default` }}>
    Don't have an account?
    <Link
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        marginLeft: `5px`,
        cursor: `default`,
      }}
      to={ROUTES.LANDING}
    >
      Sign Up
    </Link>
  </p>
);
const PasswordForgetLink = () => (
  <p
    style={{
      textAlign: `center`,
      margin: `0px`,
      padding: `0px`,
      cursor: `default`,
    }}
  >
    <Link
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        paddingLeft: `5px`,
        cursor: `default`,
      }}
      to={ROUTES.PASSWORD_FORGET}
    >
      Forgot Password?
    </Link>
  </p>
);

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);

export default LoginPageCondition;

export { SignInForm };
