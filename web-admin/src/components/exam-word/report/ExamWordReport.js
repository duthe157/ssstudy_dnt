import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";


import { listClassWord, reportClassWord, showExamWord, listClassRoom } from "../../../redux/examword/action";
import { type } from "jquery";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class ExamWordReport extends Component {
  constructor(props) {
    super();
    this.state = {
      classroom_id: "",
      classroom_code: "",
      classroom_name: "",
      examReportData: [],
      file_name: "BangDiem",
      classrooms: [],
      typeExam: "",
      selectedClassId: 'all',
      isLoading: true,
      // State cho thu gọn/mở rộng
      expandedSections: {}, // {sectionIndex: true/false}
      expandedSubparts: {}, // {`${sectionIndex}-${subpartIndex}`: true/false}
      expandedChildren: {}, // {`${sectionIndex}-${subpartIndex}-${childIndex}`: true/false}
    };
  }

  exportToExcel = () => {
    // Tạo dữ liệu cho file Excel
    const { reportData, exam, classList } = this.props;
    if (!reportData) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    // Lấy thông tin lớp học (nếu có)
    // let classroomName = '';
    if (classList && Array.isArray(classList) && classList.length > 0) {
      // classroomName = classList[0]?.classroom?.name || '';
    }

    // Lấy thông tin môn học (nếu có)
    if (exam && exam.subject && exam.subject.name) {
      // Có thể sử dụng exam.subject.name nếu cần
    }
    // Lấy thông tin lớp học và môn học (nếu có)
    let classNamePart = '';
    let selectedClass = 'Rỗng';
    let subjectName = '';
    if (this.state.selectedClassId !== 'all') {
      const selectedClassData = this.state.classrooms.find(
        item => item.classroom_id === this.state.selectedClassId
      );
      console.log("Selected Class for Export:", selectedClassData);
      if (selectedClassData) {
        selectedClass = selectedClassData.classroom_name || 'Rỗng';
        subjectName = selectedClassData.classroom_subject || '';
        classNamePart = `_${selectedClass}`;
      }
    }
    // Chuẩn bị dữ liệu cho sheet học sinh đã làm bài
    const completedRows = [];
    if (reportData.testings && Array.isArray(reportData.testings)) {
      reportData.testings.forEach((item) => {
        completedRows.push({
          'Mã đề': this.props.match.params.id || 'Rỗng',
          'Tên đề': item.exam_name || 'Rỗng',
          'Mã học sinh': item.user_code || 'Rỗng',
          'Tên học sinh': item.user_name || 'Rỗng',
          'Môn học': item.subject || subjectName || "Rỗng",
          'Lớp học': selectedClass || 'Rỗng',
          'Email': item.user_email || 'Rỗng',
          'Số điện thoại': item.user_phone || 'Rỗng',
          'Điểm': item.total_score_achieve != null ? item.total_score_achieve?.toFixed(2) : 'Rỗng',
          'Ngày nộp': item.created_at
            ? moment(item.created_at).local().format('DD/MM/YYYY HH:mm')
            : 'Rỗng'
        });
      });
    }

    // Chuẩn bị dữ liệu cho sheet học sinh chưa làm bài
    const notCompletedRows = [];
    const arrayUserTesting = [];

    // Lấy danh sách user_id đã làm bài
    if (reportData.testings && Array.isArray(reportData.testings)) {
      for (let i = 0; i < reportData.testings.length; i++) {
        arrayUserTesting.push(reportData.testings[i].user_id);
      }
    }

    // Tìm những học sinh chưa làm bài
    if (reportData.students && Array.isArray(reportData.students)) {
      for (let i = 0; i < reportData.students.length; i++) {
        const index = arrayUserTesting.indexOf(reportData.students[i].user.id);
        if (index < 0) {
          notCompletedRows.push({
            'Mã học sinh': reportData.students[i].user.code || 'Rỗng',
            'Tên học sinh': reportData.students[i].user.fullname || 'Rỗng',
            'Email': reportData.students[i].user.email || 'Rỗng',
            'Số điện thoại': reportData.students[i].user.phone || 'Rỗng',
            'Lớp học': reportData.students[i].classroom?.name || 'Rỗng',
            'Trạng thái': 'Chưa làm bài'
          });
        }
      }
    }

    // Import thư viện xlsx khi cần
    import('xlsx').then(XLSX => {
      const wb = XLSX.utils.book_new();

      // Tạo sheet cho học sinh đã làm bài
      if (completedRows.length > 0) {
        const wsCompleted = XLSX.utils.json_to_sheet(completedRows);
        XLSX.utils.book_append_sheet(wb, wsCompleted, 'Đã làm bài');
      }

      // Tạo sheet cho học sinh chưa làm bài
      if (notCompletedRows.length > 0) {
        const wsNotCompleted = XLSX.utils.json_to_sheet(notCompletedRows);
        XLSX.utils.book_append_sheet(wb, wsNotCompleted, 'Chưa làm bài');
      }

      // Nếu không có sheet nào được tạo, tạo sheet rỗng
      if (completedRows.length === 0 && notCompletedRows.length === 0) {
        const emptySheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, emptySheet, 'Báo cáo điểm');
      }

      // Đặt tên file: Báo cáo điểm + tên lớp (nếu có) + ngày hiện tại
      const today = moment().format('YYYY-MM-DD');

      // Lấy tên lớp từ state nếu đã chọn lớp cụ thể


      const fileName = `Báo cáo điểm_${classNamePart}_${today}.xlsx`;
      XLSX.writeFile(wb, fileName);
    });
  }

  // Hàm toggle thu gọn section
  toggleSection = (sectionIndex) => {
    this.setState(prevState => ({
      expandedSections: {
        ...prevState.expandedSections,
        [sectionIndex]: !prevState.expandedSections[sectionIndex]
      }
    }));
  }

  // Hàm toggle thu gọn subpart
  toggleSubpart = (sectionIndex, subpartIndex) => {
    const key = `${sectionIndex}-${subpartIndex}`;
    this.setState(prevState => ({
      expandedSubparts: {
        ...prevState.expandedSubparts,
        [key]: !prevState.expandedSubparts[key]
      }
    }));
  }

  // Hàm toggle thu gọn children
  toggleChildren = (sectionIndex, subpartIndex, childIndex) => {
    const key = `${sectionIndex}-${subpartIndex}-${childIndex}`;
    this.setState(prevState => ({
      expandedChildren: {
        ...prevState.expandedChildren,
        [key]: !prevState.expandedChildren[key]
      }
    }));
  }

  handleSelectChange = async (event) => {
    try {
      const selectedValue = event.target.value;
      this.setState({ selectedClassId: selectedValue });

      if (selectedValue === 'all') {
        await this.props.reportClassWord({
          exam_id: this.props.match.params.id
        });
        return;
      }

      // Gọi API với classroom_id được chọn
      console.log("Selected Class ID:", selectedValue);
      await this.props.reportClassWord({
        exam_id: this.props.match.params.id,
        classroom_id: selectedValue
      });

    } catch (error) {
      console.error("Error when changing classroom:", error);
    }
  };


  async componentDidMount() {
    // await this.props.listClassWord({ exam_id: this.props.match.params.id });
    // await this.props.showExamWord(this.props.match.params.id);

    await this.props.reportClassWord({ exam_id: this.props.match.params.id });
    const res = await this.props.listClassRoom(this.props.match.params.id);
    if (res && Array.isArray(res.items)) {
      this.setState(
        {
          classrooms: res.items,
          typeExam: this.props.reportData?.type,
          isLoading: false
        },
        () => {
          // callback sau khi state được cập nhật
          console.log("Report data from state:", this.state.typeExam);
          console.log("Classrooms from state:", this.state.classrooms);
        }
      );
    }
  }

  fetchRowsClass() {
    if (this.state.classrooms instanceof Array) {
      return this.state.classrooms.map((obj, i) => {
        return (
          <option value={obj.classroom.id} key={obj.classroom.id.toString()}>
            {obj.classroom.name}
          </option>
        );
      });
    }
  }

  fetchRowsUser() {
    if (
      this.props.reportData != null &&
      this.props.reportData.testings instanceof Array
    ) {
      return this.props.reportData.testings.map((obj, i) => {
        return (
          <tr>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td className="d-flex justify-content-start align-items-center">
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user_name}</span>
            </td>
            <td>

              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user_code}</span>
            </td>
            <td
              style={{
                textAlign: "center",
              }}
            >
              {obj.total_score_achieve?.toFixed(2)}
            </td>
            <td
              style={{
                textAlign: "center",
                width: 150,
              }}
            >
              <span>
                {obj.created_at
                  ? moment(obj.created_at).format("DD/MM/YYYY HH:mm")
                  : ""}
              </span>
            </td>
          </tr>
        );
      });
    }
  }

  fetchRowsUserNoExam() {
    const arrayUserTesting = [];
    const studentNotExam = [];
    if (
      this.props.reportData !== null &&
      this.props.reportData.testings instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.testings.length; i++) {
        arrayUserTesting.push(this.props.reportData.testings[i].user_id);
      }
    }

    if (
      this.props.reportData !== null &&
      this.props.reportData.students instanceof Array
    ) {
      for (let i = 0; i < this.props.reportData.students.length; i++) {
        const index = arrayUserTesting.indexOf(
          this.props.reportData.students[i].user.id
        );
        if (index < 0) {
          studentNotExam.push(this.props.reportData.students[i]);
        }
      }
    }

    if (studentNotExam instanceof Array) {
      return studentNotExam.map((obj, i) => {
        return (
          <tr key={i}>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td>
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.name}</span>
            </td>
            <td>
              <span
                className="avatar gd-primary mr-2"
                data-toggle-class="loading"
                style={{
                  width: 30,
                }}
              ></span>
              <span>{obj.user.code}</span>
            </td>
          </tr>
        );
      });
    }
  }

  // Render một câu hỏi cụ thể
  renderQuestion = (question, index) => {
    const { correct, wrong, questionId, _id, number } = question;
    const total = correct + wrong !== 0 ? correct + wrong : 1;
    const displayNumber = number !== undefined ? number : questionId; // Ưu tiên number, fallback về questionId

    return (
      <div
        key={_id || index}
        className="widget-result-item d-flex flex-row justify-content-start align-items-center"
        style={{ marginLeft: '20px', marginBottom: '8px' }}
      >
        <div className="widget-result-item-left">
          Câu {displayNumber}: <b>{_id}</b>
        </div>

        <div className="widget-result-item-right d-flex flex-column justify-content-start align-items-center">
          <div className="top-widget">{correct}</div>
          <div className="top-widget">{wrong}</div>
        </div>

        <div className="widget-result-item-right d-flex flex-column justify-content-start align-items-center">
          <div className="top-widget">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#31c971"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-check mx-2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="top-widget">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x mx-2"
            >
              <line x1={18} y1={6} x2={6} y2={18} />
              <line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </div>
        </div>

        <div
          className="widget-result-item-right1 d-flex flex-column justify-content-between align-items-start"
          style={{ height: 30 }}
        >
          <div className="top-widget">
            <div
              className="progress-true"
              style={{
                width: (correct / total) * 500,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#31c971",
              }}
            />
          </div>
          <div className="top-widget">
            <div
              className="progress-false"
              style={{
                width: (wrong / total) * 500,
                height: 5,
                borderRadius: 5,
                backgroundColor: "red",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render phần thi con (children)
  renderSubSection = (subSection, subIndex, sectionIndex) => {
    const subpartKey = `${sectionIndex}-${subIndex}`;
    const isSubpartExpanded = this.state.expandedSubparts[subpartKey] !== false; // Mặc định mở rộng
    const sortedQuestions = subSection.questions
      ? subSection.questions.sort((a, b) => {
        const aNumber = a.number !== undefined ? a.number : parseInt(a.questionId);
        const bNumber = b.number !== undefined ? b.number : parseInt(b.questionId);
        return aNumber - bNumber;
      })
      : [];

    return (
      <div key={`sub-${subIndex}`} style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '10px',
            paddingLeft: '10px',
            borderLeft: '3px solid #3498db',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => this.toggleSubpart(sectionIndex, subIndex)}
        >
          <span style={{ marginRight: '8px', fontSize: '12px' }}>
            {isSubpartExpanded ? '▼' : '▶'}
          </span>
          {subSection.name}
          <span style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: 'normal' }}>
            {' '}(Tổng: {subSection.totalQuestions} câu)
          </span>
        </div>

        {isSubpartExpanded && (
          <>
            {/* Render children nếu có */}
            {subSection.children && Array.isArray(subSection.children) &&
              subSection.children.map((child, childIndex) => {
                // Nếu child.name là 'Children 1', render trực tiếp questions mà không hiển thị tiêu đề
                if (child.name === 'Children 1') {
                  return (
                    <div key={`child-direct-${childIndex}`} style={{ marginLeft: '20px', marginBottom: '15px' }}>
                      {/* Render questions trực tiếp không có tiêu đề */}
                      {child.questions && Array.isArray(child.questions) &&
                        child.questions
                          .sort((a, b) => {
                            const aNumber = a.number !== undefined ? a.number : parseInt(a.questionId);
                            const bNumber = b.number !== undefined ? b.number : parseInt(b.questionId);
                            return aNumber - bNumber;
                          })
                          .map((question, qIndex) => this.renderQuestion(question, qIndex))
                      }
                    </div>
                  );
                }

                // Render bình thường cho các children khác
                const childKey = `${sectionIndex}-${subIndex}-${childIndex}`;
                const isChildExpanded = this.state.expandedChildren[childKey] !== false; // Mặc định mở rộng

                return (
                  <div key={`child-${childIndex}`} style={{ marginLeft: '20px', marginBottom: '15px' }}>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#34495e',
                        marginBottom: '8px',
                        paddingLeft: '8px',
                        borderLeft: '2px solid #95a5a6',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => this.toggleChildren(sectionIndex, subIndex, childIndex)}
                    >
                      <span style={{ marginRight: '8px', fontSize: '12px' }}>
                        {isChildExpanded ? '▼' : '▶'}
                      </span>
                      {child.name}
                      <span style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: 'normal' }}>
                        {' '}(Tổng: {child.totalQuestions} câu)
                      </span>
                    </div>

                    {isChildExpanded && (
                      <>
                        {/* Render questions trong children */}
                        {child.questions && Array.isArray(child.questions) &&
                          child.questions
                            .sort((a, b) => {
                              const aNumber = a.number !== undefined ? a.number : parseInt(a.questionId);
                              const bNumber = b.number !== undefined ? b.number : parseInt(b.questionId);
                              return aNumber - bNumber;
                            })
                            .map((question, qIndex) => this.renderQuestion(question, qIndex))
                        }
                      </>
                    )}
                  </div>
                );
              })
            }

            {/* Render questions trực tiếp trong subSection nếu không có children hoặc children rỗng */}
            {(!subSection.children || subSection.children.length === 0) &&
              sortedQuestions.map((question, qIndex) => this.renderQuestion(question, qIndex))
            }
          </>
        )}
      </div>
    );
  };

  fetchParams = () => {
    const { reportData } = this.props;

    if (reportData != null && Array.isArray(reportData.question_summary)) {
      return reportData.question_summary.map((section, index) => {
        const isSectionExpanded = this.state.expandedSections[index] !== false; // Mặc định mở rộng

        return (
          <div key={`section-${index}`} style={{ marginBottom: '30px' }}>
            {/* Tiêu đề phần chính */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '15px',
                padding: '12px 15px',
                backgroundColor: '#ecf0f1',
                borderRadius: '6px',
                borderLeft: '4px solid #e74c3c',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => this.toggleSection(index)}
            >
              <span style={{ marginRight: '10px', fontSize: '14px' }}>
                {isSectionExpanded ? '▼' : '▶'}
              </span>
              {section.name}
              <span style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: 'normal' }}>
                {' '}(Tổng: {section.totalQuestions} câu)
              </span>
            </div>

            {isSectionExpanded && (
              <>
                {/* Render các subparts */}
                {section.subparts && Array.isArray(section.subparts) &&
                  section.subparts.map((subpart, subIndex) => {
                    // Nếu subpart.name == section.name thì bỏ qua hiển thị subpart, render trực tiếp children
                    if (subpart.name === section.name) {
                      return (
                        <div key={`subpart-skip-${subIndex}`}>
                          {/* Render children trực tiếp */}
                          {subpart.children && Array.isArray(subpart.children) &&
                            subpart.children.map((child, childIndex) => {
                              // Nếu child.name == section.name thì bỏ qua hiển thị child, render trực tiếp questions
                              if (child.name === section.name) {
                                return (
                                  <div key={`child-skip-${childIndex}`}>
                                    {/* Render questions trực tiếp */}
                                    {child.questions && Array.isArray(child.questions) &&
                                      child.questions.map((question, qIndex) =>
                                        this.renderQuestion(question, qIndex)
                                      )
                                    }
                                  </div>
                                );
                              }
                              // Nếu child.name là 'Children 1', render trực tiếp questions mà không hiển thị tiêu đề
                              else if (child.name === 'Children 1') {
                                return (
                                  <div key={`child-children1-${childIndex}`}>
                                    {/* Render questions trực tiếp không có tiêu đề */}
                                    {child.questions && Array.isArray(child.questions) &&
                                      child.questions.map((question, qIndex) =>
                                        this.renderQuestion(question, qIndex)
                                      )
                                    }
                                  </div>
                                );
                              }
                              else {
                                // Render child bình thường nếu child.name != section.name
                                const childKey = `${index}-skip-${childIndex}`;
                                const isChildExpanded = this.state.expandedChildren[childKey] !== false;

                                return (
                                  <div key={`child-direct-${childIndex}`} style={{ marginBottom: '15px' }}>
                                    <div
                                      style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#2c3e50',
                                        marginBottom: '10px',
                                        paddingLeft: '10px',
                                        borderLeft: '3px solid #3498db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => this.toggleChildren(index, 'skip', childIndex)}
                                    >
                                      <span style={{ marginRight: '8px', fontSize: '12px' }}>
                                        {isChildExpanded ? '▼' : '▶'}
                                      </span>
                                      {child.name}
                                      <span style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: 'normal' }}>
                                        {' '}(Tổng: {child.totalQuestions} câu)
                                      </span>
                                    </div>

                                    {isChildExpanded && (
                                      <>
                                        {/* Render questions trong children */}
                                        {child.questions && Array.isArray(child.questions) &&
                                          child.questions.map((question, qIndex) =>
                                            this.renderQuestion(question, qIndex)
                                          )
                                        }
                                      </>
                                    )}
                                  </div>
                                );
                              }
                            })
                          }

                          {/* Render questions trực tiếp trong subpart nếu không có children */}
                          {(!subpart.children || subpart.children.length === 0) &&
                            subpart.questions && Array.isArray(subpart.questions) &&
                            subpart.questions
                              .sort((a, b) => {
                                const aNumber = a.number !== undefined ? a.number : parseInt(a.questionId);
                                const bNumber = b.number !== undefined ? b.number : parseInt(b.questionId);
                                return aNumber - bNumber;
                              })
                              .map((question, qIndex) => this.renderQuestion(question, qIndex))
                          }
                        </div>
                      );
                    } else {
                      // Render bình thường nếu subpart.name != section.name
                      return this.renderSubSection(subpart, subIndex, index);
                    }
                  })
                }

                {/* Render questions trực tiếp trong section nếu không có subparts */}
                {(!section.subparts || section.subparts.length === 0) &&
                  section.questions && Array.isArray(section.questions) &&
                  section.questions
                    .sort((a, b) => {
                      const aNumber = a.number !== undefined ? a.number : parseInt(a.questionId);
                      const bNumber = b.number !== undefined ? b.number : parseInt(b.questionId);
                      return aNumber - bNumber;
                    })
                    .map((question, qIndex) => this.renderQuestion(question, qIndex))
                }
              </>
            )}
          </div>
        );
      });
    }

    return <div>Không có dữ liệu thống kê câu hỏi</div>;
  };

  renderChart = () => {
    let initOptions = {
      title: "Phân bố điểm",
      chart: { type: "pie" },
      series: [{ name: "Tổng", colorByPoint: true, data: [] }],
    };

    if (this.props.reportData) {
      const d = this.props.reportData || {};
      const pr4 = d.PR4 ? { name: d.PR4.name, y: d.PR4.value, color: "#0088FE" } : null;
      const pr3 = d.PR3 ? { name: d.PR3.name, y: d.PR3.value, color: "#00C49F" } : null;
      const pr2 = d.PR2 ? { name: d.PR2.name, y: d.PR2.value, color: "#FFBB28" } : null;
      const pr1 = d.PR1 ? { name: d.PR1.name, y: d.PR1.value, color: "#FF8042" } : null;
      const pr0 = d.PR0 ? { name: d.PR0.name, y: d.PR0.value, color: "lightgray", sliced: true, selected: true } : null;
      const points = [pr4, pr3, pr2, pr1, pr0].filter(Boolean);
      initOptions = {
        ...initOptions,
        tooltip: { valueSuffix: '' },
        plotOptions: { series: { allowPointSelect: true, cursor: 'pointer' } },
        series: [{ name: "Tổng", colorByPoint: true, data: points }],
      };
    }

    return <HighchartsReact highcharts={Highcharts} options={initOptions} />;
  };

  compare(a, b) {
    const _a = a.total_score_achieve;
    const _b = b.total_score_achieve;

    let comparison = 0;
    if (_a < _b) {
      comparison = 1;
    } else if (_a > _b) {
      comparison = -1;
    }
    return comparison;
  }

  topFive = () => {
    if (
      this.props.reportData != null &&
      this.props.reportData.testings instanceof Array
    ) {
      var data = this.props.reportData.testings.sort(this.compare);
      var dataNew = data.slice(0, 5);
      return dataNew.map((obj, i) => {
        return (
          <tr>
            <td
              width={50}
              style={{
                textAlign: "center",
              }}
            >
              {i + 1}
            </td>
            <td>
              <span>{obj.user_name}</span>
            </td>
            <td
              style={{
                textAlign: "center",
              }}
            >
              {obj.total_score_achieve?.toFixed(2)}
            </td>
          </tr>
        );
      });
    }
  };

  render() {
    return (
      <div className="page-content page-container" id="page-content">
        <div className="padding">
          {this.props.reportData !== null && this.state.classrooms !== null ? (
            <div className="row">
              <div className="col-md-12">

                {/* Select block */}
                {this.state.typeExam === 'MAC_DINH' && (
                  <div
                    className="filter-bar"
                    style={{
                      background: "#fff",
                      padding: "12px 20px",
                      borderRadius: "6px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      marginBottom: "25px"
                    }}
                  >
                    <select
                      id="filterSelect"
                      className="form-control"
                      style={{ width: "220px" }}
                      onChange={this.handleSelectChange}
                      disabled={this.state.isLoading}
                    >
                      <option value="all">
                        {this.state.isLoading ? "Đang tải..." : "---Chọn lớp học---"}
                      </option>
                      {Array.isArray(this.state.classrooms) &&
                        this.state.classrooms.length > 0 ? (
                        this.state.classrooms.map((item) => (
                          <option
                            key={item.classroom_id}
                            value={item.classroom_id}
                          >
                            {item.classroom_name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Không có dữ liệu lớp học</option>
                      )}
                    </select>
                  </div>)}

                {/* Tabs block */}
                {(this.state.typeExam === "THI_THU" ||
                  (this.state.typeExam === "MAC_DINH" && this.state.selectedClassId !== "all")) ? (
                  <div className="card">
                    <div className="b-b">
                      <div className="nav-active-border b-primary bottom">
                        <ul className="nav" id="myTab" role="tablist">
                          <li className="nav-item">
                            <a
                              className="nav-link active"
                              id="home-tab"
                              data-toggle="tab"
                              href="#dashboard"
                              role="tab"
                              aria-controls="dashboard"
                              aria-selected="true"
                            >
                              Tổng quan
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="score-tab"
                              data-toggle="tab"
                              href="#score"
                              role="tab"
                              aria-controls="score"
                              aria-selected="false"
                            >
                              Bảng điểm
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className="nav-link"
                              id="params-tab"
                              data-toggle="tab"
                              href="#params"
                              role="tab"
                              aria-controls="params"
                              aria-selected="false"
                            >
                              Thông số câu
                            </a>
                          </li>
                          {this.state.typeExam === 'MAC_DINH' && (
                            <li className="nav-item">
                              <a
                                className="nav-link"
                                id="chualam-tab"
                                data-toggle="tab"
                                href="#chualam"
                                role="tab"
                                aria-controls="chualam"
                                aria-selected="false"
                              >
                                Chưa làm
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Tab content */}
                    <div className="tab-content p-3">
                      {/* Tổng quan */}
                      <div
                        className="tab-pane fade active show"
                        id="dashboard"
                        role="tabpanel"
                        aria-labelledby="dashboard-tab"
                      >
                        {/* Button xuất Excel ở đầu */}
                        <div className="row mb-3">
                          <div className="col-md-12 text-left">
                            <button
                              className="btn btn-success"
                              onClick={this.exportToExcel}
                              style={{
                                padding: "8px 16px",
                                fontSize: "14px",
                                fontWeight: "500"
                              }}
                            >
                              <i className="fas fa-file-excel mr-2"></i>
                              Xuất Excel
                            </button>
                          </div>
                        </div>

                        {/* Nội dung thống kê & chart */}
                        <div className="row">
                          <div className="col-md-6">
                            <div className="widget-spread">
                              <div className="widget-average-top1 d-flex justify-content-around align-items-center">
                                Phân bố điểm
                              </div>
                              <div className="row widget-average-bottom1 d-flex flex-row justify-content-start align-items-center">
                                <div className="col-md-8 col-sm-12 widget-container">
                                  {this.renderChart()}
                                </div>
                                <div className="col-md-4 col-sm-12 widget-info d-flex flex-column justify-content-start align-items-start">
                                  <div className="item-info">
                                    <div className="box-info" style={{ backgroundColor: "#0088FE" }}></div>{" "}
                                    {this.props.reportData?.PR4?.name || ""}
                                  </div>
                                  <div className="item-info">
                                    <div className="box-info" style={{ backgroundColor: "#00C49F" }}></div>{" "}
                                    {this.props.reportData?.PR3?.name || ""}
                                  </div>
                                  <div className="item-info">
                                    <div className="box-info" style={{ backgroundColor: "#FFBB28" }}></div>{" "}
                                    {this.props.reportData?.PR2?.name || ""}
                                  </div>
                                  <div className="item-info">
                                    <div className="box-info" style={{ backgroundColor: "#FF8042" }}></div>{" "}
                                    {this.props.reportData?.PR1?.name || ""}
                                  </div>
                                  <div className="item-info">
                                    <div className="box-info" style={{ backgroundColor: "lightgray" }}></div>{" "}
                                    {this.props.reportData?.PR0?.name || ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="row mb-5">
                              {/* Điểm trung bình */}
                              <div className="col-md-6">
                                <div className="widget-average">
                                  <div className="widget-average-top d-flex align-items-center position-relative">
                                    <span style={{ position: "absolute", left: 0 }}>
                                      {/* Icon sao */}
                                      <svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-star">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                      </svg>
                                    </span>
                                    <span className="mx-auto" style={{ fontSize: 15 }}>Điểm trung bình</span>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <span style={{ fontWeight: 700, fontSize: 45, color: "#007bff" }}>
                                      {this.props.reportData?.avg_point || "0"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Học sinh đã làm */}
                              {this.state.typeExam === 'MAC_DINH' ? (<div className="col-md-6">
                                <div className="widget-average">
                                  <div className="widget-average-top d-flex align-items-center position-relative">
                                    <span style={{ position: "absolute", left: 0 }}>
                                      {/* Icon users */}
                                      <svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-users">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx={9} cy={7} r={4} />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                    </span>
                                    <span className="mx-auto" style={{ fontSize: 15 }}>Học sinh đã làm</span>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <span style={{ fontWeight: 700, fontSize: 45, color: "#007bff" }}>
                                      {this.props.reportData
                                        ? `${this.props.reportData.total_testing || 0}/${this.props.reportData.total_student || 0}`
                                        : "0/0"}
                                    </span>
                                  </div>
                                </div>
                              </div>) : null}
                            </div>

                            {/* Top học sinh */}
                            <div className="row">
                              <div className="col-md-12">
                                <div className="widget-average-board">
                                  <div className="widget-average-top d-flex justify-content-start align-items-center">
                                    <span className="mr-1">Học sinh làm</span>{" "}
                                    <strong style={{ color: "#0088FE" }}>Tốt</strong>
                                  </div>
                                  <div className="widget-average-bottom d-flex justify-content-center align-items-center">
                                    <table className="table table-striped">
                                      <thead>
                                        <tr>
                                          <th style={{ textAlign: "center" }}>STT</th>
                                          <th>Học sinh</th>
                                          <th width={90} style={{ textAlign: "center" }}>Điểm TB</th>
                                        </tr>
                                      </thead>
                                      <tbody>{this.topFive()}</tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bảng điểm */}
                      <div
                        className="tab-pane fade"
                        id="score"
                        role="tabpanel"
                        aria-labelledby="score-tab"
                      >
                        <table className="table table-striped table-score">
                          <thead>
                            <tr>
                              <th style={{ textAlign: "center", verticalAlign: "inherit" }}>STT</th>
                              <th>Tên học sinh</th>
                              <th>Mã học sinh</th>
                              <th width={90} style={{ textAlign: "center" }}>Điểm</th>
                              <th width={150} style={{ textAlign: "center" }}>Thời gian</th>
                            </tr>
                          </thead>
                          <tbody>{this.fetchRowsUser()}</tbody>
                        </table>
                      </div>

                      {/* Chưa làm */}
                      <div
                        className="tab-pane fade"
                        id="chualam"
                        role="tabpanel"
                        aria-labelledby="chualam-tab"
                      >
                        <table className="table table-striped table-chualam">
                          <thead>
                            <tr>
                              <th style={{ textAlign: "center", verticalAlign: "inherit" }}>STT</th>
                              <th>Tên học sinh</th>
                              <th>Mã học sinh</th>
                            </tr>
                          </thead>
                          <tbody>{this.fetchRowsUserNoExam()}</tbody>
                        </table>
                      </div>

                      {/* Thông số câu */}
                      <div
                        className="tab-pane fade"
                        id="params"
                        role="tabpanel"
                        aria-labelledby="params-tab"
                      >
                        {this.fetchParams()}
                      </div>
                    </div>
                  </div>
                ) : <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                  <p style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: "#666",
                    textAlign: "center",
                    margin: 0
                  }}>
                    Hãy chọn một lớp từ danh sách trên để xem báo cáo chi tiết.
                  </p>
                </div>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    classList: state.examWord.classList,
    reportData: state.examWord.reportClass,
    exam: state.examWord.examword,
    classroomsData: state.examWord.classrooms
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ listClassWord, reportClassWord, showExamWord, listClassRoom }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExamWordReport)
);