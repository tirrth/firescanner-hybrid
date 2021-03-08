import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import SignInPage from "../Forms/SignIn";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import FacultyImg from "../../images/faculty.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ReactDOMServer from "react-dom/server";

import AuthUserContext from "../Session/context";

import "./records.css";
import RecordList from "./recordList";

const condition = (authUser) => !!authUser;

const Records = () => (
  <AuthUserContext.Consumer>
    {(authUser) =>
      condition(authUser) &&
      JSON.parse(localStorage.getItem("authUser")).role === "Faculty" ? (
        <RecordsWithFirebase />
      ) : (
        <SignInPage />
      )
    }
  </AuthUserContext.Consumer>
);

class RecordsBaseMain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isToggleHamburger: false,
      authUser: JSON.parse(localStorage.getItem("authUser")),
      profile_name: JSON.parse(localStorage.getItem("authUser")).name,

      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,

      subkey: "",
      facDate: "",
      facRandom: "",

      blurBg: false,
      recordsCardMainSectionHide: false,
      RecordsListMainSectionHide: false,

      recordListTable: false,
    };

    this.recordsCardMainSection = React.createRef();

    this.recordsListCardMain = React.createRef();

    this.RecordsListMainSectionCloseBtn = React.createRef();
  }

  componentDidMount() {
    this.props.firebase
      .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
      .on("child_added", (snapshot) => {
        var subject = snapshot.child("subject").val();
        var department = snapshot.child("department").val();
        var semester = snapshot.child("semester").val();
        var division = snapshot.child("division").val();
        var subKeys = snapshot.key;
        var shift = snapshot.child("shift").val();
        if (shift === `No Shift (Has only one Shift)`) {
          shift = "No Shift";
        } else {
          shift = snapshot.child("shift").val();
        }

        var recordsCardMain = document.createElement("div");
        var recordsCardMainInfo = document.createElement("div");
        var recordsCardMainInfoSub = document.createElement("h3");
        var recordsCardMainInfoDept = document.createElement("p");
        var recordsCardMainInfoSDShift = document.createElement("p");
        var recordsCardMainInfoSem = document.createElement("span");
        var recordsCardMainInfoDiv = document.createElement("span");
        var recordsCardMainInfoShift = document.createElement("span");

        recordsCardMain.className = "recordsCardMain";

        recordsCardMain.appendChild(recordsCardMainInfo);
        recordsCardMainInfo.appendChild(recordsCardMainInfoSub);
        recordsCardMainInfo.appendChild(recordsCardMainInfoDept);
        recordsCardMainInfo.appendChild(recordsCardMainInfoSDShift);
        recordsCardMainInfoSDShift.appendChild(recordsCardMainInfoSem);
        recordsCardMainInfoSDShift.appendChild(recordsCardMainInfoDiv);
        recordsCardMainInfoSDShift.appendChild(recordsCardMainInfoShift);

        recordsCardMainInfoDept.className = `recordsCardMainInfoDeptParagraph`;

        recordsCardMainInfoSub.textContent = `${subject}`;
        recordsCardMainInfoDept.textContent = department;
        recordsCardMainInfoSem.textContent = `Sem(${semester}) - `;
        recordsCardMainInfoDiv.textContent = `Div(${division}) - `;
        recordsCardMainInfoShift.textContent = `Shift(${shift})`;

        recordsCardMain.addEventListener("click", () => {
          this.setState({
            blurBg: true,
            RecordsListMainSectionHide: true,
          });
          this.setState({ subkey: snapshot.key });
          this.props.firebase
            .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
            .child(`${subKeys}/attendees`)
            .on("child_added", (snapshot) => {
              var attendanceRecordDates = snapshot.key;

              this.props.firebase
                .facultySubjects(
                  this.state.facAuthID,
                  this.state.fac_college_name
                )
                .child(`${subKeys}/attendees/${attendanceRecordDates}`)
                .on("child_added", (snapshot) => {
                  var attendanceRecordRandomNo = snapshot.key;

                  // console.log(attendanceRecordDates, attendanceRecordRandomNo);

                  var RecordsListCard = document.createElement("div");
                  var RecordsListCardDR = document.createElement("div");
                  var RecordsListCardDate = document.createElement("div");
                  var RecordsListCardRandom = document.createElement("div");
                  var RecordsListDownloadBtn = document.createElement("div");

                  RecordsListCard.className = "RecordsListCard";
                  RecordsListCardDR.className = "RecordsListCardDR";
                  RecordsListCardDate.className = "RecordsListCardDate";
                  RecordsListCardRandom.className = "RecordsListCardRandom";
                  RecordsListDownloadBtn.className = "RecordsListDownloadBtn";

                  const RecordListCardDownloadBtn = ReactDOMServer.renderToStaticMarkup(
                    <FontAwesomeIcon
                      icon="download"
                      style={{
                        fontSize: `12px`,
                      }}
                    />
                  );

                  RecordsListCard.appendChild(RecordsListCardDR);
                  RecordsListCard.appendChild(RecordsListDownloadBtn);

                  RecordsListCardDR.appendChild(RecordsListCardDate);
                  RecordsListCardDR.appendChild(RecordsListCardRandom);

                  RecordsListDownloadBtn.innerHTML = RecordListCardDownloadBtn;

                  RecordsListCard.addEventListener("click", () => {
                    this.setState({ facDate: attendanceRecordDates });
                    this.setState({ facRandom: attendanceRecordRandomNo });

                    this.setState({
                      recordListTable: true,
                      RecordsListMainSectionHide: false,
                      recordsCardMainSectionHide: true,
                    });
                  });

                  RecordsListCardDate.textContent = `${attendanceRecordDates} /`;
                  RecordsListCardRandom.textContent =
                    " " + attendanceRecordRandomNo;

                  this.recordsListCardMain.current.appendChild(RecordsListCard);
                });
            });
        });

        this.recordsCardMainSection.current.appendChild(recordsCardMain);
      });
  }

  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  recordsListMainSectionClose = () => {
    this.setState({ blurBg: false, RecordsListMainSectionHide: false });
    // window.location.reload(true);
  };

  onFeedbackClick = () => {
    alert(
      "Send me your feedback on this email address => tirthpatel5885@gmail.com"
    );
  };

  render() {
    return (
      <div
        className={
          this.state.blurBg
            ? "MainRecordsSectionDesktop MainRecordsSectionDesktopOverflowHide"
            : "MainRecordsSectionDesktop"
        }
      >
        {!this.state.recordsCardMainSectionHide ? (
          <div
            className={
              this.state.blurBg ? "classListNavBar blur" : "classListNavBar"
            }
          >
            <div className="classListSectionhamburgerNav">
              <div
                onClick={this.hamburgerToggle}
                className={
                  !this.state.isToggleHamburger
                    ? "classListHamburger"
                    : "classListHamburger classListHamburgerOpen"
                }
              >
                <span className="classListHamburgerLineOne"></span>
                <span className="classListHamburgerLineTwo"></span>
                <span className="classListHamburgerLineThree"></span>
              </div>
              <div
                className={
                  !this.state.isToggleHamburger
                    ? "classListNavBarSlider"
                    : "classListNavBarSlider classListNavBarSliderSlide"
                }
              >
                <div
                  onClick={this.hamburgerToggle}
                  className={
                    !this.state.isToggleHamburger
                      ? "classListHamburgerClose"
                      : "classListHamburgerClose classListHamburgerOpen"
                  }
                >
                  <FontAwesomeIcon
                    icon="plus"
                    style={{
                      transform: `rotate(45deg)`,
                      fontSize: `20px`,
                      color: `#8d8d8d`,
                    }}
                  />
                </div>
                <div className="classListNavBarBanner">
                  <div className="classListNavBarBannerImg">
                    <img src={FacultyImg} alt="classListNavBarBannerImg" />
                  </div>
                  <div className="classListNavBarBannerHeader">
                    <p>{this.state.profile_name}</p>
                  </div>
                </div>
                <div className="classListNavBarNavList">
                  <ul>
                    <Link to={ROUTES.HOME} style={{ textDecoration: `none` }}>
                      <li>Classroom</li>
                    </Link>
                    <Link
                      className="classListNavBarNavListLinkProfile"
                      to={ROUTES.PROFILE}
                      style={{ textDecoration: `none` }}
                    >
                      <li>Profile</li>
                    </Link>
                    {this.state.authUser.role === "Faculty" && (
                      <Link
                        to={ROUTES.RECORDS}
                        style={{ textDecoration: `none` }}
                      >
                        <li>Records</li>
                      </Link>
                    )}
                    {this.state.authUser.role === "Student" && <li>ID Card</li>}
                    <li onClick={this.onFeedbackClick}>Feedback</li>

                    <li onClick={this.props.firebase.doSignOut}>Log Out</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="classListNavHeader">
              <span style={{ color: `#4885ed` }}>R</span>
              <span style={{ color: `#db3236` }}>e</span>
              <span style={{ color: `#f4c20d` }}>c</span>
              <span style={{ color: `#4885ed` }}>o</span>
              <span style={{ color: `#3cba54` }}>r</span>
              <span style={{ color: `#db3236` }}>d</span>
              <span style={{ color: `#f4c20d` }}>s</span>
            </p>
          </div>
        ) : null}

        {!this.state.recordsCardMainSectionHide ? (
          <div
            ref={this.recordsCardMainSection}
            className={
              this.state.blurBg
                ? "recordsCardMainSection blur recordsCardMainSectionOverflowHide"
                : "recordsCardMainSection"
            }
          ></div>
        ) : null}

        {!this.state.recordsCardMainSectionHide &&
        this.state.RecordsListMainSectionHide ? (
          <div className="RecordsListMainSection">
            <div className="RecordsListCardsHeader">Date / Random No.</div>
            <div
              className="RecordsListCardsMain"
              ref={this.recordsListCardMain}
            ></div>
            <div
              ref={this.RecordsListMainSectionCloseBtn}
              className="RecordsListMainSectionCloseBtn"
              onClick={this.recordsListMainSectionClose}
            >
              <FontAwesomeIcon
                icon="plus"
                style={{ transform: `rotate(45deg)` }}
              />
            </div>
          </div>
        ) : null}

        {this.state.recordListTable && (
          <RecordList
            subkey={this.state.subkey}
            facdate={this.state.facDate}
            facrandom={this.state.facRandom}
          />
        )}
      </div>
    );
  }
}

const RecordsWithFirebase = compose(withFirebase)(RecordsBaseMain);

export default Records;

export { RecordsWithFirebase };
