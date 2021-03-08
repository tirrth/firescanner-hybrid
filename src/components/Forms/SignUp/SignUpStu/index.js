import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "../../../Session/context";
import Classroom from "../../../classroom";
import TermCheckbox from "../TermsCheckbox";

import { withFirebase } from "../../../Configuration";
import CollegeJSON from "../../../../CollegeList.json";

import * as ROUTES from "../../../../constants/routes";
import * as ROLE from "../../../../constants/role";

import Banner from "../../FormBanner";
import StuSignUpBanner from "../../../../images/stud_banner.png";
import "../../index.css";

import Spinner from "../../../spinner";

const condition = (authUser) => !!authUser;

const SignUpStudentPageCondition = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (condition(authUser) ? <Classroom /> : <SignUpStuPage />)}
  </AuthUserContext.Consumer>
);

class SignUpStuPage extends Component {
  render() {
    return (
      <div style={{ backgroundColor: `#FCFCFC` }}>
        <Banner
          banner={StuSignUpBanner}
          alt="FcaulLoginBanner"
          banner_header="Register as an Attendee"
          banner_subheader="Please Register Your Student Profile By Filling Below Blanks"
        />
        <SignUpStuForm />
        <SignInLink />
      </div>
    );
  }
}

const INITIAL_STATE = {
  fname: "",
  lname: "",
  college: "",
  collegeWithCode: "",
  enrolno: "",
  department: "",
  semester: "",
  division: "",
  email: "",
  shift: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  role: ROLE.STUDENT,

  college_list: CollegeJSON,
  course_list: [],

  termCheckboxToggle: false,

  isToggleSpinner: false,
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";
const ERROR_CODE_INVALID_EMAIL = "auth/invalid-email";

const ERROR_MSG_ACCOUNT_EXISTS =
  "An account with this E-Mail address already exists. Try to login with another account instead.";
const ERROR_MSG_INVALID_EMAIL = "Invalid Email ID";

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCollege = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    this.setState({
      course_list:
        event.target.value !== "----[College Code / College Name]----"
          ? this.state.college_list.find(
              (college) =>
                `${college.code} - ${college.name}` === event.target.value
            ).courses
          : [],
    });

    this.setState({ department: "" });

    if (event.target.value !== "----[College Code / College Name]----") {
      this.setState({
        college: this.state.college_list.find(
          (college) =>
            `${college.code} - ${college.name}` === event.target.value
        ).name,
      });
    } else if (event.target.value === "----[College Code / College Name]----") {
      this.setState({ college: "" });
    }
  };

  onChangeDepartment = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value === "--SELECT--") {
      this.setState({ department: "" });
    }
  };

  onSubmit = (event) => {
    const {
      fname,
      lname,
      college,
      enrolno,
      department,
      semester,
      division,
      email,
      shift,
      passwordOne,
      passwordTwo,
      role,
    } = this.state;

    this.setState({ error: null, isToggleSpinner: true });

    if (
      fname === "" &&
      lname === "" &&
      department === "" &&
      semester === "" &&
      college === "" &&
      division === "" &&
      shift === "" &&
      passwordOne === "" &&
      passwordTwo === "" &&
      email === "" &&
      enrolno === ""
    ) {
      this.setState({ error: "Please Fill Everything Up Properly" });
    } else if (
      semester === "--SELECT--" ||
      division === "--SELECT--" ||
      shift === "--SELECT--" ||
      college === "----[College Code / College Name]----" ||
      department === "--SELECT--"
    ) {
      this.setState({ error: "Please Select the right Options" });
    } else if (fname === "" || lname === "") {
      this.setState({ error: "Please Enter Your First & Last Name Properly" });
    } else if (college === "") {
      this.setState({ error: "Please Select Your College" });
    } else if (department === "") {
      this.setState({ error: "Please Select Your Department" });
    } else if (semester === "") {
      this.setState({ error: "Please Select Your Semester" });
    } else if (division === "") {
      this.setState({ error: "Please Select Your Division" });
    } else if (enrolno === "") {
      this.setState({ error: "Please Enter Your GTU Enrolment No." });
    } else if (enrolno.length !== 12) {
      this.setState({ error: "Incorrect GTU Enrolment No." });
    } else if (email === "") {
      this.setState({ error: "Please Enter Your Email Address" });
    } else if (shift === "") {
      this.setState({ error: "Please Enter Your College Shift" });
    } else if (passwordOne !== passwordTwo) {
      this.setState({ error: "Passwords are not matching" });
    } else if (passwordOne === "") {
      this.setState({ error: "Please Enter Password" });
    } else if (!this.state.termCheckboxToggle) {
      this.setState({ error: "Please Accept T&C" });
    } else {
      if (this._isMounted) {
        this.props.firebase
          .doCreateUserWithEmailAndPassword(email, passwordOne)
          .then((authUser) => {
            if (this._isMounted) {
              // Create a user in your Firebase realtime database
              this.props.firebase
                .userAuthorization(authUser.user.uid)
                .set({
                  college,
                  role: role,
                  emailVerified: false,
                })
                .then(() => {
                  if (this._isMounted) {
                    this.props.firebase
                      .student(college, authUser.user.uid)
                      .set({
                        name: fname + " " + lname,
                        enrolment_no: enrolno,
                        department,
                        semester,
                        division,
                        email,
                        shift,
                      })
                      .then(() => {
                        if (this._isMounted) {
                          // console.log("Successfully Signed Up.");
                          this.setState({ ...INITIAL_STATE });
                          // console.log("Initialized newState!!");
                          this.props.history.push(ROUTES.CLASSROOM);
                          // console.log("Redirected to Home!!");
                          // window.location.reload(true);
                        }
                      });
                  }
                });
            } else {
              this.props.firebase.doAccountDelete();
              this.setState({
                isToggleSpinner: false,
                error: "Something went wrong! Try again later.",
              });
            }
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
    }

    event.preventDefault();
  };

  termCheckboxToggleInfo = () => {
    this.setState({ termCheckboxToggle: !this.state.termCheckboxToggle });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      fname,
      lname,
      college,
      collegeWithCode,
      enrolno,
      department,
      semester,
      division,
      email,
      shift,
      passwordOne,
      passwordTwo,
      error,

      college_list,
      course_list,
    } = this.state;

    var splitCollege = college.split(" ");
    var splitCollegeLimit = college.split(" ", 4);
    var splitDept = department.split(" ");
    var splitDeptLimit = college.split(" ", 4);
    return (
      <form
        onSubmit={this.onSubmit}
        className="StuSignupForm"
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
                  ? splitCollegeLimit.map((i, key) => {
                      return <span key={key}>{i[0]}</span>;
                    })
                  : splitCollege.map((i, key) => {
                      return <span key={key}>{i[0]}</span>;
                    })
                : null}
              {college !== "" && splitCollege.length > 4 ? ".." : null}
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={department}
              onChange={this.onChangeDepartment}
              name="department"
            >
              <option>--SELECT--</option>
              {course_list.map((dept, key) => {
                return <option key={key}>{dept}</option>;
              })}
            </select>

            <label className={"dropdown-placeholder"}>
              Department
              {department !== "" ? " - " : null}
              {department !== ""
                ? splitDept.length > 4
                  ? splitDeptLimit.map((i) => i[0])
                  : splitDept.map((i) => i[0])
                : null}
              {department !== "" && splitDept.length > 4 ? ".." : null}
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="semester"
              value={semester}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
            </select>
            <label className="dropdown-placeholder">
              Semester
              {semester && semester !== "--SELECT--" ? " - " + semester : null}
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="division"
              value={division}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>Not Any</option>
            </select>
            <label className="dropdown-placeholder">
              {division && division !== "--SELECT--"
                ? division === "Not Any"
                  ? "Division - No"
                  : "Division - " + division
                : "Class Div."}
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              type="number"
              name="enrolno"
              className="input"
              value={enrolno}
              onChange={this.onChange}
            />
            <label
              className={enrolno !== "" ? "placeholder above" : "placeholder"}
            >
              Enrolment No.
            </label>
          </div>

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
        </div>
        <br />
        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="shift"
              value={shift}
              onChange={this.onChange}
            >
              <option>--SELECT--</option>
              <option>First Shift</option>
              <option>Second Shift</option>
              <option>No Shift (Has only one Shift)</option>
            </select>
            <label className="dropdown-placeholder">
              Shift
              {shift && shift !== "--SELECT--"
                ? " - " + shift.substr(0, shift.indexOf(" "))
                : null}
            </label>
          </div>
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
        </div>
        <br />
        <div className="flex-grp flex-fila-grp">
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

        <TermCheckbox toggleInfo={this.termCheckboxToggleInfo} />

        <button type="submit" name="submit" className="SubmitBut">
          Submit
        </button>

        {this.state.isToggleSpinner && error === null ? (
          <div style={{ marginTop: `10px` }}>
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
    Already have an account?
    <Link
      to={ROUTES.SIGN_IN}
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        paddingLeft: `5px`,
        cursor: `default`,
      }}
    >
      Sign In
    </Link>
  </p>
);

const SignUpStuForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpStudentPageCondition;

export { SignUpStuForm };
