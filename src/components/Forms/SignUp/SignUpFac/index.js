import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "../../../Session/context";
import Classroom from "../../../classroom";
import TermsCheckbox from "../TermsCheckbox";

import { withFirebase } from "../../../Configuration";
import CollegeJSON from "../../../../CollegeList.json";

import * as ROUTES from "../../../../constants/routes";
import * as ROLE from "../../../../constants/role";

import Banner from "../../FormBanner";
import FacSignUpBanner from "../../../../images/faculty_banner.png";
import "../../index.css";

import Spinner from "../../../spinner";

const condition = (authUser) => !!authUser;

const SignUpFacultyPageCondition = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (condition(authUser) ? <Classroom /> : <SignUpFacPage />)}
  </AuthUserContext.Consumer>
);

class SignUpFacPage extends Component {
  render() {
    return (
      <div style={{ backgroundColor: `#FCFCFC` }}>
        <Banner
          banner={FacSignUpBanner}
          alt="FcaulLoginBanner"
          banner_header="Register as a Faculty"
          banner_subheader="Please Register Your Faculty Profile By Filling Below Blanks"
        />
        <SignUpFacForm />
        <SignInLink />
      </div>
    );
  }
}

const INITIAL_STATE = {
  fname: "",
  lname: "",
  email: "",
  collegeWithCode: "",
  college: "",
  accesscode: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  role: ROLE.FACULTY,
  college_list: CollegeJSON,

  termCheckboxToggle: false,

  isSpinnerToggle: false,

  showAlert: false,
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";
const ERROR_CODE_INVALID_EMAIL = "auth/invalid-email";

const ERROR_MSG_ACCOUNT_EXISTS =
  "An account with this E-Mail address already exists. Try to login with another account instead.";
const ERROR_MSG_INVALID_EMAIL = "Invalid Email ID";

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCollege = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value !== "----[College Code / College Name]----") {
      this.setState({
        college: this.state.college_list.find(
          (college) =>
            `${college.code} - ${college.name}` === event.target.value
        ).name,
      });
    } else if (event.target.value === "----[College Code / College Name]----") {
      this.setState({
        college: "",
      });
    }
  };

  onSubmit = (event) => {
    const {
      fname,
      lname,
      email,
      college,
      accesscode,
      passwordOne,
      passwordTwo,
      role,
    } = this.state;

    this.setState({ error: null, isSpinnerToggle: true });

    if (
      passwordOne === "" &&
      passwordTwo === "" &&
      fname === "" &&
      lname === "" &&
      email === "" &&
      accesscode === "" &&
      college === ""
    ) {
      this.setState({ error: "Please Fill Everything Up Properly" });
    } else if (college === "----[College Code / College Name]----") {
      this.setState({ error: "Please Select the right Options" });
    } else if (fname === "" || lname === "") {
      this.setState({ error: "Please Enter Your First & Last Name Properly" });
    } else if (email === "") {
      this.setState({ error: "Please Enter Your Email Address" });
    } else if (college === "") {
      this.setState({ error: "Please Select Your College" });
    } else if (passwordOne !== passwordTwo) {
      this.setState({ error: "Passwords are not matching" });
    } else if (passwordOne === "") {
      this.setState({ error: "Please Enter a Password" });
    } else if (accesscode === "") {
      this.setState({ error: "Please Enter an Access Code" });
    } else if (accesscode.length !== 4 && accesscode.length !== 6) {
      this.setState({ error: "Access code must be of 4 or 6 digits" });
    } else if (!this.state.termCheckboxToggle) {
      this.setState({ error: "Please Accept T&C" });
    } else {
      this.props.firebase
        .doCreateUserWithEmailAndPassword(email, passwordOne)
        .then((authUser) => {
          // Create a user in your Firebase realtime database
          this.props.firebase.userAuthorization(authUser.user.uid).set({
            college,
            role,
          });

          this.props.firebase.faculty(college, authUser.user.uid).set({
            name: fname + " " + lname,
            email,
            access_code: accesscode,
          });
        })
        .then(() => {
          this.setState({ ...INITIAL_STATE });
          this.props.history.push(ROUTES.CLASSROOM);
        })
        .catch((error) => {
          if (this.state.error == null) {
            if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
              error.message = ERROR_MSG_ACCOUNT_EXISTS;
              this.setState({ error: error.message });
            } else if (error.code === ERROR_CODE_INVALID_EMAIL) {
              error.message = ERROR_MSG_INVALID_EMAIL;
              this.setState({ error: error.message });
            }
          }
        });
    }

    event.preventDefault();
  };

  termCheckboxToggleInfo = () => {
    this.setState({ termCheckboxToggle: !this.state.termCheckboxToggle });
  };

  componentDidMount() {
    this.setState({ showAlert: true });
  }

  render() {
    const {
      fname,
      lname,
      email,
      college,
      collegeWithCode,
      accesscode,
      passwordOne,
      passwordTwo,
      error,

      college_list,
    } = this.state;
    var splitCollege = college.split(" ");
    var splitCollegeLimit = college.split(" ", 4);

    return (
      <form
        onSubmit={this.onSubmit}
        className="FacSignupForm"
        autoComplete="off"
      >
        <div className="flex-grp flex-fila-grp">
          <div className="group fi-name">
            <input
              type="text"
              name="fname"
              className="input"
              value={fname}
              onChange={this.onChange}
            />
            <label
              className={fname !== "" ? "placeholder above" : "placeholder"}
            >
              First Name
            </label>
          </div>
          <div className="group la-name">
            <input
              type="text"
              name="lname"
              className="input"
              value={lname}
              onChange={this.onChange}
            />
            <label
              className={lname !== "" ? "placeholder above" : "placeholder"}
            >
              Last Name
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              autoComplete="nope"
              type="email"
              name="email"
              className="input"
              value={email}
              onChange={this.onChange}
            />
            <label
              className={email !== "" ? "placeholder above" : "placeholder"}
            >
              Email ID
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={collegeWithCode}
              onChange={this.onChangeCollege}
              name="collegeWithCode"
            >
              <option>----[College Code / College Name]----</option>
              {college_list.map((e, key) => {
                return (
                  <option key={key}>
                    {e.code} - {e.name}
                  </option>
                );
              })}
            </select>
            <label className={"dropdown-placeholder"}>
              College
              {college !== "" ? " - " : null}
              {college !== ""
                ? splitCollege.length > 4
                  ? splitCollegeLimit.map((i) => i[0])
                  : splitCollege.map((i) => i[0])
                : null}
              {college !== "" && splitCollege.length > 4 ? ".." : null}
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              autoComplete="new-password"
              type="password"
              name="passwordOne"
              className="input"
              value={passwordOne}
              onChange={this.onChange}
            />
            <label
              className={
                passwordOne !== "" ? "placeholder above" : "placeholder"
              }
            >
              Password
            </label>
          </div>
          <div className="group">
            <input
              autoComplete="new-password"
              type="password"
              name="passwordTwo"
              className="input"
              value={passwordTwo}
              onChange={this.onChange}
            />
            <label
              className={
                passwordTwo !== "" ? "placeholder above" : "placeholder"
              }
            >
              Confirm Password
            </label>
          </div>
        </div>

        <br />
        <div className="group">
          <input
            type="number"
            name="accesscode"
            className="input"
            value={accesscode}
            onChange={this.onChange}
          />
          <label
            className={accesscode !== "" ? "placeholder above" : "placeholder"}
          >
            Access Code
          </label>
        </div>

        <TermsCheckbox toggleInfo={this.termCheckboxToggleInfo} />

        <button type="submit" name="submit" className="SubmitBut">
          Submit
        </button>

        {this.state.isToggleSpinner && error === null ? (
          <div style={{ marginBottom: `10px` }}>
            <Spinner />
          </div>
        ) : null}

        <div className="error-text">
          {error !== null ? (
            <p style={{ color: `#ff0000` }}>*{error}*</p>
          ) : null}
        </div>
      </form>
    );
  }
}

const SignInLink = () => (
  <p
    style={{
      textAlign: `center`,
      padding: `0`,
      paddingBottom: `60px`,
      margin: `0`,
      cursor: `default`,
    }}
  >
    Already have an account?{" "}
    <Link
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        paddingLeft: `5px`,
        cursor: `default`,
      }}
      to={ROUTES.SIGN_IN}
    >
      Sign In
    </Link>
  </p>
);

const SignUpFacForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpFacultyPageCondition;

export { SignUpFacForm };
