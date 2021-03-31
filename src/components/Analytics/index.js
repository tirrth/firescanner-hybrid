import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SubjectList from "../subjectList";

import SignInPage from "../Forms/SignIn";

// eslint-disable-next-line
// import ReactDOMServer from "react-dom/server";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import AuthUserContext from "../Session/context";

import "./analytics.css";
import RecordList from "./recordList";
import AttendeesList from "./attendeesList";

import Menu from "../menu";
// import MessLoader from "../messLoader";

// import ContentNotFound from "../../images/content_error.svg";

import Spinner from "../spinner";

const condition = (authUser) => !!authUser;

class Analytics extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          condition(authUser) ? <AnalyticsWithFirebase /> : <SignInPage />
        }
      </AuthUserContext.Consumer>
    );
  }
}

var xDown = null;
var yDown = null;

class AnalyticsBaseMain extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      isToggleHamburger: false,
      authUser: JSON.parse(localStorage.getItem("authUser")),
      profile_name: JSON.parse(localStorage.getItem("authUser")).name,

      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,

      stu_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      stu_dept: JSON.parse(localStorage.getItem("authUser")).department,
      stu_sem: JSON.parse(localStorage.getItem("authUser")).semester,
      stu_div: JSON.parse(localStorage.getItem("authUser")).division,
      stu_shift: JSON.parse(localStorage.getItem("authUser")).shift,
      stu_enrolno: JSON.parse(localStorage.getItem("authUser")).enrolment_no,

      subkey: "",
      fackey: "",

      facDate: "",
      facRandom: "",

      blurBg: false,
      recordsCardMainSectionHide: false,
      RecordsListMainSectionHide: false,
      recordListTable: false,

      overallAnalyticsBtnClick: false,
      studentsAnalyticsBtnClick: false,
      analyticsBtn: true,

      presentStu: 0,
      totalStu: 0,

      subjectPercentageAverageAnalysis: 0,
      totalRecordsCount: 0,

      unClickable: false,

      NoRecordsHide: true,
      isSpinnerHide: true,

      subjectList: [],
      recordInfoList: [],
    };

    this.recordsCardMainSection = React.createRef();

    this.recordsListCardMain = React.createRef();

    this.subjectPercentageAverageAnalysis = React.createRef();

    this.StudentAttendanceCardMain = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;
    try {
      this.props.firebase.db.goOnline();
    } catch (error) {
      console.log(error);
    }

    document.addEventListener("touchstart", this.handleTouchStart, false);
    document.addEventListener("touchmove", this.handleTouchMove, false);
  }

  componentWillUnmount() {
    this._isMounted = false;
    try {
      this.props.firebase.db.goOffline();
    } catch (error) {
      console.log(error);
    }

    document.removeEventListener("touchstart", this.handleTouchStart, false);
    document.removeEventListener("touchmove", this.handleTouchMove, false);
  }

  unclickableToggle = (toggleBoolean) => {
    this.setState({ unClickable: toggleBoolean });
  };

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
    }
    /* reset values */
    xDown = null;
    yDown = null;
  };

  recordsListMainSectionClose = () => {
    window.location.reload(true);
  };

  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  overallAnalyticsBtnClick = () => {
    this.setState({ analyticsBtn: false, overallAnalyticsBtnClick: true });
  };

  studentsAnalyticsBtnClick = () => {
    this.setState({ analyticsBtn: false, studentsAnalyticsBtnClick: true });
  };

  onSubjectCardClick = (current_subKey, current_facKey) => {
    // console.log(current_facKey);

    if (this.state.overallAnalyticsBtnClick) {
      if (this._isMounted) {
        this.setState({
          RecordsListMainSectionHide: true,
          blurBg: true,
          isSpinnerHide: false,
        });

        this.props.firebase
          .facultySubjects(current_facKey, this.state.fac_college_name)
          .child(`${current_subKey}/attendees`)
          .once("value", (snapshot) => {
            if (this._isMounted) {
              const recordsObject = snapshot.val();

              if (recordsObject) {
                this.setState({
                  subkey: current_subKey,
                });

                var recordInfoList = [];
                var totalRecordsCount = 0;
                var subjectPercentageAverageAnalysis = 0;
                for (var attendanceRecordDate in recordsObject) {
                  // skip loop if the property is from prototype
                  if (!recordsObject.hasOwnProperty(attendanceRecordDate))
                    continue;

                  for (var attendanceRecordRandomNo in recordsObject[
                    attendanceRecordDate
                  ]) {
                    // skip loop if the property is from prototype
                    if (
                      !recordsObject[attendanceRecordDate].hasOwnProperty(
                        attendanceRecordRandomNo
                      )
                    )
                      continue;

                    var presentStu = 0;
                    var totalStu = 0;

                    for (var attendanceRecord in recordsObject[
                      attendanceRecordDate
                    ][attendanceRecordRandomNo]) {
                      // skip loop if the property is from prototype
                      if (
                        !recordsObject[attendanceRecordDate][
                          attendanceRecordRandomNo
                        ].hasOwnProperty(attendanceRecord)
                      )
                        continue;

                      totalStu++;
                      if (
                        recordsObject[attendanceRecordDate][
                          attendanceRecordRandomNo
                        ][attendanceRecord].stuAttendance === "present"
                      ) {
                        presentStu++;
                      }
                    }

                    var averagePercentage = Math.round(
                      (presentStu / totalStu) * 100
                    );

                    //To count total average of all the subjects
                    totalRecordsCount++;
                    subjectPercentageAverageAnalysis =
                      subjectPercentageAverageAnalysis + averagePercentage;
                    //End of the count of total average of all the subjects

                    this.setState({
                      isSpinnerHide: true,
                    });

                    recordInfoList.push({
                      attendanceRecordDate: attendanceRecordDate,
                      attendanceRecordAverage: averagePercentage,
                      attendanceRecordRandomNo: attendanceRecordRandomNo,
                    });

                    this.setState({
                      recordInfoList: recordInfoList,
                    });
                  }

                  this.setState({
                    totalRecordsCount: totalRecordsCount,
                  });
                  this.setState({
                    subjectPercentageAverageAnalysis: subjectPercentageAverageAnalysis,
                  });
                }
              } else {
                this.setState({
                  recordInfoList: null,
                  isSpinnerHide: true,
                });
              }
            }
          });
      }
    } else if (this.state.studentsAnalyticsBtnClick) {
      if (this._isMounted) {
        this.setState({
          subkey: current_subKey,
        });

        if (this.state.authUser.role === "Student") {
          this.setState({ fackey: current_facKey });
        }

        this.setState({ recordsCardMainSectionHide: true });
      }
    }
  };

  RecordsListCardClick = (date, randomNo) => {
    if (this.state.authUser.role === "Faculty") {
      this.setState({
        facDate: date,
      });
      this.setState({
        facRandom: randomNo,
      });

      this.setState({
        recordListTable: true,
        RecordsListMainSectionHide: false,
        recordsCardMainSectionHide: true,
      });
    }
  };

  render() {
    return (
      <div
        className={
          !this.state.recordListTable ? "MainRecordsSectionDesktop" : null
        }
      >
        {!this.state.recordsCardMainSectionHide ? (
          <div>
            <div
              className={
                this.state.blurBg ? "classListNavBar blur" : "classListNavBar"
              }
            >
              <Menu
                unClickable={this.state.unClickable}
                isToggleHamburger={this.state.isToggleHamburger}
                hamburgerToggle={this.hamburgerToggle}
                name={`Analytics`}
                blur={this.state.blurBg}
              />
              <p className="classListNavHeader">
                <span style={{ color: `#4885ed` }}>A</span>
                <span style={{ color: `#db3236` }}>n</span>
                <span style={{ color: `#f4c20d` }}>a</span>
                <span style={{ color: `#4885ed` }}>l</span>
                <span style={{ color: `#3cba54` }}>y</span>
                <span style={{ color: `#db3236` }}>t</span>
                <span style={{ color: `#f4c20d` }}>i</span>
                <span style={{ color: `#4885ed` }}>c</span>
                <span style={{ color: `#3cba54` }}>s</span>
              </p>
            </div>

            {this.state.analyticsBtn && (
              <div className="analyticsBtn">
                <div className="analyticsBtnContainer">
                  <div
                    className="overallAnalyticsBtn"
                    onClick={this.overallAnalyticsBtnClick}
                  >
                    Overall
                  </div>
                  <div className="orAnalyticsDiv">OR</div>
                  {this.state.authUser.role === "Faculty" && (
                    <div
                      className="studentsAnalyticsBtn"
                      onClick={this.studentsAnalyticsBtnClick}
                    >
                      Students
                    </div>
                  )}
                  {this.state.authUser.role === "Student" && (
                    <div
                      className="studentsAnalyticsBtn"
                      onClick={this.studentsAnalyticsBtnClick}
                    >
                      Your
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!this.state.recordsCardMainSectionHide &&
        !this.state.analyticsBtn &&
        this.state.NoRecordsHide &&
        this.state.subjectList ? (
          <SubjectList
            blur={this.state.blurBg}
            onSubjectClick={(current_subKey, current_facKey) =>
              this.onSubjectCardClick(current_subKey, current_facKey)
            }
            unclickableToggle={(toggleBoolean) =>
              this.unclickableToggle(toggleBoolean)
            }
          />
        ) : null}

        {!this.state.recordsCardMainSectionHide &&
        this.state.RecordsListMainSectionHide &&
        this.state.overallAnalyticsBtnClick ? (
          <div className="RecordsListMainSection">
            <div
              ref={this.subjectPercentageAverageAnalysis}
              style={{
                zIndex: `1000`,
                marginBottom: `40px`,
                fontWeight: `600`,
                width: `200px`,
                height: `40px`,
                borderRadius: `10px`,
                backgroundColor: `#4885ed`,
                color: `#ffffff`,
                display: `grid`,
                placeItems: `center`,
                fontSize: `18px`,
                marginTop: `30px`,
                padding: `0`,
              }}
            >
              Average{" "}
              {this.state.recordInfoList === null
                ? ":-)"
                : " : " +
                  Math.round(
                    this.state.subjectPercentageAverageAnalysis /
                      this.state.totalRecordsCount
                  ) +
                  "%"}
            </div>
            <div className="RecordsListCardsMain" style={{ zIndex: `1000` }}>
              {!this.state.isSpinnerHide && <Spinner size="32px" />}

              {this.state.isSpinnerHide &&
              this.state.recordInfoList === null ? (
                <div
                  className="RecordsListCard"
                  style={{
                    alignItems: `center`,
                    color: `#999999`,
                    pointerEvents: `none`,
                  }}
                >
                  No Records Found
                </div>
              ) : null}

              {this.state.isSpinnerHide && this.state.recordInfoList
                ? this.state.recordInfoList.reverse().map((header) => {
                    const splitted_timestamp = header.attendanceRecordDate
                      ?.toString()
                      ?.split("T");
                    const date = splitted_timestamp[0].split("-")[2] || "00";
                    const month = splitted_timestamp[0].split("-")[1] || "00";
                    const year = splitted_timestamp[0].split("-")[0] || "00";
                    return (
                      <div
                        key={header.attendanceRecordRandomNo}
                        className="RecordsListCard"
                        style={
                          this.state.authUser.role === "Student"
                            ? {
                                pointerEvents: `none`,
                              }
                            : null
                        }
                        onClick={() =>
                          this.RecordsListCardClick(
                            header.attendanceRecordDate,
                            header.attendanceRecordRandomNo
                          )
                        }
                      >
                        <div className="RecordsListCardDate">
                          {`${date}-${month}-${year}`}
                        </div>
                        <div
                          className={
                            header.attendanceRecordAverage >= 85
                              ? "AnalyticsRecordListCardAverageGreen"
                              : header.attendanceRecordAverage <= 50
                              ? "AnalyticsRecordListCardAverageRed"
                              : "AnalyticsRecordListCardAverage"
                          }
                        >
                          {header.attendanceRecordAverage}%
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
            <div
              className="RecordsListMainSectionCloseBtn"
              onClick={this.recordsListMainSectionClose}
              style={{ marginBottom: `30px`, zIndex: `1000` }}
            >
              <FontAwesomeIcon
                icon="plus"
                style={{ transform: `rotate(45deg)` }}
              />
            </div>
          </div>
        ) : null}

        {this.state.recordListTable &&
        this.state.authUser.role === "Faculty" ? (
          <RecordList
            subkey={this.state.subkey}
            facdate={this.state.facDate}
            facrandom={this.state.facRandom}
          />
        ) : null}

        {this.state.recordsCardMainSectionHide &&
        !this.state.RecordsListMainSectionHide &&
        this.state.studentsAnalyticsBtnClick ? (
          <div className={"classListNavBar"}>
            <Menu
              isToggleHamburger={this.state.isToggleHamburger}
              hamburgerToggle={this.hamburgerToggle}
              name={`Analytics`}
            />
            <p className="classListNavHeader">
              <span style={{ color: `#4885ed` }}>A</span>
              <span style={{ color: `#db3236` }}>n</span>
              <span style={{ color: `#f4c20d` }}>a</span>
              <span style={{ color: `#4885ed` }}>l</span>
              <span style={{ color: `#3cba54` }}>y</span>
              <span style={{ color: `#db3236` }}>t</span>
              <span style={{ color: `#f4c20d` }}>i</span>
              <span style={{ color: `#4885ed` }}>c</span>
              <span style={{ color: `#3cba54` }}>s</span>
            </p>
          </div>
        ) : null}

        {this.state.recordsCardMainSectionHide &&
        !this.state.RecordsListMainSectionHide &&
        this.state.studentsAnalyticsBtnClick ? (
          <div
            className="studentsAnalytics"
            style={{
              height: `100%`,
              width: `100%`,
              position: `absolute`,
              top: `0`,
              left: `0`,
              backgroundColor: `#ffffff`,
              overflowY: `scroll`,
            }}
          >
            {this.state.authUser.role === "Faculty" && (
              <AttendeesList
                subkey={this.state.subkey}
                studentsAnalyticsBtnClick={this.state.studentsAnalyticsBtnClick}
              />
            )}
            {this.state.authUser.role === "Student" && (
              <AttendeesList
                subkey={this.state.subkey}
                fackey={this.state.fackey}
                studentsAnalyticsBtnClick={this.state.studentsAnalyticsBtnClick}
              />
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

const AnalyticsWithFirebase = compose(
  withRouter,
  withFirebase
)(AnalyticsBaseMain);

export default Analytics;

export { AnalyticsWithFirebase };
