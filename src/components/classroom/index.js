import React, { Component } from "react";
import { IonAlert } from "@ionic/react";
import SubjectList from "../subjectList";

import "./classroom.css";
import CollegeJSON from "../../CollegeList.json";

import { withRouter } from "react-router-dom";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withEmailVerification } from "../Session";

import AuthUserContext from "../Session/context";
import Spinner from "../spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SomethingWrongGIF from "../../images/something_wrong.gif";
import Menu from "../menu";

import Scanner from "./scanner";
import Result from "./result";

import ReactDOMServer, { renderToStaticMarkup } from "react-dom/server";

import Quagga from "quagga";

import SelectionCard from "./selectionCard";

import "./attendees.css";
import "./studentslist.css";
const condition = (authUser) => !!authUser;

class Classroom extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          condition(authUser) ? <ClassroomSectionMain /> : <SpinnerComponent />
        }
      </AuthUserContext.Consumer>
    );
  }
}

class SpinnerComponent extends Component {
  render() {
    return (
      <div
        style={{
          position: `fixed`,
          top: `0`,
          left: `0`,
          height: `100%`,
          width: `100%`,
          display: `flex`,
          justifyContent: `center`,
          alignItems: `center`,
        }}
      >
        <Spinner size="40px" />
      </div>
    );
  }
}

const INITIAL_STATE_ADD_CLASS_INPUTS = {
  department: "",
  subject: "",
  semester: "",
  division: "",
  shift: "",
};

const INITIAL_STATE_CLASSROOM_SECTION = {
  isToggle: false,
  addBlur: false,
  addNavBlur: false,
  isToggleHamburger: false,
  isHide: false,
  isHideLast: 0,
  onCardClickToggle: false,
  selectionCardToggle: true,
  queCardSelectionOptions: "",

  facCardInfoObj: {},
  facKey: "",
  subStuKey: "",
  stuCardInfoObj: {},

  randomNumber: 0,
  fac_access: false,
  resultBarcode: 0,
  scanningCardToggle: false,

  barcodeSuccessFailToggle: false,
  onScanAlternativeToggle: false,

  alt_enrolment_no: "",

  stuAttendanceInfoFirebaseFacName: "",
  stuAttendanceInfoFirebaseStuSubject: "",
  stuAttendanceInfoFirebaseCardDeptInfo: "",

  stuLength: "",
  liveSubStuLength: "",

  StudentAttendanceCardInfoToggle: false,

  classCardMainSideStrapsDeleteToggle: false,

  classCardMainAddStudentsToggle: false,

  StudentAttendanceCheckAgain: "",
  StudentAttendanceCheckToggle: false,
  addStudents: false,

  childElementCount: 0,

  showAlertExit: false,
  showAlertAddDb: false,
  showAlertPresent: false,
  showAlertAbsent: false,
  showAlertAccessCode: false,
  showAlertWrong: false,
  showAlertWarning: false,
  showAlertDelete: false,

  unClickable: false,
  isSpinnerHide: true,
  NoClassesHide: true,

  studentList: [],
  currentSubName: null,
};

var xDown = null;
var yDown = null;

