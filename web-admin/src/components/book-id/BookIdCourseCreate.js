import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listSubject } from "../../redux/subject/action";
import { createBook } from "../../redux/book-id-course/action";
import { listClassroomGroup } from "../../redux/classroomgroup/action";
import { listBookCategory } from "../../redux/book/action";
import { listStudent } from "../../redux/student/action";
import { uploadImage, listCategory, updateMetaDataCategory } from "../../redux/category/action";
import { DatePicker } from "antd";
import moment from "moment";
import baseHelpers from "../../helpers/BaseHelpers";

import { listChapter, updateMetaDataChapter } from "../../redux/chapter/action";
import ChapterItemList from "../lesson/Components/ChapterItemList";


import ModalEditLesson from "../lesson/Components/ModalEditLesson";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { map } from "lodash";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import Swal from 'sweetalert2';
import "antd/dist/antd.css";

import {
  Book,           // Sách / tài liệu
  FileText,       // File, văn bản
  Clock,
  FilePlus,        // Đồng hồ
  PlusSquare,     // Nút thêm
  Play,           // Nút play
  Image,          // Hình ảnh
  Link as LinkIcon,           // Liên kết
  BarChart,       // Biểu đồ / thống kê
  Video,          // Video
  Star,           // Ngôi sao / nổi bật
  Users,          // Người dùng / nhóm
  Menu,           // 3 gạch ngang (handle kéo thả)
  CheckSquare,    // Nhiệm vụ / task (thay cho FaTasks)
  ListChecks,     // Danh sách có dấu tick
  Layers,         // Các lớp, có thể dùng cho cấu trúc module
  Info,           // Biểu tượng thông tin
  BookOpen,       // Quyển sách mở (dạng đọc)
  FolderPlus,
  Trash      // Thêm thư mục / chủ đề
} from "lucide-react";

const ICON_COMPONENTS = [
  <Book
    style={{
      fontSize: '28px',
    }}
    strokeWidth={1.75}
  />,
  <Play
    style={{
      fontSize: '28px',
    }}
    strokeWidth={1.75}
  />,
  <CheckSquare
    style={{
      fontSize: '28px',
    }}
    strokeWidth={1.75}
  />,
  <Clock
    style={{
      fontSize: '28px',
    }}
    strokeWidth={1.75}
  />,
];

const ICON_LIST = [
  // Học liệu & bài học
  { component: <Book size={22} />, index: 0 },
  { component: <BookOpen size={22} />, index: 1 },
  { component: <FileText size={22} />, index: 2 },

  // Trạng thái & tiến trình
  { component: <Clock size={22} />, index: 3 },
  { component: <CheckSquare size={22} />, index: 4 },
  { component: <ListChecks size={22} />, index: 5 },

  // Hành động & tương tác
  { component: <PlusSquare size={22} />, index: 6 },
  { component: <Play size={22} />, index: 7 },
  { component: <Menu size={22} />, index: 8 },

  // Nội dung & đa phương tiện
  { component: <Image size={22} />, index: 9 },
  { component: <Video size={22} />, index: 10 },
  { component: <LinkIcon size={22} />, index: 11 },

  // Thống kê & thông tin
  { component: <BarChart size={22} />, index: 12 },
  { component: <Info size={22} />, index: 13 },
  { component: <Star size={22} />, index: 14 },

  // Người dùng & nhóm
  { component: <Users size={22} />, index: 15 },

  // Cấu trúc & chủ đề
  { component: <FolderPlus size={22} />, index: 16 },
  { component: <Layers size={22} />, index: 17 },
];

// Icon mapping for courseIncludes
const INCLUDE_ICON_MAP = {
  Book,
  BookOpen,
  FileText,
  Clock,
  CheckSquare,
  ListChecks,
  PlusSquare,
  Play,
  Menu,
  Image,
  Video,
  Link: LinkIcon,
  BarChart,
  Info,
  Star,
  Users,
  FolderPlus,
  Layers,
  Trash
};


class BookIdCourseCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      showDialog: false,
      code: "",
      name: "",
      subject_id: "",
      numberStudent: "",
      constantData: [
        {
          id: 1,
          icon: 0,
          label: 'Số chuyên đề:',
          placeholder: 'Ví dụ: 20+ Chuyên đề',
          value: '',
        },
        {
          id: 2,
          icon: 1,
          label: 'Số bài học:',
          placeholder: 'Ví dụ: 150+ Bài học',
          value: '',
        },
        {
          id: 3,
          icon: 2,
          label: 'Số bài tập:',
          placeholder: 'Ví dụ: 200+ Bài tập',
          value: '',
        },
        {
          id: 4,
          icon: 3,
          label: 'Số giờ học:',
          placeholder: 'Ví dụ: 400+ Giờ học',
          value: '',
        },
      ],
      courseIncludes: [],
      courseIncludesInput: "",
      featuredInformation: [],
      mainIcon: null,
      featuredInformationInput: "",
      editingCourseIncludeId: null,
      editingCourseIncludeText: "",
      editingCourseIncludeIconId: null,
      teacher_id: "",
      group_id: "",
      teacher: "",
      room: "",
      note: "",
      description: "",
      video_intro: "",
      content: "",
      files: [],
      next_classrooms: null,
      hp_day: "",
      hp_1month_day: "",
      hp_3month_day: "",
      hp_6month_day: "",
      hp_12month_day: "",
      is_cadup: false,
      is_auto_diff_day: false,
      is_online: false,
      is_featured: false,
      status: false,
      extra_number_student: 0,
      link_fb_page: "",
      link_fb_group: "",
      promotion: {
        from_date: null,
        to_date: null,
        type: "BY_DATE_RANGE",
        hour: 0,
        note: ""
      },
      level: null,
      quantity: 0,
      chapters: [],
      ordering: 0,
      price: "",
      origin_price: "",
      listBookAttacheds: [],
      listBookRelates: [],
      listClassroomRelates: [],
      listClassroomAttacheds: [],
      avtPreview: "",
      isOpen: false,
      categories: [],
      selectedChapterId: null,
      timeCourse: {
        opening_date: null,
        closing_date: null,
      },
      // -----------------chapter by lesson------------------------------
      selectedChapters: [],
      selectedCateId: null,
      is_open: false,
      search_chapter: "",
      group: [],
      activeGroupId: null,
      isAddGroupModalOpen: false,
      isEditGroupModalOpen: false,
      isEditGroupMode: false,
      editingTitle: "",
      editingGroupId: null,
      editingGroupTitle: "",
    };
    this.inputRef = React.createRef();
  }

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listSubject(data);
    await this.props.listBookCategory(data);

    // Khôi phục dữ liệu từ session nếu có
    const savedChapters = sessionStorage.getItem("temp_selectedChapters");
    const savedGroups = sessionStorage.getItem("temp_groups");
    const savedActiveGroup = sessionStorage.getItem("temp_activeGroupId");

    if (savedChapters) {
      this.setState({ selectedChapters: JSON.parse(savedChapters) });
    }
    if (savedGroups) {
      this.setState({ group: JSON.parse(savedGroups) });
    }
    if (savedActiveGroup) {
      this.setState({ activeGroupId: JSON.parse(savedActiveGroup) });
    }
  }

  _onChange = async (e) => {
    var name = e.target.name;
    var value = e.target.value;
    let checked = e.target.checked;
    let avtPreview = "";

    if (name === "is_featured" || name === "status") {
      value = checked;
    }

    if (name === "files") {

      value = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
          avtPreview = reader.result;
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });
      value = [value];
      this.setState({
        [name]: value,
        avtPreview: avtPreview
      });
    } else {
      this.setState({
        [name]: value,
      });
    }


    if (name === "subject_id") {
      let params = {};

      if (value) {
        params = {
          subject_id: value,
          limit: 100,
        };
        await this.props.listChapter(params);
        params = {
          is_show_home: true,
          limit: 100,
        };
        await this.props.listClassroomGroup(params);


        params = {
          user_group: "TEACHER",
          subject_id: value,
          limit: 100,
        };
        await this.props.listStudent(params);

        if (this.props.chapters) {
          this.setState({
            chapters: this.props.chapters
          })
        }
      }
    }
  };

  _onChangeTypePromotion = async (e) => {

    let { name, value } = e.target;

    this.setState({
      promotion: {
        ...this.state.promotion,
        [name]: value
      }
    })
  }
  handleEditFeaturedInformation = (item) => {
    this.setState({
      editingItemId: item.id,
      editingText: item.text
    });
  };

  handleSaveFeaturedInformation = (id) => {
    const { editingText } = this.state;
    const text = editingText.trim();

    if (text === "") return;

    this.setState((prevState) => ({
      featuredInformation: prevState.featuredInformation.map((item) =>
        item.id === id ? { ...item, text: text } : item
      ),
      editingItemId: null,
      editingText: ""
    }));
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.categories != nextProps.categories) {
      this.setState({
        categories: nextProps.categories
      })
    }
  }

  // handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const data = {
  //     code: this.state.code,
  //     name: this.state.name,
  //     subject_id: this.state.subject_id,
  //     group_id: this.state.group_id,
  //     teacher_id: this.state.teacher_id,
  //     teacher: this.state.teacher,
  //     room: this.state.room,
  //     note: this.state.note,
  //     files: this.state.files,
  //     hp_day: this.state.hp_day,
  //     hp_1month_day: this.state.hp_1month_day,
  //     hp_3month_day: this.state.hp_3month_day,
  //     hp_6month_day: this.state.hp_6month_day,
  //     hp_12month_day: this.state.hp_12month_day,
  //     is_cadup: this.state.is_cadup,
  //     is_online: this.state.is_online,
  //     is_featured: this.state.is_featured,
  //     video_intro: this.state.video_intro,
  //     status: this.state.status,
  //     extra_number_student: this.state.extra_number_student,
  //     ordering: this.state.ordering
  //   };
  //   data.description = this.state.description.toString();
  //   data.content = this.state.content.toString();

  //   await this.props.createBook(data);
  //   if (this.props.redirect === true) {
  //     await this.props.history.push("/classroom");
  //   }
  // };

  fetchTeacherRows() {
    if (this.props.students instanceof Array) {
      return this.props.students.map((obj, i) => {
        return (
          <option value={obj._id} key={obj._id.toString()}>
            {obj.fullname}
          </option>
        );
      });
    }
  }


  getIconIndex = (iconComponent) => {
    if (!iconComponent) return -1;

    const iconType = iconComponent.type;

    // Học liệu & bài học
    if (iconType === Book) return 0;
    if (iconType === BookOpen) return 1;
    if (iconType === FileText) return 2;

    // Trạng thái & tiến trình
    if (iconType === Clock) return 3;
    if (iconType === CheckSquare) return 4;
    if (iconType === ListChecks) return 5;

    // Hành động & tương tác
    if (iconType === PlusSquare) return 6;
    if (iconType === Play) return 7;
    if (iconType === Menu) return 8;

    // Nội dung & đa phương tiện
    if (iconType === Image) return 9;
    if (iconType === Video) return 10;
    if (iconType === LinkIcon) return 11;

    // Thống kê & thông tin
    if (iconType === BarChart) return 12;
    if (iconType === Info) return 13;
    if (iconType === Star) return 14;

    // Người dùng & nhóm
    if (iconType === Users) return 15;

    // Cấu trúc & chủ đề
    if (iconType === FolderPlus) return 16;
    if (iconType === Layers) return 17;

    return -1; // fallback nếu không khớp
  };

  getIconKey = (iconComponent) => {
    if (!iconComponent) return 'Book';

    const iconType = iconComponent.type;

    // Học liệu & bài học
    if (iconType === Book) return 'Book';
    if (iconType === BookOpen) return 'BookOpen';
    if (iconType === FileText) return 'FileText';

    // Trạng thái & tiến trình
    if (iconType === Clock) return 'Clock';
    if (iconType === CheckSquare) return 'CheckSquare';
    if (iconType === ListChecks) return 'ListChecks';

    // Hành động & tương tác
    if (iconType === PlusSquare) return 'PlusSquare';
    if (iconType === Play) return 'Play';
    if (iconType === Menu) return 'Menu';

    // Nội dung & đa phương tiện
    if (iconType === Image) return 'Image';
    if (iconType === Video) return 'Video';
    if (iconType === LinkIcon) return 'Link';

    // Thống kê & thông tin
    if (iconType === BarChart) return 'BarChart';
    if (iconType === Info) return 'Info';
    if (iconType === Star) return 'Star';

    // Người dùng & nhóm
    if (iconType === Users) return 'Users';

    // Cấu trúc & chủ đề
    if (iconType === FolderPlus) return 'FolderPlus';
    if (iconType === Layers) return 'Layers';

    return 'Book'; // fallback
  };

  getIconComponentFromKey = (iconKey) => {
    const IconComponent = INCLUDE_ICON_MAP[iconKey] || Book;
    return <IconComponent size={22} />;
  };

  handleSubmit = async (e) => {
    let { promotion, listBookAttacheds, selectedChapters, listBookRelates, listClassroomRelates, listClassroomAttacheds, timeCourse, featuredInformation, courseIncludes, constantData } = this.state;

    const isFeaturedEmpty = !featuredInformation || featuredInformation.length === 0;

    // 🔹 Kiểm tra riêng từng phần
    const isConstantDataEmpty = constantData.every(item => !item.value || item.value.trim() === '');
    const isIncludesEmpty = !courseIncludes || courseIncludes.length === 0;

    // 🔹 Chỉ báo “Khoá học bao gồm chưa có mục nào” nếu cả 2 đều trống
    const isCourseIncludesEmpty = isConstantDataEmpty && isIncludesEmpty;

    if (isFeaturedEmpty || isCourseIncludesEmpty) {
      let htmlMessage = "<div style='text-align:left'>";
      htmlMessage += "<p>Một số thông tin còn trống:</p><ul>";

      if (isFeaturedEmpty) htmlMessage += "<li>Thông tin nổi bật chưa có nội dung.</li>";
      if (isCourseIncludesEmpty) htmlMessage += "<li>Khoá học bao gồm chưa có mục nào.</li>";

      htmlMessage += "</ul><p>Bạn có chắc chắn muốn tiếp tục lưu không?</p></div>";

      const result = await Swal.fire({
        title: "Xác nhận lưu dữ liệu?",
        html: htmlMessage,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Tiếp tục lưu",
        cancelButtonText: "Huỷ",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return; // ❌ Người dùng bấm Huỷ
      }

    }

    const constantDataProcessed = constantData.map(item => ({
      id: item.id,
      text: item.value || '', // Lấy value từ constantData
      icon: item.icon // Giữ nguyên số từ 0-3
    }));

    // Xử lý courseIncludes  
    const courseIncludesProcessed = courseIncludes.map(item => ({
      id: item.id,
      text: item.text || '', // Đảm bảo có text
      icon: this.getIconIndex(item.mainIcon), // Lưu index của icon (backward compatibility)
      iconKey: item.iconKey || this.getIconKey(item.mainIcon) // Lưu iconKey cho frontend
    }));

    const finalData = [...constantDataProcessed, ...courseIncludesProcessed];

    e.preventDefault();
    const data = {
      code: this.state.code,
      price: this.state.price ? this.state.price : this.state.origin_price,
      origin_price: this.state.origin_price,
      quantity: this.state.quantity,
      highlightInformations: featuredInformation,
      includes: finalData,
      name: this.state.name,
      student_owned: this.state.numberStudent,
      promotion: this.state.promotion,
      subject_id: this.state.subject_id,
      group_id: this.state.group_id,
      teacher_id: this.state.teacher_id,
      teacher: this.state.teacher,
      room: this.state.room,
      note: this.state.note,
      hp_day: this.state.hp_day,
      files: this.state.files,
      hp_1month_day: this.state.hp_1month_day,
      hp_3month_day: this.state.hp_3month_day,
      hp_6month_day: this.state.hp_6month_day,
      hp_12month_day: this.state.hp_12month_day,
      is_cadup: this.state.is_cadup,
      is_auto_diff_day: this.state.is_auto_diff_day,
      is_online: this.state.is_online,
      is_featured: this.state.is_featured,
      video_intro: this.state.video_intro,
      status: this.state.status,
      extra_number_student: this.state.extra_number_student,
      link_fb_group: this.state.link_fb_group,
      link_fb_page: this.state.link_fb_page,
      ordering: this.state.ordering,
      level: this.state.level,
      book_attached: listBookAttacheds ? listBookAttacheds.map(item => item.id) : [],
      book_relates: listBookRelates ? listBookRelates.map(item => item.id) : [],
      classroom_relates: listClassroomRelates ? listClassroomRelates.map(item => item.id) : [],
      classroom_attached: listClassroomAttacheds ? listClassroomAttacheds.map(item => item.id) : [],
      search_chapter: "",
      timeCourse: timeCourse,
    };

    console.log("Dữ liệu gửi đi:", JSON.stringify(data, null, 2));

    let chapterDatas = [];
    if (selectedChapters && selectedChapters.length > 0) {
      selectedChapters.map((item, index) => {
        let chapterData = {
          id: item._id,
          name: item.name,
          ordering: index + 1,
        };

        // Thêm selected_subject_id nếu có
        if (item.selected_subject_id) {
          chapterData.selected_subject_id = item.selected_subject_id;
        }

        // Thêm group.id nếu có
        const matchingGroup = this.state.group?.find(g => g.id === item.group_id);
        if (matchingGroup) {
          chapterData.group_id = matchingGroup.id;
        }

        chapterDatas.push(chapterData);
      })

      data.chapters = chapterDatas;
    }

    data.group_chapter = this.state.group || [];
    data.description = this.state.description.toString();
    data.content = this.state.content.toString();
    await this.props.createBook(data);

    if (this.props.redirect) {
      // Xóa session sau khi lưu thành công
      sessionStorage.removeItem("temp_selectedChapters");
      sessionStorage.removeItem("temp_groups");
      sessionStorage.removeItem("temp_activeGroupId");
      this.props.history.push("/book-id-course");
    }
  };

  fetchRows() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return (
          <option value={obj._id} key={obj._id.toString()}>
            {obj.name}
          </option>
        );
      });
    }
  }

  fetchGroupRows() {
    if (
      this.props.classroomGroups &&
      this.props.classroomGroups instanceof Array
    ) {
      return this.props.classroomGroups.map((obj, i) => {
        return (
          <option value={obj._id} key={obj._id.toString()}>
            {obj.name}
          </option>
        );
      });
    }
  }

  processLatexInContent = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    let processedContent = htmlContent;

    // Decode HTML entities to handle raw LaTeX characters correctly
    const textarea = document.createElement('textarea');
    textarea.innerHTML = processedContent;
    processedContent = textarea.value;

    const delimiters = [
      { start: '\\[', end: '\\]', display: true },
      { start: '\\(', end: '\\)', display: false },
      { start: '$$', end: '$$', display: true },
      { start: '$', end: '$', display: false },
    ];

    delimiters.forEach(({ start, end }) => {
      try {
        const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedStart + '([\\s\\S]*?)' + escapedEnd, 'g');

        processedContent = processedContent.replace(regex, (match, latex) => {
          try {
            let cleanedLatex = String(latex).trim();
            // Aggressively remove trailing backslashes and surrounding whitespace
            while (cleanedLatex && cleanedLatex.endsWith('\\') && !cleanedLatex.endsWith('\\\\')) {
              cleanedLatex = cleanedLatex.slice(0, -1).trim();
            }

            if (!cleanedLatex) return match;

            const rendered = katex.renderToString(cleanedLatex, {
              output: "html",
              throwOnError: false,
            });

            const escapedLatex = String(cleanedLatex).replace(/"/g, '&quot;');
            const renderedWithAttr = rendered.replace(
              '<span class="katex"',
              `<span class="katex" data-latex="${escapedLatex}"`
            );

            return `<span class="math-symbol" data-latex="${escapedLatex}" contenteditable="false">${renderedWithAttr}</span>`;
          } catch (error) {
            console.error("LaTeX render error:", error, "LaTeX:", latex);
            return match;
          }
        });
      } catch (error) {
        console.error("Regex creation error:", error);
      }
    });

    return processedContent;
  };

  _handleEditorContentChange = (content) => {
    if (this._isSettingContent) return;

    const processedContent = this.processLatexInContent(content);
    this.setState({ content: processedContent });

    if (processedContent !== content && /(\\\\\(|\\\\\[|\$\$|\$)/.test(content)) {
      this._isSettingContent = true;
      setTimeout(() => {
        this._isSettingContent = false;
      }, 0);
    }
  };

  _handleEditorDescriptionChange = (content) => {
    if (this._isSettingDescription) return;

    const processedContent = this.processLatexInContent(content);
    this.setState({ description: processedContent });

    if (processedContent !== content && /(\\\\\(|\\\\\[|\$\$|\$)/.test(content)) {
      this._isSettingDescription = true;
      setTimeout(() => {
        this._isSettingDescription = false;
      }, 0);
    }
  };

  handleImageUploadBefore = async (files, info, uploadHandler) => {
    const data = new FormData();
    data.append("files", files[0]);

    await this.props.uploadImage(data);
    const response = {
      result: [{
        url: this.props.image,
        name: files[0].name,
        size: files[0].size
      }]
    };
    await uploadHandler(response);
  };

  changeDateStart = (date, dateString) => {
    if (date !== null) {
      this.setState({
        promotion: {
          ...this.state.promotion,
          from_date: date.format("YYYY/MM/DD HH:mm"),
        }
      });
    } else {
      this.setState({
        promotion: {
          ...this.state.promotion,
          from_date: null,
        }
      });
    }
  };

  changeDateEnd = (date, dateString) => {
    if (date !== null) {
      this.setState({
        promotion: {
          ...this.state.promotion,
          to_date: date.format("YYYY/MM/DD HH:mm"),
        }
      });
    } else {
      this.setState({
        promotion: {
          ...this.state.promotion,
          to_date: null,
        }
      });
    }
  };

  changeTimeCourse = (date, fieldName) => {
    this.setState(prevState => ({
      timeCourse: {
        ...prevState.timeCourse,
        [fieldName]: date ? date.format('YYYY-MM-DD') : null,
      }
    }));
  }


  // ----------------------------new code---------------------------------

  fetchSubjectRows() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return <option key={i} value={obj._id}>{obj.name}</option>;
      });
    }
  }

  // fetchCategoryRows() {
  //   if (this.props.bookCategories instanceof Array) {
  //     return this.props.bookCategories.map((obj, i) => {
  //       return <option key={i} value={obj._id}>{obj.name}</option>;
  //     });
  //   }
  // }

  handleAddBookAttached = async (data) => {
    let dataList = [...this.state.listBookAttacheds];
    if (data) {
      dataList.push(data);
    }

    await this.setState({
      listBookAttacheds: dataList
    })
  }

  handleAddBookRelate = async (data) => {
    let dataList = [...this.state.listBookRelates];
    if (data) {
      dataList.push(data);
    }


    await this.setState({
      listBookRelates: dataList
    })

  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragEndInCludes = (result) => {
    if (!result.destination) return;

    const items = Array.from(this.state.courseIncludes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    this.setState({ courseIncludes: items });
  };


  onDragEndInformation = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const items = Array.from(this.state.featuredInformation);
    const [moved] = items.splice(source.index, 1);
    items.splice(destination.index, 0, moved);

    this.setState({ featuredInformation: items });
  };

  onDragEndBookAttached = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state.listBookAttacheds,
      result.source.index,
      result.destination.index
    );

    await this.setState({
      listBookAttacheds: items,
    });
  }

  handleRemoveBookAttached = async (item) => {
    let dataRemove = [];
    let { listBookAttacheds } = this.state;


    if (listBookAttacheds) {
      dataRemove = listBookAttacheds.filter(value => value.id !== item.id);
    }

    this.setState({
      listBookAttacheds: dataRemove
    })
  }

  handleSetIsNotOpenBlock = () => {
    this.setState({
      isOpen: false
    })
  }

  getListCategory = async (id) => {
    let data = {};
    if (id) {
      data = {
        chapter_id: id,
        is_sort_ordering: true,
      };
    }
    await this.props.listCategory(data);

    await this.setState({
      selectedChapterId: id,
      isOpen: true
    })
  }

  onDragEndCategory = async (result) => {
    if (!result.destination) {
      return;
    }

    let { categories } = this.state;

    let data = [];

    const items = this.reorder(
      categories,
      result.source.index,
      result.destination.index
    );

    if (items) {
      map(items, (_item, _index) => {

        let dataItem = {
          ordering: parseInt(_index + 1),
          id: _item._id
        };
        data.push(dataItem);

      })

      if (data && data.length > 0) {
        await this.props.updateMetaDataCategory(data);
      }

      // this.props.handleChangeCategories(items);

      await this.setState({
        categories: items
      })
    }

  }

  handleAddChapter = async (data, groupID) => {
    const { group, activeGroupId, selectedChapters } = this.state;
    let targetGroupId;

    if (activeGroupId) {
      targetGroupId = activeGroupId;
    } else if (groupID) {
      targetGroupId = groupID;
      this.setActiveGroup(targetGroupId);
    } else {
      const existingGroup = group && group.length > 0 ? group[0] : null;
      if (existingGroup) {
        targetGroupId = existingGroup.id;
        this.setActiveGroup(targetGroupId);
      } else {
        targetGroupId = await this.addGroupChapter("Nhóm Mới");
      }
    }

    let chapters = [...selectedChapters];
    if (data) {
      const newChapter = {
        ...data,
        group_id: targetGroupId
      };
      chapters.push(newChapter);
    }

    await this.setState({
      selectedChapters: chapters
    });
    sessionStorage.setItem("temp_selectedChapters", JSON.stringify(chapters));
  }

  // Method để xử lý khi chọn môn học cho chapter
  handleSubjectChangeForChapter = async (chapterId, subjectId) => {
    const { selectedChapters } = this.state;

    console.log('Cập nhật môn học cho chapter:', chapterId, 'với subject_id:', subjectId);

    // Tìm và cập nhật chapter với subject_id mới
    const updatedChapters = selectedChapters.map(chapter => {
      if (chapter._id === chapterId) {
        return {
          ...chapter,
          selected_subject_id: subjectId // Thêm field selected_subject_id
        };
      }
      return chapter;
    });

    // Cập nhật state
    await this.setState({
      selectedChapters: updatedChapters
    });

    console.log('selectedChapters đã được cập nhật:', updatedChapters);
  }

  handleGroupChangeForChapter = async (chapterId, groupId) => {
    const { selectedChapters } = this.state;

    const updatedChapters = selectedChapters.map((chapter) => {
      if (chapter._id === chapterId) {
        return {
          ...chapter,
          group_id: groupId
        };
      }
      return chapter;
    });

    await this.setState({ selectedChapters: updatedChapters });
  }

  openModalAddGroupChapter = () => {
    this.addGroupChapter(); // Add directly without modal
  };
  closeModalAddGroupChapter = () => {
    this.setState({
      isAddGroupModalOpen: false,
      newGroupTitle: '',
    });
  };
  addGroupChapter = async (title) => {
    const safeTitle = title && title.trim() !== ''
      ? title.trim()
      : 'Nhóm Mới';

    const currentGroups = this.state.group || [];
    const newId = currentGroups.length > 0
      ? Math.max(...currentGroups.map(g => g.id)) + 1
      : 1;
    const newOrderno = currentGroups.length > 0
      ? Math.max(...currentGroups.map(g => g.orderno || 0)) + 1
      : 1;

    const newGroup = { id: newId, title: safeTitle, orderno: newOrderno };
    const updatedGroups = [...currentGroups, newGroup];

    await this.setState({
      group: updatedGroups,
      activeGroupId: newGroup.id,
      isAddGroupModalOpen: false,
      newGroupTitle: '',
    });
    sessionStorage.setItem("temp_groups", JSON.stringify(updatedGroups));
    sessionStorage.setItem("temp_activeGroupId", JSON.stringify(newGroup.id));
    return newGroup.id;
  };
  setActiveGroup = (groupId) => {
    this.setState({
      activeGroupId: groupId,
    });
    sessionStorage.setItem("temp_activeGroupId", JSON.stringify(groupId));
  };
  openEditGroupModal = () => {
    this.setState((prev) => ({
      isEditGroupMode: !prev.isEditGroupMode,
      editingGroupId: null,
      editingGroupTitle: '',
    }));
  };
  handleGroupTabClick = (group) => {
    if (this.state.isEditGroupMode) {
      this.setState({
        editingGroupId: group.id,
        editingGroupTitle: group.title,
        activeGroupId: group.id,
      });
    } else {
      this.setActiveGroup(group.id);
    }
  };
  saveGroupTitle = async () => {
    const { editingGroupId, group } = this.state;
    if (!editingGroupId) return;

    const inputValue = this.inputRef?.current?.value || '';
    const title = inputValue.trim() !== '' ? inputValue.trim() : 'Nhóm Mới';

    const updated = (group || []).map((g) => (g.id === editingGroupId ? { ...g, title } : g));

    this.setState({
      group: updated,
      editingGroupId: null,
      editingGroupTitle: '',
      isEditGroupMode: false,
    });
    sessionStorage.setItem("temp_groups", JSON.stringify(updated));
  };
  deleteGroup = async (groupId) => {
    const currentGroups = this.state.group || [];
    const filtered = currentGroups.filter((g) => g.id !== groupId);
    const newActive = this.state.activeGroupId === groupId
      ? (filtered[0]?.id || null)
      : this.state.activeGroupId;

    const { selectedChapters = [] } = this.state;

    // Loại bỏ toàn bộ chapter thuộc group vừa xóa
    const filteredChapters = selectedChapters.filter(
      (chapter) => chapter.group_id !== groupId
    );

    this.setState({
      group: filtered,
      activeGroupId: newActive,
      editingGroupId: null,
      editingGroupTitle: '',
      selectedChapters: filteredChapters,
    });
    sessionStorage.setItem("temp_groups", JSON.stringify(filtered));
    sessionStorage.setItem("temp_activeGroupId", JSON.stringify(newActive));
    sessionStorage.setItem("temp_selectedChapters", JSON.stringify(filteredChapters));
  };

  onDragEndGroupTabs = (result) => {
    console.log('onDragEndGroupTabs called:', result);

    if (!result.destination) {
      console.log('No destination, returning');
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const newGroups = Array.from(this.state.group);
    const [reorderedGroup] = newGroups.splice(sourceIndex, 1);
    newGroups.splice(destinationIndex, 0, reorderedGroup);

    // Cập nhật orderno cho tất cả groups theo thứ tự mới
    const groupsWithUpdatedOrder = newGroups.map((group, index) => ({
      ...group,
      orderno: index + 1
    }));

    // Cập nhật state với thứ tự mới
    this.setState({ group: groupsWithUpdatedOrder });
    sessionStorage.setItem("temp_groups", JSON.stringify(groupsWithUpdatedOrder));
  };

  getChapterCountByGroup = (groupId) => {
    const { selectedChapters = [] } = this.state;
    return selectedChapters.filter(chapter => chapter.group_id === groupId).length;
  };

  fetchListChapters() {

    let { selectedChapters, search_chapter } = this.state;
    let finIndex = -1;

    if (this.props.chapters instanceof Array) {
      return this.props.chapters.map((object, index) => {
        finIndex = selectedChapters.findIndex(item => item._id == object._id);

        if (finIndex == -1 && object.name.toLowerCase().includes(search_chapter.toLowerCase())) {
          return (
            <ChapterItemList
              obj={object}
              isOpen={this.state.isOpen}
              index={index}
              categories={this.state.categories}
              selectedChapterId={this.state.selectedChapterId}
              handleSetIsNotOpenBlock={this.handleSetIsNotOpenBlock}
              getListCategory={this.getListCategory}
              onDragEndCategory={this.onDragEndCategory}
              isNotShowAction={true}
              isBtnAddChapter={true}
              handleAddChapter={this.handleAddChapter}
              handleSetCateId={this.handleSetCateId}
              showSubjectSelector={true}
              subjectList={this.props.subjects ? this.props.subjects.filter(subject => subject.status === true) : []}
              handleSubjectChangeForChapter={this.handleSubjectChangeForChapter}
              handleGroupChangeForChapter={this.handleGroupChangeForChapter}
              groupList={this.state.group}
            />
          );
        }
      });
    }
  }

  // -------------------fetch chapter by class---------------------

  handleRemoveChapter = async (id) => {
    let { selectedChapters } = this.state;
    if (id) {
      const filteredChapters = selectedChapters.filter(item => item._id !== id);
      await this.setState({
        selectedChapters: filteredChapters
      });
      sessionStorage.setItem("temp_selectedChapters", JSON.stringify(filteredChapters));
    }
  }

  fetchListChaptersByClass() {
    const { selectedChapters, activeGroupId } = this.state;
    const actived = this.state.activeGroupId;

    if (selectedChapters instanceof Array) {
      const chaptersInGroup = actived
        ? selectedChapters.filter((chapter) => chapter.group_id === activeGroupId)
        : selectedChapters;
      return chaptersInGroup.map((object, index) => {
        return (
          <Draggable
            key={index}
            draggableId={"" + index}
            index={index}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <ChapterItemList
                  obj={object}
                  key={index}
                  isOpen={this.state.isOpen}
                  index={index}
                  categories={this.state.categories}
                  selectedChapterId={this.state.selectedChapterId}
                  handleSetIsNotOpenBlock={this.handleSetIsNotOpenBlock}
                  getListCategory={this.getListCategory}
                  onDragEndCategory={this.onDragEndCategory}
                  isNotShowAction={true}
                  isBtnAddChapter={false}
                  handleRemoveChapter={this.handleRemoveChapter}
                  handleSetCateId={this.handleSetCateId}
                  showSubjectSelector={true}
                  subjectList={this.props.subjects ? this.props.subjects.filter(subject => subject.status === true) : []}
                  handleSubjectChangeForChapter={this.handleSubjectChangeForChapter}
                  handleGroupChangeForChapter={this.handleGroupChangeForChapter}
                  groupList={this.state.group}
                />
              </div>
            )}
          </Draggable>
        );
      });
    }
  }

  handleSetCateId = async (id) => {
    await this.setState({
      selectedCateId: id
    })
  }


  handleUploadImage = () => {
    document.getElementById("input-upload-image").click();
  }

  remoAvatar = () => {
    document.getElementById("input-upload-image").value = "";
    this.setState({
      files: [],
      avtPreview: ""
    })
  }

  onDragEndBookRelate = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state.listBookRelates,
      result.source.index,
      result.destination.index
    );

    await this.setState({
      listBookRelates: items,
    });
  }

  handleRemoveBookRelate = async (item) => {
    let dataRemove = [];
    let { listBookRelates } = this.state;


    if (listBookRelates) {
      dataRemove = listBookRelates.filter(value => value.id !== item.id);
    }

    this.setState({
      listBookRelates: dataRemove
    })
  }

  handleAddClassroomRelate = async (data) => {
    let dataList = [...this.state.listClassroomRelates];
    if (data) {
      dataList.push(data);
    }


    await this.setState({
      listClassroomRelates: dataList
    })

  }

  handleAddClassroomAttached = async (data) => {
    let dataList = [...this.state.listClassroomAttacheds];
    if (data) {
      dataList.push(data);
    }


    await this.setState({
      listClassroomAttacheds: dataList
    })

  }

  handleSearchChapterByValue = async (e) => {
    e.preventDefault();

    let { search_chapter } = this.state;


    let params = {
      keyword: search_chapter,
      limit: 100,
    };
    await this.props.listChapter(params);
  }

  onDragEndClassroomRelate = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state.listClassroomRelates,
      result.source.index,
      result.destination.index
    );

    await this.setState({
      listClassroomRelates: items,
    });
  }

  onDragEndClassroomAttached = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state.listClassroomAttacheds,
      result.source.index,
      result.destination.index
    );

    await this.setState({
      listClassroomAttacheds: items,
    });
  }

  handleRemoveClassroomRelate = async (item) => {
    let dataRemove = [];
    let { listClassroomRelates } = this.state;


    if (listClassroomRelates) {
      dataRemove = listClassroomRelates.filter(value => value.id !== item.id);
    }

    this.setState({
      listClassroomRelates: dataRemove
    })
  }

  handleRemoveClassroomAttached = async (item) => {
    let dataRemove = [];
    let { listClassroomAttacheds } = this.state;


    if (listClassroomAttacheds) {
      dataRemove = listClassroomAttacheds.filter(value => value.id !== item.id);
    }

    this.setState({
      listClassroomAttacheds: dataRemove
    })
  }

  onDragEndChapterByClass = async (result) => {
    if (!result.destination) {
      return;
    }

    let { selectedChapters } = this.state;

    const items = this.reorder(
      selectedChapters,
      result.source.index,
      result.destination.index
    );

    if (items) {
      await this.setState({
        selectedChapters: items
      });
      sessionStorage.setItem("temp_selectedChapters", JSON.stringify(items));
    }
  }

  handleDeleteFeaturedInformation = (id) => {
    this.setState((prevState) => ({
      featuredInformation: prevState.featuredInformation.filter((item) => item.id !== id),
    }));
  };

  createFeaturedInformation = () => {
    const { featuredInformation, featuredInformationInput } = this.state;
    const text = featuredInformationInput.trim();

    if (text === "") return;

    const newItem = {
      id: Date.now(), // tạo id duy nhất
      text: text
    };

    this.setState({
      featuredInformation: [...featuredInformation, newItem],
      featuredInformationInput: "" // reset input
    });
  };

  createCourseIncludes = () => {
    const { courseIncludesInput, mainIcon, courseIncludes } = this.state;

    // Không thêm nếu input trống
    if (!courseIncludesInput.trim()) return;

    // Lấy icon mặc định nếu chưa chọn
    const selectedIcon = mainIcon || ICON_LIST[0].component;
    const selectedIconIndex = mainIcon
      ? ICON_LIST.findIndex(i => i.component.type === mainIcon.type)
      : 0;
    const selectedIconKey = this.getIconKey(selectedIcon);

    // Tạo item mới
    const newItem = {
      id: Date.now(),
      icon: selectedIconIndex,
      iconKey: selectedIconKey,
      mainIcon: selectedIcon,
      text: courseIncludesInput.trim(),
    };

    // Cập nhật state
    this.setState({
      courseIncludes: [...courseIncludes, newItem],
      courseIncludesInput: '',
      showDialog: false,
    });
    console.log("Added course include:", JSON.stringify(newItem, null, 2));
  };

  handleDoubleClickIconCourseInclude = (itemId) => {
    this.setState({
      editingCourseIncludeIconId: itemId,
      showDialog: true,
    });
  };

  handleDoubleClickTextCourseInclude = (item) => {
    this.setState({
      editingCourseIncludeId: item.id,
      editingCourseIncludeText: item.text,
    });
  };

  handleSaveTextCourseInclude = (itemId) => {
    this.setState({
      courseIncludes: this.state.courseIncludes.map((i) =>
        i.id === itemId ? { ...i, text: this.state.editingCourseIncludeText } : i
      ),
      editingCourseIncludeId: null,
      editingCourseIncludeText: '',
    });
  };

  handleIconSelectForEdit = (icon) => {
    if (this.state.editingCourseIncludeIconId) {
      this.setState({
        courseIncludes: this.state.courseIncludes.map((i) =>
          i.id === this.state.editingCourseIncludeIconId
            ? { ...i, mainIcon: icon }
            : i
        ),
        editingCourseIncludeIconId: null,
        showDialog: false,
      });
    } else {
      this.setState({
        mainIcon: icon,
        showDialog: false,
      });
    }
  };


  // ------------------------------
  // 🪄 Hộp thoại chọn icon
  // ------------------------------
  renderDialog() {
    if (!this.state.showDialog) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={() => this.setState({ showDialog: false })}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '420px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={(e) => this.closeDialog()}
        >
          <h3 style={{
            marginBottom: '16px',
            fontWeight: 600,
            fontSize: '18px',
            color: '#333'
          }}>
            Chọn icon
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            {ICON_LIST.map((item, index) => (
              <button
                key={index}
                style={{
                  width: '60px',
                  height: '60px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor:
                    this.state.mainIcon?.type === item.component.type
                      ? '#e3f2fd'
                      : 'white',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}
                onClick={() => this.handleIconSelectForEdit(item.component)}
              >
                {item.component}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  closeDialog = () => {
    this.setState({ showDialog: false, editingCourseIncludeIconId: null });
  }

  render() {
    const { promotion, origin_price, price, timeCourse } = this.state;


    const discountPercent = origin_price && price ? ((price - origin_price) / origin_price * 100).toFixed(0) : 0;
    return (
      <div>
        <div className="page-content page-container page-create-book page-classroom-create" id="page-content">
          <div className="padding">
            <h2 className='text-md text-highlight sss-page-title'>Thêm mới lớp học</h2>
            <div className="general-info">
              <h3 className="title-block">Thông tin chung</h3>
              <div className="content">
                <input
                  onChange={this._onChange}
                  type="file"
                  className="form-control-file d-none"
                  name="files"
                  id="input-upload-image"
                />
                <div className="block-image">
                  {
                    !this.state.files || this.state.files.length == 0
                      ?
                      <button type="button" onClick={this.handleUploadImage}>
                        <img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
                        <span>THÊM HÌNH</span>
                      </button>
                      :
                      <div className="block-image-overlay">
                        <img
                          id="output"
                          src={this.state.avtPreview}
                          alt="your image"
                          className="image"
                        />
                        <div className="middle">
                          <div className="text" onClick={this.remoAvatar}>Hủy chọn</div>
                        </div>
                      </div>
                  }
                </div>
                <div className="block-content">
                  <div className="item-input-text">
                    <div className="form-group mr-16" style={{ width: "144px" }}>
                      <label className="text-form-label">Mã khóa học</label>
                      <div>
                        <input
                          type="text"
                          placeholder="Tự động sinh"
                          className="form-control"
                          name="code"
                          disabled="true"
                          value={this.state.code}
                        />
                      </div>
                    </div>

                    <div className="form-group mr-16" style={{ width: "60%" }}>
                      <label className="text-form-label">Tên khóa học</label>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          onChange={this._onChange}
                          value={this.state.name}
                        />
                      </div>
                    </div>
                    <div className="form-group mr-16" style={{ width: "20%" }}>
                      <label className="text-form-label">Video giới thiệu khóa học</label>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          name="video_intro"
                          onChange={this._onChange}
                          value={this.state.video_intro}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="item-input-text">
                    <div className="form-group mb-0 mr-32" style={{ width: "15%" }}>
                      <label className="text-form-label">Phân loại</label>
                      <div>
                        <select
                          className="custom-select"
                          value={this.state.level}
                          name="level"
                          onChange={this._onChange}
                        >
                          <option value="">Cấp học</option>
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

                    <div className="form-group mr-32 mb-0" style={{ width: "20%" }}>
                      <label className="text-form-label">Môn học</label>
                      <div>
                        <select
                          className="custom-select"
                          value={this.state.subject_id}
                          name="subject_id"
                          onChange={this._onChange}
                        >
                          <option value="">-- Chọn môn học --</option>
                          {this.fetchSubjectRows()}
                        </select>
                      </div>
                    </div>

                    <div className="form-group mb-0 mr-32" style={{ width: "20%" }}>
                      <label className="text-form-label">Danh mục</label>
                      <div>
                        <div className="">
                          <select
                            className="custom-select"
                            value={this.state.group_id}
                            name="group_id"
                            onChange={this._onChange}
                          >
                            <option value="">-- Chọn danh mục --</option>
                            {this.fetchGroupRows()}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-0 mr-32" style={{ width: "20%" }}>
                      <label className="text-form-label">Giáo viên</label>
                      <div>
                        <select
                          className="custom-select"
                          value={this.state.teacher_id}
                          name="teacher_id"
                          onChange={this._onChange}
                        >
                          <option value="">-- Chọn giáo viên --</option>
                          {this.fetchTeacherRows()}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="block-chapter">
              <div className="block-list-chapter block-chapter-selected">
                <div className="title-action">
                  <div className="left-align">
                    <h3 className="title-block mb-0 mr-18">Danh sách chương của khóa học</h3>
                    <button
                      className="button"
                      onClick={this.openModalAddGroupChapter}
                    >
                      Thêm nhóm
                      <img src="/assets/img/icon-add.svg" alt="" className="ml-12" />
                    </button>
                  </div>
                  {this.state.group?.length > 0 && (
                    <button
                      className="button"
                      onClick={this.openEditGroupModal}
                      style={{
                        backgroundColor: this.state.isEditGroupMode ? '#6735dc' : undefined,
                        color: this.state.isEditGroupMode ? '#fff' : undefined,
                      }}
                    >
                      {this.state.isEditGroupMode ? 'Huỷ' : 'Sửa'}
                    </button>
                  )}
                </div>

                {this.state.isEditGroupMode && this.state.group?.length > 0 && (
                  <span style={{ color: '#5E5959', fontSize: '13px', marginBottom: '8px', fontStyle: 'italic' }}>
                    Nhấn vào tên nhóm để chỉnh sửa và nhấn Enter để lưu
                  </span>

                )}
                {this.state.group?.length > 0 && (
                  <DragDropContext onDragEnd={this.onDragEndGroupTabs}>
                    <Droppable droppableId="group-tabs-container" direction="horizontal">
                      {(provided, snapshot) => (
                        <div
                          className="chapter-tabs"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {this.state.group
                            .sort((a, b) => (a.orderno || 0) - (b.orderno || 0))
                            .map((group, index) => (
                              <Draggable
                                key={`group-${group.id}`}
                                draggableId={`group-tab-${group.id}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={
                                      "chapter-tab "
                                      + (this.state.activeGroupId === group.id ? "active" : "")
                                      + (snapshot.isDragging ? " dragging" : "")
                                    }
                                    onClick={() => this.handleGroupTabClick(group)}
                                    style={{
                                      ...provided.draggableProps.style,
                                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                      userSelect: 'none'
                                    }}
                                  >
                                    {this.state.isEditGroupMode && (
                                      <span
                                        className="chapter-tab-delete"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          this.deleteGroup(group.id);
                                        }}
                                        title="Xóa nhóm"
                                        style={{
                                          pointerEvents: 'auto',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Trash size={12} color="#ff5626" />
                                      </span>
                                    )}
                                    {this.state.isEditGroupMode && this.state.editingGroupId === group.id ? (
                                      <input
                                        ref={this.inputRef}
                                        autoFocus
                                        defaultValue={this.state.editingGroupTitle}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            this.saveGroupTitle();
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{
                                          color: '#fff',
                                          fontStyle: 'bold',
                                          background: 'none',
                                          border: 'none',
                                          fontWeight: '600',
                                          fontSize: '14px',
                                          minWidth: '10px',
                                          pointerEvents: 'auto',
                                          outline: 'none'
                                        }}
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={(e) => {
                                          if (this.state.isEditGroupMode) {
                                            e.stopPropagation();
                                            this.setState({
                                              editingGroupId: group.id,
                                              editingGroupTitle: group.title || `Chương ${index + 1}`
                                            });
                                          }
                                        }}
                                        style={{
                                          cursor: this.state.isEditGroupMode ? 'text' : 'inherit'
                                        }}
                                      >
                                        {`${group.title || `Chương ${index + 1}`} (${this.getChapterCountByGroup(group.id)})`}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
                <DragDropContext onDragEnd={this.onDragEndChapterByClass}>
                  <Droppable droppableId="droppable" type="droppableItem">
                    {(provided, snapshot) => (
                      <div className="list" ref={provided.innerRef}>
                        {this.fetchListChaptersByClass()}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
              <div className="block-chapter-list">
                <div className="form-group" style={{ width: "100%" }}>
                  <h3 className="title-block">Tất cả chương</h3>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      className="form-control mr-32"
                      name="search_chapter"
                      onChange={(e) => this.setState({ search_chapter: e.target.value })}
                      value={this.state.search_chapter}
                    />
                    <span className='input-group-append'>
                      <button
                        className='btn btn-white btn-sm'
                        type='button'
                        onClick={(e) => this.handleSearchChapterByValue(e)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#FF8345",
                          color: "#fff",
                          whiteSpace: "nowrap"
                        }}
                      >
                        <span>Tìm kiếm</span>
                        <span className='d-flex text-muted' style={{ marginLeft: "12px" }}>
                          <img src="/assets/img/icon-search.svg" alt="" />
                        </span>
                      </button>
                    </span>
                  </div>
                </div>
                <div className="block-list-chapter custom-classroom-create">
                  <ul className="list">
                    {this.fetchListChapters()}
                  </ul>
                </div>
              </div>
            </div>

            <div className="block-description">
              <h3 className="title-block">Mô tả ngắn</h3>
              <div className="content">
                <SunEditor
                  onImageUploadBefore={this.handleImageUploadBefore}
                  height={'200px'}
                  setContents={this.state.description}
                  onChange={this._handleEditorDescriptionChange}
                  setOptions={{
                    buttonList: baseHelpers.getSunEditorOptions(),
                    katex: katex,
                  }}
                />
              </div>
            </div>
            <div className="block-editor-content">
              <h3 className="title-block">Nội dung chi tiết</h3>
              <div className="content">
                <SunEditor
                  onImageUploadBefore={this.handleImageUploadBefore}
                  height={'250px'}
                  setContents={this.state.content}
                  onChange={this._handleEditorContentChange}
                  setOptions={{
                    buttonList: baseHelpers.getSunEditorOptions(),
                    katex: katex,
                  }}
                />
              </div>
            </div>

            <div className="two-column-layout">
              <div className="block-editor-content">
                <div className="column">
                  <div className="block-highlight-info">
                    <h3 className="title-block">Thông tin nổi bật</h3>
                    <div className="content">

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          name="featuredInformationInput"
                          type="text"
                          placeholder="Nhập thông tin nổi bật..."
                          className="highlight-input"
                          value={this.state.featuredInformationInput}
                          onChange={(e) => this.setState({ featuredInformationInput: e.target.value })}
                        />

                        <button
                          className="btn-add"
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            fontWeight: '600',
                            fontSize: '14px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#43a047')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                          onClick={this.createFeaturedInformation}
                        >
                          Thêm
                        </button>
                      </div>

                      {/* Danh sách thông tin nổi bật */}
                      <DragDropContext
                        onDragEnd={(result) => {
                          if (!result.destination) return;
                          const items = Array.from(this.state.featuredInformation);
                          const [reorderedItem] = items.splice(result.source.index, 1);
                          items.splice(result.destination.index, 0, reorderedItem);
                          this.setState({ featuredInformation: items });
                        }}
                      >
                        <Droppable droppableId="featuredInformationList">
                          {(provided) => (
                            <div
                              className="highlight-list"
                              style={{ marginTop: '15px' }}
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {this.state.featuredInformation.length === 0 ? (
                                <div
                                  className="empty-state"
                                  style={{
                                    border: '1px solid #e0e0e0',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    color: '#777',
                                    fontSize: '14px'
                                  }}
                                >
                                  Chưa có thông tin nổi bật nào.
                                </div>
                              ) : (
                                <div
                                  className="highlight-items"
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    marginTop: '10px'
                                  }}
                                >
                                  {this.state.featuredInformation.map((item, index) => (
                                    <Draggable
                                      key={item.id || index}
                                      draggableId={String(item.id || index)}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid #ddd',
                                            padding: '20px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: '#fafafa',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                            ...provided.draggableProps.style
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '10px',
                                              flex: 1
                                            }}
                                          >
                                            <Menu
                                              size={16}
                                              style={{
                                                color: '#666',
                                                flexShrink: 0,
                                                cursor: 'grab',
                                                paddingRight: '4px',
                                              }}
                                            />
                                            {this.state.editingItemId === item.id ? (
                                              <input
                                                type="text"
                                                value={this.state.editingText}
                                                onChange={(e) => this.setState({ editingText: e.target.value })}
                                                style={{
                                                  fontSize: '14px',
                                                  color: '#333',
                                                  border: '1px solid #ccc',
                                                  borderRadius: '4px',
                                                  padding: '4px 8px',
                                                  flex: 1
                                                }}
                                                autoFocus
                                              />
                                            ) : (
                                              <span
                                                style={{
                                                  fontSize: '14px',
                                                  color: '#333',
                                                  cursor: 'pointer',
                                                  flex: 1
                                                }}
                                                onDoubleClick={() => this.handleEditFeaturedInformation(item)}
                                              >
                                                {item.text}
                                              </span>
                                            )}
                                          </div>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 3px' }}>
                                            {this.state.editingItemId === item.id && (
                                              <button
                                                style={{
                                                  backgroundColor: '#4CAF50',
                                                  color: 'white',
                                                  border: 'none',
                                                  borderRadius: '4px',
                                                  padding: '4px 8px',
                                                  cursor: 'pointer',
                                                  fontSize: '12px'
                                                }}
                                                onClick={() => this.handleSaveFeaturedInformation(item.id)}
                                              >
                                                ✓
                                              </button>
                                            )}
                                            <span
                                              style={{
                                                color: 'red',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                              }}
                                              onClick={() =>
                                                this.handleDeleteFeaturedInformation(item.id)
                                              }
                                            >
                                              Xóa
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      <div
                        className="drag-instruction"
                        style={{ marginTop: '10px', fontSize: '13px', color: '#888' }}
                      >
                        Kéo-thả để thay đổi thứ tự các mục. Double-click vào mục để chỉnh sửa, khi
                        đang chỉnh sửa nhấn tick để lưu.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="block-editor-content">
                  <div className="block-course-includes" style={{ fontFamily: 'sans-serif' }}>
                    <h3 className="title-block" >Khoá học bao gồm</h3>
                    <div className="content">
                      <div className="course-stats" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {this.state.constantData.map((item) => (
                          <div
                            key={item.id}
                            className="stat-item"
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 0',
                              width: '100%',
                            }}
                          >
                            {ICON_COMPONENTS[item.icon]}

                            <label
                              style={{
                                fontWeight: 500,
                                minWidth: '130px',
                                whiteSpace: 'nowrap',
                                color: '#333',
                                flexShrink: 0,
                              }}
                            >
                              {item.label}
                            </label>

                            <input
                              type="text"
                              value={item.value}
                              placeholder={item.placeholder}
                              onChange={(e) => {
                                // Kiểm tra an toàn
                                if (!e || !e.target) return;

                                const newValue = e.target.value || ''; // Fallback về string rỗng

                                this.setState((prev) => ({
                                  constantData: prev.constantData.map((i) =>
                                    i.id === item.id ? { ...i, value: newValue } : i
                                  ),
                                }));
                              }}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '8px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outlineColor: '#3f51b5',
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Thêm mục tùy chỉnh */}
                      <div
                        className="custom-section"
                        style={{
                          marginTop: '25px',
                          paddingTop: '10px',
                          borderTop: '1px solid #ddd',
                        }}
                      >
                        {/* Hàng tiêu đề và hướng dẫn */}
                        <div
                          className="section-header"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px',
                          }}
                        >
                          <div
                            className="section-title"
                            style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                            }}
                          >
                            Thêm mục tùy chỉnh
                          </div>
                          <div
                            className="input-description"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              color: '#555',
                            }}
                          >
                            <span style={{ color: '#777' }}>
                              Nhập nội dung và chọn kèm icon bên cạnh
                            </span>
                          </div>
                        </div>

                        {/* Hàng input */}
                        <div
                          className="input-row"
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                          }}
                        >
                          <input
                            name="courseIncludesInput"
                            value={this.state.courseIncludesInput}
                            onChange={(e) => this.setState({ courseIncludesInput: e.target.value })}
                            type="text"
                            placeholder="Ví dụ: 20+ Bài giảng livestream tương tác"
                            className="custom-input"
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />

                          {/* Nút chọn icon */}
                          <button
                            className="btn-icon"
                            style={{
                              backgroundColor: '#f7f8fa',
                              color: '#3f51b5',
                              border: '1px solid #ccc',
                              padding: '10px 20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                              borderRadius: '8px',
                              width: '40px',
                              height: '40px',
                              boxSizing: 'border-box'
                            }}
                            onClick={() => {
                              this.setState({ showDialog: true });
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ebedf3')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f7f8fa')}
                          >
                            {/* Nếu có mainIcon thì hiển thị, không thì mặc định là FaBook */}
                            {this.state.mainIcon ? (
                              React.cloneElement(this.state.mainIcon, { style: { fontSize: '20px', color: '#9e9e9e' } })
                            ) : (
                              <Book size={20} style={{ color: "#9e9e9e" }} />
                            )}
                          </button>
                          {this.renderDialog()}

                          {/* Nút thêm */}
                          <button
                            className="btn-add"
                            style={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 20px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease',
                              fontWeight: '600',
                              fontSize: '14px',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                              width: '80px', // Cùng chiều rộng với nút icon
                              height: '40px', // Cùng chiều cao với nút icon
                              boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#43a047')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
                            onClick={() => {
                              this.createCourseIncludes();
                            }}
                          >
                            Thêm
                          </button>
                        </div>

                        <DragDropContext onDragEnd={this.onDragEndInCludes}>
                          <Droppable droppableId="courseIncludes">
                            {(provided) => (
                              <div
                                className="course-includes-list"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ marginTop: '15px' }}
                              >
                                {this.state.courseIncludes.map((item, index) => {
                                  console.log("Data includes", JSON.stringify(item, null, 2));
                                  // Lấy icon theo index từ dữ liệu
                                  const iconIndex = item.icon;
                                  const mainIcon = ICON_LIST[iconIndex]
                                    ? ICON_LIST[iconIndex].component
                                    : <Book size={18} color="#666" />; // fallback nếu không có

                                  return (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps} // vẫn cho phép kéo cả item
                                          style={{
                                            ...provided.draggableProps.style,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            border: "1px solid #ddd",
                                            padding: "16px 18px",
                                            borderRadius: "8px",
                                            backgroundColor: snapshot.isDragging ? "#e3f2fd" : "#fafafa",
                                            marginBottom: "8px",
                                            boxShadow: snapshot.isDragging
                                              ? "0 4px 12px rgba(0,0,0,0.15)"
                                              : "0 1px 3px rgba(0,0,0,0.05)",
                                            transition: "all 0.2s ease",
                                            cursor: "grab",
                                          }}
                                        >
                                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            {/* Icon chính */}
                                            <div
                                              {...provided.dragHandleProps}
                                              style={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}
                                            >
                                              <Menu
                                                size={20}
                                                color="#666"
                                                style={{
                                                  paddingRight: '5px',
                                                }}
                                              />
                                            </div>

                                            <div
                                              onDoubleClick={() => this.handleDoubleClickIconCourseInclude(item.id)}
                                              style={{
                                                cursor: 'pointer',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.2s'
                                              }}
                                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                              title="Double-click để sửa icon"
                                            >
                                              {mainIcon}
                                            </div>

                                            {/* Text */}
                                            {this.state.editingCourseIncludeId === item.id ? (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                  type="text"
                                                  value={this.state.editingCourseIncludeText}
                                                  onChange={(e) => this.setState({ editingCourseIncludeText: e.target.value })}
                                                  style={{
                                                    fontSize: '16px',
                                                    border: '1px solid #1677ff',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    outline: 'none',
                                                    minWidth: '200px'
                                                  }}
                                                  autoFocus
                                                  onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                      this.handleSaveTextCourseInclude(item.id);
                                                    }
                                                  }}
                                                />
                                                <button
                                                  onClick={() => this.handleSaveTextCourseInclude(item.id)}
                                                  style={{
                                                    backgroundColor: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                  }}
                                                >
                                                  ✓ Lưu
                                                </button>
                                                <button
                                                  onClick={() => this.setState({ editingCourseIncludeId: null, editingCourseIncludeText: '' })}
                                                  style={{
                                                    backgroundColor: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                  }}
                                                >
                                                  ✗
                                                </button>
                                              </div>
                                            ) : (
                                              <span
                                                style={{ fontSize: "14px", color: "#333", cursor: 'pointer' }}
                                                onDoubleClick={() => this.handleDoubleClickTextCourseInclude(item)}
                                                title="Double-click để sửa text"
                                              >
                                                {item.text}
                                              </span>
                                            )}
                                          </div>

                                          {/* Nút xóa */}
                                          <span
                                            style={{
                                              color: "red",
                                              fontSize: "13px",
                                              cursor: "pointer",
                                              fontWeight: 600,
                                            }}
                                            onClick={() =>
                                              this.setState({
                                                courseIncludes: this.state.courseIncludes.filter(
                                                  (i) => i.id !== item.id
                                                ),
                                              })
                                            }
                                          >
                                            Xóa
                                          </span>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="block-action-footer" style={{ display: "flex", marginTop: "20px", marginRight: "20px" }}>
              <button
                type="button"
                className="btn-cancel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "10px 24px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                    onClick={() => {
                      sessionStorage.removeItem("temp_selectedChapters");
                      sessionStorage.removeItem("temp_groups");
                      sessionStorage.removeItem("temp_activeGroupId");
                      this.props.history.push("/book-id-course");
                    }}
              >
                <img src="/assets/img/icon-arrow-left.svg" alt="" style={{ marginRight: "10px" }} />
                HỦY
              </button>

              <button
                type="button"
                className="btn-submit"
                onClick={(e) => this.handleSubmit(e)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "10px 24px",
                  cursor: "pointer",
                  marginLeft: "16px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea580c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F97316")}
              >
                LƯU
                <img
                  src="/assets/img/icon-arrow-right.svg"
                  alt=""
                  style={{ marginLeft: "10px", filter: "brightness(0) invert(1)" }}
                />
              </button>
            </div>

          </div>
        </div>

        <ModalEditLesson
          selectedCateId={this.state.selectedCateId}
          classroom_id={this.props.match.params.id || null}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    subjects: state.subject.subjects,
    redirect: state.bookIdCourse.redirect,
    classroom: state.classroom.classroom,
    students: state.student.students,
    classroomGroups: state.classroomGroup.classroomGroups,
    image: state.question.image,
    bookCategories: state.book.bookCategories,
    chapters: state.chapter.chapters,
    categories: state.category.categories,

  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      listSubject,
      createBook,
      listStudent,
      listClassroomGroup,
      uploadImage,
      listBookCategory,
      listChapter,
      listCategory,
      updateMetaDataCategory,
      updateMetaDataChapter
    },
    dispatch
  );
}

let ClassCreateContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BookIdCourseCreate)
);

export default ClassCreateContainer;

