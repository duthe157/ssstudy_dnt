import axios from "axios";
import * as ActionTypes from "./type";
import { initAPI, responseError, notify } from "../../config/api";

export function uploadBanner(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`file/upload`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const data = res.data.data;
          dispatch({
            type: ActionTypes.UPLOAD_BANNER,
            data,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function uploadImageOutstanding(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`file/upload`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const data = res.data.data;
          dispatch({
            type: ActionTypes.UPLOAD_IMAGE_OUTSTANSDING,
            data,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function uploadImageAudition(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`file/upload`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const data = res.data.data;
          dispatch({
            type: ActionTypes.UPLOAD_IMAGE_AUDITION,
            data,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function uploadImageSchedule(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`file/upload`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const data = res.data.data;
          dispatch({
            type: ActionTypes.UPLOAD_IMAGE_SCHEDULE,
            data,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function uploadWordFile(file) {
    initAPI();
    return async dispatch => {
        try {
            const formData = new FormData();
            formData.append("docxFile", file);

            const res = await axios.post(
        "https://hgr0a62zxby.sn.mynetname.net:4548/docx-question/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                }
            );

            console.log("Upload Word file - raw response:", res);
            console.log("Upload Word file - res.data:", res.data);

            const { fileId, subject, questions } = res?.data || {};

            if (!Array.isArray(questions)) {
                throw new Error("Tải file thất bại: dữ liệu không hợp lệ");
            }

            // Lọc bỏ câu hỏi trống
            const validQuestions = questions.filter(
                q => q && q.plainText && q.plainText.trim().length > 0
            );

            console.log("Câu hỏi hợp lệ:", validQuestions);

            if (validQuestions.length === 0) {
                throw new Error("Tải file thất bại: không có câu hỏi hợp lệ");
            }

            // Dispatch thành công
            dispatch({
                type: ActionTypes.UPLOAD_WORD_FILE_SUCCESS,
                payload: { fileId, subject, questions: validQuestions },
            });

            notify({ data: { code: 200, message: "Tải file thành công" } }, false);

            return { fileId, subject, questions: validQuestions };

        } catch (err) {
            console.error("Upload Word file - error:", err);
            responseError(err);
            throw err;
        }
    };
}
