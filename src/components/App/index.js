import React, { Component } from "react";
import SignIn from "../Forms/SignIn";
import SignUpStu from "../Forms/SignUp/SignUpStu";
import SignUpFac from "../Forms/SignUp/SignUpFac";
import PasswordForget from "../Forms/PasswordForget";
import PasswordUpdate from "../Forms/PasswordUpdate";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Landing from "../Landing";
import Analytics from "../Analytics";
import Destination from "../DestinationPage";
import { withAuthentication } from "../Session";

/*Font Awesome Library*/
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faMinus,
  faPlus,
  faPencilAlt,
  faTrashAlt,
  faUndo,
  faDatabase,
  faDownload,
  faSignOutAlt,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

import ProfilePage from "../Forms/Profile";
import Classroom from "../classroom";
import IdCard from "../IdCard";
import Spinner from "../spinner";
import SubList from "../subjectList";

library.add(
  faArrowRight,
  faMinus,
  faPlus,
  faPencilAlt,
  faTrashAlt,
  faUndo,
  faDownload,
  faDatabase,
  faSignOutAlt,
  faPrint
);

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path={ROUTES.DESTINATION} exact component={Destination} />
            <Route path={ROUTES.LANDING} component={Landing} />
            <Route path={ROUTES.SIGN_IN} component={SignIn} />
            <Route path={ROUTES.STU_SIGN_UP} component={SignUpStu} />
            <Route path={ROUTES.FAC_SIGN_UP} component={SignUpFac} />
            <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForget} />
            <Route path={ROUTES.PASSWORD_UPDATE} component={PasswordUpdate} />
            <Route path={ROUTES.PROFILE} component={ProfilePage} />
            <Route path={ROUTES.CLASSROOM} component={Classroom} />
            <Route path={ROUTES.ANALYTICS} component={Analytics} />
            <Route path={ROUTES.IDCARD} component={IdCard} />
            <Route path={ROUTES.SPINNER} component={Spinner} />
            <Route path={ROUTES.SUBLIST} component={SubList} />

            <Route path="*" component={Destination} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default withAuthentication(App);
