import React from 'react';

class ExamInfoSection extends React.Component {
  render() {
    const {
      examId,
      name,
      typeExam,
      examTypeId,
      linkExam,
      group,
      classes,
      subject_id,
      is_redo,
      level,
      time,
      tp,
      pointTrueFalse,
      pointTrueFalse1,
      pointTrueFalse2,
      pointTrueFalse3,
      pointTrueFalse4,
      TN,
      HSA,
      TSA,
      APT,
      onInputChange,
      onSwitchChange,
      onCompetitionChange,
      subjects,
      examCategories,
      examTypeOptions
    } = this.props;

    const fetchRowsSubject = () => {
      if (subjects instanceof Array) {
        return subjects.map((obj) => (
          <option value={obj._id} key={obj._id.toString()}>
            {obj.name}
          </option>
        ));
      }
      return [];
    };

    const fetchCategoryRows = () => {
      if (examCategories instanceof Array) {
        return examCategories.map((obj) => (
          <option value={obj._id} key={obj._id}>
            {obj.name}
          </option>
        ));
      }
      return [];
    };

    const fetchExamTypeRows = () => {
      if (examTypeOptions instanceof Array) {
        return examTypeOptions.map((obj) => (
          <option
            value={obj._id || obj.id || obj.name}
            key={(obj._id || obj.id || obj.name) + "_type"}
          >
            {obj.name}
          </option>
        ));
      }
      return [];
    };

    return (
      <div className="general-info block-item-content">
        <h3 className="title-block">Thông tin đề thi</h3>
        
        <div className="content input-group">
          <div className="form-group mr-32" style={{ width: "144px" }}>
            <label className="text-form-label">Mã đề thi</label>
            <div>
              <input
                type="text"
                className="form-control"
                name="examId"
                onChange={onInputChange}
                value={examId}
                disabled
              />
            </div>
          </div>

          <div className="form-group mb-0 mr-32" style={{ width: "400px" }}>
            <label className="text-form-label">Tên đề thi</label>
            <div>
              <input
                type="text"
                className="form-control"
                name="name"
                onChange={onInputChange}
                value={name}
              />
            </div>
          </div>

          <div className="form-group mb-0 mr-32" style={{ minWidth: "300px" }}>
            <label className="text-form-label">Kỳ thi</label>
            <div>
              <select
                className="custom-select"
                value={typeExam}
                name="typeExam"
                onChange={onCompetitionChange}
              >
                {fetchCategoryRows()}
              </select>
            </div>
          </div>

          <div className="form-group mb-0 mr-32" style={{ minWidth: "280px" }}>
            <label className="text-form-label">Loại đề thi</label>
            <div>
              <select
                className="custom-select"
                value={examTypeId}
                name="examTypeId"
                onChange={onInputChange}
              >
                <option value="">-- Chọn loại đề thi --</option>
                {fetchExamTypeRows()}
              </select>
            </div>
          </div>

          <div className="form-group mb-0 mr-32" style={{ minWidth: "200px" }}>
            <label className="text-form-label">Đề thi PDF</label>
            <div>
              <input
                type="url"
                className="form-control"
                name="linkExam"
                placeholder="Nhập URL PDF"
                onChange={onInputChange}
                value={linkExam}
              />
            </div>
          </div>
        </div>

        <div className="content input-group" style={{ flexWrap: "nowrap", gap: "16px" }}>
          <div className="form-group mb-0" style={{ width: "15%" }}>
            <label className="text-form-label">Loại bài kiểm tra</label>
            <div>
              <select className="custom-select" name="level" value={level} onChange={onInputChange}>
                <option value="">Không </option>
                <option value="1">Thi giữa kỳ 1</option>
                <option value="2">Thi cuối kỳ 1</option>
                <option value="3">Thi giữa kỳ 2</option>
                <option value="4">Thi cuối kỳ 2</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-0" style={{ width: "15%" }}>
            <label className="text-form-label">Nhóm đề</label>
            <div>
              <select
                className="custom-select"
                value={group}
                name="group"
                onChange={onInputChange}
              >
                <option value={"MAC_DINH"}>Mặc định</option>
                <option value={"THI_THU"}>Đề thi thử</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-0" style={{ width: "15%" }}>
            <label className="text-form-label">Lớp học</label>
            <div>
              <select
                className="custom-select"
                value={classes}
                name="classes"
                onChange={onInputChange}
              >
                <option value="">Lớp học</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>Lớp {grade}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mb-0" style={{ width: "20%" }}>
            <label className="text-form-label">Môn học</label>
            <div>
              <select
                className="custom-select"
                value={subject_id}
                name="subject_id"
                onChange={onInputChange}
              >
                <option value="">-- Chọn môn học --</option>
                {fetchRowsSubject()}
              </select>
            </div>
          </div>

          <div className="form-group mb-0 mr-12" style={{ width: "15%" }}>
            <label className="text-form-label">Cho phép làm lại</label>
            <div>
              <select
                className="custom-select"
                value={is_redo}
                name="is_redo"
                onChange={onInputChange}
              >
                <option value={false}>Không cho phép</option>
                <option value={true}>Có</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-0 mr-32" style={{ minWidth: "280px" }}>
            <label className="text-form-label">Thành phố</label>
            <div>
              <select
                className="custom-select"
                value={tp}
                name="tp"
                onChange={onInputChange}
              >
                <option value="">Chọn thành phố</option>
                {[
                  { value: "1", label: "Hà Nội" },
                  { value: "2", label: "Hồ Chí Minh" },
                  { value: "3", label: "Đà Nẵng" },
                  { value: "4", label: "Hải Phòng" },
                  { value: "5", label: "Cần Thơ" },
                  { value: "6", label: "Nha Trang" },
                  { value: "7", label: "Huế" },
                  { value: "8", label: "Vũng Tàu" },
                  { value: "9", label: "Quảng Ninh" },
                  { value: "10", label: "Bình Dương" }
                ].map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </select>
            </div>
          </div>

          {(typeExam === TN || typeExam === APT) && (
            <div className="form-group mb-0 mr-32">
              <label className="text-form-label">Thời gian (Phút)</label>
              <div>
                <input
                  min="0"
                  max="999"
                  type="number"
                  className="form-control"
                  name="time"
                  onChange={onInputChange}
                  value={time}
                />
              </div>
            </div>
          )}
        </div>

        {typeExam === TN && (
          <div className="content input-group" style={{ flexWrap: "nowrap", gap: "16px" }}>
            <div className="form-group mb-0 mt-4 row">
              <div className="col-auto">
                <label className="">Cấu hình thang điểm câu hỏi đúng sai</label>
              </div>
              <div className="col">
                <label className="ui-switch ui-switch-md info m-t-xs">
                  <input
                    type="checkbox"
                    name="pointTrueFalse"
                    value={pointTrueFalse}
                    checked={pointTrueFalse === true ? "checked" : ""}
                    onChange={onSwitchChange}
                  />
                  <i />
                </label>
              </div>
            </div>
          </div>
        )}

        {(typeExam === TN || typeExam === TSA) && pointTrueFalse === true && (
          <div className="content input-group" style={{ flexWrap: "nowrap", gap: "16px" }}>
            <div className="form-group mb-0 row ml-2" style={{ width: "800px" }}>
              {[
                { name: "pointTrueFalse1", label: "Trả lời đúng 1 ý", value: pointTrueFalse1 },
                { name: "pointTrueFalse2", label: "Trả lời đúng 2 ý", value: pointTrueFalse2 },
                { name: "pointTrueFalse3", label: "Trả lời đúng 3 ý", value: pointTrueFalse3 },
                { name: "pointTrueFalse4", label: "Trả lời đúng 4 ý", value: pointTrueFalse4 }
              ].map((item, index) => (
                <div key={item.name} className="row col-6">
                  <span className="input-group-addon">
                    <i>{item.label}</i>
                  </span>
                  <input
                    min="0"
                    max="99"
                    type="number"
                    className="form-control ml-2 mr-2"
                    name={item.name}
                    onChange={onInputChange}
                    value={item.value}
                    style={{ width: "100px" }}
                  />
                  <span className="input-group-addon">
                    <i> %</i>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ExamInfoSection;
