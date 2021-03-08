import React, { Component } from "react";

import { compose } from "recompose";

import { withFirebase } from "../../Configuration";

class SignUpFormBase extends Component {
  // doSignOutBtn = () => {
  //   this.props.firebase.doSignOut();
  // };

  render() {
    return (
      <form onSubmit={this.props.firebase.doSignOut}>
        <button type="submit" name="submit">
          Sign Out
        </button>
      </form>
    );
  }
}

export default compose(withFirebase)(SignUpFormBase);
