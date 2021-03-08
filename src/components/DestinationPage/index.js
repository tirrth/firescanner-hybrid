import React from "react";
import Classroom from "../classroom";
import Landing from "../Landing";
import { AuthUserContext } from "../Session";

const Destination = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (authUser ? <NavigationAuth /> : <NavigationNonAuth />)}
  </AuthUserContext.Consumer>
);

const NavigationAuth = () => <Classroom />;

const NavigationNonAuth = () => <Landing />;

export default Destination;
