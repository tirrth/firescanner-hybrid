import React, { Component } from "react";
import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import "../classroom/attendees.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import AttendanceError from "../../images/attendance_error.svg";

class AttendeesList extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      authUser: JSON.parse(localStorage.getItem("authUser")),
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      stu_college_name: JSON.parse(localStorage.getItem("authUser")).college,

      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,
      studentsPresentLecCount: 0,
      totalAteendanceTimesCount: 0,

      StudentAttendanceNotFound: true,
    };

    this.StudentAttendanceCardMain = React.createRef();
    this.StudentAttendanceCardBtnAverageClasses = React.createRef();
    this.StudentAttendanceCardBtnAveragePercentage = React.createRef();
    this.RecordsListMainSectionCloseBtn = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;

    if (this.props.studentsAnalyticsBtnClick) {
      if (this.state.authUser.role === "Faculty") {
        if (this._isMounted) {
          this.props.firebase
            .studentLength(
              this.state.fac_college_name,
              this.state.facAuthID,
              this.props.subkey
            )
            .orderByChild("stu_enrolno")
            .on("child_added", (snapshot) => {
              if (this._isMounted) {
                var subStuInfo = snapshot.val();

                var studsCardEnrolNo = subStuInfo.stu_enrolno;
                var studsCardName = subStuInfo.stu_name;

                var StudentAttendanceCard = document.createElement("div");
                var StudentAttendanceCardInfo = document.createElement("div");
                var StudentAttendanceCardInfoEnrolNo = document.createElement(
                  "div"
                );
                var StudentAttendanceCardInfoName = document.createElement(
                  "div"
                );
                var StudentAttendanceCardBtn = document.createElement("div");

                var StudentAttendanceCardBtnAveragePercentage = document.createElement(
                  "div"
                );
                var StudentAttendanceCardBtnAverageClasses = document.createElement(
                  "div"
                );

                StudentAttendanceCard.className =
                  "StudentAttendanceCard StudentAttendanceCardAnalytics";

                StudentAttendanceCard.appendChild(StudentAttendanceCardInfo);
                StudentAttendanceCard.appendChild(StudentAttendanceCardBtn);

                StudentAttendanceCardInfo.appendChild(
                  StudentAttendanceCardInfoEnrolNo
                );
                StudentAttendanceCardInfo.appendChild(
                  StudentAttendanceCardInfoName
                );

                StudentAttendanceCardBtn.appendChild(
                  StudentAttendanceCardBtnAveragePercentage
                );
                StudentAttendanceCardBtn.appendChild(
                  StudentAttendanceCardBtnAverageClasses
                );

                StudentAttendanceCardInfo.className =
                  "StudentAttendanceCardInfo";
                StudentAttendanceCardInfoEnrolNo.className =
                  "StudentAttendanceCardInfoEnrolNo";
                StudentAttendanceCardInfoName.className =
                  "StudentAttendanceCardInfoNameHide";
                StudentAttendanceCardInfoEnrolNo.style.userSelect = "none";
                StudentAttendanceCardInfoName.style.userSelect = "none";
                StudentAttendanceCardBtnAverageClasses.style.userSelect =
                  "none";
                StudentAttendanceCardBtnAveragePercentage.style.userSelect =
                  "none";

                StudentAttendanceCardBtn.className = "StudentAttendanceCardBtn";
                StudentAttendanceCardBtnAverageClasses.className =
                  "StudentAttendanceCardBtnAverageClassesHide";
                StudentAttendanceCardBtnAveragePercentage.className =
                  "StudentAttendanceCardBtnAveragePercentage";

                StudentAttendanceCard.addEventListener("click", () => {
                  StudentAttendanceCardInfoEnrolNo.classList.toggle(
                    "StudentAttendanceCardInfoEnrolNoHide"
                  );
                  StudentAttendanceCardInfoName.classList.toggle(
                    "StudentAttendanceCardInfoName"
                  );

                  StudentAttendanceCardBtnAverageClasses.classList.toggle(
                    "StudentAttendanceCardBtnAverageClasses"
                  );
                  StudentAttendanceCardBtnAveragePercentage.classList.toggle(
                    "StudentAttendanceCardBtnAveragePercentageHide"
                  );
                });

                StudentAttendanceCardInfoEnrolNo.append(studsCardEnrolNo);
                StudentAttendanceCardInfoName.append(studsCardName);

                /*To find the totalAttendaceTimesCount (00/{totalAttendanceTimesCount}) AND Students Present Lectures Count */

                var totalAteendanceTimesCount = 0;
                var studentsPresentLecCount = 0;
                this.props.firebase
                  .facultySubjects(
                    this.state.facAuthID,
                    this.state.fac_college_name
                  )
                  .child(`${this.props.subkey}/attendees`)
                  .on("child_added", (snapshot) => {
                    if (this._isMounted) {
                      var subDateKey = snapshot.key;
                      this.props.firebase
                        .facultySubjects(
                          this.state.facAuthID,
                          this.state.fac_college_name
                        )
                        .child(`${this.props.subkey}/attendees/${subDateKey}`)
                        .on("child_added", (snapshot) => {
                          var subRandomNoKey = snapshot.key;
                          //   console.log(snapshot.key);
                          totalAteendanceTimesCount++;

                          this.props.firebase
                            .facultySubjects(
                              this.state.facAuthID,
                              this.state.fac_college_name
                            )
                            .child(
                              `${this.props.subkey}/attendees/${subDateKey}/${subRandomNoKey}`
                            )
                            .orderByKey()
                            .on("child_added", (snapshot) => {
                              if (this._isMounted) {
                                if (
                                  snapshot.val().stuAttendance === "present" &&
                                  snapshot.val().stuEnNo === studsCardEnrolNo
                                ) {
                                  studentsPresentLecCount++;
                                }
                              }
                            });
                        });
                    }
                  });

                if (
                  Math.round(
                    `${
                      (studentsPresentLecCount / totalAteendanceTimesCount) *
                      100
                    }`
                  ) >= 75
                ) {
                  StudentAttendanceCardBtn.className =
                    "StudentAttendanceCardBtn StudentAttendanceCardBtnAverageGreen";
                } else if (
                  Math.round(
                    `${
                      (studentsPresentLecCount / totalAteendanceTimesCount) *
                      100
                    }`
                  ) <= 50
                ) {
                  StudentAttendanceCardBtn.className =
                    "StudentAttendanceCardBtn StudentAttendanceCardBtnAverageRed";
                } else {
                  StudentAttendanceCardBtn.className =
                    "StudentAttendanceCardBtn StudentAttendanceCardBtnAverage";
                }

                StudentAttendanceCardBtnAverageClasses.append(
                  `${studentsPresentLecCount}/${totalAteendanceTimesCount}`
                );

                StudentAttendanceCardBtnAveragePercentage.append(
                  (totalAteendanceTimesCount === 0
                    ? 0
                    : Math.round(
                        `${
                          (studentsPresentLecCount /
                            totalAteendanceTimesCount) *
                          100
                        }`
                      )) + "%"
                );

                this.setState({ StudentAttendanceNotFound: false });
                this.StudentAttendanceCardMain.current.insertBefore(
                  StudentAttendanceCard,
                  this.RecordsListMainSectionCloseBtn.current
                );
              }
            });
        }
      }

      if (this.state.authUser.role === "Student") {
        if (this._isMounted) {
          var totalAteendanceTimesCount = 0;
          var studentsPresentLecCount = 0;
          this.props.firebase
            .facultySubjects(this.props.fackey, this.state.authUser.college)
            .child(`${this.props.subkey}/attendees`)
            .on("child_added", (snapshot) => {
              if (this._isMounted) {
                var subDateKey = snapshot.key;
                this.props.firebase
                  .facultySubjects(
                    this.props.fackey,
                    this.state.stu_college_name
                  )
                  .child(`${this.props.subkey}/attendees/${subDateKey}`)
                  .on("child_added", (snapshot) => {
                    if (this._isMounted) {
                      var subRandomNoKey = snapshot.key;

                      totalAteendanceTimesCount++;

                      this.props.firebase
                        .facultySubjects(
                          this.props.fackey,
                          this.state.stu_college_name
                        )
                        .child(
                          `${this.props.subkey}/attendees/${subDateKey}/${subRandomNoKey}`
                        )
                        .orderByKey()
                        .on("child_added", (snapshot) => {
                          if (this._isMounted) {
                            if (
                              snapshot.val().stuAttendance === "present" &&
                              snapshot.val().stuEnNo ===
                                this.state.authUser.enrolment_no
                            ) {
                              studentsPresentLecCount++;
                            }
                          }
                        });
                    }
                  });
              }
            });

          this.setState({
            studentsPresentLecCount: studentsPresentLecCount,
            totalAteendanceTimesCount: totalAteendanceTimesCount,
          });
        }
      }
    }
  }
  recordsListMainSectionClose = () => {
    window.location.reload(true);
  };

  StudentAttendanceAnalysisToggle = () => {
    this.StudentAttendanceCardBtnAverageClasses.current.classList.toggle(
      "StudentAttendanceCardBtnAverageClasses"
    );
    this.StudentAttendanceCardBtnAveragePercentage.current.classList.toggle(
      "StudentAttendanceCardBtnAveragePercentageHide"
    );
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <div style={{ height: `100%` }}>
        {this.state.authUser.role === "Faculty" && (
          <div className="AttendeeBaseMainContent AttendeeBaseMainContentAnalytics">
            <div
              ref={this.StudentAttendanceCardMain}
              className="StudentAttendanceCardMain"
            >
              {this.state.StudentAttendanceNotFound ? (
                <img
                  src={AttendanceError}
                  alt="Attendance Not Found"
                  style={{
                    width: `100vw`,
                    position: `absolute`,
                    top: `50%`,
                    left: `50%`,
                    transform: `translate(-50%,-50%)`,
                  }}
                />
              ) : (
                <div
                  ref={this.RecordsListMainSectionCloseBtn}
                  className="RecordsListMainSectionCloseBtn"
                  onClick={this.recordsListMainSectionClose}
                  style={{ marginLeft: `auto`, marginRight: `auto` }}
                >
                  <FontAwesomeIcon
                    icon="plus"
                    style={{ transform: `rotate(45deg)` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {this.state.authUser.role === "Student" && (
          <div
            onClick={this.StudentAttendanceAnalysisToggle}
            style={{
              width: `120px`,
              height: `120px`,
              backgroundColor: `#4885ed`,
              borderRadius: `50%`,
              position: `absolute`,
              left: `50%`,
              top: `50%`,
              transform: `translate(-50%, -50%)`,
              display: `flex`,
              justifyContent: `center`,
              alignItems: `center`,
              color: `#ffffff`,
              fontWeight: `600`,
              fontSize: `22px`,
            }}
          >
            <p
              className="StudentAttendanceCardBtnAverageClassesHide"
              style={{
                marginRight: `0px`,
                userSelect: `none`,
              }}
              ref={this.StudentAttendanceCardBtnAverageClasses}
            >
              {this.state.studentsPresentLecCount}/
              {this.state.totalAteendanceTimesCount}
            </p>
            <p
              className="StudentAttendanceCardBtnAveragePercentage"
              style={{ marginRight: `0px`, userSelect: `none` }}
              ref={this.StudentAttendanceCardBtnAveragePercentage}
            >
              {this.state.totalAteendanceTimesCount === 0
                ? 0
                : Math.round(
                    `${
                      (this.state.studentsPresentLecCount /
                        this.state.totalAteendanceTimesCount) *
                      100
                    }`
                  )}
              %
            </p>
          </div>
        )}
      </div>
    );
  }
}

const AttendeesListFireBase = compose(withFirebase)(AttendeesList);

export default AttendeesListFireBase;
