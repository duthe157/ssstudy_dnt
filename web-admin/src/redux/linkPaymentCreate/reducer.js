import { LIST_TEACHER, LIST_COURSE, CREATE_LINK_PAYMENT, GET_STUDENT_DETAIL, RESET_STUDENT_DETAIL } from "./type";

const initState = {
  listTeacher: [],
  listCourses: [],
  dataCreateLinkPayment: null,
  student: null,
  studentDetailMessage: null,
};

const reducer = (state = initState, action) => {
  switch (action.type) {
    case LIST_TEACHER: 
      return {
        ...state,
        listTeacher: action.listTeacher,
      }
    case LIST_COURSE:
      return {
        ...state,
        listCourses: action.courses,
      }
    case CREATE_LINK_PAYMENT:
      return {
        ...state,
        dataCreateLinkPayment: action.data,
      }
    case GET_STUDENT_DETAIL:
      return {
        ...state,
        student: action.student,
        studentDetailMessage: action.message ?? null,
      }
    case RESET_STUDENT_DETAIL:
      return {
        ...state,
        student: null,
        studentDetailMessage: null,
      }
    default:
      return state;
  }
};

export default reducer; 