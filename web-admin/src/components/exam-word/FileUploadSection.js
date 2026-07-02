import React from 'react';
import { notification } from 'antd';

class FileUploadSection extends React.Component {
  onChangeHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      this.props.onFileChange(null, "Chỉ chấp nhận file Word (.doc, .docx)");
      notification.error({
        message: "Định dạng file không hợp lệ",
        description: "Vui lòng chọn file Word (.doc, .docx)",
        placement: "topRight",
      });
      event.target.value = null;
      return;
    }

    this.props.onFileChange(file, null);
  };

  render() {
    const { fileData, fileError, onUpload } = this.props;

    return (
      <div className="block-exam block-item-content">
        <h3 className="title-block">Tải lên file Word</h3>
        <div className="content">
          <input
            type="file"
            id="wordFile"
            className="text-muted"
            accept=".doc,.docx"
            onChange={this.onChangeHandler}
            ref={(el) => (this.fileInputRef = el)}
          />
          <button
            className="btn btn-primary mx-2"
            onClick={onUpload}
            disabled={!fileData}
          >
            <img
              src="/assets/img/icon-upload.svg"
              alt=""
              style={{ width: "24px", height: "24px" }}
            />
            Tải lên
          </button>
        </div>

        <div className="file-hint mt-2">
          <small className="text-muted">
            Chỉ chấp nhận các định dạng .doc, .docx
          </small>
          {fileError && (
            <div className="text-danger mt-1">
              <small>{fileError}</small>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default FileUploadSection;
