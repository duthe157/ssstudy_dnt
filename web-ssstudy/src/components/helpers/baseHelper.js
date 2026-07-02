import React from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { CDN_LINK } from "../../utils/constants";
import {
  renderQuestionImage,
  renderQuestionImageWithFallback,
  isSupportedImageFormat,
} from "../../utils/imageProcessor";

class BaseHelper {
  currencyFormat(value) {
    return value?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  formatDateTimeToString(value) {
    return moment(value).format("DD/MM/YYYY HH:mm:ss");
  }
  formatDateToString(value) {
    return moment(value).format("DD/MM/YYYY");
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  validatePhone(phone) {
    try {
      let _phone = phone;
      if (phone) {
        const regexPhone = /(?:[-+() ]*\d){10,13}/gm;
        if (phone.match(regexPhone)) {
          const phones = phone.match(regexPhone).map((s) => {
            return s.trim();
          });
          if (phones !== "") _phone = phones[0];
        }
      }

      if (_phone) {
        _phone = _phone.replace(/ +/g, "");
        _phone = _phone.replace(/-/gi, "");
        _phone = _phone.replace(".", "");
        _phone = _phone.replace("+840", "0");
        _phone = _phone.replace("+84", "0");
      }
      const regexNV = /(\+84|0){1}(9|8|7|5|4|3|2){1}[0-9]{8}/;
      const isValid = regexNV.test(_phone);

      if (isValid) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  formatDateCustom(value, format = "DD/MM/YYYY") {
    return moment(value).format(format);
  }

  formatDateTimeLiveStream(value) {
    // Format: HH:mm - DD/MM/YYYY
    return moment(value).format("HH:mm - DD/MM/YYYY");
  }

  renderQuestionHTML(question) {
    let _content = "";
    try {
      const kind = question.kind;
      const content = question.content;
      if (kind === "text/0") _content += `<span>${content}</span>`;

      if (kind === "text/1") _content += `<b>${content}</b>`;

      if (kind === "text/2") _content += `<em>${content}</em>`;

      if (kind === "text/3") _content += `<b><em>${content}</em><b>`;

      if (kind === "text/4") _content += `<u>${content}</u>`;

      if (kind === "text/8")
        _content += `<span style="background:yellow">${content}</span>`;

      if (kind === "text/16") _content += `<sub>${content}</sub>`;

      if (kind === "text/32") _content += `<sup>${content}</sup>`;

      if (kind === "text/64") _content += `<b>${content}</b>`;

      if (kind === "br") _content += `<br/>`;

      if (kind === "error/0")
        _content += `<span style="background:red">ERROR!: ${content}</span>`;

      // Xử lý tất cả các định dạng ảnh base64
      // Hỗ trợ: png, jpg, jpeg, gif, bmp, svg+xml, wmf
      if (isSupportedImageFormat(kind)) {
        _content += renderQuestionImageWithFallback({ kind, content });
      }
    } catch (err) {
      // Error handling
    }

    return _content;
  }

  renderQuestion(data) {
    const question = data.question;
    if (data && question && question instanceof Array) {
      return question.map((object, i) => {
        const _content = this.renderQuestionHTML(object);
        return <span dangerouslySetInnerHTML={{ __html: _content }}></span>;
      });
    }
  }

  fetchQuestionOption(data) {
    if (data && data instanceof Array) {
      return data.map((object, i) => {
        const _content = this.renderQuestionHTML(object);
        return <span dangerouslySetInnerHTML={{ __html: _content }}></span>;
      });
    }
  }

  fetchQuestion(question, num, showCorrect = false) {
    if (question) {
      return (
        <div key={num + 1} className="api-question-item">
          <div className="api-list-question-preview">
            {this.renderQuestion(question)}
          </div>
          <div className="api-list-option">
            {question.A ? (
              <span className="api-question-option-item">
                <strong>A:</strong> {this.fetchQuestionOption(question.A)}{" "}
                {showCorrect && question.correct && question.correct === "A" ? (
                  <span>
                    <img
                      src="/assets/img/icon-check-done.svg"
                      class="ml-12"
                      alt=""
                    />
                  </span>
                ) : (
                  <></>
                )}
              </span>
            ) : (
              <></>
            )}
            {question.B ? (
              <span className="api-question-option-item">
                <strong>B:</strong> {this.fetchQuestionOption(question.B)}{" "}
                {showCorrect && question.correct && question.correct === "B" ? (
                  <span>
                    <img
                      src="/assets/img/icon-check-done.svg"
                      class="ml-12"
                      alt=""
                    />
                  </span>
                ) : (
                  <></>
                )}
              </span>
            ) : (
              <></>
            )}
            {question.C ? (
              <span className="api-question-option-item">
                <strong>C:</strong> {this.fetchQuestionOption(question.C)}{" "}
                {showCorrect && question.correct && question.correct === "C" ? (
                  <span>
                    <img
                      src="/assets/img/icon-check-done.svg"
                      class="ml-12"
                      alt=""
                    />
                  </span>
                ) : (
                  <></>
                )}
              </span>
            ) : (
              <></>
            )}
            {question.D ? (
              <span className="api-question-option-item">
                <strong>D:</strong> {this.fetchQuestionOption(question.D)}{" "}
                {showCorrect && question.correct && question.correct === "D" ? (
                  <span>
                    <img
                      src="/assets/img/icon-check-done.svg"
                      class="ml-12"
                      alt=""
                    />
                  </span>
                ) : (
                  <></>
                )}
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>
      );
    }
  }

  async downloadImage(imageSrc) {
    if (imageSrc) {
      try {
        // const image = await fetch(imageSrc)
        // const imageBlog = await image.blob()
        // const imageURL = URL.createObjectURL(imageBlog)

        // const link = document.createElement('a')
        // link.href = imageURL
        // link.download = ''
        // document.body.appendChild(link)
        // link.click()
        // document.body.removeChild(link)

        window.open(imageSrc, "_blank");
      } catch (error) {
        toast("Lỗi! Không thể tải file", {
          position: "top-right",
          autoClose: 5000,
          type: "error",
        });
      }
    } else {
      toast("File chưa được cập nhật", {
        position: "top-right",
        autoClose: 5000,
        type: "error",
      });
    }
  }

  renderLinkCdn(path) {
    return `${CDN_LINK}${path}`;
  }

  saveDisplayedNews(sortedNames) {
    const key = "DisplayedNews";
    if (typeof window === "undefined") return; // tránh lỗi SSR

    localStorage.setItem(key, JSON.stringify(sortedNames));
  }
}

export default new BaseHelper();
