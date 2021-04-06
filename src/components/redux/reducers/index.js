import { ADD_COLLEGE_LIST } from "../../../constants/redux-action-types";

const initialState = {
  college_list: [],
};

const rootReducer = (state = initialState, action) => {
  if (action.type === ADD_COLLEGE_LIST) {
    return {
      ...state,
      college_list: [...state.college_list, ...action.payload],
    };
  }
  return state;
};

export default rootReducer;