class ClassroomSection extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.addStudentsCardStudentInfoEnNo = [];
    this.addStudentsCardStudentInfoName = [];

    var today = new Date();
    var dateFirebase =
      (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) +
      (today.getMonth() + 1 < 10
        ? "0" + (today.getMonth() + 1)
        : today.getMonth() + 1) +
      today.getFullYear();

    var dateStyle =
      today.getDate() +
      "." +
      (today.getMonth() + 1) +
      "." +
      today.getFullYear();

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    this.state = {
      ...INITIAL_STATE_ADD_CLASS_INPUTS,
      ...INITIAL_STATE_CLASSROOM_SECTION,

      dateFirebase: dateFirebase,
      dateStyle: dateStyle,
      time: "",
      weekdayName: weekday[today.getDay()],

      authUser: JSON.parse(localStorage.getItem("authUser")),
      fac_name: JSON.parse(localStorage.getItem("authUser")).name,
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      fac_access_code: JSON.parse(localStorage.getItem("authUser")).access_code,
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,
      course_list: CollegeJSON.find(
        (college) =>
          college.name === JSON.parse(localStorage.getItem("authUser")).college
      ).courses,
      stu_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      stu_dept: JSON.parse(localStorage.getItem("authUser")).department,
      stu_sem: JSON.parse(localStorage.getItem("authUser")).semester,
      stu_div: JSON.parse(localStorage.getItem("authUser")).division,
      stu_shift: JSON.parse(localStorage.getItem("authUser")).shift,
      stu_enrolno: JSON.parse(localStorage.getItem("authUser")).enrolment_no,
      stu_uid: JSON.parse(localStorage.getItem("authUser")).uid,
      stu_name: JSON.parse(localStorage.getItem("authUser")).name,
      profile_name: JSON.parse(localStorage.getItem("authUser")).name,
    };

    this.classCardMainFacStuSection = React.createRef();

    this.StudentAttendanceCardMain = React.createRef();

    this.StudentAttendanceCardLast = React.createRef();

    this.addStudents = React.createRef();

    this.addAllStudents = React.createRef();

    this.removeAllStudents = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;

    try {
      this.props.firebase.db.goOnline();
    } catch (error) {
      console.log(error);
    }

    this.setState({ NoClassesHide: true });

    if (this.state.authUser.role === "Faculty") {
      this.setState({ StudentAttendanceCheckToggle: false });
    } else if (this.state.authUser.role === "Student") {
      if (this._isMounted) {
        this.props.firebase.userAuthorization(this.state.authUser.uid).update({
          emailVerified: true,
        });
      }

      this.setState({ StudentAttendanceCheckToggle: false });

      this._onConfirm = () => {
        if (
          (this.state.resultBarcode.length === 12 ||
            this.state.alt_enrolment_no.length === 12) &&
          (this.state.resultBarcode === this.state.stu_enrolno ||
            this.state.alt_enrolment_no === this.state.stu_enrolno)
        ) {
          const { stuCardInfoObj } = this.state;

          this.props.firebase
            .studentLengthAttendance(
              this.state.fac_college_name,
              stuCardInfoObj.FacKey,
              stuCardInfoObj.SubFacKey,
              this.state.stu_uid
            )
            .update({
              attendance: "present",
            })
            .then(() => {
              this.setState({
                StudentAttendanceCheckToggle: true,
                scanningCardToggle: false,
                isToggle: false,
              });
            })
            .then(() => {
              this.currentTime();

              this.props.firebase
                .studentLength(
                  this.state.fac_college_name,
                  stuCardInfoObj.FacKey,
                  stuCardInfoObj.SubFacKey
                )
                .orderByKey()
                .once("value", (snapshot) => {
                  if (this._isMounted) {
                    var subStuLength = snapshot.numChildren();
                    this.setState({ stuLength: subStuLength });
                  }
                });

              this.props.firebase
                .studentLength(
                  this.state.fac_college_name,
                  stuCardInfoObj.FacKey,
                  stuCardInfoObj.SubFacKey
                )
                .orderByKey()
                .on("value", (snapshot) => {
                  if (this._isMounted) {
                    let liveSubStuLength = 0;

                    var subStudents = snapshot.val();
                    for (var substu in subStudents) {
                      if (subStudents[substu].attendance === "present") {
                        liveSubStuLength = liveSubStuLength + 1;
                      }
                    }
                    this.setState({
                      liveSubStuLength: liveSubStuLength,
                    });
                  }
                });

              this.props.firebase
                .studentLength(
                  this.state.fac_college_name,
                  stuCardInfoObj.FacKey,
                  stuCardInfoObj.SubFacKey
                )
                .orderByChild("stu_enrolno")
                .on("child_added", (snapshot) => {
                  if (this._isMounted) {
                    var subStuKey = snapshot.key;
                    this.setState({ subStuKey: subStuKey });

                    var subStuInfo = snapshot.val();

                    var studsCardEnrolNo = subStuInfo.stu_enrolno;
                    var studsCardName = subStuInfo.stu_name;

                    var StudentAttendanceCard = document.createElement("div");
                    var StudentAttendanceCardInfo = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardInfoEnrolNo = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardInfoName = document.createElement(
                      "div"
                    );
                    var StudentAttendanceCardBtn = document.createElement(
                      "div"
                    );

                    var StudentAttendanceCardBtnIndicator = document.createElement(
                      "div"
                    );

                    StudentAttendanceCard.className = "StudentAttendanceCard";
                    StudentAttendanceCardInfo.className =
                      "StudentAttendanceCardInfo";
                    StudentAttendanceCardInfoEnrolNo.className =
                      "StudentAttendanceCardInfoEnrolNo";
                    StudentAttendanceCardInfoName.className =
                      "StudentAttendanceCardInfoNameHide";
                    StudentAttendanceCardBtn.className =
                      "StudentAttendanceCardBtn";
                    StudentAttendanceCardBtnIndicator.className =
                      "StudentAttendanceCardBtnIndicator";

                    StudentAttendanceCard.appendChild(
                      StudentAttendanceCardInfo
                    );
                    StudentAttendanceCard.appendChild(StudentAttendanceCardBtn);

                    StudentAttendanceCardInfo.appendChild(
                      StudentAttendanceCardInfoEnrolNo
                    );
                    StudentAttendanceCardInfo.appendChild(
                      StudentAttendanceCardInfoName
                    );

                    StudentAttendanceCardBtn.appendChild(
                      StudentAttendanceCardBtnIndicator
                    );

                    if (studsCardEnrolNo === this.state.stu_enrolno) {
                      studsCardEnrolNo = "You";
                    }

                    StudentAttendanceCardInfoEnrolNo.append(studsCardEnrolNo);
                    StudentAttendanceCardInfoName.append(studsCardName);

                    StudentAttendanceCard.addEventListener("click", () => {
                      StudentAttendanceCardInfoEnrolNo.classList.toggle(
                        "StudentAttendanceCardInfoEnrolNoHide"
                      );
                      StudentAttendanceCardInfoName.classList.toggle(
                        "StudentAttendanceCardInfoName"
                      );
                    });

                    this.StudentAttendanceCardMain.current.insertBefore(
                      StudentAttendanceCard,
                      this.StudentAttendanceCardLast.current
                    );

                    this.props.firebase
                      .studentLengthAttendance(
                        this.state.fac_college_name,
                        stuCardInfoObj.FacKey,
                        stuCardInfoObj.SubFacKey,
                        subStuKey
                      )
                      .on("value", (snapshot) => {
                        if (this._isMounted) {
                          if (snapshot.val().attendance === "present") {
                            StudentAttendanceCardBtnIndicator.className =
                              "StudentAttendanceCardBtnIndicatorOn";
                          } else if (snapshot.val().attendance === "absent") {
                            StudentAttendanceCardBtnIndicator.className =
                              "StudentAttendanceCardBtnIndicator";
                          }
                        }
                      });
                  }
                });
            });
        } else {
          this.setState({ barcodeSuccessFailToggle: true });
        }
      };
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
        if (!this.state.addBlur) {
          this.setState({ isToggleHamburger: false });
        }
      } else {
        if (xDown <= 40) {
          /* rigth swipe */

          if (!this.state.addBlur) {
            this.setState({ isToggleHamburger: true });
          }
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

  checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  };

  currentTimeSetTimeout = () => {
    setTimeout(this.currentTime, 500);
  };

  currentTime = () => {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    h = this.checkTime(h);
    m = this.checkTime(m);
    s = this.checkTime(s);
    var timeStyle = h + ":" + m + ":" + s;
    this.setState({ time: timeStyle });
    this.currentTimeSetTimeout();
  };

  onEditBarDelBtnIcon = () => {
    this.setState({
      classCardMainSideStrapsDeleteToggle: !this.state
        .classCardMainSideStrapsDeleteToggle,
    });
    this.setState({
      classCardMainAddStudentsToggle: false,
    });
  };

  onEditBarEditBtnIcon = () => {
    this.setState({
      classCardMainAddStudentsToggle: !this.state
        .classCardMainAddStudentsToggle,
    });
    this.setState({
      classCardMainSideStrapsDeleteToggle: false,
    });
  };

  AttendeesExitBtn = () => {
    this.setState({ showAlertExit: true });
  };

  AttendeesDBAddBtn = () => {
    if (this.state.authUser.role === "Faculty") {
      this.setState({ showAlertAddDb: true });
    }

    //You can not update attendance to absent in this fun. as it will make absent every students even in the pdf.
  };

  _onDetected = (result) => {
    this.setState({
      resultBarcode: result.codeResult.code,
      onScanAlternativeToggle: false,
      barcodeSuccessFailToggle: false,
    });
  };

  _scanningCardClose = () => {
    this.setState({
      scanningCardToggle: false,
      isToggle: false,
      resultBarcode: 0,
      barcodeSuccessFailToggle: false,
    });
  };
  _onScanAlternative = () => {
    this.setState({
      resultBarcode: 1,
      onScanAlternativeToggle: true,
      barcodeSuccessFailToggle: false,
    });
    try {
      Quagga.stop();
    } catch (error) {
      console.log(error);
    }
  };

  _onReScan = () => {
    this.setState({
      resultBarcode: 0,
    });
  };

  onCardClick = () => {
    this.setState({ onCardClickToggle: !this.state.onCardClickToggle });
    console.log(this.state.onCardClickToggle);
  };

  addBtnToggle = () => {
    this.setState({
      isToggle: !this.state.isToggle,
      addBlur: !this.state.addBlur,
    });
  };

  nextClickBtn = () => {
    this.setState(
      this.state.department && this.state.department !== "--DEPARTMENT--"
        ? { isHide: !this.state.isHide }
        : { isHide: this.state.isHide }
    );
  };

  nextClickBtnLast = () => {
    this.setState(this.state.subject ? { isHideLast: 1 } : { isHideLast: 0 });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  hamburgerToggle = () => {
    this.setState({ isToggleHamburger: !this.state.isToggleHamburger });
  };

  StudentAttendanceCardInfo = () => {
    this.setState({
      StudentAttendanceCardInfo: !this.state.StudentAttendanceCardInfo,
    });
  };

  onSubmit = () => {
    const {
      fac_college_name,
      subject,
      department,
      semester,
      division,
      shift,
      queCardSelectionOptions,
    } = this.state;

    if (
      this.state.semester &&
      this.state.division &&
      this.state.shift &&
      this.state.semester !== "SEMESTER--" &&
      this.state.division !== "DIVISION--" &&
      this.state.shift !== "COLLEGE SHIFT--"
    ) {
      this.setState({
        selectionCardToggle: true,
        isToggle: !this.state.isToggle,
        addBlur: !this.state.addBlur,
        isHide: false,
        isHideLast: 0,
        ...INITIAL_STATE_ADD_CLASS_INPUTS,
      });
      //To add the data of the subject
      const autoFacultySubKey = this.props.firebase
        .facultySubjects(this.state.facAuthID, fac_college_name)
        .push().key;

      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
        .child(autoFacultySubKey)
        .set({
          department,
          subject,
          semester,
          division,
          shift,
          room: queCardSelectionOptions,
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("Please Submit All your fields Properly!");
    }
  };

  queCardSelectionOptionClassMethod = () => {
    this.setState({
      selectionCardToggle: false,
      queCardSelectionOptions: "class",
    });
  };
  queCardSelectionOptionLabMethod = () => {
    this.setState({
      selectionCardToggle: false,
      queCardSelectionOptions: "lab",
    });
  };

  addStudentsClose = () => {
    this.setState({
      addStudents: false,
      addBlur: !this.state.addBlur,
      addNavBlur: !this.state.addNavBlur,
    });
    window.location.reload(true);
  };

  addStudentsNext = () => {
    this.setState({
      addStudents: false,
      addBlur: !this.state.addBlur,
      addNavBlur: !this.state.addNavBlur,
      classCardMainAddStudentsToggle: !this.state
        .classCardMainAddStudentsToggle,
    });
  };

  unclickableToggle = (toggleBoolean) => {
    this.setState({ unClickable: toggleBoolean });
  };

  onSubjectClick = (current_subKey, current_facKey) => {
    // console.log(current_subKey, current_facKey);

    if (this.state.authUser.role === "Student") {
      this.setState({
        stuCardInfoObj: {
          SubFacKey: current_subKey,
          FacKey: current_facKey,
        },
      });
      this.setState({ showAlertAccessCode: true });
    }
  };

  onRandomCodeNextClick = (
    current_subKey,
    current_facKey,
    randomCode,
    current_subData
  ) => {
    this.props.firebase
      .studentLength(
        this.state.fac_college_name,
        current_facKey, //OR this.state.facAuthId
        current_subKey
      )
      .orderByKey()
      .once("value", (snapshot) => {
        if (this._isMounted) {
          var subStuLength = snapshot.numChildren();
          if (subStuLength === 0) {
            this.setState({
              classCardMainAddStudentsToggle: true,
            });
            this.onAddStudentsClick(current_subKey, current_subData);
          } else {
            this.props.firebase
              .facultySubjects(
                this.state.authUser.uid,
                this.state.fac_college_name
              )
              .child(`${current_subKey}/students`)
              .on("child_added", (snapshot) => {
                this.props.firebase
                  .facultySubjects(
                    this.state.authUser.uid,
                    this.state.fac_college_name
                  )
                  .child(`${current_subKey}/students/${snapshot.key}`)
                  .update({ attendance: "absent" });
              });

            this.props.firebase
              .facultySubjects(
                this.state.authUser.uid,
                this.state.fac_college_name
              )
              .child(`${current_subKey}/random_access`)
              .update({
                access_boolean: false,
                random_number: 0,
              });

            this.setState({ stuLength: subStuLength });

            this.setState({ randomNumber: randomCode });

            this.setState({
              facCardInfoObj: { current_facultySub_key: current_subKey },
            });

            this.setState({ showAlertAccessCode: true });
          }
        }
      });
  };

  onDeleteSubjectClick = (current_subKey, current_subName) => {
    if (this.state.classCardMainSideStrapsDeleteToggle) {
      this.setState({
        facCardInfoObj: {
          current_facultySub_key: current_subKey,
          subject: current_subName,
        },
      });
      this.setState({ showAlertDelete: true });
    }
  };

  onAddStudentsClick = (current_subKey, current_subData) => {
    this.setState({ studentList: [], isSpinnerHide: false });

    this.setState({
      addBlur: !this.state.addBlur,
      addNavBlur: !this.state.addNavBlur,
      addStudents: true,
    });

    this.setState({
      currentSubName: {
        sub_name: current_subData.subject,
        sub_room: current_subData.room,
      },
    });

    var studentListTotalNo;

    var studentListInvalidFeildNo = 0;

    var studentList = [];

    this.props.firebase
      .studentList(this.state.fac_college_name)
      .orderByChild("enrolment_no")
      .on("child_added", (snapshot) => {
        var stu_info = snapshot.val();
        if (
          stu_info.department === current_subData.department &&
          stu_info.division === current_subData.division &&
          stu_info.semester === current_subData.semester &&
          stu_info.shift === current_subData.shift
        ) {
          var stu_uid = snapshot.key;

          this.props.firebase
            .userAuthorization(stu_uid)
            .once("value", (snapshot) => {
              if (snapshot.val().emailVerified) {
                this.props.firebase
                  .studentLengthAttendance(
                    this.state.fac_college_name,
                    this.state.authUser.uid,
                    current_subKey,
                    stu_uid
                  )
                  .once("value", (snapshot) => {
                    const addedStu = snapshot.val();

                    if (addedStu) {
                      studentList.push({
                        name: stu_info.name,
                        enrolment_no: stu_info.enrolment_no,
                        uid: stu_uid,
                        added: true,
                      });
                      this.setState({
                        isSpinnerHide: true,
                        studentList: studentList,
                      });
                    } else {
                      studentList.push({
                        name: stu_info.name,
                        enrolment_no: stu_info.enrolment_no,
                        uid: stu_uid,
                        added: false,
                      });
                      this.setState({
                        isSpinnerHide: true,
                        studentList: studentList,
                      });
                    }
                  });
              }
            });
        } else {
          this.props.firebase
            .studentList(this.state.fac_college_name)
            .once("value", (snapshot) => {
              studentListTotalNo = snapshot.numChildren();
            });

          studentListInvalidFeildNo = studentListInvalidFeildNo + 1;
          if (studentListInvalidFeildNo === studentListTotalNo) {
            this.setState({ isSpinnerHide: true, studentList: null });
          }
        }
      });

    this.onStudentAddClick = (
      student_uid,
      student_enrolment_no,
      student_name
    ) => {
      let stuAddedIndex;
      this.state.studentList.map((student) => {
        if (student.uid === student_uid) {
          return (stuAddedIndex = this.state.studentList.indexOf(student));
        } else {
          return null;
        }
      });

      let studentList = [...this.state.studentList];
      let addedStudent = {
        ...studentList[stuAddedIndex],
        added: true,
      };
      studentList[stuAddedIndex] = addedStudent;
      this.setState({ studentList });

      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
        .child(`${current_subKey}/students/${student_uid}`)
        .set({
          stu_enrolno: student_enrolment_no,
          stu_name: student_name,
          attendance: "absent",
        })
        .catch((error) => {
          console.log(error);
        });
    };

    this.onStudentRemoveClick = (student_uid) => {
      let stuRemovedIndex;
      this.state.studentList.map((student) => {
        if (student.uid === student_uid) {
          return (stuRemovedIndex = this.state.studentList.indexOf(student));
        } else {
          return null;
        }
      });

      let studentList = [...this.state.studentList];
      let removedStudent = {
        ...studentList[stuRemovedIndex],
        added: false,
      };
      studentList[stuRemovedIndex] = removedStudent;
      this.setState({ studentList });

      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
        .child(`${current_subKey}/students/${student_uid}`)
        .remove()
        .catch((error) => {
          console.log(error);
        });
    };

    this.onAddAllStudentsClick = () => {
      this.modifyStudentListArray(true);

      this.state.studentList.map((student) => {
        return this.props.firebase
          .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
          .child(`${current_subKey}/students/${student.uid}`)
          .set({
            stu_enrolno: student.enrolment_no,
            stu_name: student.name,
            attendance: "absent",
          })
          .catch((error) => {
            console.log(error);
          });
      });
    };

    this.onRemoveAllStudentsClick = () => {
      this.modifyStudentListArray(false);

      this.props.firebase
        .facultySubjects(this.state.authUser.uid, this.state.fac_college_name)
        .child(`${current_subKey}/students`)
        .remove()
        .catch((error) => {
          console.log(error);
        });
    };

    this.modifyStudentListArray = (changed_state) => {
      let index = 0;
      let studentList;
      let modifiedStudent;

      studentList = [...this.state.studentList];

      while (index < this.state.studentList.length) {
        modifiedStudent = {
          ...studentList[index],
          added: changed_state,
        };

        studentList[index] = modifiedStudent;

        index++;
      }

      this.setState({ studentList });
    };
  };

  onClickAddStudentsCardStudentInfo = (student_uid) => {
    this.addStudentsCardStudentInfoEnNo[student_uid].classList.toggle(
      "addStudentsCardStudentInfoEnNoHide"
    );
    this.addStudentsCardStudentInfoName[student_uid].classList.toggle(
      "addStudentsCardStudentInfoName"
    );
  };

  render() {
    const {
      department,
      subject,
      semester,
      division,
      shift,
      alt_enrolment_no,
    } = this.state;

    return (
      <div className={"classRoomSectionMain"}>
        <IonAlert
          isOpen={this.state.showAlertAccessCode}
          onDidDismiss={() => this.setState({ showAlertAccessCode: false })}
          header={this.state.authUser.role === "Student" ? "Just do it!" : null}
          message={
            this.state.authUser.role === "Faculty"
              ? "Please make sure that you do not close your application untill you're done taking everyone's attendance, otherwise you'll lose all of your records."
              : null
          }
          inputs={[
            {
              name: `AccessCode`,
              type: `number`,
              placeholder:
                this.state.authUser.role === "Faculty"
                  ? `Enter your Access Code`
                  : `Enter Access Code`,
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Next",
              handler: (data) => {
                if (
                  this.state.authUser.role === "Faculty" &&
                  data.AccessCode === this.state.fac_access_code
                ) {
                  this.setState({ StudentAttendanceCheckToggle: true });

                  if (this.state.StudentAttendanceCheckToggle) {
                    this.currentTime();

                    const { facCardInfoObj } = this.state;

                    this.props.firebase
                      .studentLength(
                        this.state.fac_college_name,
                        this.state.facAuthID,
                        facCardInfoObj.current_facultySub_key
                      )
                      .orderByKey()
                      .on("value", (snapshot) => {
                        if (this._isMounted) {
                          let liveSubStuLength = 0;
                          var subStudents = snapshot.val();
                          for (var substu in subStudents) {
                            if (subStudents[substu].attendance === "present") {
                              liveSubStuLength = liveSubStuLength + 1;
                            }
                          }
                          this.setState({
                            liveSubStuLength: liveSubStuLength,
                          });
                        }
                      });

                    this.props.firebase
                      .studentLength(
                        this.state.fac_college_name,
                        this.state.facAuthID,
                        facCardInfoObj.current_facultySub_key
                      )
                      .orderByChild("stu_enrolno")
                      .on("child_added", (snapshot) => {
                        if (this._isMounted) {
                          var subStuKey = snapshot.key;
                          var subStuInfo = snapshot.val();
                          var studsCardEnrolNo = subStuInfo.stu_enrolno;
                          var studsCardName = subStuInfo.stu_name;
                          var StudentAttendanceCard = document.createElement(
                            "div"
                          );
                          var StudentAttendanceCardInfo = document.createElement(
                            "div"
                          );
                          var StudentAttendanceCardInfoEnrolNo = document.createElement(
                            "div"
                          );
                          var StudentAttendanceCardInfoName = document.createElement(
                            "div"
                          );
                          var StudentAttendanceCardBtn = document.createElement(
                            "div"
                          );

                          var StudentAttendanceCardBtnIndicator = document.createElement(
                            "div"
                          );

                          var StudentAttendanceCardBtnAddContainer = document.createElement(
                            "div"
                          );
                          var StudentAttendanceCardBtnCancelContainer = document.createElement(
                            "div"
                          );

                          const StudentAttendanceCardBtnCancel = ReactDOMServer.renderToStaticMarkup(
                            <FontAwesomeIcon
                              icon="minus"
                              style={{
                                fontSize: `12px`,
                              }}
                            />
                          );

                          const StudentAttendanceCardBtnAdd = ReactDOMServer.renderToStaticMarkup(
                            <FontAwesomeIcon
                              icon="plus"
                              style={{
                                fontSize: `12px`,
                              }}
                            />
                          );

                          StudentAttendanceCard.className =
                            "StudentAttendanceCard";
                          StudentAttendanceCardInfo.className =
                            "StudentAttendanceCardInfo";
                          StudentAttendanceCardInfoEnrolNo.className =
                            "StudentAttendanceCardInfoEnrolNo";
                          StudentAttendanceCardInfoName.className =
                            "StudentAttendanceCardInfoNameHide";
                          StudentAttendanceCardBtn.className =
                            "StudentAttendanceCardBtn";
                          StudentAttendanceCardBtnIndicator.className =
                            "StudentAttendanceCardBtnIndicator";
                          StudentAttendanceCardBtnAddContainer.className =
                            "StudentAttendanceCardBtnAddCancel";
                          StudentAttendanceCardBtnCancelContainer.className =
                            "StudentAttendanceCardBtnAddCancel";

                          StudentAttendanceCard.appendChild(
                            StudentAttendanceCardInfo
                          );
                          StudentAttendanceCard.appendChild(
                            StudentAttendanceCardBtn
                          );

                          StudentAttendanceCardInfo.appendChild(
                            StudentAttendanceCardInfoEnrolNo
                          );
                          StudentAttendanceCardInfo.appendChild(
                            StudentAttendanceCardInfoName
                          );

                          StudentAttendanceCardBtn.appendChild(
                            StudentAttendanceCardBtnIndicator
                          );

                          StudentAttendanceCardInfo.addEventListener(
                            "click",
                            () => {
                              StudentAttendanceCardInfoEnrolNo.classList.toggle(
                                "StudentAttendanceCardInfoEnrolNoHide"
                              );
                              StudentAttendanceCardInfoName.classList.toggle(
                                "StudentAttendanceCardInfoName"
                              );
                            }
                          );

                          StudentAttendanceCardInfoEnrolNo.append(
                            studsCardEnrolNo
                          );
                          StudentAttendanceCardInfoName.append(studsCardName);

                          StudentAttendanceCardBtnIndicator.className =
                            "StudentAttendanceCardBtnIndicator";
                          StudentAttendanceCardBtnAddContainer.innerHTML = StudentAttendanceCardBtnAdd;
                          StudentAttendanceCardBtn.appendChild(
                            StudentAttendanceCardBtnAddContainer
                          );

                          StudentAttendanceCardBtnAddContainer.addEventListener(
                            "click",
                            () => {
                              this.props.firebase
                                .studentLengthAttendance(
                                  this.state.fac_college_name,
                                  this.state.facAuthID,
                                  facCardInfoObj.current_facultySub_key,
                                  subStuKey
                                )
                                .update({
                                  attendance: "present",
                                })
                                .catch((error) => {
                                  console.log(error);
                                });
                            }
                          );
                          StudentAttendanceCardBtnCancelContainer.addEventListener(
                            "click",
                            () => {
                              this.props.firebase
                                .studentLengthAttendance(
                                  this.state.fac_college_name,
                                  this.state.facAuthID,
                                  facCardInfoObj.current_facultySub_key,
                                  subStuKey
                                )
                                .update({
                                  attendance: "absent",
                                })
                                .catch((error) => {
                                  console.log(error);
                                });
                            }
                          );

                          this.props.firebase
                            .studentLengthAttendance(
                              this.state.fac_college_name,
                              this.state.facAuthID,
                              facCardInfoObj.current_facultySub_key,
                              subStuKey
                            )
                            .on("child_changed", (snapshot) => {
                              if (this._isMounted) {
                                if (snapshot.val() === "present") {
                                  StudentAttendanceCardBtnIndicator.className =
                                    "StudentAttendanceCardBtnIndicatorOn";

                                  StudentAttendanceCardBtnCancelContainer.innerHTML = StudentAttendanceCardBtnCancel;
                                  try {
                                    StudentAttendanceCardBtn.replaceChild(
                                      StudentAttendanceCardBtnCancelContainer,
                                      StudentAttendanceCardBtnAddContainer
                                    );
                                  } catch (error) {
                                    console.log(error);
                                  }
                                } else if (snapshot.val() === "absent") {
                                  StudentAttendanceCardBtnIndicator.className =
                                    "StudentAttendanceCardBtnIndicator";

                                  StudentAttendanceCardBtnAddContainer.innerHTML = StudentAttendanceCardBtnAdd;

                                  try {
                                    StudentAttendanceCardBtn.replaceChild(
                                      StudentAttendanceCardBtnAddContainer,
                                      StudentAttendanceCardBtnCancelContainer
                                    );
                                  } catch (error) {
                                    console.log(error);
                                  }
                                }
                              }
                            });

                          this.StudentAttendanceCardMain.current.insertBefore(
                            StudentAttendanceCard,
                            this.StudentAttendanceCardLast.current
                          );
                        }
                      });

                    this.props.firebase
                      .facultySubjects(
                        this.state.facAuthID,
                        this.state.fac_college_name
                      )
                      .child(facCardInfoObj.current_facultySub_key)
                      .update({
                        random_access: {
                          access_boolean: true,
                          random_number: this.state.randomNumber,
                        },
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                } else if (this.state.authUser.role === "Student") {
                  const { stuCardInfoObj } = this.state;

                  this.props.firebase
                    .facultySubjects(
                      stuCardInfoObj.FacKey,
                      this.state.fac_college_name
                    )
                    .child(`${stuCardInfoObj.SubFacKey}/random_access`)
                    .once("value", (snapshot) => {
                      if (this._isMounted) {
                        const fetchrandomno = snapshot.val();
                        const stufetchrandomno = data.AccessCode;

                        if (
                          parseInt(stufetchrandomno) ===
                            fetchrandomno.random_number &&
                          fetchrandomno.access_boolean === true
                        ) {
                          this.props.firebase
                            .studentLengthAttendance(
                              this.state.fac_college_name,
                              stuCardInfoObj.FacKey,
                              stuCardInfoObj.SubFacKey,
                              this.state.stu_uid
                            )
                            .once("value", (snapshot) => {
                              var subStudents = snapshot.val();
                              this.setState({
                                StudentAttendanceCheckAgain:
                                  subStudents.attendance,
                              });

                              if (
                                this.state.StudentAttendanceCheckAgain ===
                                "absent"
                              ) {
                                this.setState({
                                  scanningCardToggle: true,
                                  addBlur: true,
                                  /*To blur the whole background */
                                });
                              } else if (
                                this.state.StudentAttendanceCheckAgain ===
                                "present"
                              ) {
                                this.setState({ showAlertWarning: true });
                              } else {
                                this.setState({ showAlertWrong: false });
                              }
                            });
                        } else {
                          this.setState({
                            showAlertAccessCode: false,
                            showAlertWrong: true,
                          });
                        }
                      }
                    });
                } else {
                  this.setState({
                    showAlertAccessCode: false,
                    showAlertWrong: true,
                  });
                }
              },
            },
          ]}
        />
        <IonAlert
          isOpen={this.state.showAlertExit}
          onDidDismiss={() => this.setState({ showAlertExit: false })}
          header={"Confirmation"}
          message={
            this.state.authUser.role === "Student"
              ? "Are you sure you want to leave the attendace room?"
              : "Are you sure you want to exit? You won't be able to record any students' attendance in your database."
          }
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Okay",
              handler: () => {
                if (this.state.authUser.role === "Faculty") {
                  const { facCardInfoObj } = this.state;
                  this.props.firebase
                    .studentLength(
                      this.state.fac_college_name,
                      this.state.facAuthID,
                      facCardInfoObj.current_facultySub_key
                    )
                    .orderByKey()
                    .on("child_added", (snapshot) => {
                      var subStuKey = snapshot.key;

                      this.props.firebase
                        .facultySubjects(
                          this.state.authUser.uid,
                          this.state.fac_college_name
                        )
                        .child(
                          `${facCardInfoObj.current_facultySub_key}/students/${subStuKey}`
                        )
                        .update({ attendance: "absent" });
                    });

                  this.props.firebase
                    .facultySubjects(
                      this.state.facAuthID,
                      this.state.fac_college_name
                    )
                    .child(facCardInfoObj.current_facultySub_key)
                    .update({
                      random_access: {
                        access_boolean: false,
                        random_number: 0,
                      },
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }
                window.location.reload(true);
              },
            },
          ]}
        />
        <IonAlert
          isOpen={this.state.showAlertAddDb}
          onDidDismiss={() => this.setState({ showAlertAddDb: false })}
          header={"Confirmation"}
          message={
            this.state.authUser.role === "Faculty"
              ? "Are you sure? You won't be able to record other students' attendance in your database once you go ahead."
              : null
          }
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary",
            },
            {
              text: "Okay",
              handler: () => {
                if (this.state.authUser.role === "Faculty") {
                  const { facCardInfoObj } = this.state;

                  this.props.firebase
                    .studentLength(
                      this.state.fac_college_name,
                      this.state.facAuthID,
                      facCardInfoObj.current_facultySub_key
                    )
                    .on("child_added", (snapshot) => {
                      var subStuKey = snapshot.key;
                      var stuAttendance = snapshot.val().attendance;
                      var stuEnNo = snapshot.val().stu_enrolno;
                      var stuName = snapshot.val().stu_name;

                      this.props.firebase
                        .facultySubjects(
                          this.state.facAuthID,
                          this.state.fac_college_name
                        )
                        .child(
                          `${facCardInfoObj.current_facultySub_key}/attendees/${this.state.dateFirebase}/${this.state.randomNumber}/${subStuKey}`
                        )
                        .set({
                          stuAttendance,
                          stuEnNo,
                          stuName,
                        })
                        .then(() => {
                          this.props.firebase
                            .facultySubjects(
                              this.state.authUser.uid,
                              this.state.fac_college_name
                            )
                            .child(
                              `${facCardInfoObj.current_facultySub_key}/students/${subStuKey}`
                            )
                            .update({ attendance: "absent" });

                          window.location.reload(true);
                        });
                    });

                  this.props.firebase
                    .facultySubjects(
                      this.state.facAuthID,
                      this.state.fac_college_name
                    )
                    .child(facCardInfoObj.current_facultySub_key)
                    .update({
                      random_access: {
                        access_boolean: false,
                        random_number: 0,
                      },
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={this.state.showAlertWrong}
          onDidDismiss={() => this.setState({ showAlertWrong: false })}
          header={"Error"}
          message={"Something is Wrong! Try Again."}
          buttons={[
            {
              text: "Okay",
            },
          ]}
        />

        <IonAlert
          isOpen={this.state.showAlertWarning}
          onDidDismiss={() => this.setState({ showAlertWarning: false })}
          header={"WARNING"}
          message={"You've already submitted your attendance once!"}
          buttons={[
            {
              text: "Okay",
            },
          ]}
        />

        <IonAlert
          isOpen={this.state.showAlertDelete}
          onDidDismiss={() => this.setState({ showAlertDelete: false })}
          header={"Confirmation"}
          message={
            "Are you sure you want to remove " +
            renderToStaticMarkup(<b>{this.state.facCardInfoObj.subject}</b>) +
            " subject from the database? You'll lose all the records related to it, if you click " +
            renderToStaticMarkup(<b>Yes.</b>)
          }
          buttons={[
            {
              text: `Cancel`,
              role: `cancel`,
              cssClass: `secondary`,
            },
            {
              text: `Yes`,
              handler: () => {
                if (this._isMounted) {
                  const { facCardInfoObj } = this.state;
                  this.props.firebase
                    .facultySubjects(
                      this.state.facAuthID,
                      this.state.fac_college_name
                    )
                    .child(`${facCardInfoObj.current_facultySub_key}`)
                    .remove();
                }
              },
            },
          ]}
        />

        {this.state.authUser.role === "Faculty" &&
        !this.state.StudentAttendanceCheckToggle ? (
          <div className="editBarContainer">
            {this.state.isToggle && (
              <div className={"quesCardsMain"}>
                {this.state.selectionCardToggle ? (
                  <SelectionCard
                    queCardSelectionOptionClassPass={
                      this.queCardSelectionOptionClassMethod
                    }
                    queCardSelectionOptionLabPass={
                      this.queCardSelectionOptionLabMethod
                    }
                  />
                ) : (
                  <div>
                    <div
                      className={
                        !this.state.isHide ? "quesCardOne" : "quesCardOne hide"
                      }
                    >
                      <p>Select the Dept.</p>
                      <div className="queCardOneForm">
                        <select
                          className="collegeListDropdown"
                          name="department"
                          value={department}
                          onChange={this.onChange}
                        >
                          <option>--DEPARTMENT--</option>
                          {this.state.course_list.map((dept) => {
                            return <option key={dept}>{dept}</option>;
                          })}
                        </select>
                        <div
                          className="queCardOnebtn"
                          onClick={this.nextClickBtn}
                        >
                          <FontAwesomeIcon
                            icon="arrow-right"
                            className="queCardOnebtnIcon"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        this.state.isHide && this.state.isHideLast === 0
                          ? "quesCardTwo"
                          : "quesCardTwo hide"
                      }
                    >
                      <p>The Subject Name?</p>
                      <div className="queCardTwoForm">
                        <input
                          type="text"
                          name="subject"
                          value={subject}
                          onChange={this.onChange}
                          className="SubjectNameDropdown"
                          placeholder="Subject"
                        />

                        <div
                          className="queCardTwobtn"
                          onClick={this.nextClickBtnLast}
                        >
                          <FontAwesomeIcon
                            icon="arrow-right"
                            className="queCardTwobtnIcon"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        this.state.isHideLast === 1
                          ? "quesCardThreeMain"
                          : "quesCardThreeMain hide"
                      }
                    >
                      <div className="quesCardThree">
                        <p>Sem., Div. &amp; Shift?</p>
                        <div className="queCardThreeForm">
                          <select
                            className="SemesterListDropdown"
                            name="semester"
                            value={semester}
                            onChange={this.onChange}
                          >
                            <option>SEMESTER--</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                          </select>
                          <select
                            className="DivisionListDropdown"
                            name="division"
                            value={division}
                            onChange={this.onChange}
                          >
                            <option>DIVISION--</option>
                            <option>A</option>
                            <option>B</option>
                            <option>C</option>
                            <option>D</option>
                            <option>Not Any</option>
                          </select>
                          <select
                            className="ShiftListDropdown"
                            name="shift"
                            value={shift}
                            onChange={this.onChange}
                          >
                            <option>COLLEGE SHIFT--</option>
                            <option>First Shift</option>
                            <option>Second Shift</option>
                            <option>No Shift (Has only one Shift)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="queCardThreebtn"
                        onClick={this.onSubmit}
                      >
                        <FontAwesomeIcon
                          icon="arrow-right"
                          className="queCardThreebtnIcon"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              className={
                !this.state.addNavBlur ? "EditBarMain" : "EditBarMain blur"
              }
            >
              <div className="EditBarBgLeft"></div>
              <div className="EditBarBgRight"></div>

              <div
                className={
                  this.state.classCardMainAddStudentsToggle
                    ? "EditBarBgShapeLeft EditBarBgShapeLeftActive"
                    : "EditBarBgShapeLeft"
                }
                onClick={this.onEditBarEditBtnIcon}
              >
                <FontAwesomeIcon
                  icon="pencil-alt"
                  className="editBarEditBtnIcon"
                />
              </div>
              <svg
                className="EditBarBgShapeMid"
                width="177"
                height="48"
                viewBox="0 0 177 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M58.9751 15.3465C53.4225 7.40845 45.5652 0 35.8778 0H1H0V0.999999V1V47V48H1.00001H176H177V47V1V0H176H141.122C131.435 0 123.578 7.40844 118.025 15.3465C111.389 24.8338 100.636 31 88.5 31C76.3641 31 65.6115 24.8338 58.9751 15.3465Z"
                  fill="#4885ed"
                />
              </svg>

              <div className="editBarAddBtn" onClick={this.addBtnToggle}>
                <FontAwesomeIcon
                  icon="plus"
                  className={
                    !this.state.isToggle
                      ? "editBarAddBtnIcon"
                      : "editBarAddBtnIcon rotate"
                  }
                />
              </div>

              <div
                className={
                  this.state.classCardMainSideStrapsDeleteToggle
                    ? "EditBarBgShapeRight EditBarBgShapeRightActive"
                    : "EditBarBgShapeRight"
                }
                onClick={this.onEditBarDelBtnIcon}
              >
                <FontAwesomeIcon
                  icon="trash-alt"
                  className="editBarDelBtnIcon"
                />
              </div>
            </div>
          </div>
        ) : null}

        {!this.state.StudentAttendanceCheckToggle ? (
          <div className="classListSection">
            <div
              className={
                !this.state.addBlur ? "classListNavBar" : "classListNavBar blur"
              }
            >
              <Menu
                unClickable={this.state.unClickable}
                hamburgerToggle={this.hamburgerToggle}
                isToggleHamburger={this.state.isToggleHamburger}
                name={`Classroom`}
                blur={this.state.addBlur}
              />

              <p className="classListNavHeader">
                <span style={{ color: `#4885ed` }}>C</span>
                <span style={{ color: `#db3236` }}>l</span>
                <span style={{ color: `#f4c20d` }}>a</span>
                <span style={{ color: `#4885ed` }}>s</span>
                <span style={{ color: `#3cba54` }}>s</span>
                <span style={{ color: `#db3236` }}>r</span>
                <span style={{ color: `#f4c20d` }}>o</span>
                <span style={{ color: `#4885ed` }}>o</span>
                <span style={{ color: `#3cba54` }}>m</span>
              </p>
            </div>

            <SubjectList
              blur={this.state.addBlur}
              onSubjectClick={(current_subKey, current_facKey) =>
                this.onSubjectClick(current_subKey, current_facKey)
              }
              unclickableToggle={(toggleBoolean) =>
                this.unclickableToggle(toggleBoolean)
              }
              wantSideStrapsToBeVisible={
                this.state.authUser.role === "Faculty" ? true : false
              }
              openDeleteSubject={this.state.classCardMainSideStrapsDeleteToggle}
              openAddStudents={this.state.classCardMainAddStudentsToggle}
              onRandomCodeNextClick={(
                current_subKey,
                current_facKey,
                randomCode,
                current_subData
              ) =>
                this.onRandomCodeNextClick(
                  current_subKey,
                  current_facKey,
                  randomCode,
                  current_subData
                )
              }
              onDeleteSubjectClick={(current_subKey, current_subName) =>
                this.onDeleteSubjectClick(current_subKey, current_subName)
              }
              onAddStudentsClick={(current_subKey, current_subData) =>
                this.onAddStudentsClick(current_subKey, current_subData)
              }
            />
          </div>
        ) : null}

        {this.state.scanningCardToggle && (
          <div className="barCodeScannerMain">
            <div
              className="cardScanningHamburgerClose"
              onClick={this._scanningCardClose}
            >
              <div className="classListHamburgerLineOneClose"></div>
              <div className="classListHamburgerLineTwoClose"></div>
            </div>
            {this.state.resultBarcode === 0 ? (
              <div className="barCodeScanner">
                <h2>Scan Your ID Card</h2>
                <Scanner onDetected={this._onDetected} />
                <div
                  className="barCodeScannerAlternative"
                  onClick={this._onScanAlternative}
                >
                  Having trouble in Scanning?
                </div>
              </div>
            ) : !this.state.barcodeSuccessFailToggle ? (
              this.state.onScanAlternativeToggle ? (
                <div className="afterResultDetectedDiv barCodeScanner">
                  <input
                    type="number"
                    name="alt_enrolment_no"
                    value={alt_enrolment_no}
                    onChange={this.onChange}
                    className="onScanAlternativeInput"
                    placeholder="Enter your Enrolment No."
                  />
                  <div className="barcodeResultOptions">
                    <div
                      className="barcodeResultOptionsReScan"
                      onClick={this._onReScan}
                    >
                      Scan
                    </div>
                    <div
                      className="barcodeResultOptionsConfirm"
                      onClick={this._onConfirm}
                    >
                      Confirm
                    </div>
                  </div>
                </div>
              ) : (
                <div className="afterResultDetectedDiv barCodeScanner">
                  <div className="barcodeResultOptions">
                    <div
                      className="barcodeResultOptionsReScan"
                      onClick={this._onReScan}
                    >
                      Re-Scan
                    </div>
                    <div
                      className="barcodeResultOptionsConfirm"
                      onClick={this._onConfirm}
                    >
                      Confirm
                    </div>
                  </div>

                  <Result
                    result={
                      this.state.resultBarcode.length === 12
                        ? this.state.resultBarcode
                        : "Error Found!"
                    }
                  />
                </div>
              )
            ) : (
              <div className="barcodeFail">
                <div className="barcodeFailGIF">
                  <img
                    src={SomethingWrongGIF}
                    style={{
                      borderRadius: `8px`,
                      width: `100%`,
                      height: `100%`,
                    }}
                    alt="Something Went Wrong GIF"
                  />
                </div>
                <div className="barcodeFailNextBtn" onClick={this._onReScan}>
                  <FontAwesomeIcon icon="undo" />
                </div>
              </div>
            )}
          </div>
        )}

        {/*Add Students Lab */}
        {this.state.addStudents ? (
          <div className={"addStudentsMain"}>
            <div className="editStudentsSubjectName">
              {this.state.currentSubName.sub_name}
              {this.state.currentSubName.sub_room === "lab" && roomLabTag}
            </div>
            <div className="addStudents">
              {!this.state.isSpinnerHide && <Spinner size="32px" />}
              {this.state.studentList !== null ? (
                this.state.studentList.map((student) => {
                  return (
                    <div
                      className="addStudentsCard"
                      key={student.enrolment_no + student.name}
                    >
                      <div
                        className="addStudentsCardStudentInfo"
                        onClick={() =>
                          this.onClickAddStudentsCardStudentInfo(student.uid)
                        }
                      >
                        <div
                          className="addStudentsCardStudentInfoEnNo"
                          ref={(ref) =>
                            (this.addStudentsCardStudentInfoEnNo[
                              student.uid
                            ] = ref)
                          }
                        >
                          {student.enrolment_no}
                        </div>
                        <div
                          className="addStudentsCardStudentInfoNameHide"
                          ref={(ref) =>
                            (this.addStudentsCardStudentInfoName[
                              student.uid
                            ] = ref)
                          }
                        >
                          {student.name}
                        </div>
                      </div>
                      <div>
                        {!student.added && (
                          <div
                            style={{
                              cursor: `default`,
                              width: `18px`,
                              height: `18px`,
                              borderRadius: `50%`,
                              border: `2px solid #db3236`,
                              display: `flex`,
                              justifyContent: `center`,
                              alignItems: `center`,
                              marginRight: `24px`,
                              marginLeft: `14px`,
                            }}
                            onClick={() =>
                              this.onStudentAddClick(
                                student.uid,
                                student.enrolment_no,
                                student.name
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon="plus"
                              style={{
                                color: `#db3236`,
                                fontSize: `12px`,
                              }}
                            />
                          </div>
                        )}
                        {student.added && (
                          <div
                            style={{
                              cursor: `default`,
                              width: `18px`,
                              height: `18px`,
                              borderRadius: `50%`,
                              border: `2px solid #3cba54`,
                              display: `flex`,
                              justifyContent: `center`,
                              alignItems: `center`,
                              marginRight: `24px`,
                              marginLeft: `14px`,
                            }}
                            onClick={() =>
                              this.onStudentRemoveClick(student.uid)
                            }
                          >
                            <FontAwesomeIcon
                              icon="minus"
                              style={{
                                color: `#3cba54`,
                                fontSize: `12px`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className="addStudentsCard"
                  style={{ justifyContent: `center`, color: `#8d8d8d` }}
                >
                  No Students Found!
                </div>
              )}
            </div>

            <div
              className="addStudentsBtn"
              style={
                !this.state.isSpinnerHide ? { pointerEvents: `none` } : null
              }
            >
              <div
                className="addAllStudentsBtn"
                onClick={this.onAddAllStudentsClick}
                // ref={this.addAllStudents}
              >
                Add all
              </div>
              <div
                className="addStudentsCloseBtn"
                onClick={this.addStudentsClose}
              >
                <FontAwesomeIcon
                  icon="plus"
                  style={{ transform: `rotate(45deg)` }}
                />
              </div>
              <div
                className="addStudentsNextBtn"
                onClick={this.addStudentsNext}
              >
                <FontAwesomeIcon icon="arrow-right" />
              </div>
              <div
                className="removeAllStudentsBtn"
                onClick={this.onRemoveAllStudentsClick}
                // ref={this.removeAllStudents}
              >
                Remove all
              </div>
            </div>
          </div>
        ) : null}
        {/* Attendees Section */}

        {this.state.StudentAttendanceCheckToggle && (
          <div className={"AttendeeBaseMain"}>
            <div className="AttendeeBaseMainHeader">
              <div className="AttendeeBaseMainHeaderContent">
                <p className="AttendeeBaseMainHeaderName">Attendees</p>
                <p className="AttendeeBaseMainHeaderDateInfo">
                  {this.state.dateStyle} &middot; {this.state.weekdayName}{" "}
                  &middot; {this.state.time}
                </p>
              </div>
              <div className="circleStudentsCount">
                <span className="AttendeeBaseMainStudentCountTotalNo">
                  {this.state.liveSubStuLength < 10 && this.state.stuLength > 99
                    ? `00${this.state.liveSubStuLength}`
                    : (this.state.liveSubStuLength < 10 &&
                        this.state.stuLength < 100) ||
                      (this.state.liveSubStuLength > 10 &&
                        this.state.stuLength > 99)
                    ? `0${this.state.liveSubStuLength}`
                    : this.state.liveSubStuLength}
                </span>

                <span className="AttendeeBaseMainStudentCountAttendeesNo">
                  {" "}
                  /{" "}
                  {this.state.stuLength < 10
                    ? `0${this.state.stuLength}`
                    : this.state.stuLength}
                </span>
              </div>
            </div>

            <div className="AttendeeBaseMainContent">
              <div
                onScroll={this.onScrollStudentCard}
                ref={this.StudentAttendanceCardMain}
                className="StudentAttendanceCardMain"
              >
                {this.state.authUser.role === "Faculty" && (
                  <div
                    className="AttendeeBaseMainLeaveChoiceBtnDiv"
                    ref={this.StudentAttendanceCardLast}
                  >
                    <div
                      className="AttendeeBaseMainAddDBBtn"
                      onClick={this.AttendeesDBAddBtn}
                    >
                      <FontAwesomeIcon icon="database" />
                      <p>Save</p>
                    </div>
                    <div
                      className="AttendeeBaseMainExitBtn"
                      onClick={this.AttendeesExitBtn}
                    >
                      <FontAwesomeIcon icon="sign-out-alt" />
                      <p>Exit</p>
                    </div>
                  </div>
                )}

                {this.state.authUser.role === "Student" && (
                  <div
                    className="AttendeeBaseMainLeaveBtnDiv"
                    ref={this.StudentAttendanceCardLast}
                    onClick={this.AttendeesExitBtn}
                  >
                    <div className="AttendeeBaseMainLeaveBtn">
                      Leave the Classroom
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

const ClassroomSectionMain = compose(
  withRouter,
  withFirebase,
  withEmailVerification
)(ClassroomSection);

export default Classroom;

export { ClassroomSectionMain };
