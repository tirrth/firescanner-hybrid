import React, { Component } from "react";

import "./recordlist.css";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";
import Spinner from "../spinner";
import { PDFExport } from "@progress/kendo-react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as ROUTES from "../../constants/routes";
import { IonAlert } from "@ionic/react";

class AnalyticsExport extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,

      facName: JSON.parse(localStorage.getItem("authUser")).name,
      facDept: "",
      facDiv: "",
      facSub: "",
      facRoom: "",
      facShift: "",
      facSem: "",

      presentStu: 0,
      absentStu: 0,
      totalStu: 0,
      stuEnrollno: 0,
      stuName: "",

      showAlertConfirmationPDF: false,
      showAlertExitDoc: false,

      isLoading: true,

      allStudentsConfirmation: true,
      presentStudentsConfirmation: false,
      absentStudentsConfirmation: false,

      data_export_state: {},
    };

    this.recordListSectionMainTableRow = React.createRef();
  }

  componentDidMount() {
    console.log(this.props, "Executes!!!");
    this._getComponentData();
  }

  _getComponentData = (data_export_state = this.props.data_export_state) => {
    this.setState({ isLoading: true, data_export_state });
    this._isMounted = true;

    if (this._isMounted) {
      this.recordListSectionMainTableRow?.current &&
        (this.recordListSectionMainTableRow.current.innerHTML = "");
      this.recordListSectionMainTableRowAbsent &&
        (this.recordListSectionMainTableRowAbsent.innerHTML = "");
      this.recordListSectionMainTableRowPresent &&
        (this.recordListSectionMainTableRowPresent.innerHTML = "");

      var presentStu = 0;
      var absentStu = 0;

      this.props.firebase
        .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
        .child(this.props.subject_key)
        .on("value", (snapshot) => {
          if (this._isMounted) {
            this.setState({ facDept: snapshot.val().department.toLowerCase() });
            this.setState({ facDiv: snapshot.val().division });
            this.setState({ facSub: snapshot.val().subject });
            this.setState({ facRoom: snapshot.val().room });
            this.setState({ facShift: snapshot.val().shift });
            this.setState({ facSem: snapshot.val().semester });

            if (snapshot.val().shift === "No Shift (Has only one Shift)") {
              this.setState({ facShift: "No" });
            }
            if (snapshot.val().division === "Not Any") {
              this.setState({ facDiv: "No" });
            }

            if (this._isMounted) {
              this.props.firebase
                .facultySubjects(
                  this.state.facAuthID,
                  this.state.fac_college_name
                )
                .child(
                  `${this.props.subject_key}/attendees/${this.props.attendance_date}/${this.props.random_no}`
                )
                .on("value", (snapshot) => {
                  this.setState({ totalStu: snapshot.numChildren() });
                });
            }

            var sr_no = 0;
            this.props.firebase
              .facultySubjects(
                this.state.facAuthID,
                this.state.fac_college_name
              )
              .child(
                `${this.props.subject_key}/attendees/${this.props.attendance_date}/${this.props.random_no}`
              )
              .orderByChild("stuEnNo")
              .on("child_added", (snapshot) => {
                if (this._isMounted) {
                  var stuAttendance = snapshot.val().stuAttendance;

                  var stuEnNo = snapshot.val().stuEnNo;
                  var stuName = snapshot.val().stuName;

                  if (stuAttendance === "present") {
                    presentStu = presentStu + 1;
                  }
                  if (stuAttendance === "absent") {
                    absentStu = absentStu + 1;
                  }

                  var recordListSectionMainTableRow = document.createElement(
                    "tr"
                  );
                  var recordListSectionMainTableRowSr = document.createElement(
                    "td"
                  );
                  var recordListSectionMainTableRowName = document.createElement(
                    "td"
                  );
                  var recordListSectionMainTableRowEn = document.createElement(
                    "td"
                  );

                  if (stuAttendance === "absent") {
                    recordListSectionMainTableRow.className =
                      "redColorAbsentIndicatorTr";
                    recordListSectionMainTableRowSr.className =
                      "redColorAbsentIndicatorTd";
                    recordListSectionMainTableRowName.className =
                      "redColorAbsentIndicatorTd";
                    recordListSectionMainTableRowEn.className =
                      "redColorAbsentIndicatorTd";
                  }

                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowSr
                  );
                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowName
                  );
                  recordListSectionMainTableRow.appendChild(
                    recordListSectionMainTableRowEn
                  );

                  recordListSectionMainTableRowSr.append(`${sr_no + 1}.`);

                  recordListSectionMainTableRowName.append(stuName);
                  recordListSectionMainTableRowEn.append(stuEnNo);

                  if (
                    !data_export_state.export_present &&
                    !data_export_state.export_absent
                  ) {
                    sr_no = sr_no + 1;
                    this.recordListSectionMainTableRow?.current.appendChild(
                      recordListSectionMainTableRow
                    );
                  } else {
                    if (
                      data_export_state.export_present &&
                      stuAttendance === "present"
                    ) {
                      sr_no = sr_no + 1;
                      this.recordListSectionMainTableRowPresent.appendChild(
                        recordListSectionMainTableRow
                      );
                    } else if (
                      data_export_state.export_absent &&
                      stuAttendance === "absent"
                    ) {
                      sr_no = sr_no + 1;
                      this.recordListSectionMainTableRowAbsent.appendChild(
                        recordListSectionMainTableRow
                      );
                    }
                  }
                }
              });

            this.setState({ presentStu: presentStu });
            this.setState({ absentStu: absentStu });
            this.setState({ isLoading: false }, () => {
              this.pdfExportComponent.save();
              // this.props.history.goBack();
            });
          }
        });
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  recordListSectionMainExitBtn = () => {
    this.setState({ showAlertExitDoc: true });
  };

  exportPDF = () => {
    this.setState({
      allStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  PDFExportAbsent = () => {
    this.setState({
      absentStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  PDFExportPresent = () => {
    this.setState({
      presentStudentsConfirmation: true,
      showAlertConfirmationPDF: true,
    });
  };

  render() {
    const timestamp_utc = new Date(
      `${this.props.attendance_date}.000Z`
    ).toUTCString();
    const { isLoading, data_export_state } = this.state;
    return (
      <>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100vh",
              width: "100vw",
              display: "grid",
              placeItems: "center",
              zIndex: 2,
            }}
          >
            <Spinner />
          </div>
        )}
        <div
          className="recordListSectionMain"
          style={isLoading ? { display: "none" } : { display: "block" }}
        >
          <IonAlert
            isOpen={
              this.state.showAlertConfirmationPDF || this.state.showAlertExitDoc
            }
            onDidDismiss={() =>
              this.setState({
                showAlertConfirmationPDF: false,
                showAlertExitDoc: false,
              })
            }
            header={"Confirmation"}
            message={
              this.state.showAlertConfirmationPDF
                ? "Are you sure you want to download the PDF?"
                : "Are you sure you want to exit?"
            }
            buttons={[
              {
                text: "No",
                role: "cancel",
                cssClass: "secondary",
              },
              {
                text: "Yes",
                handler: () => {
                  if (this.state.showAlertConfirmationPDF) {
                    if (this.state.presentStudentsConfirmation) {
                      this._getComponentData({
                        ...this.props.data_export_state,
                        export_present: true,
                        export_absent: false,
                      });
                    } else if (this.state.absentStudentsConfirmation) {
                      this._getComponentData({
                        ...this.props.data_export_state,
                        export_absent: true,
                        export_present: false,
                      });
                    } else if (this.state.allStudentsConfirmation) {
                      this._getComponentData({
                        ...this.props.data_export_state,
                        export_absent: false,
                        export_present: false,
                      });
                    }
                  } else if (this.state.showAlertExitDoc) {
                    this.props.history.push(ROUTES.ANALYTICS);
                    // window.location.reload();
                  }
                },
              },
            ]}
          />
          <PDFExport
            ref={(component) => (this.pdfExportComponent = component)}
            paperSize="auto"
            margin={40}
            fileName={`Attendance Report of ${this.state.facSub} (${
              this.props.attendance_date.toString().split("T")[0]
            })`}
          >
            <div className="recordListPDFInfoMain" id="divToPrint">
              <div className="recordListPDFInfo">
                <div className="recordListSectionMainInfo">
                  <div className="recordListSectionMainInfoDR">
                    {this.props.attendance_date.toString().split("T")
                      .length && (
                      <div className="recordListSectionMainInfoDate">
                        <p></p>
                        <p style={{ marginLeft: `6px` }}>
                          {timestamp_utc.replace("GMT", "")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="recordListSectionMainInfoClg">
                    {this.state.fac_college_name}
                  </div>
                  <div className="recordListSectionMainInfoRest">
                    <div className="recordListSectionMainInfoDSDS">
                      <div className="recordListSectionMainInfoFac">
                        <p>Faculty Name: </p>
                        <p style={{ marginLeft: `6px` }}>
                          {this.state.facName}
                        </p>
                      </div>
                      <div className="recordListSectionMainInfoDept">
                        <p>Department: </p>
                        <p
                          style={{
                            marginLeft: `6px`,
                            textTransform: `capitalize`,
                          }}
                        >
                          {this.state.facDept}
                        </p>
                      </div>
                      <div className="recordListSectionMainInfoSub">
                        <p>Subject: </p>
                        <p style={{ marginLeft: `6px` }}>
                          {this.state.facSub} - {this.state.facRoom}
                        </p>
                      </div>
                      <div className="recordListSectionMainInfoSemDivShift">
                        <p>Semester/Division/Shift: </p>
                        <p
                          style={{ marginLeft: `6px` }}
                        >{`${this.state.facSem}/${this.state.facDiv}/${this.state.facShift}`}</p>
                      </div>
                    </div>
                    <div className="recordListSectionMainInfoTPA">
                      <div className="recordListSectionMainInfoTotal">
                        <p>Total Students: </p>
                        <p style={{ marginLeft: `6px` }}>
                          {this.state.totalStu}
                        </p>
                      </div>
                      <div className="recordListSectionMainInfoPresent">
                        <p>Present: </p>
                        <p style={{ marginLeft: `6px` }}>
                          {this.state.presentStu}
                        </p>
                      </div>
                      <div className="recordListSectionMainInfoAbsent">
                        <p>Absent:</p>
                        <p style={{ marginLeft: `6px` }}>
                          {this.state.absentStu}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Name</th>
                      <th>Enrollment No.</th>
                    </tr>
                  </thead>

                  {/* <tbody
                    style={
                      !data_export_state.export_present &&
                      !data_export_state.export_absent
                        ? { display: "block" }
                        : { display: "none" }
                    }
                    ref={this.recordListSectionMainTableRow}
                  ></tbody> */}

                  <tbody
                    ref={
                      !data_export_state.export_present &&
                      !data_export_state.export_absent
                        ? this.recordListSectionMainTableRow
                        : (ref_comp) => {
                            if (data_export_state.export_present)
                              this.recordListSectionMainTableRowPresent = ref_comp;
                            else if (data_export_state.export_absent)
                              this.recordListSectionMainTableRowAbsent = ref_comp;
                            else return null;
                          }
                    }
                  ></tbody>

                  {/* <tbody
                    style={
                      data_export_state.export_absent
                        ? { display: "block" }
                        : { display: "none" }
                    }
                    ref={(absent) =>
                      (this.recordListSectionMainTableRowAbsent = absent)
                    }
                  ></tbody> */}
                </table>
              </div>
            </div>
          </PDFExport>
          <div className="recordListSectionMainEPBtn">
            <div
              onClick={this.PDFExportPresent}
              className="recordListSectionMainPresentBtn"
              style={{ fontWeight: `800` }}
            >
              P
            </div>
            <div
              onClick={this.PDFExportAbsent}
              className="recordListSectionMainAbsentBtn"
              style={{ fontWeight: `800` }}
            >
              A
            </div>
            <div
              className="recordListSectionMainPrintBtn"
              onClick={this.exportPDF}
            >
              <FontAwesomeIcon icon="print" />
            </div>
            <div
              className="recordListSectionMainExitBtn"
              onClick={this.recordListSectionMainExitBtn}
            >
              <FontAwesomeIcon icon="sign-out-alt" />
            </div>
          </div>
        </div>
      </>
    );
  }
}

const AnalyticsExportWithFire = compose(
  withFirebase,
  withRouter
)(AnalyticsExport);

export default AnalyticsExportWithFire;
