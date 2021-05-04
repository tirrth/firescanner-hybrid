import React, { Component } from "react";

import "./recordlist.css";

import { compose } from "recompose";
import { withFirebase } from "../Configuration";
import { withRouter } from "react-router-dom";
import Spinner from "../spinner";
import { PDFExport } from "@progress/kendo-react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as ROUTES from "../../constants/routes";
import { IonAlert, isPlatform } from "@ionic/react";

import jsPDF from "jspdf";
import "jspdf-autotable";

import { File } from "@ionic-native/file";
import { FileOpener } from "@ionic-native/file-opener";

class AnalyticsExport extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this._file = File;
    this._fileOpener = FileOpener;

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
      tableData: [],

      showAlertConfirmationPDF: false,
      showAlertExitDoc: false,

      isLoading: true,

      allStudentsConfirmation: true,
      presentStudentsConfirmation: false,
      absentStudentsConfirmation: false,

      data_export_state: {},

      is_pdf_export_loading: false,
      is_pdf_present_export_loading: false,
      is_pdf_absent_export_loading: false,
    };

    this.recordListSectionMainTableRow = React.createRef();
  }

  componentDidMount() {
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

                  this.setState({
                    tableData: [
                      ...this.state.tableData,
                      {
                        stuName,
                        stuEnNo: `${stuEnNo}`,
                        sr_no: `${sr_no + 1}.`,
                        attendance: stuAttendance === "present" ? "P" : "Ab",
                        is_present: stuAttendance === "present",
                      },
                    ],
                  });
                  if (
                    !data_export_state.export_present &&
                    !data_export_state.export_absent
                  ) {
                    sr_no = sr_no + 1;
                    this.recordListSectionMainTableRow?.current.appendChild(
                      recordListSectionMainTableRow
                    );
                  } else if (
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
              });

            this.setState({ presentStu: presentStu });
            this.setState({ absentStu: absentStu });
            this.setState({ isLoading: false }, () => {
              if (isPlatform("android")) {
                this._generateNativePdf();
              } else {
                this.pdfExportComponent.save();
              }
              // this.props.history.goBack();
            });
          }
        });
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  _generateNativePdf() {
    const { data_export_state } = this.state;
    if (data_export_state.export_present) {
      this.setState({ is_pdf_present_export_loading: true });
    } else if (data_export_state.export_absent) {
      this.setState({ is_pdf_absent_export_loading: true });
    } else {
      this.setState({ is_pdf_export_loading: true });
    }

    const isFileNameExists = (file_directory_path, fileName) => {
      return this._file.checkFile(file_directory_path, fileName);
    };

    const _getFileName = async (
      file_directory_path,
      file_name_replacement_count = 0
    ) => {
      const fileName = `Attendance Report of ${this.state.facSub} (${
        this.props.attendance_date.toString().split("T")[0]
      })${
        file_name_replacement_count ? "_" + file_name_replacement_count : ""
      }.pdf`;

      return isFileNameExists(file_directory_path, fileName)
        .then(async (is_exists) =>
          is_exists
            ? await _getFileName(
                file_directory_path,
                file_name_replacement_count + 1
              )
            : fileName
        )
        .catch((err) => {
          console.log("Error: " + JSON.stringify({ err }));
          return fileName;
        });
    };

    const _downloadNativeFile = (
      base_directory_path,
      working_directory_name,
      fileName,
      buffer
    ) => {
      this._file
        .checkDir(base_directory_path, working_directory_name)
        .then((is_exists) => {
          if (is_exists) {
            //This is where the PDF file will get stored , you can change it as you like
            // for more information please visit https://ionicframework.com/docs/native/file/
            const directory_path = `${base_directory_path}${working_directory_name}`;

            //Writing File to Device
            this._file
              .writeFile(directory_path, fileName, buffer, { replace: true })
              .then((success) => {
                console.log("File created Successfully!!", success);

                this._fileOpener
                  .open(`${directory_path}/${fileName}`, "application/pdf")
                  .then(() => console.log("File is opened"))
                  .catch((e) => console.log("Error opening file", e));
              })
              .catch((error) => console.log("Cannot create File!!", error))
              .finally(() =>
                this.setState({
                  is_pdf_absent_export_loading: false,
                  is_pdf_present_export_loading: false,
                  is_pdf_export_loading: false,
                })
              );
          }
        })
        .catch((err) => {
          console.log("Error: ", err);
          this._file
            .createDir(base_directory_path, working_directory_name, true)
            .then(() => {
              _downloadNativeFile(
                base_directory_path,
                working_directory_name,
                fileName,
                buffer
              );
            })
            .catch((err) => console.log("Error: ", err));
        });
    };

    const attendance_info = document.getElementsByClassName(
      "recordListSectionMainInfo"
    )[0];
    const doc = new jsPDF("portrait", "px", "a4", true);
    attendance_info &&
      doc.html(attendance_info, {
        x: 20,
        y: 20,
        callback: async () => {
          const { tableData: body } = this.state;
          doc.autoTable({
            columnStyles: {
              0: { cellWidth: 50 },
              3: { cellWidth: 80 },
            },
            margin: { top: 10 },
            showHead: "everyPage",
            showFoot: "everyPage",
            columns: [
              { header: "Sr.", dataKey: "sr_no" },
              { header: "Name", dataKey: "stuName" },
              { header: "Enrollment No.", dataKey: "stuEnNo" },
              { header: "Attendance", dataKey: "attendance" },
            ],
            body,
            didParseCell: (data) => {
              data.cell.styles.halign = "center";
              if (data.row.raw.is_present === false) {
                data.cell.styles.textColor = [255, 99, 71];
              }
            },
          });
          const base_dir_path = this._file.externalRootDirectory;
          const working_dir_name = "FireScanner";
          const fileName = await _getFileName(
            `${base_dir_path}${working_dir_name}/`
          );

          let pdfOutput = doc.output();
          let buffer = new ArrayBuffer(pdfOutput.length);
          // using ArrayBuffer will allow you to put image inside PDF
          let array = new Uint8Array(buffer);
          for (var i = 0; i < pdfOutput.length; i++) {
            array[i] = pdfOutput.charCodeAt(i);
          }
          _downloadNativeFile(
            base_dir_path,
            working_dir_name,
            fileName,
            buffer
          );
        },
      });

    // doc.autoTable({ html: "#my-table" }); OR ----------------

    // // Example usage of columns property. Note that America will not be included even though it exist in the body since there is no column specified for it.
    // doc.autoTable({
    //   styles: { fillColor: [255, 99, 71] },
    //   columnStyles: { europe: { halign: "center" } }, // European countries centered
    //   body: [
    //     { europe: "Sweden", america: "Canada", asia: "China" },
    //     { europe: "Norway", america: "Mexico", asia: "Japan" },
    //   ],
    //   columns: [
    //     { header: "Europe", dataKey: "europe" },
    //     { header: "Asia", dataKey: "asia" },
    //   ],
    // }); OR ----------------
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
                    window.location.reload();
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

                <table id="my-table">
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
              onClick={
                this.state.is_pdf_absent_export_loading ||
                this.state.is_pdf_present_export_loading ||
                this.state.is_pdf_export_loading
                  ? () => null
                  : this.PDFExportPresent
              }
              className="recordListSectionMainPresentBtn"
              style={{ fontWeight: `800` }}
            >
              {!this.state.is_pdf_present_export_loading ? (
                "P"
              ) : (
                <div style={{ marginTop: "2px", marginLeft: "1px" }}>
                  <Spinner color="#FFFFFF" size="28px" />
                </div>
              )}
            </div>
            <div
              onClick={
                this.state.is_pdf_absent_export_loading ||
                this.state.is_pdf_present_export_loading ||
                this.state.is_pdf_export_loading
                  ? () => null
                  : this.PDFExportAbsent
              }
              className="recordListSectionMainAbsentBtn"
              style={{ fontWeight: `800` }}
            >
              {!this.state.is_pdf_absent_export_loading ? (
                "A"
              ) : (
                <div style={{ marginTop: "2px", marginLeft: "1px" }}>
                  <Spinner color="#FFFFFF" size="28px" />
                </div>
              )}
            </div>
            <div
              className="recordListSectionMainPrintBtn"
              onClick={
                this.state.is_pdf_absent_export_loading ||
                this.state.is_pdf_present_export_loading ||
                this.state.is_pdf_export_loading
                  ? () => null
                  : this.exportPDF
              }
            >
              {!this.state.is_pdf_export_loading ? (
                <FontAwesomeIcon icon="print" />
              ) : (
                <div style={{ marginTop: "2px", marginLeft: "1px" }}>
                  <Spinner color="#FFFFFF" size="28px" />
                </div>
              )}
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
