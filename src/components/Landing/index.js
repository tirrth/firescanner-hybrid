import React, { Component } from "react";
import "./index.css";
import ChoiceCard from "./CardChoice";
import StudentImg from "../../images/student.png";
import FacultyImg from "../../images/faculty.png";
import { Link, withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { IonAlert } from "@ionic/react";
import { compose } from "recompose";

class Choice extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      showAlert: false,
    };
  }
  componentDidMount() {
    this._isMounted = true;
  }
  showAlert = () => {
    if (this._isMounted) {
      this.setState({ showAlert: true });
    }
  };
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <div className="Choice">
        <IonAlert
          isOpen={this.state.showAlert}
          onDidDismiss={() => this.setState({ showAlert: false })}
          header={"ALERT!!"}
          message={
            "Make sure you're a Faculty member and not a Student, because your data will be in the hands of your Head Of Department. If you try to create any problems, you'll be in a big troble. You can visit 'firedance.web.app', if you want to do some experiments with this application or want to explore faculty section. Thank you."
          }
          buttons={[
            {
              text: `Cancel`,
              role: "cancel",
              cssClass: `secondary`,
            },
            {
              text: `Next`,
              handler: () => {
                this.props.history.push(ROUTES.FAC_SIGN_UP);
                window.location.reload(false);
              },
            },
          ]}
        />
        <div className="ChoiceCards">
          <div className="ChoiceCardOneDiv">
            <Link to={ROUTES.STU_SIGN_UP} style={{ textDecoration: "none" }}>
              <ChoiceCard
                image={StudentImg}
                choice="Student"
                alt="Student_Image"
              />
            </Link>
          </div>

          <div className="ChoiceCardSecondDiv" onClick={this.showAlert}>
            <ChoiceCard
              image={FacultyImg}
              choice="Faculty"
              alt="Faculty_Image"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(withRouter)(Choice);
