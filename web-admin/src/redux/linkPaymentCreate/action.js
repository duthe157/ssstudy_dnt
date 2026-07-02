import axios from "axios";
import { initAPI, notify, responseError } from "../../config/api";
import {
  CREATE_LINK_PAYMENT,
  GET_STUDENT_DETAIL,
  LIST_COURSE,
  LIST_TEACHER,
  RESET_STUDENT_DETAIL,
} from "./type";

export function listTeacher(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`user/list`, {
        user_group: "TEACHER",
        limit: 100,
      })
      .then((res) => {
        const response = res.data;
        if (response.code === 200) {
          const data = response.data;
          const listTeacher = data.records;
          dispatch({ type: LIST_TEACHER, listTeacher: listTeacher });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function listCourses(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`classroom/list`, data)
      .then((res) => {
        const response = res.data;
        if (response.code === 200) {
          const data = response.data;
          const courses = data.records;
          dispatch({ type: LIST_COURSE, courses: courses });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function createLinkPayment(payload) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`link-payment/create`, payload)
      .then((res) => {
        const response = res.data;
        if (response.code === 200) {
          dispatch({ type: CREATE_LINK_PAYMENT, data: response.data });
          notify(res);
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function getStudentDetail(params) {
  initAPI();
  const { email, phone } = params;
  return async (dispatch) => {
    await axios
      .get(`user/student-detail?email=${email}&phone=${phone}`)
      .then((res) => {
        const response = res.data;
        if (response.code === 200) {
          const message = response.message || response.data?.message || null;
          if (response.data) {
            const { fullname, code } = response.data;
            const displayMessage = message || `${fullname} - Mã: ${code}`;
            dispatch({
              type: GET_STUDENT_DETAIL,
              student: { fullname, code },
              message: displayMessage,
            });
          } else {
            dispatch({
              type: GET_STUDENT_DETAIL,
              student: null,
              message: message || "Tài khoản mới - Hệ thống sẽ tự động tạo tài khoản ở trạng thái chờ",
            });
          }
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function resetStudentDetail() {
  return (dispatch) => {
    dispatch({
      type: RESET_STUDENT_DETAIL,
      student: null,
      message: null,
    });
  };
}
