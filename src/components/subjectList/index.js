import React, { Component } from "react";
import MessLoader from "../messLoader";
import ContentNotFound from "../../images/content_error.svg";

import { withFirebase } from "../Configuration";

import "../Analytics/analytics.css";
import "../classroom/classroom.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const sideStraps = {
  openRandomCodeSideStrap: false,
  openDeleteSubjectSideStrap: false,
  subKey: "",
  randomCode: null,
  isShowGenerateBtn: true,
};

class index extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      authUser: JSON.parse(localStorage.getItem("authUser")),
      cssLoader: true,
      NoRecordsHide: true,
      subjectList: [],

      ...sideStraps,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    this.props.unclickableToggle(true);
    this.setState({ NoRecordsHide: true });

    if (this.state.authUser.role === "Faculty") {
      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.authUser.college)
        .on("value", (snapshot) => {
          if (this._isMounted) {
            const subjectObject = snapshot.val();

            if (subjectObject) {
              const subjectInfo = Object.entries(subjectObject).map(
                ([key, value]) => ({
                  subKey: key,
                  subData: value,
                  facKey: this.state.authUser.uid,
                })
              );
              this.setState({
                cssLoader: false,
                subjectList: subjectInfo,
                NoRecordsHide: true,
              });
              this.props.unclickableToggle(false);
            } else {
              this.setState({
                cssLoader: false,
                subjectList: null,
                NoRecordsHide: false,
              });

              this.props.unclickableToggle(false);
            }
          }
        });
    } else if (this.state.authUser.role === "Student") {
      const { authUser } = this.state;
      //   console.log(authUser.college);
      this.props.firebase
        .studentSubjects(authUser.college)
        .on("value", (snapshot) => {
          if (this._isMounted) {
            const facultyObject = snapshot.val();

            if (facultyObject) {
              const totalFacMemebers = Object.keys(facultyObject).length;
              var facMembersWithNoSubjects = 0;

              var subjectList = [];

              for (var facultyList in facultyObject) {
                const facultySubjectsFlag = Object.keys(
                  facultyObject[facultyList]
                );

                if (
                  facultySubjectsFlag.find((element) => element === "subjects")
                ) {
                  const totalSubjects = Object.keys(
                    facultyObject[facultyList].subjects
                  ).length;
                  var totalSubjectsWithDifferentFieldsCount = 0;

                  const totalValidSubjects = [];
                  var totalValidSubjectsHavingNoStudentsCount = 0;

                  for (var facultySubjectList in facultyObject[facultyList]
                    .subjects) {
                    if (
                      facultyObject[facultyList].subjects[facultySubjectList]
                        .department === authUser.department &&
                      facultyObject[facultyList].subjects[facultySubjectList]
                        .semester === authUser.semester &&
                      facultyObject[facultyList].subjects[facultySubjectList]
                        .division === authUser.division &&
                      facultyObject[facultyList].subjects[facultySubjectList]
                        .shift === authUser.shift
                    ) {
                      totalValidSubjects.push(facultySubjectList);
                      const totalValidSubjectsCount = totalValidSubjects.length;

                      const facultySubjectStudentsFlag = Object.keys(
                        facultyObject[facultyList].subjects[facultySubjectList]
                      );

                      if (
                        facultySubjectStudentsFlag.find(
                          (element) => element === "students"
                        )
                      ) {
                        for (var facultySubjectStudentList in facultyObject[
                          facultyList
                        ].subjects[facultySubjectList].students) {
                          if (
                            facultyObject[facultyList].subjects[
                              facultySubjectList
                            ].students[facultySubjectStudentList]
                              .stu_enrolno === authUser.enrolment_no
                          ) {
                            const subjectInfo = {
                              facName: facultyObject[facultyList].name,
                              facKey: facultyList, // <-- Just in case, if you need to use it somewhere
                              subName:
                                facultyObject[facultyList].subjects[
                                  facultySubjectList
                                ].subject,
                              subRoom:
                                facultyObject[facultyList].subjects[
                                  facultySubjectList
                                ].room,
                              subKey: facultySubjectList,
                            };

                            subjectList.push(subjectInfo);

                            this.setState({
                              cssLoader: false,
                              subjectList: subjectList,
                              NoRecordsHide: true,
                            });
                            this.props.unclickableToggle(false);
                          }
                        }
                      } else {
                        totalValidSubjectsHavingNoStudentsCount =
                          totalValidSubjectsHavingNoStudentsCount + 1;

                        if (
                          totalValidSubjectsHavingNoStudentsCount ===
                          totalValidSubjectsCount
                        ) {
                          this.setState({
                            cssLoader: false,
                            subjectList: null,
                            NoRecordsHide: false,
                          });
                          this.props.unclickableToggle(false);
                        }
                      }
                    } else {
                      totalSubjectsWithDifferentFieldsCount =
                        totalSubjectsWithDifferentFieldsCount + 1;

                      if (
                        totalSubjectsWithDifferentFieldsCount === totalSubjects
                      ) {
                        this.setState({
                          cssLoader: false,
                          subjectList: null,
                          NoRecordsHide: false,
                        });
                        this.props.unclickableToggle(false);
                      }
                    }
                  }
                } else {
                  facMembersWithNoSubjects = facMembersWithNoSubjects + 1;

                  if (facMembersWithNoSubjects === totalFacMemebers) {
                    this.setState({
                      cssLoader: false,
                      subjectList: null,
                      NoRecordsHide: false,
                    });
                    this.props.unclickableToggle(false);
                  }
                }
              }
            } else {
              this.setState({
                cssLoader: false,
                subjectList: null,
                NoRecordsHide: false,
              });
              this.props.unclickableToggle(false);
            }
          }
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onSubjectClick = (current_subKey, current_facKey) => {
    this.props.onSubjectClick(current_subKey, current_facKey); // pass any argument to the callback
  };

  wantSideStrapsToBeVisible = (current_subKey, current_facKey) => {
    this.setState({ subKey: "" });

    if (!this.props.openDeleteSubject && !this.props.openAddStudents) {
      this.setState({ isShowGenerateBtn: true });

      this.setState({ subKey: current_subKey });
      this.setState({
        openRandomCodeSideStrap: true,
      });
    } else if (this.props.openDeleteSubject) {
      this.setState({ subKey: current_subKey });
      this.setState({ openDeleteSubjectSideStrap: true });
    }
  };

  closeSideStrap = (e) => {
    e.stopPropagation();

    if (!this.props.openDeleteSubject && !this.props.openAddStudents) {
      this.setState({
        openRandomCodeSideStrap: false,
      });
    } else if (this.props.openDeleteSubject) {
      this.setState({ openDeleteSubjectSideStrap: false });
    }
  };

  onGenerateBtnClick = (e) => {
    e.stopPropagation();

    this.setState({ isShowGenerateBtn: false });
    this.setState({ randomCode: Math.floor(1000 + Math.random() * 9000) });
  };

  onRandomCodeAgainClick = (e) => {
    e.stopPropagation();

    this.setState({ randomCode: Math.floor(1000 + Math.random() * 9000) });
  };

  onRandomCodeNextClick = (
    current_subKey,
    current_facKey,
    randomCode,
    current_subData
  ) => {
    this.props.onRandomCodeNextClick(
      current_subKey,
      current_facKey,
      randomCode,
      current_subData
    );
  };

  onDeleteSubjectBtnClick = (current_subKey, current_subName) => {
    this.props.onDeleteSubjectClick(current_subKey, current_subName);
  };

  openAddStudentsClick = (current_subKey, subData) => {
    this.props.onAddStudentsClick(current_subKey, subData);
  };

  render() {
    return (
      <div>
        {this.state.cssLoader ? <MessLoader /> : null}

        {!this.state.NoRecordsHide ? (
          <div className={this.props.blur ? "NoRecords blur" : "NoRecords"}>
            <img
              src={ContentNotFound}
              alt={"ContentNotFound"}
              style={{ width: `100vw` }}
            />
          </div>
        ) : null}

        {!this.state.cssLoader && this.state.NoRecordsHide ? (
          <div
            className={
              this.props.blur
                ? "recordsCardMainSection blur"
                : "recordsCardMainSection"
            }
          >
            {this.state.subjectList.map((subject) => {
              return (
                <div
                  key={subject.subKey}
                  className={
                    this.props.wantSideStrapsToBeVisible
                      ? "recordsCardMain recordsCardMainExtraLastMargin"
                      : "recordsCardMain"
                  }
                  onClick={
                    this.props.wantSideStrapsToBeVisible
                      ? this.props.openAddStudents
                        ? () =>
                            this.openAddStudentsClick(
                              subject.subKey,
                              subject.subData
                            )
                        : () =>
                            this.wantSideStrapsToBeVisible(
                              subject.subKey,
                              subject.facKey
                            )
                      : this.onSubjectClick.bind(
                          this,
                          subject.subKey,
                          subject.facKey
                        )
                  }
                >
                  {this.state.authUser.role === "Faculty" ? (
                    <div
                      className="recordsCardMainInfoDiv"
                      key={subject.subKey}
                    >
                      <h3 className="recordsCardMainInfoSubParagraph">
                        {subject.subData.room === "lab" ? (
                          <div>
                            {subject.subData.subject}
                            {roomLabTag}
                          </div>
                        ) : (
                          subject.subData.subject
                        )}
                      </h3>
                      <p className="recordsCardMainInfoDeptParagraph">
                        {subject.subData.department.toLowerCase()}
                      </p>
                      <p className="recordsCardMainInfoSDShiftParagraph">
                        <span>Sem({subject.subData.semester})</span>
                        <span> - Div({subject.subData.division}) - </span>
                        <span>
                          {subject.subData.shift ===
                          "No Shift (Has only one Shift)"
                            ? "No Shift"
                            : subject.subData.shift}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div
                      className="recordsCardMainInfoDiv"
                      key={subject.subKey}
                    >
                      <div>
                        <h3 className="recordsCardMainInfoSubParagraph">
                          {subject.subRoom === "lab" ? (
                            <div>
                              {subject.subName}
                              {roomLabTag}
                            </div>
                          ) : (
                            subject.subName
                          )}
                        </h3>
                        <p className="recordsCardMainInfoFacName">
                          {subject.facName}
                        </p>
                      </div>
                    </div>
                  )}
                  {this.state.authUser.role === "Faculty" &&
                  this.props.wantSideStrapsToBeVisible ? (
                    !this.props.openDeleteSubject &&
                    !this.props.openAddStudents ? (
                      <div
                        className={
                          this.state.openRandomCodeSideStrap &&
                          subject.subKey === this.state.subKey
                            ? "classCardMainSideStraps strapsSlide"
                            : "classCardMainSideStraps"
                        }
                        onClick={this.closeSideStrap}
                      >
                        <div
                          className={
                            this.state.openRandomCodeSideStrap &&
                            subject.subKey === this.state.subKey &&
                            this.state.isShowGenerateBtn
                              ? "classCardMainSideStrapsGenerateBtn showStrapsBtn"
                              : "classCardMainSideStrapsGenerateBtn"
                          }
                          onClick={this.onGenerateBtnClick}
                        >
                          Generate a Random PIN
                        </div>
                        {!this.state.isShowGenerateBtn && (
                          <div
                            className={
                              this.state.openRandomCodeSideStrap &&
                              subject.subKey === this.state.subKey
                                ? "classCardMainSideStrapsGenerateBtnRandom showStrapsBtn"
                                : "classCardMainSideStrapsGenerateBtnRandom"
                            }
                          >
                            <div
                              className="classCardMainSideStrapsGenerateBtnRandomAgain"
                              onClick={this.onRandomCodeAgainClick}
                            >
                              <FontAwesomeIcon
                                icon="undo"
                                style={{
                                  color: `#ffffff`,
                                  fontSize: `15px`,
                                  cursor: `default`,
                                }}
                              />
                            </div>
                            <div>{this.state.randomCode}</div>
                            <div
                              className="classCardMainSideStrapsGenerateBtnRandomNext"
                              onClick={this.onRandomCodeNextClick.bind(
                                this,
                                subject.subKey,
                                subject.facKey,
                                this.state.randomCode,
                                subject.subData
                              )}
                            >
                              <FontAwesomeIcon
                                icon="arrow-right"
                                style={{
                                  color: `#ffffff`,
                                  fontSize: `16px`,
                                  cursor: `default`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null
                  ) : null}

                  {this.state.authUser.role === "Faculty" &&
                  this.props.wantSideStrapsToBeVisible ? (
                    this.props.openDeleteSubject ? (
                      <div
                        className={
                          this.state.openDeleteSubjectSideStrap &&
                          subject.subKey === this.state.subKey
                            ? "classCardMainSideStrapsDelete strapsSlideDelete"
                            : "classCardMainSideStrapsDelete"
                        }
                        onClick={this.closeSideStrap}
                      >
                        <div
                          className={
                            this.state.openDeleteSubjectSideStrap &&
                            subject.subKey === this.state.subKey
                              ? "classCardMainSideStrapsDeleteBtn showStrapsBtn"
                              : "classCardMainSideStrapsDeleteBtn"
                          }
                          onClick={this.onDeleteSubjectBtnClick.bind(
                            this,
                            subject.subKey,
                            subject.subData.subject
                          )}
                        >
                          <FontAwesomeIcon
                            icon="trash-alt"
                            style={{
                              cursor: `default`,
                              fontSize: `20px`,
                            }}
                          />
                        </div>
                        <div></div>
                      </div>
                    ) : null
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

const roomLabTag = (
  <sup
    style={{
      backgroundColor: `red`,
      padding: `2px 4px`,
      borderRadius: `4px`,
      fontSize: `8px`,
      color: `#ffffff`,
      marginLeft: `5px`,
      fontWeight: `800`,
    }}
  >
    LAB
  </sup>
);

const SubjectListFirebase = withFirebase(index);

export default SubjectListFirebase;
