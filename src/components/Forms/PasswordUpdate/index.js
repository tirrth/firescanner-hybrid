import React, { Component } from "react";
import "../index.css";
import { withFirebase } from "../../Configuration";
import Banner from "../FormBanner";
import StuSignUpBanner from "../../../images/faculty_banner.png";
import Spinner from "../../spinner";

const PasswordUpdatePage = () => (
  <div>
    <Banner
      banner={StuSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Update Password"
      banner_subheader="Please Enter your New Password"
    />
    <PasswordUpdateForm />
  </div>
);

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: "",
  isSpinnerHide: true,
};

class PasswordUpdateFormBase extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  onSubmit = (event) => {
    if (this._isMounted) {
      this.setState({ isSpinnerHide: false, error: "" });

      const { passwordOne, passwordTwo } = this.state;

      if (passwordOne === "") {
        this.setState({ error: "Invalid Password!" });
      } else if (passwordOne !== passwordTwo) {
        this.setState({ error: "Passwords are not matching" });
      } else {
        if (this._isMounted) {
          this.props.firebase
            .doPasswordUpdate(passwordOne)
            .then(() => {
              this.setState({ ...INITIAL_STATE });
              this.setState({ error: "Updated Successfully!" });
            })
            .catch((error) => {
              this.setState({ error: error.message });
            });
        }
      }
      event.preventDefault();
    }
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { passwordOne, passwordTwo, error, isSpinnerHide } = this.state;

    return (
      <form onSubmit={this.onSubmit} style={{ paddingBottom: `30px` }}>
        <div className="group">
          <input
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            className="input"
          />
          <label className="placeholder">New Password</label>
        </div>
        <br />
        <br />
        <div className="group">
          <input
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            className="input"
          />
          <label className="placeholder">Confirm Password</label>
        </div>
        <br />
        <button type="submit" name="submit" className="SubmitBut">
          Reset
        </button>
        {error !== "" ? (
          <div
            className="error-text"
            style={{ marginTop: `-10px`, marginBottom: `-28px` }}
          >
            <p
              style={
                error === "Updated Successfully!"
                  ? { color: `green` }
                  : { color: `#ff0000` }
              }
            >
              {error === "Updated Successfully!" ? error : "*" + error + "*"}
            </p>
          </div>
        ) : null}
        {error === "" && !isSpinnerHide ? <Spinner /> : null}
      </form>
    );
  }
}
const PasswordUpdateForm = withFirebase(PasswordUpdateFormBase);

export default PasswordUpdatePage;

export { PasswordUpdateForm };
