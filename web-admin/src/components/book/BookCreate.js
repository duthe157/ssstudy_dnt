import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { listSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action";
import { createBook } from "../../redux/book/action";
import { uploadImage } from "../../redux/book/action";
import { listClassroomGroup } from "../../redux/classroomgroup/action";
import { listLabel, syncLabels } from "../../redux/label/action";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { DatePicker } from "antd";
import baseHelpers from "../../helpers/BaseHelpers";
import moment from "moment";
import ModalAttachedClassroom from "./ModalAttachedClassroom";
import ModalClassroomRelate from "../classroom/Components/ModalClassroomRelate";
import ModalBookRelate from "./ModalBookRelate";
import SelectBox from "../SelectBox";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { COPY_CHAPTER } from "../../redux/chapter/type";
import {
  Book as BookIcon,
  FileText,
  Clock,
  FilePlus,
  PlusSquare,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart,
  Video,
  Star,
  Users,
  Menu,
  CheckSquare,
  ListChecks,
  Layers,
  Info,
  BookOpen,
  FolderPlus
} from "lucide-react";

let CDN_LINK = 'https://cdn.luyenthitiendat.vn/';

class BookCreate extends Component {
  constructor(props) {
    super();
    this.state = {
      name: "",
      subject_id: "",
      category_id: "",
      description: "",
      content: "",
      status: true,
      is_featured: false,
      numberStudent: "",
      price: "",
      code: "",
      origin_price: "",
      files: [],
      external_link: "",
      ordering: 1,
      teacher_id: null,
      quantity: 0,
      promotion: {
        from_date: null,
        to_date: null,
        type: "BY_DATE_RANGE",
        hour: 0,
        note: ""
      },
      listClassroomAttached: [],
      listClassroomRelates: [],
      listBookRelates: [],
      avtPreview: "",
      level: null,
      label_ids: [],

      // ====== NEW: Highlights & Includes state ======
      bookHighlights: [],
      bookIncludes: [],
      newHighlightText: "",
      newIncludeText: "",
      editingHighlightIndex: null,
      editingIncludeIndex: null,
      editingHighlightText: "",
      editingIncludeText: "",
      newIncludeIcon: "/assets/img/icon-document.svg",
      includeIconPickerOpen: false,
      newIncludeIconKey: "Book",
      editingIncludeIconIndex: null,
      editingIncludeIconKey: "Book",
      includeIconEditPickerOpen: false
      // ====== end NEW ======
    };
  }

  async componentDidMount() {
    const data = {
      limit: 999,
      is_delete: false,
    };
    await this.props.listSubject(data);
    
    // Lấy danh sách danh mục từ classroom-group/list
    const categoryData = {
      limit: 100,
    };
    await this.props.listClassroomGroup(categoryData);

    const params = {
      user_group: "TEACHER",
      limit: 100,
    };
    await this.props.listAdmin(params);
    await this.props.listLabel({ limit: 99999, page: 1 });
  }

  _onChange = async (e) => {
    var name = e.target.name;
    let value = e.target.value;
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
        [name]: value
      });
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

  handleSubmit = async (type) => {
    let { promotion, listClassroomAttached, listClassroomRelates, listBookRelates, numberStudent } = this.state;
    const data = {
      name: this.state.name,
      subject_id: this.state.subject_id,
      category_id: this.state.category_id,
      is_featured: this.state.is_featured,
      status: this.state.status,
      files: this.state.files,
      external_link: this.state.external_link,
      price: this.state.price ? this.state.price : this.state.origin_price,
      student_owned: numberStudent,
      promotion: promotion,
      origin_price: isNaN(this.state.origin_price)
        ? 0
        : this.state.origin_price,
      ordering: this.state.ordering,
      content: this.stripPTags(this.state.content),
      description: this.stripPTags(this.state.description),
      teacher_id: this.state.teacher_id,
      code: this.state.code,
      classroom_attached: listClassroomAttached.map(item => item.id),
      classroom_relates: listClassroomRelates.map(item => item.id),
      book_relates: listBookRelates.map(item => item.id),
      quantity: this.state.quantity,
      level: this.state.level,
      highlightInformations: {
        items: (this.state.bookHighlights || []).map((it) => ({ text: it.text }))
      },
      includes: {
        items: (this.state.bookIncludes || []).map((it) => ({ text: it.text, iconKey: it.iconKey }))
      }
      // promotion: this.state.promotion.to_date && this.state.promotion.from_date ? this.state.promotion : {}
    };

    // if (promotion.to_date || promotion.from_date) {
    //     // }

    if (type === 0) {
      console.log("chưa làm");
    } else {
      const createRes = await this.props.createBook(data);
      if (createRes && createRes.data && createRes.data.code === 200) {
        const bookId = createRes.data.data && (createRes.data.data._id || createRes.data.data.id);
        const labelIds = Array.isArray(this.state.label_ids)
          ? this.state.label_ids.filter(Boolean)
          : (this.state.label_ids ? [this.state.label_ids] : []);

        if (bookId && this.props.syncLabels) {
          await this.props.syncLabels({
            item_id: bookId,
            item_type: "BOOK",
            label_ids: labelIds,
          });
        }

        await this.props.history.push("/book");
      }
    }
  };

  fetchSubjectRows() {
    if (this.props.subjects instanceof Array) {
      return this.props.subjects.map((obj, i) => {
        return <option key={i} value={obj._id}>{obj.name}</option>;
      });
    }
  }

  getLabelItems = (labels = this.props.labels) => {
    if (!(labels instanceof Array)) {
      return labels?.records || labels?.labels || labels?.children || [];
    }

    const primaryLabel = labels.find((label) => label?.is_primary === true);
    if (primaryLabel?.children instanceof Array) {
      return primaryLabel.children;
    }

    if (labels[0]?.children instanceof Array) {
      return labels[0].children;
    }

    return labels;
  };

  getLabelId = (label) => label?._id || label?.id || label?.value;

  fetchLabelYears() {
    return this.getLabelItems().map((obj) => ({
      value: this.getLabelId(obj),
      label: obj.name || obj.label || obj.title,
    })).filter((obj) => obj.value);
  }

  fetchCategoryRows() {
    if (this.props.classroomGroups instanceof Array) {
      // Chỉ lấy các item có status = true
      const activeCategories = this.props.classroomGroups.filter(obj => obj.status === true);
      return activeCategories.map((obj, i) => {
        return <option key={i} value={obj._id}>{obj.name}</option>;
      });
    }
  }

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

  _handleEditorContentChange = (content) => {
    this.setState({ content: content });
  };
  _handleEditorDescriptionChange = (content) => {
    this.setState({ description: content });
  };

  stripPTags = (html) => {
    if (!html || typeof html !== "string") return html;
    return html.replace(/<\/?p[^>]*>/gi, "");
  };

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

  handleAddClassroomAttached = async (data) => {
    let dataList = [...this.state.listClassroomAttached];
    if (data) {
      dataList.push(data);
    }


    await this.setState({
      listClassroomAttached: dataList
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

  handleAddBookRelate = async (data) => {
    let dataList = [...this.state.listBookRelates];
    if (data) {
      dataList.push(data);
    }


    await this.setState({
      listBookRelates: dataList
    })

  }

  handleRemoveClassroomAttached = async (item) => {
    let dataRemove = [];
    let { listClassroomAttached } = this.state;



    if (listClassroomAttached) {
      dataRemove = listClassroomAttached.filter(value => value.id !== item.id);
    }

    this.setState({
      listClassroomAttached: dataRemove
    })
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

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragEndClassroomAttached = async (result) => {
    // const { listClassroomAttached } = this.state;

    // // dropped outside the list
    // if (
    //   !result.destination ||
    //   result.source.index == result.destination.index
    // ) {
    //   return;
    // }
    // this.setState(
    //   {
    //     listClassroomAttached: produce(listClassroomAttached, (draft) => {
    //       const tg = { ...draft[result.source.index] };
    //       draft[result.source.index] = { ...draft[result.destination.index] };
    //       draft[result.destination.index] = tg;
    //     }),
    //   }
    // );
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
      this.state.listClassroomAttached,
      result.source.index,
      result.destination.index
    );

    await this.setState({
      listClassroomAttached: items,
    });
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

  clearFormDate = async () => {
    console.log(123);
  }

  // ====== NEW: handlers for highlights ======
  handleAddHighlight = async () => {
    const text = (this.state.newHighlightText || "").trim();
    if (!text) return;
    const items = [...(this.state.bookHighlights || [])];
    items.push({ id: Date.now(), text });
    await this.setState({ bookHighlights: items, newHighlightText: "" });
  };

  onDragEndHighlights = async (result) => {
    if (!result.destination) return;
    const items = this.reorder(
      this.state.bookHighlights,
      result.source.index,
      result.destination.index
    );
    await this.setState({ bookHighlights: items });
  };

  startEditHighlight = (index) => {
    const item = this.state.bookHighlights[index];
    this.setState({
      editingHighlightIndex: index,
      editingHighlightText: item?.text || ""
    });
  };

  saveEditHighlight = async () => {
    const { editingHighlightIndex, editingHighlightText, bookHighlights } = this.state;
    if (editingHighlightIndex === null) return;
    const items = [...bookHighlights];
    items[editingHighlightIndex] = {
      ...items[editingHighlightIndex],
      text: (editingHighlightText || "").trim()
    };
    await this.setState({
      bookHighlights: items,
      editingHighlightIndex: null,
      editingHighlightText: ""
    });
  };

  removeHighlight = async (itemId) => {
    const items = (this.state.bookHighlights || []).filter((it) => it.id !== itemId);
    await this.setState({ bookHighlights: items });
  };
  // ====== end NEW ======

  // ====== NEW: handlers for includes ======
  handleAddInclude = async () => {
    const text = (this.state.newIncludeText || "").trim();
    if (!text) return;
    const items = [...(this.state.bookIncludes || [])];
    items.push({
      id: Date.now(),
      text,
      iconKey: this.state.newIncludeIconKey
    });
    await this.setState({ bookIncludes: items, newIncludeText: "" });
  };

  onDragEndIncludes = async (result) => {
    if (!result.destination) return;
    const items = this.reorder(
      this.state.bookIncludes,
      result.source.index,
      result.destination.index
    );
    await this.setState({ bookIncludes: items });
  };

  startEditInclude = (index) => {
    const item = this.state.bookIncludes[index];
    this.setState({
      editingIncludeIndex: index,
      editingIncludeText: item?.text || ""
    });
  };

  saveEditInclude = async () => {
    const { editingIncludeIndex, editingIncludeText, bookIncludes } = this.state;
    if (editingIncludeIndex === null) return;
    const items = [...bookIncludes];
    items[editingIncludeIndex] = {
      ...items[editingIncludeIndex],
      text: (editingIncludeText || "").trim()
    };
    await this.setState({
      bookIncludes: items,
      editingIncludeIndex: null,
      editingIncludeText: ""
    });
  };

  removeInclude = async (itemId) => {
    const items = (this.state.bookIncludes || []).filter((it) => it.id !== itemId);
    await this.setState({ bookIncludes: items });
  };
  // ====== end NEW ======

  // ====== NEW: include icon picker handlers ======
  openIncludeIconPicker = () => {
    this.setState({ includeIconPickerOpen: true });
  };
  closeIncludeIconPicker = () => {
    this.setState({ includeIconPickerOpen: false });
  };
  selectIncludeIcon = (iconKey) => {
    this.setState({ newIncludeIconKey: iconKey, includeIconPickerOpen: false });
  };

  // Icon editing methods
  startEditIncludeIcon = (index) => {
    const item = this.state.bookIncludes[index];
    this.setState({
      editingIncludeIconIndex: index,
      editingIncludeIconKey: item?.iconKey || "Book",
      includeIconEditPickerOpen: true
    });
  };

  closeIncludeIconEditPicker = () => this.setState({ includeIconEditPickerOpen: false, editingIncludeIconIndex: null });
  
  selectEditIncludeIcon = async (iconKey) => {
    const { editingIncludeIconIndex, bookIncludes } = this.state;
    if (editingIncludeIconIndex === null) return;
    const items = [...bookIncludes];
    items[editingIncludeIconIndex] = {
      ...items[editingIncludeIconIndex],
      iconKey: iconKey
    };
    await this.setState({
      bookIncludes: items,
      includeIconEditPickerOpen: false,
      editingIncludeIconIndex: null
    });
  };
  // ====== end NEW ======

  render() {
    const { promotion, origin_price, price } = this.state;


    const discountPercent = price && origin_price ? ((price - origin_price) / origin_price * 100).toFixed(0) : 0;
    const includeIconMap = {
      Book: BookIcon,
      FileText,
      Clock,
      FilePlus,
      PlusSquare,
      Play,
      Image: ImageIcon,
      Link: LinkIcon,
      BarChart,
      Video,
      Star,
      Users,
      Menu,
      CheckSquare,
      ListChecks,
      Layers,
      Info,
      BookOpen,
      FolderPlus
    };
    const SelectedIncludeIcon = includeIconMap[this.state.newIncludeIconKey] || BookIcon;
    return (
      <div>
        <div className="page-content page-container page-create-book" id="page-content">
          <div className="padding">
            <h2 className='text-md text-highlight sss-page-title'>
              Thêm sách mới
            </h2>
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
                      <label className="text-form-label">Mã sách</label>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          name="code"
                          onChange={this._onChange}
                          value={this.state.code}
                        />
                      </div>
                    </div>

                    <div className="form-group mr-16" style={{ width: "60%" }}>
                      <label className="text-form-label">Tên sản phẩm</label>
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
                    <div className="form-group" style={{ width: "40%" }}>
                      <label className="text-form-label">Link bản xem thử</label>
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          name="external_link"
                          onChange={this._onChange}
                          value={this.state.external_link}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="item-input-text">
                    <div className="form-group mb-0 mr-10">
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

                    <div className="form-group mr-32 mb-0">
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

                    <div className="form-group mb-0 mr-32">
                      <label className="text-form-label">Danh mục </label>
                      <div>
                        <div className="">
                          <select
                            className="custom-select"
                            value={this.state.category_id}
                            name="category_id"
                            onChange={this._onChange}
                          >
                            <option value="">-- Chọn danh mục --</option>
                            {this.fetchCategoryRows()}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-0 mr-32">
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

                    <div className="form-group mb-0 mr-32" style={{ width: "180px" }}>
                      <label className="text-form-label">Số học viên sở hữu</label>
                      <div>
                        <input
                          type="number"
                          className="form-control"
                          name="numberStudent"
                          onChange={this._onChange}
                          value={this.state.numberStudent}
                        />
                      </div>
                    </div>

                    <div className="form-group mb-0 mr-32">
                      <label className="text-form-label">Nổi bật</label>
                      <div className="mt-16">
                        <div className="float-left">
                          <label className="ui-switch ui-switch-md info m-t-xs">
                            <input
                              type="checkbox"
                              name="is_featured"
                              value={this.state.is_featured}
                              checked={this.state.is_featured === true ? 'checked' : ''}
                              onChange={this._onChange}
                            />{' '}
                            <i />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-0 mr-32">
                      <label className="text-form-label">Hiển thị</label>
                      <div className="mt-16">
                        <div className="float-left">
                          <label className="ui-switch ui-switch-md info m-t-xs">
                            <input
                              type="checkbox"
                              name="status"
                              value={this.state.status}
                              checked={this.state.status === true ? 'checked' : ''}
                              onChange={this._onChange}
                            />{' '}
                            <i />
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
              
            <div className="two-column-layout">
              <div className="block-price-discount">
                <h3 className="title-block">Giá và khuyến mãi</h3>
                <div className="content input-group" style={{ flexWrap: "wrap", gap: "4px" }}>
                  <div className="form-group mb-0 mr-10" style={{ width: "180px" }}>
                    <label className="text-form-label">Giá sản phẩm</label>
                    <div>
                      <input
                        type="number"
                        className="form-control"
                        name="origin_price"
                        onChange={this._onChange}
                        value={this.state.origin_price}
                      />
                    </div>
                  </div>
                  <div className="form-group mb-0 mr-10" style={{ width: "180px" }}>
                    <label className="text-form-label">Giá khuyến mãi</label>
                    <div>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        onChange={this._onChange}
                        value={this.state.price}
                      />
                    </div>
                  </div>
                  <div className="form-group mb-0 mr-10" style={{ width: "160px" }}>
                    <label className="text-form-label">Chênh lệch</label>
                    <div className="percent-difference">
                      <span> {discountPercent && !isNaN(discountPercent) ? discountPercent : 0}%</span>
                    </div>
                  </div>


                  <div className="form-group mb-0 mr-10">
                    <label className="text-form-label">Chọn thời gian khuyến mãi</label>
                    <div>
                      <select
                        className="custom-select"
                        value={promotion.type}
                        name="type"
                        onChange={this._onChangeTypePromotion}
                      >
                        {/* <option value="">Chọn thời gian</option> */}
                        <option value="BY_DATE_RANGE">Khoảng thời gian cụ thể</option>
                        <option value="BY_HOUR">Thời gian kết thúc</option>
                      </select>
                    </div>
                  </div>

                  {
                    promotion.type == "BY_DATE_RANGE"
                    &&
                    <div className="form-group mb-0 mr-10">
                      <label className="text-form-label">Nhập thời gian</label>
                      <div className="group-date" style={{ display: "flex" }}>
                        <DatePicker
                          format={
                            "DD/MM/YYYY HH:mm"
                          }
                          value={promotion.from_date
                            ? moment(promotion.from_date)
                            : null}
                          showTime={{ format: 'HH:mm' }}
                          placeholder="Từ ngày"
                          // allowClear={<div onClick={this.clearFormDate}> </div>}
                          onChange={this.changeDateStart}
                        // onOk={this.clearFormDate}
                        />
                        <DatePicker
                          format={
                            "DD/MM/YYYY HH:mm"
                          }
                          value={promotion.to_date
                            ? moment(promotion.to_date)
                            : null}
                          showTime={{ format: 'HH:mm' }}
                          placeholder="Đến ngày"
                          onChange={this.changeDateEnd}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  }
                  {
                    promotion.type == "BY_HOUR"
                    &&
                    <div className="form-group mb-0 mr-10" style={{ width: "180px" }}>
                      <label className="text-form-label">Nhập số giờ</label>
                      <div>
                        <input
                          type="number"
                          className="form-control"
                          name="hour"
                          onChange={this._onChangeTypePromotion}
                          value={promotion.hour}
                        />
                      </div>
                    </div>
                  }
                  <div className="form-group mb-0 mr-10" style={{ width: "180px" }}>
                    <label className="text-form-label">Số lượng khuyến mãi</label>
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        name="quantity"
                        onChange={this._onChange}
                        value={this.state.quantity}
                      />
                    </div>
                  </div>
                </div>

                <div className="content input-group">
                  <div className="form-group mb-0" style={{ width: "auto", paddingTop: "10px" }}>
                    <label className="text-form-label">Ghi chú khuyến mãi</label>
                    <div>
                      <textarea
                        className="form-control custom-textarea"
                        placeholder="Nhập ghi chú khuyến mãi (nếu có)"
                        name="promotionNote"
                        onChange={(e) => this.setState({ promotion: { ...this.state.promotion, note: e.target.value } })}
                        value={this.state.promotion.note}
                      ></textarea>
                    </div>
                  </div>

                  {/* CSS trực tiếp */}
                  <style>
                    {`
                      .custom-textarea {
                        width: 400px !important;    /* chiều ngang mong muốn */
                        height: 60px;               /* chiều cao vừa đủ */
                        display: inline-block;      /* không full width */
                        padding: 4px;               /* nhỏ gọn hơn */
                        box-sizing: border-box;     /* width tính luôn padding */
                      }
                    `}
                  </style>
                </div>
              </div>

              <div class="block-price-discount">
                <h3 className="title-block">Gắn nhãn</h3>
                <div className="form-group mb-0">
                  <label className="text-form-label">Năm học</label>
                  <SelectBox
                    placeholder="Chọn nhãn"
                    value={this.state.label_ids}
                    onChange={(value) => this.setState({ label_ids: value })}
                    options={this.fetchLabelYears()}
                  />
                </div>
              </div>
            </div>

            
            <div className="block-attach-product">
              <div className="title-action">
                <h3 className="title-block mb-0 mr-18">Khóa học đi kèm</h3>
                <button
                  type="button"
                  data-toggle="modal"
                  data-target="#classroom-attached"
                  data-toggle-class="fade-down"
                  data-toggle-class-target=".animate"
                >
                  Thêm khóa Học
                  <img src="/assets/img/icon-add.svg" alt="" className="ml-12" />
                </button>
              </div>

              <div className="block-list-product">
                <DragDropContext onDragEnd={this.onDragEndClassroomAttached}>
                  <Droppable droppableId="droppable" direction="horizontal">
                    {(provided, snapshot) => (
                      <ul
                        className="list-products ml-0 pl-0"
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDragging ? "#e8f0fe" : "none",
                        }}
                      >
                        {
                          this.state.listClassroomAttached && this.state.listClassroomAttached.length > 0
                          &&
                          this.state.listClassroomAttached.map((item, index) => {
                            return (
                              <Draggable
                                key={index}
                                draggableId={"" + index}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    className="list-item"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      userSelect: "none",
                                      background: snapshot.isDragging
                                        ? "#e8f0fe"
                                        : "none",
                                      display: "table-row",
                                    }}
                                  >
                                    <div className="block-content">
                                      <div className="action-head">
                                        <a className="mr-14">
                                          <img src="/assets/img/icon-move.svg" alt="" />
                                        </a>
                                        <a onClick={() => this.handleRemoveClassroomAttached(item)}>
                                          <img src="/assets/img/icon-close.svg" alt="" />
                                        </a>
                                      </div>
                                      <div className="product-info">
                                        <div className="image">
                                          {
                                            item.avatar
                                              ?
                                              <img src={item.avatar} alt="" />
                                              :
                                              <img src="/assets/img/no-image.png" alt="" />
                                          }
                                        </div>
                                        <p className="name">
                                          {item.name ? item.name : ""}
                                        </p>
                                        <span className="price">{item.price ? baseHelpers.currencyFormat(item.price) : 0} đ</span>
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            )
                          })
                        }
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            <div className="block-attach-product">
              <div className="title-action">
                <h3 className="title-block mb-0 mr-18">Khóa học đề xuất</h3>
                <button
                  className="button"
                  data-toggle="modal"
                  data-target="#classroom-relate"
                  data-toggle-class="fade-down"
                  data-toggle-class-target=".animate"
                >
                  Thêm khóa Học
                  <img src="/assets/img/icon-add.svg" alt="" className="ml-12" />
                </button>
              </div>

              <div className="block-list-product">
                <DragDropContext onDragEnd={this.onDragEndClassroomRelate}>
                  <Droppable droppableId="droppable" direction="horizontal">
                    {(provided, snapshot) => (
                      <ul
                        className="list-products ml-0 pl-0"
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDragging ? "#e8f0fe" : "none",
                        }}
                      >
                        {
                          this.state.listClassroomRelates && this.state.listClassroomRelates.length > 0
                          &&
                          this.state.listClassroomRelates.map((item, index) => {
                            return (
                              <Draggable
                                key={index}
                                draggableId={"" + index}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    className="list-item"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      userSelect: "none",
                                      background: snapshot.isDragging
                                        ? "#e8f0fe"
                                        : "none",
                                      display: "table-row",
                                    }}
                                  >
                                    <div className="block-content">
                                      <div className="action-head">
                                        <a className="mr-14">
                                          <img src="/assets/img/icon-move.svg" alt="" />
                                        </a>
                                        <a onClick={() => this.handleRemoveClassroomRelate(item)}>
                                          <img src="/assets/img/icon-close.svg" alt="" />
                                        </a>
                                      </div>
                                      <div className="product-info">
                                        <div className="image">
                                          {
                                            item.avatar
                                              ?
                                              <img src={item.avatar} alt="" />
                                              :
                                              <img src="/assets/img/no-image.png" alt="" />
                                          }
                                        </div>
                                        <p className="name">
                                          {item.name ? item.name : ""}
                                        </p>
                                        <span className="price">{item.price ? baseHelpers.currencyFormat(item.price) : 0} đ</span>
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>

                            )
                          })
                        }
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            <div className="block-attach-product">
              <div className="title-action">
                <h3 className="title-block mb-0 mr-18">Sách đề xuất</h3>
                <button
                  type="button"
                  data-toggle="modal"
                  data-target="#book-relate"
                  data-toggle-class="fade-down"
                  data-toggle-class-target=".animate"
                >
                  Thêm sách
                  <img src="/assets/img/icon-add.svg" alt="" className="ml-12" />
                </button>
              </div>

              <div className="block-list-product">
                <DragDropContext onDragEnd={this.onDragEndBookRelate}>
                  <Droppable droppableId="droppable" direction="horizontal">
                    {(provided, snapshot) => (
                      <ul
                        className="list-products ml-0 pl-0"
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDragging ? "#e8f0fe" : "none",
                        }}
                      >
                        {
                          this.state.listBookRelates && this.state.listBookRelates.length > 0
                          &&
                          this.state.listBookRelates.map((item, index) => {
                            return (
                              <Draggable
                                key={index}
                                draggableId={"" + index}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <li
                                    className="list-item"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      userSelect: "none",
                                      background: snapshot.isDragging
                                        ? "#e8f0fe"
                                        : "none",
                                      display: "table-row",
                                    }}
                                  >
                                    <div className="block-content">
                                      <div className="action-head">
                                        <a className="mr-14">
                                          <img src="/assets/img/icon-move.svg" alt="" />
                                        </a>
                                        <a onClick={() => this.handleRemoveBookRelate(item)}>
                                          <img src="/assets/img/icon-close.svg" alt="" />
                                        </a>
                                      </div>
                                      <div className="product-info">
                                        <div className="image">
                                          {
                                            item.avatar
                                              ?
                                              <img src={item.avatar} alt="" />
                                              :
                                              <img src="/assets/img/no-image.png" alt="" />
                                          }
                                        </div>
                                        <p className="name">
                                          {item.name ? item.name : ""}
                                        </p>
                                        <span className="price">{item.price ? baseHelpers.currencyFormat(item.price) : 0} đ</span>
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            )
                          })
                        }
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            <div className="block-description">
              <h3 className="title-block">Mô tả sản phẩm</h3>
              <div className="content">
                <SunEditor
                  onImageUploadBefore={this.handleImageUploadBefore}
                  height={'400px'}
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
              <h3 className="title-block">Nội dung</h3>
              <div className="content">
                <SunEditor
                  onImageUploadBefore={this.handleImageUploadBefore}
                  height={'400px'}
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
              <div className="column">
                <div className="block-highlight-info">
                  <h3 className="title-block">Điểm nổi bật của sách</h3>
                  <div className="content">
                    <div className="highlight-input-section">
                      <input
                        type="text"
                        placeholder="Thêm điểm nổi bật cho sách, ví dụ: 'Kèm đáp án chi tiết'"
                        className="highlight-input"
                        value={this.state.newHighlightText}
                        onChange={(e) => this.setState({ newHighlightText: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-success btn-add"
                        onClick={this.handleAddHighlight}
                      >
                        Thêm
                      </button>
                    </div>

                    <DragDropContext onDragEnd={this.onDragEndHighlights}>
                      <Droppable droppableId="book-highlight-droppable">
                        {(provided, snapshot) => (
                          <ul
                            className="ml-0 pl-0"
                            ref={provided.innerRef}
                            style={{ background: snapshot.isDragging ? "#e8f0fe" : "none" }}
                          >
                            {
                              (this.state.bookHighlights && this.state.bookHighlights.length > 0)
                                ? this.state.bookHighlights.map((item, index) => {
                                  const isEditing = this.state.editingHighlightIndex === index;
                                  return (
                                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                      {(provided2, snapshot2) => (
                                        <li
                                          className="highlight-item-row"
                                          ref={provided2.innerRef}
                                          {...provided2.draggableProps}
                                          onDoubleClick={() => this.startEditHighlight(index)}
                                          style={{
                                            ...provided2.draggableProps.style,
                                            background: "#fff",
                                            border: "1px solid #e6edf5",
                                            borderRadius: "8px",
                                            padding: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "10px"
                                          }}
                                        >
                                          {/* Left: drag + text/input */}
                                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <a {...provided2.dragHandleProps} style={{ display: "flex", alignItems: "center" }}>
                                              <img src="/assets/img/icon-move.svg" alt="" />
                                            </a>
                                            {isEditing ? (
                                              <input
                                                type="text"
                                                className="form-control"
                                                style={{ width: "420px" }}
                                                value={this.state.editingHighlightText}
                                                onChange={(e) => this.setState({ editingHighlightText: e.target.value })}
                                                onKeyDown={(e) => e.key === "Enter" ? this.saveEditHighlight() : null}
                                              />
                                            ) : (
                                              <span style={{ fontSize: "16px", color: "#0f172a" }}>
                                                {item.text}
                                              </span>
                                            )}
                                          </div>

                                          {/* Right: actions Sửa/Xóa */}
                                          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                            <a
                                              style={{ color: "#0f172a", fontWeight: 600, cursor: "pointer" }}
                                              onClick={isEditing ? this.saveEditHighlight : () => this.startEditHighlight(index)}
                                            >
                                              {isEditing ? "Lưu" : "Sửa"}
                                            </a>
                                            <a
                                              style={{ color: "#e53935", fontWeight: 600, cursor: "pointer" }}
                                              onClick={() => this.removeHighlight(item.id)}
                                            >
                                              Xóa
                                            </a>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  );
                                })
                                : <span className="empty-state">Chưa có điểm nổi bật cho sách.</span>
                            }
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="drag-instruction">
                      Kéo‑thả để sắp xếp. Double-click để chỉnh sửa.
                    </div>
                  </div>
                </div>
              </div>

              <div className="column">
                <div className="block-course-includes">
                  <h3 className="title-block">Sách bao gồm</h3>
                  <div className="content">
                    <div className="highlight-input-section">
                      <input
                        type="text"
                        placeholder="Ví dụ: 15+ Chuyên đề"
                        className="custom-input"
                        value={this.state.newIncludeText}
                        onChange={(e) => this.setState({ newIncludeText: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={this.openIncludeIconPicker}
                        title="Chọn icon"
                        style={{
                          width: 40,
                          height: 40,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          border: "1px solid #e6edf5",
                          background: "#fff",
                          cursor: "pointer"
                        }}
                      >
                        <SelectedIncludeIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className="btn-success btn-add"
                        onClick={this.handleAddInclude}
                      >
                        Thêm
                      </button>
                    </div>

                    <DragDropContext onDragEnd={this.onDragEndIncludes}>
                      <Droppable droppableId="book-includes-droppable">
                        {(provided, snapshot) => (
                          <ul
                            className="ml-0 pl-0"
                            ref={provided.innerRef}
                            style={{ background: snapshot.isDragging ? "#e8f0fe" : "none" }}
                          >
                            {
                              (this.state.bookIncludes && this.state.bookIncludes.length > 0)
                                ? this.state.bookIncludes.map((item, index) => {
                                  const RowIcon = includeIconMap[item.iconKey] || BookIcon;
                                  return (
                                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                      {(provided2, snapshot2) => (
                                        <li
                                          className="include-item-row"
                                          ref={provided2.innerRef}
                                          {...provided2.draggableProps}
                                          onDoubleClick={() => this.startEditInclude(index)}
                                          style={{
                                            ...provided2.draggableProps.style,
                                            background: "#fff",
                                            border: "1px solid #e6edf5",
                                            borderRadius: "8px",
                                            padding: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "10px"
                                          }}
                                        >
                                          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                            <a className="mr-10" {...provided2.dragHandleProps}>
                                              <img src="/assets/img/icon-move.svg" alt="move" />
                                            </a>

                                            <div
                                              style={{
                                                width: 28,
                                                height: 28,
                                                border: "1px solid #e6edf5",
                                                borderRadius: 8,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginRight: 12,
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                              }}
                                              onDoubleClick={() => this.startEditIncludeIcon(index)}
                                              title="Double-click để đổi icon"
                                            >
                                              <RowIcon size={18} />
                                            </div>

                                            {this.state.editingIncludeIndex === index ? (
                                              <input
                                                type="text"
                                                className="form-control"
                                                style={{ flex: 1 }}
                                                value={this.state.editingIncludeText}
                                                onChange={(e) =>
                                                  this.setState({ editingIncludeText: e.target.value })
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") this.saveEditInclude();
                                                }}
                                              />
                                            ) : (
                                              <span style={{ flex: 1 }}>{item.text}</span>
                                            )}
                                          </div>

                                          <div className="actions" style={{ display: "flex", alignItems: "center" }}>
                                            {this.state.editingIncludeIndex === index ? (
                                              <a
                                                className="ml-12"
                                                onClick={this.saveEditInclude}
                                                style={{ fontWeight: 600, cursor: "pointer" }}
                                              >
                                                Lưu
                                              </a>
                                            ) : null}
                                            <a
                                              className="ml-12"
                                              onClick={() => this.removeInclude(item.id)}
                                              style={{ color: "#e53935", fontWeight: 600, cursor: "pointer" }}
                                            >
                                              Xóa
                                            </a>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  );
                                })
                                : <span className="empty-state">Chưa có tài nguyên kèm theo.</span>
                            }
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="drag-instruction">
                      Kéo-thả để sắp xếp. Double-click vào text để chỉnh sửa, double-click vào icon để đổi icon.
                    </div>

                    {this.state.includeIconPickerOpen && (
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          background: "rgba(0,0,0,0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 9999
                        }}
                      >
                        <div
                          style={{
                            width: 480,
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 12px 32px rgba(0,0,0,0.12)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "16px 20px",
                              borderBottom: "1px solid #eee"
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>Chọn icon</span>
                            <a onClick={this.closeIncludeIconPicker}>
                              <img src="/assets/img/icon-close.svg" alt="close" />
                            </a>
                          </div>

                          <div style={{ padding: 20 }}>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gridTemplateRows: "repeat(4, auto)",
                                gap: 16,
                                justifyItems: "center",
                                alignItems: "center"
                              }}
                            >
                              {["Book", "FileText", "Clock", "FilePlus", "PlusSquare", "Play", "Image", "Link", "BarChart", "Video", "Star", "Users", "Menu", "CheckSquare", "ListChecks", "Layers", "Info", "BookOpen", "FolderPlus"].map((key) => {
                                const IconCmp = includeIconMap[key];
                                const selected = this.state.newIncludeIconKey === key;
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    onClick={() => this.selectIncludeIcon(key)}
                                    style={{
                                      width: 56,
                                      height: 56,
                                      borderRadius: 12,
                                      border: selected ? "2px solid #ff9011" : "1px solid #e6edf5",
                                      background: "#fff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <IconCmp size={24} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", textAlign: "right" }}>
                            <button type="button" className="button" onClick={this.closeIncludeIconPicker}>
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {this.state.includeIconEditPickerOpen && (
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          background: "rgba(0,0,0,0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 9999
                        }}
                      >
                        <div
                          style={{
                            width: 480,
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 12px 32px rgba(0,0,0,0.12)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "16px 20px",
                              borderBottom: "1px solid #eee"
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>Đổi icon</span>
                            <a onClick={this.closeIncludeIconEditPicker}>
                              <img src="/assets/img/icon-close.svg" alt="close" />
                            </a>
                          </div>

                          <div style={{ padding: 20 }}>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gridTemplateRows: "repeat(4, auto)",
                                gap: 16,
                                justifyItems: "center",
                                alignItems: "center"
                              }}
                            >
                              {["Book", "FileText", "Clock", "FilePlus", "PlusSquare", "Play", "Image", "Link", "BarChart", "Video", "Star", "Users", "Menu", "CheckSquare", "ListChecks", "Layers", "Info", "BookOpen", "FolderPlus"].map((key) => {
                                const IconCmp = includeIconMap[key];
                                const selected = this.state.editingIncludeIconKey === key;
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    onClick={() => this.selectEditIncludeIcon(key)}
                                    style={{
                                      width: 56,
                                      height: 56,
                                      borderRadius: 12,
                                      border: selected ? "2px solid #ff9011" : "1px solid #e6edf5",
                                      background: "#fff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer"
                                    }}
                                  >
                                    <IconCmp size={24} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", textAlign: "right" }}>
                            <button type="button" className="button" onClick={this.closeIncludeIconEditPicker}>
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
            <div className="block-action-footer">
              <button type="button" className="btn-cancel" onClick={() => this.props.history.push("/book")} >
                <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                Hủy
              </button>
              <button type="button" className="btn-submit ml-16" onClick={() => this.handleSubmit(1)}>
                Tạo mới
                <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
              </button>
            </div>
            <ModalAttachedClassroom book={this.props.book} handleAddClassroom={this.handleAddClassroomAttached} selectedClassroom={this.state.listClassroomAttached} classroomAttached={this.props.classroomAttached} />
            <ModalClassroomRelate book={this.props.book} handleAddClassroom={this.handleAddClassroomRelate} selectedClassroom={this.state.listClassroomRelates} classroomRelates={this.props.classroomRelates} />
            <ModalBookRelate book={this.props.book} handleAddBook={this.handleAddBookRelate} selectedBooks={this.state.listBookRelates} bookRelates={this.props.bookRelates} />
          </div>
        </div>
      </div >
    );
  }
}

function mapStateToProps(state) {
  return {
    labels: state.label.labels,
    subjects: state.subject.subjects,
    book: state.book.book,
    classroomGroups: state.classroomGroup ? state.classroomGroup.classroomGroups : [],
    redirect: state.book.redirect,
    image: state.book.image,
    students: state.student.students,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { listSubject, createBook, uploadImage, listAdmin, listClassroomGroup, listLabel, syncLabels },
    dispatch
  );
}

let ContainerCreate = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BookCreate)
);

export default ContainerCreate;
