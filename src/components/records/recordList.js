import React, { Component } from "react";

import "./recordlist.css";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PDFExport } from "@progress/kendo-react-pdf";
import * as ROUTES from "../../constants/routes";

class recordList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fac_college_name: JSON.parse(localStorage.getItem("authUser")).college,
      facAuthID: JSON.parse(localStorage.getItem("authUser")).uid,

      facName: "",
      facDept: "",
      facDiv: "",
      facSub: "",
      facShift: "",
      facSem: "",

      presentStu: 0,
      absentStu: 0,
      totalStu: 0,
      stuEnrollno: 0,
      stuName: "",
    };

    this.recordListSectionMainTableRow = React.createRef();
  }
  componentDidMount() {
    var presentStu = 0;
    var absentStu = 0;

    this.props.firebase
      .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
      .child(this.props.subkey)
      .on("value", (snapshot) => {
        this.setState({ facName: snapshot.val().fname });
        this.setState({ facDept: snapshot.val().department });
        this.setState({ facDiv: snapshot.val().division });
        this.setState({ facSub: snapshot.val().subject });
        this.setState({ facShift: snapshot.val().shift });
        this.setState({ facSem: snapshot.val().semester });

        if (snapshot.val().shift === "No Shift (Has only one Shift)") {
          this.setState({ facShift: "No Shift" });
        }

        this.props.firebase
          .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
          .child(
            `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
          )
          .on("value", (snapshot) => {
            this.setState({ totalStu: snapshot.numChildren() });
          });

        var srno = 0;
        this.props.firebase
          .facultySubjects(this.state.facAuthID, this.state.fac_college_name)
          .child(
            `${this.props.subkey}/attendees/${this.props.facdate}/${this.props.facrandom}`
          )
          .on("child_added", (snapshot) => {
            var stuAttendance = snapshot.val().stuAttendance;

            var stuEnNo = snapshot.val().stuEnNo;
            var stuName = snapshot.val().stuName;

            if (stuAttendance === "present") {
              presentStu = presentStu + 1;
            }
            if (stuAttendance === "absent") {
              absentStu = absentStu + 1;
            }

            var recordListSectionMainTableRow = document.createElement("tr");
            var recordListSectionMainTableRowSr = document.createElement("td");
            var recordListSectionMainTableRowName = document.createElement(
              "td"
            );
            var recordListSectionMainTableRowEn = document.createElement("td");

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
          });

        this.setState({ presentStu: presentStu });
        this.setState({ absentStu: absentStu });
      });
  }

  recordListSectionMainExitBtn = () => {
    this.props.history.push(ROUTES.RECORDS);
    window.location.reload(true);
  };

  exportPDF() {
    this.pdfExportComponent.save();
  }

  render() {
    return (
      <div className="recordListSectionMain">
        <PDFExport
          //es6 way to give reference
          ref={(component) => (this.pdfExportComponent = component)}
          paperSize="auto"
          margin={40}
          fileName={`Attendance Report of ${this.state.facSub} (${this.props.facdate})`}
        >
          <div className="recordListPDFInfoMain" id="divToPrint">
            <div className="recordListPDFInfo">
              <div className="recordListSectionMainInfo">
                <div className="recordListSectionMainInfoDR">
                  <div className="recordListSectionMainInfoDate">
                    <p>Date: </p>
                    <p style={{ marginLeft: `6px` }}>{this.props.facdate}</p>
                  </div>
                  <div className="recordListSectionMainInfoRandom">
                    <p>Random No.: </p>
                    <p style={{ marginLeft: `6px` }}>{this.props.facrandom}</p>
                  </div>
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
                      <p style={{ marginLeft: `6px` }}>{this.state.facDept}</p>
                    </div>
                    <div className="recordListSectionMainInfoSub">
                      <p>Subject: </p>
                      <p style={{ marginLeft: `6px` }}>{this.state.facSub}</p>
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

                <tbody ref={this.recordListSectionMainTableRow}></tbody>
              </table>
            </div>
          </div>
        </PDFExport>
        <div className="recordListSectionMainEPBtn">
          <div
            className="recordListSectionMainPrintBtn"
            onClick={() => {
              this.pdfExportComponent.save();
            }}
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
