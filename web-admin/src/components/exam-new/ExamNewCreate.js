import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import $ from "jquery";
import {listSubject} from "../../redux/subject/action";
import {
  createExam,
  createQuestion,
  createSection,
  deleteGroup,
  deleteQuestion,
  deleteSection,
  detailExam,
  updateExam,
  updateGroupQuestionf,
  updateQuestion,
  updateSection
} from "../../redux/examv2/action";
import {listExamCategory} from "../../redux/examcategory/action";
import baseHelpers from "../../helpers/BaseHelpers";
import {DragDropContext, Droppable} from "react-beautiful-dnd";
import ModalQuestion1 from "./ModalQuestion1";
import ModalQuestion2 from "./ModalQuestion2";
import ModalQuestion3 from "./ModalQuestion3";
import ModalQuestion4 from "./ModalQuestion4";
import ModalQuestion5 from "./ModalQuestion5";
import ModalQuestion6 from "./ModalQuestion6";
import ModalGroupQuestion from "./ModalGroupQuestion";
import {setLoader} from '../LoadingContext';
import {notification} from "antd";
import queryString from "query-string";

class ExamNewCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      time: 90,
      pointTrueFalse: false,
      pointTrueFalse1: 10,
      pointTrueFalse2: 25,
      pointTrueFalse3: 50,
      pointTrueFalse4: 100,
      name: "",
      code: "",
      started_at: "",
      finished_at: "",
      keyword: "",
      subject_id: "",
      category_id: "",
      creating_type: "DEFAULT",
      examQuestions: [],
      questionNo: 1,
      fileData: "",
      doc_type: "GOOGLE_DRIVE",
      group: 'MAC_DINH',
      level: null,
      selectedQuestions: [],
      currentQuestionvalue: null,
      type_question: "",
      sectionType: 'DEFAULT',
      exam: null,
      section: null,
      tabData: [],
      statusTabCreate: true,
      examId: "",
      examSectionId: '',
      examSectionGroupId: '',
      examSectionSubjectId: '',
      newTabName: "",
      typeExam: "TOT_NGHIEP",
      linkExam: "",
      linkAnswer: "",
      TN: "TOT_NGHIEP",
      HSA: "HSA",
      APT: "APT",
      TSA: "TSA",
      actionUser: 'CREATE',
      deleteQuestionIds: [],
      actionGroup: 'create',
      actionQuestion: 'create',
      groupDetail: null
    };
  }

  renderQuestionType = (type) => {
    switch (type) {
      case 'TN_SINGLE_CHOICE':
        return 'TRẮC NGHIỆM';
      case 'TN_TRUE_FALSE':
        return 'TRẮC NGHIỆM ĐÚNG SAI';
      case 'ESSAY':
        return 'ĐIỀN SỐ/TRẢ LỜI NGẮN';
      case 'DRAG_DROP':
        return 'KÉO THẢ';
      case 'TN_MULTI_CHOICE':
        return 'TRẮC NGHIỆM NHIỀU ĐÁP ÁN';
      case 'TRUE_FALSE':
        return 'ĐÚNG SAI';
      default:
        return type; // Default case returns the type if not matched
    }
  }

  renderAnswerDS = (answer) => {
    if (answer === true) {
      return "Đúng"
    } else {
      return "Sai"
    }
  }

  renderAnswer = (question) => {
    switch (question.type) {
      case 'TN_SINGLE_CHOICE':
        return question.answer;
      case 'TN_TRUE_FALSE':
        let answer =
          "a:" + this.renderAnswerDS(question.answer.a) +
          ", b:" + this.renderAnswerDS(question.answer.b) +
          (question.answer.c !== undefined ? ", c:" + this.renderAnswerDS(question.answer.c) : "") +
          (question.answer.d !== undefined ? ", d:" + this.renderAnswerDS(question.answer.d) : "");
        return answer;
      case 'ESSAY':
        return question.answer;
      case 'DRAG_DROP':
        let answer1 = question.answer.map(item => `${item.key}:${item.value}`).join(', ');
        return answer1;
      case 'TN_MULTI_CHOICE':
        return question.answer;
      case 'TRUE_FALSE':
        return question.answer === "TRUE" ? "ĐÚNG" : "SAI";
      default:
        return ''; // Default case returns the type if not matched
    }
  }

  createRow(question, index) {
    return (<tr className="v-middle table-row-item" key={question._id}>
        <td className="text-left p-sm-1">
          Câu {question.question_no}
        </td>
        <td className="text-left p-sm-1">
          {question.code}
        </td>
        <td className="text-left p-sm-1">
          {this.renderAnswer(question)}
        </td>
        <td className="text-center p-sm-1">
          {this.renderQuestionType(question.type)}
        </td>
        <td className="text-center p-sm-1">
              <span
                className={question.doc_link ? "bg-have-data" : "bg-no-data"}>{question.doc_link && question.doc_link != "" ? "Đã có" : "Chưa có"}</span>
        </td>
        <td className="text-center p-sm-1">
              <span
                className={question.video_link ? "bg-have-data" : "bg-no-data"}>{question.video_link && question.video_link != "" ? "Đã có" : "Chưa có"}</span>
        </td>
        <td className="text-left p-sm-1">
          {question.created_at ? baseHelpers.formatDateToString(question.created_at) : null}
        </td>
        <td className='text-right p-sm-1'>
          <div className="item-action">
            <a
              className="mr-14"
              data-toggle='modal'
              data-target='#edit-question'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.handleOpenModalUpdateQuestion(question)}
              title='Chỉnh sửa'
            >
              <img src="/assets/img/icon-edit.svg" alt=""/>
            </a>
            <a
              onClick={() =>this.handleSetDeleteQuestion(question._id)}
              data-toggle='modal'
              data-target='#delete-question'
              data-toggle-classname='fade-down'
              data-toggle-class-target='.animate'
              title="Xóa"
            >
              <img src="/assets/img/icon-delete.svg" alt=""/>
            </a>
          </div>
        </td>
      </tr>
      //   )}
      // </Draggable>
    );
  }

  fetchRows(data) {
    data = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (data instanceof Array) {
      return data.map((object, i) => {
        return this.createRow(object, i)
      });
    }
  }

  getKeyTabActive = () => {
    let tabActive = this.state.tabData.filter(item => item.active)
    return tabActive && tabActive.length > 0 ? tabActive[0].key : 'tabCreate'
  }

  setSelectedQuestion = async (question) => {
    if (question) {
      await this.setState({
        currentQuestionvalue: question
      })
    }
  }

  handleDeleteGroupQuestionApi = async () => {
    this.props.deleteGroup({exam_section_group_id: this.state.examSectionGroupId })
    let tabNew = this.state.tabData
    for (let i = 0; i < tabNew.length; i++) {
      if (tabNew[i]._id === this.state.examSectionId && tabNew[i].exam_section_type === 'GROUP_SUBJECT') {
        for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
          if (tabNew[i].exam_section_group[j]._id === this.state.examSectionGroupId) {
            tabNew[i].exam_section_group.splice(j,1)
          }
        }
      }
    }
    this.setState({
      tabNew,
    });
  }

  handleDeleteQuestionApi = async () => {
    this.props.deleteQuestion({ids: this.state.deleteQuestionIds})
    let tabNew = this.state.tabData
    for (let i = 0; i < tabNew.length; i++) {
      if (tabNew[i]._id === this.state.examSectionId && tabNew[i].exam_section_type === 'DEFAULT') {
        for (let j = 0; j < tabNew[i].questions.length; j++) {
          if (this.state.deleteQuestionIds.includes(tabNew[i].questions[j]._id)) {
            tabNew[i].questions.splice(j,1)
          }
        }
      } else if (tabNew[i]._id === this.state.examSectionId && tabNew[i].exam_section_type === 'GROUP_SUBJECT') {
        for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
          if (tabNew[i].exam_section_group[j]._id === this.state.examSectionGroupId) {
            for (let k = 0; k < tabNew[i].exam_section_group[j].subjects.length; k++) {
              if (tabNew[i].exam_section_group[j].subjects[k].subject_id === this.state.examSectionSubjectId) {
                for (let l = 0; l < tabNew[i].exam_section_group[j].subjects[k].questions.length; l++) {
                  if (this.state.deleteQuestionIds.includes(tabNew[i].exam_section_group[j].subjects[k].questions[l]._id)) {
                    tabNew[i].exam_section_group[j].subjects[k].questions.splice(l, 1)
                  }
                }
              }
            }
          }
        }
      }
    }
    this.setState({
      deleteQuestionIds: []
    })
  }

  handleSetDeleteQuestion = (id) => {
    this.setState({
      deleteQuestionIds: [id]
    })
  }

  handleOpenModalUpdateQuestion = (question) => {
    // Reset toàn bộ dữ liệu và đặt actionQuestion về 'update'
    this.setState({
      actionQuestion: 'update',
      currentQuestionvalue: null
    }, () => {
      // Sau khi đã reset xong, mới đặt currentQuestionvalue
      this.setState({ currentQuestionvalue: question }, () => {
        // Sau khi đã cập nhật state xong, mới mở modal tương ứng
        switch (question.type) {
          case 'TN_SINGLE_CHOICE':
            $('#create-update').trigger('click')
            break;
          case 'TN_TRUE_FALSE':
            $('#create-update2').trigger('click')
            break;
          case 'ESSAY':
            $('#create-update3').trigger('click')
            break;
          case 'DRAG_DROP':
            $('#create-update4').trigger('click')
            break;
          case 'TN_MULTI_CHOICE':
            $('#create-update5').trigger('click')
            break;
          case 'TRUE_FALSE':
            $('#create-update6').trigger('click')
            break;
        }
      });
    });
  }

  _onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  _onChangeSwitch = e => {
    var name = e.target.name;
    let checked = e.target.checked;
    this.setState({
      [name]: checked,
    });
  };

  _onChangeTypePoint = (e, index, idInput) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].calculate_score_type = value;
      if (value === "count_true") {
        document.getElementById(`${idInput}total_score`).style.display = 'none';
        document.getElementById(`${idInput}point_per_question`).style.display = 'none';
      } else {
        document.getElementById(`${idInput}total_score`).style.display = 'block';
        document.getElementById(`${idInput}point_per_question`).style.display = 'flex';
      }
      this.setState({tabData: updatedTabData});
    }
  };

  _onChageInputTotalScore = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].total_score = value; // Update the total_score
      this.setState({tabData: updatedTabData}); // Set updated state
    }
  };

  _onChageInputNameSection = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_section_name = value; // Update the total_score
      this.setState({tabData: updatedTabData}); // Set updated state
    }
  };

  _onChageInputLinkPdf = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_link = value; // Update the total_score
      this.setState({tabData: updatedTabData}); // Set updated state
    }
  };

  _onChageInputTime = (e, index) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    if (index >= 0 && index < updatedTabData.length) {
      updatedTabData[index].exam_section_time = value; // Update the total_score
      this.setState({tabData: updatedTabData}); // Set updated state
    }
  };

  _onChageLinkGroupExamp = (e, keyTab, keyGroup, keySubject) => {
    const value = e.target.value;
    const updatedTabData = [...this.state.tabData];
    updatedTabData.forEach((tab, index) => {
      if (tab._id === keyTab) {
        updatedTabData[index].exam_section_group.forEach((group, indexGroup) => {
          if (group._id === keyGroup) {
            updatedTabData[index].exam_section_group[indexGroup].subjects.forEach((subject, indexSubject) => {
              if (subject.subject_id === keySubject) {
                updatedTabData[index].exam_section_group[indexGroup].subjects[indexSubject].exam_link = value;
              }
            });
          }
        });
      }
    })
    this.setState({tabData: updatedTabData});
  };

  _onChangeNameTab = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.state.tabData[name].name = value
  };

  getData = () => {
    const data = {
      limit: 999, is_delete: false,
    };
    return data;
  };

  onChange = (e) => {
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  onChangeHandler = (event) => {
    if (this.state.doc_type === "PDF") {
      this.setState({
        fileData: event.target.files[0],
      });
    } else {
      this.setState({doc_link: ""});
    }
  };

  // handleChangeTag = async (value) => {
  //   await this.setState({
  //     tagsSearch: value,
  //   });
  // };

  async componentDidMount() {
    this.initData()
    await this.props.listSubject(this.getData());
    await this.props.listExamCategory(this.getData());
  }

  initData() {
    const url = this.props.location.search;
    let params = queryString.parse(url);
    let examId = params.id;
    if (examId && examId != "" && examId != undefined) {
      this.loadDetailExamAPI(examId)
      this.setState({
        examId,
        actionUser: 'UPDATE'
      })
    }
  }

  async loadDetailExamAPI(examId) {
    try {
      setLoader(true);

      const data = {
        exam_id: examId,
        creating_type: "MANUAL"
      };

      await this.props.detailExam(data);
      let {exam_section: dataExamSection, name, type, is_redo, group, level, subject, point_true_false, exam_doc_link,
        answer_doc_link} = this.props.detail;

      if (dataExamSection?.length > 0) {
        // Mark the first section as active and others as inactive
        dataExamSection.forEach((section, index) => {
          section.active = index === 0;

          // If section type is 'GROUP_SUBJECT', process its groups
          if (section.exam_section_type === 'GROUP_SUBJECT') {
            section.exam_section_group.forEach((groupData) => {
              for (const subject of groupData.subjects) {
                const subIndex = groupData.subjects.indexOf(subject);
                subject.active = subIndex === 0;
              }
            });
          }
        });
        dataExamSection = dataExamSection.sort((a, b) => a.exam_section_order - b.exam_section_order);
      }

      let pointTrueFalse1 = point_true_false === undefined ? 0 : point_true_false["1"];
      let pointTrueFalse2 = point_true_false === undefined ? 0 : point_true_false["2"];
      let pointTrueFalse3 = point_true_false === undefined ? 0 : point_true_false["3"];
      let pointTrueFalse4 = point_true_false === undefined ? 0 : point_true_false["4"];
      let pointTrueFalse = point_true_false === undefined ? false: true;

      // Update the state with the transformed data
      this.setState({
        tabData: dataExamSection || [],
        typeExam: type,
        statusTabCreate: !(dataExamSection?.length > 0),
        subject_id: subject.id,
        pointTrueFalse,
        pointTrueFalse1,
        pointTrueFalse2,
        pointTrueFalse3,
        pointTrueFalse4,
        name,
        is_redo,
        group,
        level,
        linkExam: exam_doc_link === null ? "" : exam_doc_link,
        linkAnswer: answer_doc_link === null ? "" : answer_doc_link
      });
    } catch (error) {
      console.error("Error loading exam details:", error);
    } finally {
      setLoader(false);
    }
  }

  fetchRowsSubject() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return (<option value={obj._id} key={obj._id.toString()}>
          {obj.name}
        </option>);
      });
    }
  }

  fetchTypeQuestions() {
    const typeQuestions = [// {_id: "GROUP_QUESTION", name: "Nhóm câu hỏi"},
      {_id: "MANUAL", name: "Thủ công"},]
    return typeQuestions.map((obj, i) => {
      return (<option value={obj._id} key={obj._id.toString()}>
        {obj.name}
      </option>);
    });
  }

  activeTab = (key) => {
    // Clone the tabData array to avoid direct mutation
    const updatedTabData = this.state.tabData.map((item) => ({
      ...item,
      active: item._id === key, // Set active true only for the matching tab
    }));

    // Update the state with the new tabData and statusTabCreate
    this.setState({
      tabData: updatedTabData,
      statusTabCreate: false,
    });
  };

  activeTabGroup(keyTab, keyGroup, keySubject) {
    let tabData = this.state.tabData;

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i]._id === keyTab) {
        for (let j = 0; j < tabData[i].exam_section_group.length; j++) {
          if (tabData[i].exam_section_group[j]._id === keyGroup) {
            for (let k = 0; k < tabData[i].exam_section_group[j].subjects.length; k++) {
              if (tabData[i].exam_section_group[j].subjects[k].subject_id === keySubject) {
                tabData[i].exam_section_group[j].subjects[k].active = true
              } else {
                tabData[i].exam_section_group[j].subjects[k].active = false
              }
            }
          }
        }
      } else {
        tabData[i].active = false
      }
    }
    this.setState({
      tabData
    });
  }

  actionCreateTab() {
    let tabData = this.state.tabData;
    tabData.map((item) => {
      item.active = false;
    });
    this.setState({
      tabData, statusTabCreate: true
    });
  }

  async createNewTab() {
    let validate = await this.validateCreateNewTab()
    if (validate === false) {
      return
    } else {
      if (this.state.examId === "") {
        await this.createNewExamApi()
      }
      await this.createNewSectionApi()
      let section = this.props.section
      section.active = true
      section.questions = []
      let sectionId = section._id

      let tabData = this.state.tabData;
      tabData.map((item) => {
        item.active = false;
      });
      tabData.push(section);
      // this.setState({
      //   tabData,
      // });
      this.activeTab(sectionId)
    }
  }

  validateCreateNewTab() {
    let validate = true
    let message = ""
    if (this.state.examId === "") {
      if (this.state.name === "") {
        validate = false
        message = "Tên đề thi không được để trống !"
      }

      if (this.state.subject_id === "") {
        validate = false
        message = "Môn học không được để trống !"
      }
      // if (this.state.category_id === "") {
      //   validate = false
      //   message = "Loại đề thi không được để trống !"
      // }
      if (this.state.level === "") {
        validate = false
        message = "Lớp học không được để trống !"
      }
      // if (this.state.time === 0) {
      //   validate = false
      //   message = "Vui lòng nhập thời gian làm bài thi !"
      // }
    }

    if (this.state.newTabName === "") {
      validate = false
      message = "Tên phần thi không được để trống !"
    }

    if (this.state.linkExam === '' || this.state.linkExam === undefined) {
      validate = false
      message = "Link đề thi không được trống!"
    }

    if (validate === false) {
      notification.error({
        message: message, placement: "topRight", top: 50, duration: 3,
      });
    }

    return validate
  }

  getExamSectionGroupOrderMax() {
    let order = 0
    let tabData = this.state.tabData;

    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i]._id === this.state.examSectionId) {
        if (tabData[i].exam_section_group && tabData[i].exam_section_group.length > 0) {
          order = Math.max( ...tabData[i].exam_section_group.map(o => o.exam_section_group_order)) + 1
        }
      }
    }
    return order
  }

  async createGroupQuestion(subject, data) {
    let dataListsubject = subject.map((item) => {
      return {
        subject_name: item.name, subject_id: item.id, questions: [], exam_link: ""
      }
    })
    data.exam_id = this.state.examId
    data.exam_section_group_order = this.getExamSectionGroupOrderMax()
    data.exam_section_id = this.state.examSectionId
    data.section_type = 'SUBJECT'
    data.subject_in_group = dataListsubject
    await this.createGroupSectionApi(data)
    let section_exam_section_group = this.props.section.exam_section_group

    for (let i =0 ; i<section_exam_section_group.length; i++) {
      if (section_exam_section_group[i].subjects && section_exam_section_group[i].subjects.length > 0) {
        for (let j =0; j<section_exam_section_group[i].subjects.length; j++){
          if (j === 0) {
            section_exam_section_group[i].subjects[j].active = true
          }
          if (section_exam_section_group[i].subjects[j].questions === undefined) {
            section_exam_section_group[i].subjects[j].questions = []
          }
        }
      }
    }
    let tabData = this.state.tabData;
    for (let i = 0; i < tabData.length; i++) {
      if (tabData[i]._id === this.state.examSectionId) {
        if (section_exam_section_group.length > 0) {
          tabData[i].exam_section_group.push(section_exam_section_group[section_exam_section_group.length - 1])
        } else {
          tabData[i].exam_section_group = section_exam_section_group
        }
      }
    }

    this.setState({
      tabData,
    });
  }

  async updateGroupQuestion(subject, data) {
    data.subject_in_group = subject.map((item) => {
      return {
        subject_name: item.name, subject_id: item.id, questions: []
      }
    })
    await this.props.updateGroupQuestionf(data)

    // let tabData = this.state.tabData;
    //
    // this.setState({
    //   tabData,
    // });
  }

  async updateGroupQuestionLinkExamp(subject, data, subjectcId, examplink) {
    data.exam_section_group_id = data._id
    data.subject_in_group = subject.map((item) => {
      if (item.id === subjectcId) {
        item.exam_link = examplink
      }
      return {
        subject_name: item.subject_name,
        subject_id: item.subject_id,
        questions: [],
        exam_link: item.exam_link
      }
    })
    await this.props.updateGroupQuestionf(data)

    // let tabData = this.state.tabData;
    //
    // this.setState({
    //   tabData,
    // });
  }

  deleteTab(key) {
    let tabData = this.state.tabData;
    let statusTabCreate = false
    let request = {
      "exam_id": this.state.examId,
      "exam_section_id": key
    }
    this.props.deleteSection(request)
    const index = tabData.findIndex(item => item._id === key);
    if (index !== -1) {
      tabData.splice(index, 1);
    }
    if (tabData.length > 0) {
      tabData[0].active = true
    } else {
      statusTabCreate = true
    }
    this.setState({
      tabData,statusTabCreate
    });
  }

  renderTabGroup(group, keyTab) {
    return (<React.Fragment key={keyTab + group._id}>
      <ul className="nav nav-tabs align-items-center justify-content-center mt-2">
        <li className="text-center highlight title-block m-0 d-flex"
            style={{left: "10px", position: "absolute"}}>{group.exam_section_group_name}

        </li>
        {group?.subjects?.map((subject, indexSubject) => (
          <li key={subject.subject_id || indexSubject}> {/* Add unique key here */}
            <a
              onClick={() => this.activeTabGroup(keyTab, group._id, subject.subject_id)}
              className={`btn no-border ${subject.active ? "btn-info" : "btn-light"}`}
              data-toggle="tab"
              href={`#${keyTab + group._id + subject.subject_id}`}
            >
              {subject.subject_name}
            </a>
          </li>
        ))}
        <li className="d-flex">
          <div
            data-toggle='tooltip'
            title='Chỉnh sửa nhóm câu hỏi'
          >
            <a
              className='btn no-border'
              data-toggle='modal'
              data-target='#createGroup'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setUpdateGroup(keyTab, group._id, group)}
            >
              <img src="/assets/img/icon-edit.svg" alt=""/>
            </a>
          </div>

          <div
            data-toggle='tooltip'
            title='Xoá nhóm câu hỏi'
          >
            <a
              className='btn no-border'
              data-toggle='modal'
              data-target='#delete-group-question'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setDeleteGroup(keyTab, group._id, group)}
            >
              <img src="/assets/img/icon-delete.svg" alt=""/>
            </a>
          </div>
        </li>
      </ul>
      <div className="block-exam block-item-content border border-info">
        {group?.subjects?.map((subject, indexSubject) => (
          <div className="tab-content" key={subject.subject_id || indexSubject}> {/* Add unique key here */}
            <div
              id={`${keyTab + group._id + subject.subject_id}`}
              className={`tab-pane fade ${subject.active ? "in active show" : ""}`}
            >
              <div className="list-actions" style={{maxHeight: "400px", overflow: "auto"}}>
                <div className="row" style={{width: "100%"}}>
                  <div className="col-sm-12">
                    <div className="input-group mb-0" style={{width: "26%"}}>
                      <div className="input-group-prepend">
                        <button
                          name="updateLink"
                          value="1"
                          className="btn btn-sm btn-primary"
                          onClick={() => this.updateGroupQuestionLinkExamp(group.subjects, group, subject.subject_id, subject.exam_link)}
                        >
                          Cập nhật
                        </button>
                        <span className="input-group-text"
                              id="basic-addon1">Link đề thi môn {subject.subject_name}</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={subject.exam_link}
                        onChange={(e) => this._onChageLinkGroupExamp(e, keyTab, group._id, subject.subject_id)}
                        style={{height: '100%'}}/>
                    </div>

                  </div>
                  <div className="col-sm-12">
                    <table className="table table-theme table-row v-middle">
                      <thead className="text-muted">
                      <tr>
                        <th className="th-custom">#</th>
                        <th className="th-custom">Mã câu hỏi</th>
                        <th className="text-left th-custom">Đáp án</th>
                        <th className="text-center th-custom">Loại câu hỏi</th>
                        <th className="text-center th-custom">Tài liệu</th>
                        <th className="text-center th-custom">Video</th>
                        <th className="text-left th-custom">Ngày tải lên</th>
                        <th className="text-right th-custom">Thao tác</th>
                      </tr>
                      </thead>
                      <DragDropContext onDragEnd={this.onDragEndQuestion}>
                        <Droppable droppableId="droppable">
                          {(provided, snapshot) => (
                            <tbody
                              ref={provided.innerRef}
                              style={{
                                background: snapshot.isDragging ? "#e8f0fe" : "none",
                              }}
                            >
                            {this.fetchRows(subject.questions)}

                            {!subject.questions || subject.questions.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center">Chưa có câu hỏi nào!</td>
                              </tr>
                            ) : null}
                            {provided.placeholder}
                            </tbody>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </table>
                  </div>
                </div>
              </div>
              <div className="block-action-footer justify-content-center mt-2 m-0">
                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle="modal"
                  data-target="#create"
                  data-toggle-class="fade-down"
                  data-toggle-class-target=".animate"
                  title="Trắc nghiệm"
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src="/assets/img/icon-add.svg" className="ml-10" alt=""/>
                  Trắc nghiệm
                </button>


                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle='modal'
                  data-target='#create2'
                  data-toggle-class='fade-down'
                  data-toggle-class-target='.animate'
                  title='Trắc nghiệm đúng sai'
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
                  Trắc nghiệm đúng sai
                </button>

                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle='modal'
                  data-target='#create3'
                  data-toggle-class='fade-down'
                  data-toggle-class-target='.animate'
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
                  Điền số/Trả lời ngắn
                </button>

                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle='modal'
                  data-target='#create4'
                  data-toggle-class='fade-down'
                  data-toggle-class-target='.animate'
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
                  Kéo thả
                </button>

                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle='modal'
                  data-target='#create5'
                  data-toggle-class='fade-down'
                  data-toggle-class-target='.animate'
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
                  TN nhiều đáp án
                </button>

                <button
                  type="button"
                  className="btn btn-info mr-2"
                  data-toggle='modal'
                  data-target='#create6'
                  data-toggle-class='fade-down'
                  data-toggle-class-target='.animate'
                  onClick={() => this.setSelectedId(keyTab, group._id, subject.subject_id)}
                >
                  <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
                  Đúng/sai
                </button>
                {/* Repeat similar buttons for other actions */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>)
  }

  setSelectedId(examSectionId, examSectionGroupId, examSectionSubjectId) {
    let questionNo = this.getQuestionNoNew(examSectionId, examSectionGroupId, examSectionSubjectId)
    this.setState({
      examSectionId, 
      examSectionGroupId, 
      examSectionSubjectId, 
      questionNo,
      actionQuestion: 'create',
      currentQuestionvalue: null  // Reset currentQuestionvalue khi tạo mới
    }, () => {
      // Đảm bảo state đã được cập nhật trước khi bất kỳ modal nào được mở
      console.log("State đã được reset để tạo mới câu hỏi");
    });
  }


  actionCreateGroup(examSectionId, examSectionGroupId, examSectionSubjectId) {
    this.setState({
      examSectionId, examSectionGroupId, examSectionSubjectId, actionGroup: 'create'
    })
  }

  setUpdateGroup(examSectionId, examSectionGroupId, groupDetail) {
    this.setState({
      examSectionId, examSectionGroupId, groupDetail, actionGroup: 'update'
    })
  }

  setDeleteGroup(examSectionId, examSectionGroupId, groupDetail) {
    this.setState({
      examSectionId, examSectionGroupId, groupDetail
    })
  }

  countTotalQuestion(tab) {
    let total = 0
    if (tab.exam_section_type === "DEFAULT") {
      total = tab.questions.length
    } else {
      for (let i = 0; i < tab.exam_section_group.length; i++) {
        for (let j = 0; j < tab.exam_section_group[i].subjects.length; j++) {
          total += tab.exam_section_group[i].subjects[j].questions.length
        }
      }
    }
    return total
  }

  renderTabs(tab, index) {
    if (tab.exam_section_type === "DEFAULT") {
      return (<div className="tab-content" key={tab._id}>
        <div id={`${tab._id}`} className={`tab-pane fade ${tab.active ? "in active show" : ""}`}>
          <div className="list-actions">
            {/*<button className="btn btn-sm btn-out-line flex-item-center">*/}
            {/*  Xóa câu hỏi*/}
            {/*  <i className="icon-delete ml-12"></i>*/}
            {/*</button>*/}
            <button className="btn btn-sm btn-out-line flex-item-center" onClick={() => this.deleteTab(tab._id)}>
              Xóa phần thi
              <i className="icon-delete ml-12"></i>
            </button>

            <div className="input-group mb-0 ml-12" style={{width: "270px"}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">TÍNH ĐIỂM</span>
              </div>
              <div className="form-control p-0" style={{height: '100%'}}>
                <select
                  value={tab.calculate_score_type}
                  // name={index}
                  onChange={(e) => this._onChangeTypePoint(e, index, tab._id)}
                  // value={tab.calculate_score_type}
                  className="custom-select pr-0 pt-0 pl-2 pb-0"
                  id={tab._id + "inputGroupSelect01"}
                  style={{height: '100%'}}>
                  <option value="count_true">Đếm số câu đúng</option>
                  <option value="total_point">Tổng điểm</option>
                </select>
              </div>
              {
                // (tab.calculate_score_type === "total_point") &&
                (
                  <input
                    value={tab.total_score}
                    onChange={(e) => this._onChageInputTotalScore(e, index)}
                    id={tab._id + "total_score"}
                    type="number"
                    className="form-control"
                    style={{height: '100%', display: (tab.calculate_score_type === "total_point") ? 'block' : 'none', maxWidth: '70px'}}/>
                )
              }
            </div>

            <div className="input-group mb-0 ml-12" style={{width: "150px"}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">TỔNG SỐ CÂU</span>
              </div>
              <div className="form-control pl-1 d-flex align-items-center" style={{height: '100%'}}>
                {tab.questions.length}
              </div>
            </div>
            <div id={tab._id + "point_per_question"} className="input-group mb-0 ml-12"
                 style={{width: "13%", display: (tab.calculate_score_type === "total_point") ? 'flex' : 'none'}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">Điểm mỗi câu</span>
              </div>
              <div className="form-control pl-1 d-flex align-items-center" style={{height: '100%', width: '56px'}}>
                {tab.total_score > 0 && (tab.total_score / tab.questions.length).toFixed(2)}
              </div>
            </div>

            <button
              name="reset"
              value="1"
              className="btn btn-primary flex-end"
              style={{right: '20px', position: 'absolute'}}
              onClick={() => this.handleUpdateSectionApi(tab, index)}
            >
              Cập nhật phần thi
            </button>
          </div>
          <div className="list-actions mt-1">
            {
              (
                <div className="input-group mb-0" style={{width: "26%"}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">TÊN PHẦN THI</span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={tab.exam_section_name}
                    onChange={(e) => this._onChageInputNameSection(e, index)}
                    style={{height: '100%'}}/>
                </div>
              )
            }
            {
              (this.state.typeExam === this.state.HSA || this.state.typeExam === this.state.TSA) &&
              (
                <div className="input-group mb-0 ml-2" style={{width: "20%"}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">LINK PDF</span>
                  </div>
                  <input type="text" className="form-control"
                         value={tab.exam_link}
                         onChange={(e) => this._onChageInputLinkPdf(e, index)}
                         aria-label="Username"
                         aria-describedby="basic-addon1" style={{height: '100%'}}/>
                </div>
              )
            }

            {
              (this.state.typeExam === this.state.HSA || this.state.typeExam === this.state.TSA) &&
              (
                <div className="input-group mb-0 ml-12" style={{width: "20%"}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">THỜI GIAN</span>
                  </div>
                  <input type="number" className="form-control"
                         value={tab.exam_section_time}
                         onChange={(e) => this._onChageInputTime(e, index)}
                         aria-label="Username"
                         aria-describedby="basic-addon1" style={{height: '100%', maxWidth: '70px'}}/>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">PHÚT</span>
                  </div>
                </div>
              )
            }
          </div>
          <div className="row" style={{minHeight: "55vh"}}>
            <div className="col-sm-12">
              <table className="table table-theme table-row v-middle">
                <thead className="text-muted">
                <tr>
                  <th>#</th>
                  <th>Mã câu hỏi</th>
                  <th className="text-left">
                    Đáp án
                  </th>
                  <th className="text-center">
                    Loại câu hỏi
                  </th>
                  <th className="text-center">
                    Tài liệu
                  </th>
                  <th className="text-center">
                    Video
                  </th>
                  <th className="text-left">
                    Ngày tải lên
                  </th>
                  <th className='text-right'>
                    Thao tác
                  </th>
                </tr>
                </thead>
                <DragDropContext onDragEnd={this.onDragEndQuestion}>
                  <Droppable droppableId={tab._id + 'droppable'}>
                    {(provided, snapshot) => (<tbody
                      ref={provided.innerRef}
                      style={{
                        background: snapshot.isDragging ? "#e8f0fe" : "none",
                      }}
                      key={tab._id + 'key_tbody'}
                    >
                    {this.fetchRows(tab.questions)}

                    {!tab.questions || tab.questions.length == 0 && <tr>
                      <td colSpan={7} className="text-center">Chưa có câu hỏi nào!</td>
                    </tr>}
                    {provided.placeholder}
                    </tbody>)}
                  </Droppable>
                </DragDropContext>
              </table>
            </div>
          </div>

          <div className="block-action-footer justify-content-center m-0">
            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              title='Trắc nghiệm'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              Trắc nghiệm
            </button>

            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create2'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              title='Trắc nghiệm đúng sai'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              Trắc nghiệm đúng sai
            </button>

            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create3'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              Điền số/Trả lời ngắn
            </button>

            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create4'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              Kéo thả
            </button>

            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create5'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              TN nhiều đáp án
            </button>

            <button
              type="button"
              className="btn btn-info mr-2"
              data-toggle='modal'
              data-target='#create6'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.setSelectedId(tab._id, "", "")}
            >
              <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
              Đúng/sai
            </button>
          </div>
        </div>
      </div>);
    } else {
      return (<div className="tab-content" key={tab._id}>
        <div id={`${tab._id}`} className={`tab-pane fade ${tab.active ? "in active show" : ""}`}>
          <div className="list-actions">
            <button className="btn btn-sm btn-out-line flex-item-center" onClick={() => this.deleteTab(tab._id)}>
              Xóa phần thi
              <i className="icon-delete ml-12"></i>
            </button>
            <button
              type="button"
              className="btn no-border btn-primary ma-2 ml-2"
              data-toggle='modal'
              data-target='#createGroup'
              data-toggle-class='fade-down'
              data-toggle-class-target='.animate'
              onClick={() => this.actionCreateGroup(tab._id, '', '')}
            >
              Thêm nhóm chủ đề
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus mx-2"
              >
                <line x1={12} y1={5} x2={12} y2={19}/>
                <line x1={5} y1={12} x2={19} y2={12}/>
              </svg>
            </button>

            <div className="input-group mb-0 ml-12" style={{width: "270px"}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">TÍNH ĐIỂM</span>
              </div>
              <div className="form-control p-0" style={{height: '100%'}}>
                <select
                  value={tab.calculate_score_type}
                  // name={index}
                  onChange={(e) => this._onChangeTypePoint(e, index, tab._id)}
                  // value={tab.calculate_score_type}
                  className="custom-select p-0 pl-2"
                  id={tab._id + "inputGroupSelect01"}
                  style={{height: '100%'}}>
                  <option value="count_true">Đếm số câu đúng</option>
                  <option value="total_point">Tổng điểm</option>
                </select>
              </div>
              {
                // tab.calculate_score_type && (tab.calculate_score_type === "total_point") &&
                (
                  <input
                    value={tab.total_score}
                    onChange={(e) => this._onChageInputTotalScore(e, index)}
                    id={tab._id + "total_score"}
                    type="number"
                    className="form-control"
                    style={{height: '100%', display: (tab.calculate_score_type === "total_point") ? 'block' : 'none', maxWidth: '70px'}}/>
                )
              }
            </div>

            <div className="input-group mb-0 ml-12" style={{width: "150px"}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">TỔNG SỐ CÂU</span>
              </div>
              <div className="form-control p-0 d-flex align-items-center" style={{height: '100%'}}>
                {this.countTotalQuestion(tab) /*{tab.questions.length}*/}
              </div>
            </div>
            <div id={tab._id + "point_per_question"} className="input-group mb-0 ml-12"
                 style={{width: "13%", display: 'none'}}>
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">Số điểm mỗi câu</span>
              </div>
              <div className="form-control p-0 d-flex align-items-center" style={{height: '100%', width: '56px'}}>
                {(tab.total_score > 0 && this.countTotalQuestion(tab) > 0) ? (tab.total_score / this.countTotalQuestion(tab)).toFixed(2) : 0}
              </div>
            </div>

            <button
              name="update"
              value="1"
              className="btn btn-primary flex-end"
              style={{right: '20px', position: 'absolute'}}
              onClick={() => this.handleUpdateSectionApi(tab, index)}
            >
              Cập nhật phần thi
            </button>
          </div>
          <div className="list-actions mt-1">
            {
              (
                <div className="input-group mb-0" style={{width: "26%"}}>
                  <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon1">TÊN PHẦN THI</span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={tab.exam_section_name}
                    onChange={(e) => this._onChageInputNameSection(e, index)}
                    style={{height: '100%'}}/>
                </div>
              )
            }
            {
              (this.state.typeExam === this.state.HSA || this.state.typeExam === this.state.TSA) &&
              (
                <div className="input-group mb-0 ml-2" style={{width: "20%"}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">LINK PDF</span>
                  </div>
                  <input type="text" className="form-control"
                         value={tab.exam_link}
                         onChange={(e) => this._onChageInputLinkPdf(e, index)}
                         aria-label="Username"
                         aria-describedby="basic-addon1" style={{height: '100%'}}/>
                </div>
              )
            }

            {
              (this.state.typeExam === this.state.HSA || this.state.typeExam === this.state.TSA) &&
              (
                <div className="input-group mb-0 ml-12" style={{width: "20%"}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">THỜI GIAN</span>
                  </div>
                  <input type="number" className="form-control"
                         value={tab.exam_section_time}
                         onChange={(e) => this._onChageInputTime(e, index)}
                         aria-label="Username"
                         aria-describedby="basic-addon1" style={{height: '100%', maxWidth: '70px'}}/>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">PHÚT</span>
                  </div>
                </div>
              )
            }
          </div>
          {tab.exam_section_group.map((group, indexGroup) => (this.renderTabGroup(group, tab._id)))}
        </div>
      </div>);
    }
  }

  getNewIndexQuestion() {
    let vm = this
    let keyTab = null
    let idQuestion = null
    let resp = {}
    for (let i = 0; i < this.state.tabData.length; i++) {
      if (this.state.tabData[i].active === true && this.state.tabData[i].type === 'MANUAL') {
        keyTab = this.state.tabData[i].key
        idQuestion = this.state.tabData[i].listAnswer.length
        resp = {keyTab, idQuestion}
        break
      } else if (this.state.tabData[i].active === true && this.state.tabData[i].type === 'GROUP') {
        keyTab = this.state.tabData[i].key
        for (let j = 0; j < this.state.tabData[i].listSubject.length; j++) {
          if (this.state.tabData[i].listSubject[j].active === true) {
            idQuestion = this.state.tabData[i].listSubject[j].listQuestion.length
            break
          }
        }
        resp = {keyTab, idQuestion}
        break
      } else {
        keyTab = 0
        idQuestion = 0
        resp = {keyTab, idQuestion}
        break
      }
    }

    return resp

    // this.state.tabData.map((tab, index) => {
    //   if (tab.active === true && tab.type === 'DEFAULT') {
    //     keyTab = tab.key
    //     idQuestion = tab.listAnswer.length
    //     return {keyTab, idQuestion}
    //   } else if (tab.active === true && tab.type === 'GROUP') {
    //     keyTab = tab.key
    //     idQuestion = 0
    //     return {keyTab, idQuestion}
    //   } else {
    //     keyTab = 0
    //     idQuestion = 0
    //     return {keyTab, idQuestion}
    //   }
    // })
  }

  getQuestionNoNew(examSectionId, examSectionGroupId, examSectionSubjectId) {
    try {
      let tabNew = this.state.tabData
      if(tabNew === undefined || tabNew.length === 0){
        return 1
      }
      for (let i = 0; i < tabNew.length; i++) {
        if (tabNew[i]._id === examSectionId && tabNew[i].exam_section_type === 'DEFAULT') {
          if (tabNew[i].questions && tabNew[i].questions.length > 0) {
            return tabNew[i].questions.length + 1
          } else {
            return 1
          }
        } else if (tabNew[i]._id === examSectionId && tabNew[i].exam_section_type === 'GROUP_SUBJECT') {
          for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
            if (tabNew[i].exam_section_group[j]._id === examSectionGroupId) {
              for (let k = 0; k < tabNew[i].exam_section_group[j].subjects.length; k++) {
                if (tabNew[i].exam_section_group[j].subjects[k].subject_id === examSectionSubjectId) {
                  if (tabNew[i].exam_section_group[j].subjects[k].questions && tabNew[i].exam_section_group[j].subjects[k].questions.length > 0) {
                    return tabNew[i].exam_section_group[j].subjects[k].questions.length + 1
                  } else {
                    return 1
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error get question no new:", error);
      return 1
    }
  }


  async addNewQuestion(dataQuestion) {
    setLoader(true)
    let question = await this.createQuestionApi(dataQuestion)
    let tabNew = this.state.tabData
    for (let i = 0; i < tabNew.length; i++) {
      if (tabNew[i]._id === this.state.examSectionId && tabNew[i].exam_section_type === 'DEFAULT') {
        if (tabNew[i].questions && tabNew[i].questions.length > 0) {
          tabNew[i].questions.push(question)
        } else {
          tabNew[i].questions = [question]
        }
        break
      } else if (tabNew[i]._id === this.state.examSectionId && tabNew[i].exam_section_type === 'GROUP_SUBJECT') {
        for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
          if (tabNew[i].exam_section_group[j]._id === this.state.examSectionGroupId) {
            for (let k = 0; k < tabNew[i].exam_section_group[j].subjects.length; k++) {
              if (tabNew[i].exam_section_group[j].subjects[k].subject_id === dataQuestion.subject_id) {
                if (tabNew[i].exam_section_group[j].subjects[k].questions && tabNew[i].exam_section_group[j].subjects[k].questions.length > 0) {
                  tabNew[i].exam_section_group[j].subjects[k].questions.push(question)
                } else {
                  tabNew[i].exam_section_group[j].subjects[k].questions = [question]
                }
                break
              }
            }
            break
          }
        }
      }
    }
    this.setState({tabData: tabNew})
    setLoader(false)
  }

  async actionUpdateQuestion(dataQuestion) {
    setLoader(true)
    let question = await this.updateQuestionApi(dataQuestion)
    let tabNew = this.state.tabData
    for (let i = 0; i < tabNew.length; i++) {
      if (tabNew[i]._id === question.exam_section_id && tabNew[i].exam_section_type === 'DEFAULT') {
        if (tabNew[i].questions && tabNew[i].questions.length > 0) {
          for (let j = 0; j < tabNew[i].questions.length; j++) {
            if (tabNew[i].questions[j]._id === question._id) {
              tabNew[i].questions[j] = question
            }
          }
        }
        break
      } else if (tabNew[i]._id === question.exam_section_id && tabNew[i].exam_section_type === 'GROUP_SUBJECT') {
        for (let j = 0; j < tabNew[i].exam_section_group.length; j++) {
          if (tabNew[i].exam_section_group[j]._id === question.exam_section_group_id) {
            for (let k = 0; k < tabNew[i].exam_section_group[j].subjects.length; k++) {
              if (tabNew[i].exam_section_group[j].subjects[k].subject_id === dataQuestion.subject_id) {
                if (tabNew[i].exam_section_group[j].subjects[k].questions && tabNew[i].exam_section_group[j].subjects[k].questions.length > 0) {
                  for (let l = 0; l < tabNew[i].exam_section_group[j].subjects[k].questions.length; l++) {
                    if (tabNew[i].exam_section_group[j].subjects[k].questions[l]._id === question._id) {
                      tabNew[i].exam_section_group[j].subjects[k].questions[l] = question
                    }
                  }
                }
                break
              }
            }
            break
          }
        }
      }
    }
    this.setState({tabData: tabNew})
    setLoader(false)
  }

  fetchCategoryRows() {
    const {TN, HSA, APT, TSA} = this.state
    let loadiDeThi = [{
      _id: TN, name: 'Tốt nghiệp'
    }, {
      _id: HSA, name: 'HSA'
    }, {
      _id: APT, name: 'APT'
    }, {
      _id: TSA, name: 'TSA'
    }]
    // if (this.props.examCategories instanceof Array) {
    if (loadiDeThi instanceof Array) {
      return loadiDeThi.map((obj, i) => {
        return (<option value={obj._id} key={obj._id}>
          {obj.name}
        </option>);
      });
    }
  }

  async createQuestionApi(request) {
    setLoader(true)
    await this.props.createQuestion(request)
    let question = this.props.question
    return question
  }

  async updateQuestionApi(request) {
    setLoader(true)
    await this.props.updateQuestion(request)
    return this.props.question
  }

  async createNewExamApi() {
    setLoader(true)
    let data = {
      "name": this.state.name,
      "group": this.state.group,
      "level": this.state.level,
      "creating_type": this.state.type_question,
      "subject_id": this.state.subject_id, // "doc_link": "http://google.com/link_tai_lieu",
      // "doc_type": "GOOGLE_DRIVE",
      // "video_link": "http://link_video_tai_lieu.com/",
      "exam_doc_link": this.state.linkExam,
      "answer_doc_link": this.state.linkAnswer,
      "time": this.state.time,
      "is_redo": this.state.is_redo,
      "classroom_id": null,
      "is_pay_fee": true,
      // "categoryID": this.state.category_id,
      "type": this.state.typeExam,
      "point_true_false": (this.state.pointTrueFalse === true && this.state.typeExam === this.state.TN)? {
        "1": this.state.pointTrueFalse1,
        "2": this.state.pointTrueFalse2,
        "3": this.state.pointTrueFalse3,
        "4": this.state.pointTrueFalse4
      } : {}
    }
    await this.props.createExam(data)
    let examId = this.props.exam._id
    this.setState({examId})
    setLoader(false)
  }

  async handleUpdateExamApi() {
    try {
      setLoader(true)
      let data = {
        "id": this.state.examId,
        "name": this.state.name,
        "group": this.state.group,
        "level": this.state.level,
        "creating_type": this.state.type_question,
        "subject_id": this.state.subject_id,
        "time": this.state.time,
        "is_redo": this.state.is_redo,
        "classroom_id": null,
        "is_pay_fee": true,
        "type": this.state.typeExam,
        "exam_doc_link": this.state.linkExam,
        "answer_doc_link": this.state.linkAnswer,
        "point_true_false": this.state.pointTrueFalse === true ? {
          "1": this.state.pointTrueFalse1,
          "2": this.state.pointTrueFalse2,
          "3": this.state.pointTrueFalse3,
          "4": this.state.pointTrueFalse4
        } : {}
      }
      await this.props.updateExam(data)
    } catch (error) {
      console.error("Error loading exam details:", error);
    } finally {
      setLoader(false);
    }
  }

  async handleUpdateSectionApi(tab, index) {
    try {
      setLoader(true)
      let data = {
        "exam_section_id": tab._id,
        "exam_id": this.state.examId,
        "exam_section_order": index,
        "exam_section_name": tab.exam_section_name,
        "section_type": tab.section_type,
        "calculate_score_type": tab.calculate_score_type,
        "total_score": tab.total_score,
        "exam_section_time": tab.exam_section_time ? tab.exam_section_time : 0,
        "exam_link": tab.exam_link,
        "point_per_question": (tab.total_score > 0 && this.countTotalQuestion(tab) > 0 ) ?
        (tab.total_score / this.countTotalQuestion(tab)).toFixed(2) : 0
      }
      await this.props.updateSection(data)
    } catch (error) {
      console.error("Error update section:", error);
    } finally {
      setLoader(false);
    }
  }

  async createNewSectionApi() {
    setLoader(true)
    let data = {
      "exam_id": this.state.examId,
      "exam_section_order": this.state.tabData.length,
      "exam_section_name": this.state.newTabName,
      "section_type": this.state.sectionType,
      "calculate_score_type": 'total_point'
    }
    await this.props.createSection(data)
    setLoader(false)
  }

  async createGroupSectionApi(data) {
    setLoader(true)
    await this.props.createSection(data)
    setLoader(false)
  }


  render() {
    return (<div>
      <div className="page-content page-container page-exam-create" id="page-content">
        <div className="padding">
          {
            this.state.actionUser === "CREATE" && (
              <h2 className="text-md text-highlight sss-page-title">Tạo đề thi</h2>
            )
          }
          {
            this.state.actionUser === "UPDATE" && (
              <h2 className="text-md text-highlight sss-page-title">Cập nhật đề thi</h2>
            )
          }
          <div className="general-info block-item-content">
            <h3 className="title-block">Thông tin đề thi</h3>
            <div className="content input-group">

              <div className="form-group mr-32" style={{width: "144px"}}>
                <label className="text-form-label">Mã đề thi</label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    name="examId"
                    onChange={this._onChange}
                    value={this.state.examId}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group mb-0 mr-32" style={{width: "400px"}}>
                <label className="text-form-label">Tên đề thi</label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    onChange={this._onChange}
                    value={this.state.name}
                    ref={(input) => {
                      this.nameInput = input;
                    }}
                  />
                </div>
              </div>

              <div className="form-group mb-0 mr-32" style={{minWidth: "280px"}}>
                <label className="text-form-label">Loại đề thi</label>
                <div>
                  <select
                    className="custom-select"
                    value={this.state.typeExam}
                    name="typeExam"
                    onChange={this._onChange}
                  >
                    {/*<option value="">*/}
                    {/*  -- Chọn danh mục --*/}
                    {/*</option>*/}
                    {this.fetchCategoryRows()}
                  </select>
                </div>
              </div>

              <div className="form-group mb-0 mr-32" style={{minWidth: "280px"}}>
                <label className="text-form-label">Cho phép làm lại</label>
                <div>
                  <select
                    className="custom-select"
                    value={this.state.is_redo}
                    name="is_redo"
                    onChange={this._onChange}
                  >
                    <option value={false}>
                      Không cho phép
                    </option>
                    <option value={true}>
                      Cho phép làm lại
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-0 mr-32" style={{minWidth: "180px"}}>
                <label className="text-form-label">Nhóm đề</label>
                <div>
                  <select
                    className="custom-select"
                    value={this.state.group}
                    name="group"
                    onChange={this._onChange}
                  >
                    <option value={'MAC_DINH'}>
                      Mặc định
                    </option>
                    <option value={'THI_THU'}>
                      Đề thi thử
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div className="content input-group" style={{flexWrap: "nowrap", gap: "16px"}}>
              <div className="form-group mb-0" style={{width: "20%"}}>
                <label className="text-form-label">Lớp học</label>
                <div>
                  <select
                    className="custom-select"
                    value={this.state.level}
                    name="level"
                    onChange={this._onChange}
                  >
                    <option value="">-- LỚP HỌC</option>
                    <option value="1">Lớp 1</option>
                    <option value="2">Lớp 2</option>
                    <option value="3">Lớp 3</option>
                    <option value="4">Lớp 4</option>
                    <option value="5">Lớp 5</option>
                    <option value="6">Lớp 6</option>
                    <option value="7">Lớp 7</option>
                    <option value="8">Lớp 8</option>
                    <option value="9">Lớp 9</option>
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>
              <div className="form-group mb-0" style={{width: "20%"}}>
                <label className="text-form-label">Môn học</label>
                <div>
                  <select
                    className="custom-select"
                    value={this.state.subject_id}
                    name="subject_id"
                    onChange={this._onChange}
                    ref={(input) => {
                      this.subjectInput = input;
                    }}
                  >
                    <option value="">
                      -- Chọn môn học
                      --
                    </option>
                    {this.fetchRowsSubject()}
                  </select>
                </div>
              </div>
              {/*<div className="form-group mb-0" style={{width: "20%"}}>*/}
              {/*  <label className="text-form-label">Phương thức tạo câu hỏi</label>*/}
              {/*  <div>*/}
              {/*    <select*/}
              {/*      className="custom-select"*/}
              {/*      value={this.state.type_question}*/}
              {/*      name="type_question"*/}
              {/*      onChange={*/}
              {/*        this._onChange*/}
              {/*      }*/}
              {/*      ref={(input) => {*/}
              {/*        this.typeQuestionInput = input;*/}
              {/*      }}*/}
              {/*    >*/}
              {/*      <option value="">*/}
              {/*        -- Chọn phương thức*/}
              {/*        --*/}
              {/*      </option>*/}
              {/*      {this.fetchTypeQuestions()}*/}
              {/*    </select>*/}
              {/*  </div>*/}
              {/*</div>*/}
              {
                (this.state.typeExam === this.state.TN || this.state.typeExam == this.state.APT) &&
                (<div className="form-group mb-0 mr-32">
                  <label className="text-form-label">Thời gian (Phút)</label>
                  <div>
                    <input
                      min="0"
                      max="999"
                      ref={(input) => {
                        this.timeInput = input;
                      }}
                      type="number"
                      className="form-control"
                      name="time"
                      onChange={this._onChange}
                      value={this.state.time}
                    />
                  </div>
                </div>)
              }
              {
                // (this.state.typeExam === this.state.TN || this.state.typeExam == this.state.APT) &&
                (<div className="form-group mb-0 mr-32" style={{width: "200px"}}>
                  <label className="text-form-label">LINK ĐỀ THI PDF</label>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      name="linkExam"
                      onChange={this._onChange}
                      value={this.state.linkExam}
                    />
                  </div>
                </div>)
              }
              {
                (<div className="form-group mb-0 mr-32" style={{width: "auto"}}>
                  <label className="text-form-label">LINK ĐÁP ÁN PDF</label>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      name="linkAnswer"
                      onChange={this._onChange}
                      value={this.state.linkAnswer}
                    />
                  </div>
                </div>)
              }
              {
                (this.state.examId != '') && (
                  <button
                    name="reset"
                    value="1"
                    className="btn btn-primary flex-end"
                    style={{right: '0px', bottom: '0px', position: 'absolute'}}
                    onClick={() => this.handleUpdateExamApi()}
                  >
                    Cập nhật thông tin đề
                  </button>
                )
              }
            </div>
            {
              (this.state.typeExam === this.state.TN) &&
              (<div className="content input-group" style={{flexWrap: "nowrap", gap: "16px"}}>
                <div className="form-group mb-0 mt-4 row">
                  <div className="col-auto">
                    <label className="">Cấu hình thang điểm câu hỏi đúng sai</label>
                  </div>
                  <div className="col">
                    <label className="ui-switch ui-switch-md info m-t-xs">
                      <input
                        type="checkbox"
                        name="pointTrueFalse"
                        value={this.state.pointTrueFalse}
                        checked={this.state.pointTrueFalse === true ? 'checked' : ''}
                        onChange={this._onChangeSwitch}
                      />{' '}
                      <i/>
                    </label>
                  </div>
                </div>
              </div>)
            }
            {(this.state.typeExam === this.state.TN || this.state.typeExam === this.state.TSA) && this.state.pointTrueFalse === true && (
              <div className="content input-group" style={{flexWrap: "nowrap", gap: "16px"}}>
                <div className="form-group mb-0 row ml-2" style={{width: "800px"}}>
                  <div className="row col-6">
                    <span className="input-group-addon"><i>Trả lời đúng 1 ý</i></span>
                    <input
                      min="0"
                      max="99"
                      type="number"
                      className="form-control ml-2 mr-2"
                      name="pointTrueFalse1"
                      onChange={this._onChange}
                      value={this.state.pointTrueFalse1}
                      ref={(input) => {
                        this.nameInput = input;
                      }}
                      style={{width: "100px"}}
                    />
                    <span className="input-group-addon"><i> %</i></span>
                  </div>
                  <div className="row col-6">
                    <span className="input-group-addon"><i>Trả lời đúng 2 ý</i></span>
                    <input
                      min="0"
                      max="99"
                      type="number"
                      className="form-control ml-2 mr-2"
                      name="pointTrueFalse2"
                      onChange={this._onChange}
                      value={this.state.pointTrueFalse2}
                      ref={(input) => {
                        this.nameInput = input;
                      }}
                      style={{width: "100px"}}
                    />
                    <span className="input-group-addon"><i> %</i></span>
                  </div>
                  <div className="row col-6">
                    <span className="input-group-addon"><i>Trả lời đúng 3 ý</i></span>
                    <input
                      min="0"
                      max="99"
                      type="number"
                      className="form-control ml-2 mr-2"
                      name="pointTrueFalse3"
                      onChange={this._onChange}
                      value={this.state.pointTrueFalse3}
                      ref={(input) => {
                        this.nameInput = input;
                      }}
                      style={{width: "100px"}}
                    />
                    <span className="input-group-addon"><i> %</i></span>
                  </div>
                  <div className="row col-6">
                    <span className="input-group-addon"><i>Trả lời đúng 4 ý</i></span>
                    <input
                      min="0"
                      max="99"
                      type="number"
                      className="form-control ml-2 mr-2"
                      name="pointTrueFalse4"
                      onChange={this._onChange}
                      value={this.state.pointTrueFalse4}
                      ref={(input) => {
                        this.nameInput = input;
                      }}
                      style={{width: "100px"}}
                    />
                    <span className="input-group-addon"><i> %</i></span>
                  </div>
                </div>
              </div>)
            }
          </div>
          <ul className="nav nav-tabs">
            {this.state.tabData.map((tab, index) => (
              <li key={index + tab._id + 'li'}><a onClick={() => this.activeTab(tab._id)}
                                                  className={`text-uppercase btn no-border ${tab.active ? "btn-primary" : "btn-light"}`}
                                                  data-toggle="tab"
                                                  href={`#${tab._id}`}>{tab.exam_section_name}</a>
              </li>))}
            <button
              onClick={() => this.actionCreateTab()}
              data-toggle="tab"
              className="btn btn-icon btn-info"
              style={{minHeight: 32}}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus mx-2"
              >
                <line x1={12} y1={5} x2={12} y2={19}/>
                <line x1={5} y1={12} x2={19} y2={12}/>
              </svg>
            </button>
          </ul>
          <div className="block-exam block-item-content" style={{minHeight: '66vh'}}>
            {this.state.tabData.map((tab, index) => (this.renderTabs(tab, index)))}
            <div className="tab-content">
              <div id='Create-New-Tab'
                   className={`tab-pane fade ${this.state.statusTabCreate ? "in active show" : ""}`}>
                <div className="form-group mb-0 mr-32" style={{width: "20%"}}>
                  <label className="text-form-label">Tên phần thi</label>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      name="newTabName"
                      onChange={this._onChange}
                      value={this.state.newTabName}
                    />
                  </div>
                </div>
                <div className="form-group mb-0 mt-2" style={{width: "20%"}}>
                  <label className="text-form-label">LOẠI PHẦN THI</label>
                  <div>
                    <select
                      className="custom-select"
                      value={this.state.sectionType}
                      name="sectionType"
                      onChange={this._onChange}
                    >
                      {/*<option value="">Loại phần thi</option>*/}
                      <option value="DEFAULT" active>Mặc định</option>
                      <option value="GROUP_SUBJECT">Nhóm chủ đề</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => this.createNewTab()}
                  data-toggle="tab"
                  className="btn btn-primary mt-2"
                >
                  Thêm mới phần thi
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-plus mx-2"
                  >
                    <line x1={12} y1={5} x2={12} y2={19}/>
                    <line x1={5} y1={12} x2={19} y2={12}/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div
        id='create'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion1
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='create2'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion2
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='create3'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion3
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='create4'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion4
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='create5'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion5
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='create6'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalQuestion6
                examId={this.state.examId}
                examSectionId={this.state.examSectionId}
                examSectionGroupId={this.state.examSectionGroupId}
                examSectionSubjectId={this.state.examSectionSubjectId}
                questionNo={this.state.questionNo}
                actionCreateQuestion={(data) => this.addNewQuestion(data)}
                actionUpdateQuestion={(data) => this.actionUpdateQuestion(data)}
                actionQuestion={this.state.actionQuestion}
                currentQuestionvalue={this.state.currentQuestionvalue}
              />
            </div>
          </div>
        </div>
      </div>


      <div
        id='createGroup'
        className='modal fade'
        data-backdrop='true'
        style={{
          display: "none", minWidth: "50vh", zIndex: 1050
        }}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down modal-lg'
          data-class='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-body'>
              <ModalGroupQuestion uniqueKey={this.getKeyTabActive() + ''}
                                  createGroupQuestion={(subject, data) => this.createGroupQuestion(subject, data)}
                                  updateGroupQuestion={(subject, data) => this.updateGroupQuestion(subject, data)}
                                  actionGroup={this.state.actionGroup}
                                  groupDetail={this.state.groupDetail}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        id='delete-question'
        className='modal fade'
        data-backdrop='true'
        style={{display: "none"}}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down'
          data-classname='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <div className='modal-title text-md'>
                Thông báo
              </div>
              <button
                className='close'
                data-dismiss='modal'
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='p-4 text-center'>
                <p>
                  Bạn chắc chắn muốn xóa bản
                  ghi này chứ?
                </p>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-light'
                data-dismiss='modal'
              >
                Đóng
              </button>
              <button
                type='button'
                onClick={() => this.handleDeleteQuestionApi()}
                className='btn btn-danger'
                data-dismiss='modal'
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      </div>


      <div
        id='delete-group-question'
        className='modal fade'
        data-backdrop='true'
        style={{display: "none"}}
        aria-hidden='true'
      >
        <div
          className='modal-dialog animate fade-down'
          data-classname='fade-down'
        >
          <div className='modal-content'>
            <div className='modal-header'>
              <div className='modal-title text-md'>
                Thông báo
              </div>
              <button
                className='close'
                data-dismiss='modal'
              >
                ×
              </button>
            </div>
            <div className='modal-body'>
              <div className='p-4 text-center'>
                <p>
                  Bạn chắc chắn muốn xóa nhóm câu hỏi này chứ?
                </p>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-light'
                data-dismiss='modal'
              >
                Đóng
              </button>
              <button
                type='button'
                onClick={() => this.handleDeleteGroupQuestionApi()}
                className='btn btn-danger'
                data-dismiss='modal'
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="block-action-footer justify-content-center mt-2 m-0" style={{display: "none"}}>
        <button
          type="button"
          className="btn btn-info mr-2"
          data-toggle="modal"
          data-target="#create"
          id="create-update"
          data-toggle-class="fade-down"
          data-toggle-class-target=".animate"
          title="Trắc nghiệm"
        >
          <img src="/assets/img/icon-add.svg" className="ml-10" alt=""/>
          Trắc nghiệm
        </button>


        <button
          type="button"
          className="btn btn-info mr-2"
          data-toggle='modal'
          data-target='#create2'
          id="create-update2"
          data-toggle-class='fade-down'
          data-toggle-class-target='.animate'
          title='Trắc nghiệm đúng sai'
        >
          <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
          Trắc nghiệm đúng sai
        </button>

        <button
          id="create-update3"
          type="button"
          className="btn btn-info mr-2"
          data-toggle='modal'
          data-target='#create3'
          data-toggle-class='fade-down'
          data-toggle-class-target='.animate'
        >
          <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
          Điền số/Trả lời ngắn
        </button>

        <button
          id="create-update4"
          type="button"
          className="btn btn-info mr-2"
          data-toggle='modal'
          data-target='#create4'
          data-toggle-class='fade-down'
          data-toggle-class-target='.animate'
        >
          <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
          Kéo thả
        </button>

        <button
          id="create-update5"
          type="button"
          className="btn btn-info mr-2"
          data-toggle='modal'
          data-target='#create5'
          data-toggle-class='fade-down'
          data-toggle-class-target='.animate'
        >
          <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
          TN nhiều đáp án
        </button>

        <button
          id="create-update6"
          type="button"
          className="btn btn-info mr-2"
          data-toggle='modal'
          data-target='#create6'
          data-toggle-class='fade-down'
          data-toggle-class-target='.animate'
        >
          <img src='/assets/img/icon-add.svg' className='ml-10' alt=''/>
          Đúng/sai
        </button>
        {/* Repeat similar buttons for other actions */}
      </div>

    </div>);
  }
}

function mapStateToProps(state) {
  return {
    // redirect: state.exam.redirect,
    subjects: state.subject.subjects,
    token: state.auth.token, // questions: state.question.questions,
    // examQuestions: state.question.examQuestions,
    // ids: state.question.ids,
    // configs: state.category.configs,
    // chapter_ids: state.category.chapter_ids,
    question: state.examV2.question,
    exam: state.examV2.exam,
    detail: state.examV2.detail,
    section: state.examV2.section,
    examCategories: state.examCategory.examCategories,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    listSubject,
    listExamCategory,
    createExam,
    updateExam,
    createQuestion,
    updateQuestion,
    createSection,
    updateSection,
    detailExam,
    deleteQuestion,
    deleteGroup,
    deleteSection,
    updateGroupQuestionf
  }, dispatch);
}

let ExamsCreateContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(ExamNewCreate));

export default ExamsCreateContainer;
