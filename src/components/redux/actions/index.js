import { ADD_COLLEGE_LIST } from "../../../constants/redux-action-types";

export function addCollegeList(payload) {
  return { type: ADD_COLLEGE_LIST, payload };
}
