import * as ActionTypes from "./type";

const initState = {
  adultEvals: [],
  classrooms: [],
  subjects: [],
  classroomGroups: [],
  modalClassrooms: [],
  modalSubjects: [],
  modalClassroomGroups: [],
  review: null,
  total: 0,
  page: 1,
  limit: 20,
  ids: [],
  checkAll: false,
  redirect: false,
};
const reducer = (state = initState, action) => {
  switch (action.type) {
    case ActionTypes.LIST_ADULT_EVALUATION:
      return {
        ...state,
        adultEvals: action.adultEvals,
        total: action.total,
        limit: action.limit,
        ids: [],
        checkAll: false,
        redirect: false,
      };
    case ActionTypes.LIST_CLASSROOM:
      return {
        ...state,
        classrooms: action.classrooms,
        total: action.total,
        limit: action.limit,
      };
    case ActionTypes.LIST_SUBJECT:
      return {
        ...state,
        subjects: action.subjects,
        total: action.total,
        limit: action.limit,
      };
    case ActionTypes.LIST_CLASSROOM_GROUP:
      return {
        ...state,
        classroomGroups: action.classroomGroups,
        total: action.total,
        limit: action.limit,
      };
    case ActionTypes.LIST_MODAL_CLASSROOM:
      return {
        ...state,
        modalClassrooms: action.payload,
      };
    case ActionTypes.LIST_MODAL_SUBJECT:
      return {
        ...state,
        modalSubjects: action.payload,
      };
    case ActionTypes.LIST_MODAL_CLASSROOM_GROUP:
      return {
        ...state,
        modalClassroomGroups: action.payload,
      };
    case "PAGING":
      return {
        ...state,
        page: action.page,
      };
    case ActionTypes.ADD_DELETE:
      var arrDelete = [];
      var deletes = [];
      arrDelete.push(action.id);
      if (action.mode === "add") {
        deletes = state.ids.concat(arrDelete);
      } else if (action.mode === "remove") {
        deletes = state.ids.filter((ele) => ele !== action.id);
      } else {
        deletes = arrDelete;
      }
      return {
        ...state,
        ids: deletes,
      };
    // case ActionTypes.CHECK_ALL:
    //     var adulEvals = state.adultEvals;
    //     var deletesAll = [];
    //     if (action.status) {
    //         deletesAll = Object.assign(
    //             [],
    //             Array.from(adulEvals, (ele) => ele._id)
    //         )
    //     } else {
    //         deletesAll = [];
    //     }
    //     return {
    //         ...state,
    //         checkAll: action.status,
    //         ids: deletesAll
    //     }
    case ActionTypes.SHOW_ADULT_EVALUATION:
      return {
        ...state,
        adultEval: action.adultEval,
      };
    case ActionTypes.CREATE_ADULT_EVALUATION:
      return {
        ...state,
        adultEval: action.adultEval,
        redirect: action.redirect,
      };
    case ActionTypes.UPDATE_ADULT_EVALUATION:
      return {
        ...state,
        adultEval: action.adultEval,
        redirect: action.redirect
      };
    case ActionTypes.CHECK_INPUT_ITEM:
      let _ids = [];
      if (action.mode === "add" && state.ids.indexOf(action.id)) {
        state.ids.push(action.id);
        _ids = state.ids;
      }
      if (action.mode === "remove") {
        if (Array.isArray(state.ids)) {
          _ids = state.ids.filter((ele) => ele !== action.id);
        }
      }

      return {
        ...state,
        ids: _ids,
      };

    case ActionTypes.DATA_REMOVE_ADULTEVAL:
      return {
        ...state,
        dataRemoveAdultEval: action.dataRemoveAdultEval,
      };
    case ActionTypes.REMOVE_ADULT_EVALUATION:
      return {
        ...state,
      };

    default:
      return state;
  }
};

export default reducer;
