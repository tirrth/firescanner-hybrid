import React, { Component } from "react";

import "./recordlist.css";

import { IonAlert } from "@ionic/react";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PDFExport } from "@progress/kendo-react-pdf";

import * as ROUTES from "../../constants/routes";
import { cipher } from "../../encryption/cipher-encrypt";

class recordList extends Component {
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
      presentStudentsConfirmation: false,
      absentStudentsConfirmation: false,
      allStudentsConfirmation: true,

      cipher_info: {},
    };

    this.recordListSectionMainTableRow = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;

    // ------------------------ Encrypting necessary data to download PDF ------------------------ //
    const cipher_salt = `${Math.random()}`;
    const encoded_cipher = cipher(cipher_salt)(
      JSON.stringify({
        subject_key: this.props.subkey,
        attendance_date: this.props.facdate,
        random_no: this.props.facrandom,
      })
    );
    this.setState({ cipher_info: { encoded_cipher, cipher_salt } });
    // ------------------------ (EXIT) Encrypting necessary data to download PDF ------------------------ //

    if (this._isMounted) {
      var presentStu = 0;
      var absentStu = 0;

      this.props.firebase
        .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
        .child(this.props.subkey)
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
                  `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
                )
                .on("value", (snapshot) => {
                  this.setState({ totalStu: snapshot.numChildren() });
                });
            }

            var srno = 0;
            this.props.firebase
              .facultySubjects(
                this.state.facAuthID,
                this.state.fac_college_name
              )
              .child(
                `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
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

                  recordListSectionMainTableRowSr.append(`${srno + 1}.`);
                  srno = srno + 1;

                  recordListSectionMainTableRowName.append(stuName);
                  recordListSectionMainTableRowEn.append(stuEnNo);

                  this.recordListSectionMainTableRow.current.appendChild(
                    recordListSectionMainTableRow
                  );

                  if (
                    this.state.presentStudentsConfirmation &&
                    stuAttendance === "present"
                  ) {
                    console.log("p");
                    this.recordListSectionMainTableRowPresent.appendChild(
                      recordListSectionMainTableRow
                    );
                  }

                  if (
                    this.state.absentStudentsConfirmation &&
                    stuAttendance === "absent"
                  ) {
                    this.recordListSectionMainTableRowAbsent.appendChild(
                      recordListSectionMainTableRow
                    );
                  }
                }
              });

            this.setState({ presentStu: presentStu });
            this.setState({ absentStu: absentStu });
          }
        });
    }
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

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const timestamp_utc = new Date(`${this.props.facdate}.000Z`).toUTCString();
    return (
      <div className="recordListSectionMain">
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
                    // this.props.history.push({
                    //   pathname: "/download/analytics",
                    //   state: {
                    //     ...this.state.cipher_info,
                    //     export_present: true,
                    //   },
                    // });
                    const encoded_base64 = window.btoa(
                      JSON.stringify({
                        ...this.state.cipher_info,
                        export_present: true,
                        export_absent: false,
                      })
                    );
                    this.props.history.push({
                      pathname: "/api/download/analytics/" + encoded_base64,
                    });
                  } else if (this.state.absentStudentsConfirmation) {
                    // this.props.history.push({
                    //   pathname: "/download/analytics",
                    //   state: { ...this.state.cipher_info, export_absent: true },
                    // });
                    const encoded_base64 = window.btoa(
                      JSON.stringify({
                        ...this.state.cipher_info,
                        export_present: false,
                        export_absent: true,
                      })
                    );
                    this.props.history.push({
                      pathname: "/api/download/analytics/" + encoded_base64,
                    });
                  } else if (this.state.allStudentsConfirmation) {
                    // this.props.history.push({
                    //   pathname: "/download/analytics",
                    //   state: this.state.cipher_info,
                    // });
                    const encoded_base64 = window.btoa(
                      JSON.stringify(this.state.cipher_info)
                    );
                    this.props.history.push({
                      pathname: "/api/download/analytics/" + encoded_base64,
                    });
                  }
                } else if (this.state.showAlertExitDoc) {
                  this.props.history.push(ROUTES.ANALYTICS);
                  window.location.reload(true);
                }
              },
            },
          ]}
        />

        <PDFExport
          //es6 way to give reference
          ref={(component) => (this.pdfExportComponent = component)}
          paperSize="auto"
          margin={40}
          fileName={`Attendance Report of ${this.state.facSub} (${
            this.props.facdate.toString().split("T")[0]
          })`}
        >
          <div className="recordListPDFInfoMain" id="divToPrint">
            <div className="recordListPDFInfo">
              <div className="recordListSectionMainInfo">
                <div className="recordListSectionMainInfoDR">
                  {/* <div className="recordListSectionMainInfoDate">
                    <p>Date: </p>
                    <p style={{ marginLeft: `6px` }}>
                      {timestamp_utc.split(" ")[0]}
                    </p>
                  </div> */}
                  {this.props.facdate.toString().split("T").length && (
                    <div className="recordListSectionMainInfoDate">
                      <p></p>
                      <p style={{ marginLeft: `6px` }}>
                        {/* {this.props.facdate.toString().slice(0, 2) +
                        "/" +
                        this.props.facdate.toString().slice(2, 4) +
                        "/" +
                        this.props.facdate.toString().slice(4)} */}
                        {timestamp_utc.replace("GMT", "")}
                      </p>
                    </div>
                  )}
                  {/* <div className="recordListSectionMainInfoRandom">
                    <p>Random No.: </p>
                    <p style={{ marginLeft: `6px` }}>{this.props.facrandom}</p>
                  </div> */}
                  {/* <div className="recordListSectionMainInfoRoom">
                    <p>Room: </p>
                    <p style={{ marginLeft: `6px` }}>{this.state.facRoom}</p>
                  </div> */}
                </div>
                <div className="recordListSectionMainInfoClg">
                  {this.state.fac_college_name}
                </div>
                <div className="recordListSectionMainInfoRest">
                  <div className="recordListSectionMainInfoDSDS">
                    <div className="recordListSectionMainInfoFac">
                      <p>Faculty Name: </p>
                      <p style={{ marginLeft: `6px` }}>{this.state.facName}</p>
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
                      <p style={{ marginLeft: `6px` }}>{this.state.totalStu}</p>
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

                {this.state.allStudentsConfirmation && (
                  <tbody ref={this.recordListSectionMainTableRow}></tbody>
                )}

                {this.state.presentStudentsConfirmation && (
                  <tbody
                    ref={(present) =>
                      (this.recordListSectionMainTableRowPresent = present)
                    }
                  ></tbody>
                )}

                {this.state.absentStudentsConfirmation && (
                  <tbody
                    ref={(absent) =>
                      (this.recordListSectionMainTableRowAbsent = absent)
                    }
                  ></tbody>
                )}
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
    );
  }
}

const recordListWithFire = compose(withFirebase, withRouter)(recordList);

export default recordListWithFire;
