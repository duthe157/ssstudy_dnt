import axios from "axios";
import { initAPI, notify, responseError } from "../../config/api";
import * as ActionTypes from "./type";
import { data } from "jquery";

export function listExamWord(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/exam-word/list`, data)
      .then((res) => {
        const responseData = res.data.data;
        const page = data.page || responseData.page || 1;
        dispatch({ type: "PAGING", page: page });
        const examwords = responseData.data;
        const total = responseData.totalItems;
        const limit = responseData.limit;
        dispatch({
          type: ActionTypes.LIST_EXAMWORDS,
          examwords,
          totalItems: total,
          limit,
          page: page,
        });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function getExamWordDetail(id) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.get("/exam-word/detail/get-by-id", {
        params: {
          id,
          _: Date.now(), // ✅ param chống cache
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("SSID"), // hoặc token từ Redux
        },
      });

      const data = res.data.data;

      dispatch({
        type: ActionTypes.SET_EXAM_DETAIL,
        payload: data,
      });

      return data;
    } catch (err) {
      responseError(err);
      throw err;
    }
  };
}

export function createExamWord(data) {
  initAPI();
  return async (dispatch) => {
    return await axios
      .post(`/exam-word/create`, data)
      .then((res) => {
        // Only treat as success when business code === 200
        if (res && res.data && res.data.code === 200) {
          notify(res);
          dispatch({
            type: ActionTypes.CREATE_EXAMWORD,
            examword: res.data.data,
            redirect: true,
          });
          return res;
        }
        // Non-200 business code: notify and throw to let UI handle without redirect
        notify(res);
        throw new Error(
          (res && res.data && res.data.message) || "Create exam word failed",
        );
      })
      .catch(async (err) => {
        responseError(err);
        throw err;
      });
  };
}

export function updateExamWord(data) {
  initAPI();
  return async (dispatch) => {
    return await axios
      .post(`/exam-word/update`, data)
      .then((res) => {
        // Only treat as success when business code === 200
        if (res && res.data && res.data.code === 200) {
          notify(res);
          dispatch({ type: ActionTypes.UPDATE_EXAMWORD, redirect: true });
          return res;
        }
        // Non-200 business code: notify and throw to let UI handle without redirect
        notify(res);
        throw new Error(
          (res && res.data && res.data.message) || "Update exam word failed",
        );
      })
      .catch(async (err) => {
        responseError(err);
        throw err;
      });
  };
}

export function showExamWord(id) {
  initAPI();
  return async (dispatch) => {
    await axios
      .get(`/exam-word/show/${id}`)
      .then((res) => {
        dispatch({ type: ActionTypes.SHOW_EXAMWORD, examword: res.data.data });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function deleteExamWord(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/exam-word/delete`, data)
      .then((res) => {
        notify(res);
        dispatch({ type: ActionTypes.DELETE_EXAMWORD });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function copyExamWord(id) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/exam-word/clone`, { id })
      .then((res) => {
        notify(res);
        dispatch({ type: ActionTypes.COPY_EXAMWORD });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function uploadFile(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/exam-word/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        notify(res);
        dispatch({ type: ActionTypes.UPLOAD_FILE, file: res.data.data });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function downloadFile(id) {
  initAPI();
  return async (dispatch) => {
    await axios
      .get(`/exam-word/download/${id}`, {
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `examword-${id}.docx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        dispatch({ type: ActionTypes.DOWNLOAD_FILE });
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function addDelete(id, mode) {
  return {
    type: ActionTypes.ADD_DELETE,
    id,
    mode,
  };
}

export function addDataRemoveExamWord(data) {
  return {
    type: "ADD_DATA_REMOVE_EXAMWORD",
    data,
  };
}

export function checkAll(status) {
  return {
    type: ActionTypes.CHECK_ALL,
    status,
  };
}

export function listClassWord(dataList) {
  console.log("listClassWord:", dataList);

  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/exam-word/classrooms`, dataList)
      .then((res) => {
        if (res.data && res.data.code === 200) {
          const data = res.data.data.items;
          dispatch({
            type: ActionTypes.LIST_CLASS,
            data,
            id: dataList.exam_id,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function reportClassWord({ exam_id, classroom_id }) {
  console.log("reportClassWord:", exam_id, classroom_id);
  initAPI();

  return async (dispatch) => {
    try {
      const res = await axios.post(`/exam-word/report`, {
        id: exam_id,
        classroom_id: classroom_id,
      });

      if (res.data && res.data.code === 200) {
        const data = res.data.data;
        dispatch({ type: ActionTypes.REPORT_CLASS, data });
      }
    } catch (err) {
      console.log("API /exam-word/report error:", err);
      responseError(err);
    }
  };
}

export function listClassRoom(examId) {
  initAPI();
  const payload = { exam_id: examId };

  return async (dispatch) => {
    try {
      const res = await axios.post("/exam-word/classrooms", payload);

      if (res.data && res.data.code === 200) {
        const data = res.data.data;
        dispatch({
          type: ActionTypes.LIST_CLASSROOMS,
          payload: data,
        });
        return data;
      }

      // Throw error if response code is not 200
      throw new Error(res.data?.message || "Failed to fetch classrooms");
    } catch (err) {
      console.log("API /exam-word/classrooms error:", err);
      responseError(err);
      throw err; // Re-throw để component có thể handle
    }
  };
}
export function exportWord(data) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.post(`/exam-word/export`, data);
      const responseData = res.data.data;
      const { fileData, filename } = responseData;

      // Decode base64
      const binary = atob(fileData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "exam.docx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch({ type: ActionTypes.EXPORT_WORD });
    } catch (err) {
      responseError(err);
    }
  };
}
