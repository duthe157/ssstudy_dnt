import React, { Component } from "react";
import { listSubject } from "../../../redux/subject/action";
import { createChapter, listChapter } from '../../../redux/chapter/action';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEmpty } from "lodash";
import moment from "moment";
import { Radio, Select, DatePicker, notification } from "antd";
import { createCategory, uploadImage, showCategory, updateCategory } from "../../../redux/category/action";
import { listExam } from "../../../redux/exam/action";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import baseHelpers from "../../../helpers/BaseHelpers";
import copy from 'copy-to-clipboard';
import { notify } from "../../../config/api";

const { Option } = Select;

class ModalEditLesson extends Component {
    constructor(props) {
        super();
        this.state = {
            id: null,
            name: "",
            chapter_id: "",
            subject_id: "",
            classroom_id: props.classroom_id ? props.classroom_id : "",
            content: "",
            is_free: false,
            free_started_at: null,
            free_finished_at: null,
            publish_at: null,
            exam_started_at: null,
            exam_finished_at: null,
            total_video_time: 0,
            video_name: "",
            video_link: "",
            video_duration: "",
            videos: [],
            exams: [],
            doc_link: "",
            exam_id: "",
            exam_doc_link_1: "",
            exam_doc_link_2: "",
            satusOpenDate: false,
            onOffLivestream: false,
            timeLivestream: null,
            rooms: []
        };
    }



    onChange = async (e) => {
        let name = e.target.name;
        let value = e.target.value;
        await this.setState({
            [name]: value
        });


        if (name == "subject_id") {
            let params = {};

            if (value) {
                params = {
                    subject_id: value,
                    limit: 100,
                };
                await this.props.listChapter(params);
            }
        }

    };

    async componentDidMount() {
    }

    _handleEditorContentChange = (content) => {
        this.setState({ content: content });
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

    onSubmit = (e) => {
    };

    fetchOptions() {
        if (this.props.books instanceof Array) {
            return this.props.books.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }


    handleChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
        await this.props.listBook(this.getData());
    };

    async UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }
        if (this.props.selectedCateId !== nextProps.selectedCateId) {
            await this.props.showCategory(nextProps.selectedCateId, this.state.classroom_id);

            if (this.props.category) {
                let cateData = this.props.category;
                const parseRoom = cateData.livestreams && cateData.livestreams.length > 0 ? cateData.livestreams.map((room) => {
                    return {
                        id: room.ordering,
                        link: room.room_link
                    }
                }) : [{ id: 1, link: "" }];
                this.setState({
                    id: cateData._id,
                    name: cateData.name ? cateData.name : "",
                    chapter_id: cateData.chapter ? cateData.chapter.id : "",
                    subject_id: cateData.subject ? cateData.subject.id : "",
                    content: cateData.content ? cateData.content : "",
                    is_free: cateData.is_free ? cateData.is_free : false,
                    free_started_at: cateData.created_at ? cateData.created_at : null,
                    free_finished_at: cateData.free_finished_at ? cateData.free_finished_at : null,
                    publish_at: cateData.publish_at ? cateData.publish_at : null,
                    exam_started_at: cateData.exam_started_at ? cateData.exam_started_at : null,
                    exam_finished_at: cateData.exam_finished_at ? cateData.exam_finished_at : null,
                    total_video_time: cateData.total_video_time ? cateData.total_video_time : 0,
                    videos: cateData.videos ? cateData.videos : [],
                    doc_link: cateData.doc_link ? cateData.doc_link : "",
                    exams: cateData.exams && cateData.exams.length > 0 ? cateData.exams : (cateData.exam ? (Array.isArray(cateData.exam) ? cateData.exam : [cateData.exam]) : []),
                    exam_doc_link_1: cateData.exam_doc_link_1 ? cateData.exam_doc_link_1 : "",
                    exam_doc_link_2: cateData.exam_doc_link_2 ? cateData.exam_doc_link_2 : "",
                    onOffLivestream: cateData.livestream_btn ? cateData.livestream_btn : false,
                    timeLivestream: cateData.start_date_time_live ? cateData.start_date_time_live : null,
                    rooms: parseRoom
                })
            }
        }
    }

    handleSubmit = async () => {
        let {
            id,
            name,
            chapter_id,
            exam_started_at,
            exam_finished_at,
            subject_id,
            content,
            is_free,
            free_started_at,
            publish_at,
            classroom_id,
            free_finished_at,
            total_video_time,
            videos,
            exams,
            doc_link,
            exam_doc_link_1,
            exam_doc_link_2,
            onOffLivestream,
            timeLivestream,
            rooms
        } = this.state;
        const parserRoomLive = rooms.filter(room => room.link).map((item, index) => {
            return {
                name: `Phòng ${index + 1}`,
                room_link: item.link,
                ordering: index + 1
            }
        });
        let data = {
            id,
            name,
            chapter_id,
            subject_id,
            classroom_id,
            content,
            is_free,
            free_started_at,
            free_finished_at,
            exam_started_at,
            exam_finished_at,
            publish_at,
            total_video_time,
            videos,
            exam_id: exams && exams.length > 0 ? exams.map(e => e.id) : [],
            doc_link,
            exam_doc_link_1,
            exam_doc_link_2,
            livestream_btn: onOffLivestream,
            start_date_time_live: timeLivestream,
            livestreams: parserRoomLive
        };


        await this.props.updateCategory(data);
    };

    fetchSubjects() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return <option key={i} value={obj._id}>{obj.name}</option>;
            });
        }
    }

    fetchChapters() {
        if (this.props.chapters instanceof Array) {
            return this.props.chapters.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    handleRemoveLesson = async (index) => {
        let listVideo = [...this.state.videos];

        listVideo.splice(index, 1);
        await this.setState({
            videos: listVideo
        })

    }

    handleRemoveExam = async (index) => {
        let listExam = [...this.state.exams];
        listExam.splice(index, 1);
        await this.setState({
            exams: listExam
        })
    }

    changeDateStart = (date, dateString) => {
        if (date !== null) {
            this.setState({
                free_started_at: date.format("YYYY/MM/DD HH:mm"),
            });
        } else {
            this.setState({
                free_started_at: null,
            });
        }
    };

    changeDateEnd = (date, dateString) => {
        if (date !== null) {
            this.setState({
                free_finished_at: date.format("YYYY/MM/DD HH:mm"),
            });
        } else {
            this.setState({
                free_finished_at: null,
            });
        }
    };

    changePublishAt = (date, dateString) => {
        if (date !== null) {
            this.setState({
                publish_at: date.format("YYYY/MM/DD"),
            });
        } else {
            this.setState({
                publish_at: null,
            });
        }
    };

    changeStartedAt = (date, dateString) => {
        if (date !== null) {
            this.setState({
                exam_started_at: date.format("YYYY/MM/DD HH:mm"),
            });
        } else {
            this.setState({
                exam_started_at: null,
            });
        }
    };

    changeFinishedAt = (date, dateString) => {
        if (date !== null) {
            this.setState({
                exam_finished_at: date.format("YYYY/MM/DD HH:mm"),
            });
        } else {
            this.setState({
                exam_finished_at: null,
            });
        }
    };

    handleAddSelectedVideo = async () => {
        let { video_name, video_link, video_duration } = this.state;

        let data = {
            name: video_name,
            link: video_link,
            duration: video_duration
        };

        await this.handleAddVideo(data);


        await this.setState({
            video_name: "",
            video_link: "",
            video_duration: 0
        })
    }

    handleAddVideo = async (data) => {
        let listVideos = [...this.state.videos];
        if (data) {
            let objVideo = {
                ...data,
                ordering: listVideos.length + 1
            }
            listVideos.push(objVideo);
        }

        await this.setState({
            videos: listVideos
        })
    }

    fetchVideoRows() {
        if (this.state.videos instanceof Array) {
            return this.state.videos.map((object, index) => {
                return (
                    <Draggable
                        key={index}
                        draggableId={"" + index}
                        index={index}
                    >
                        {(provided, snapshot) => (
                            <tr
                                className="v-middle table-row-item"
                                data-id={17}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <td>
                                    <img src="/assets/img/icon-move.svg" alt="" />
                                </td>
                                <td className="text-left">
                                    {object.name}
                                </td>
                                <td className="text-left">
                                    {object.link}
                                </td>

                                <td className="text-left">
                                    {object.duration}
                                </td>


                                <td className='text-right'>
                                    <div className="item-action">
                                        <span className="cursor-pointer mr-2" onClick={() => {
                                            copy(object.link)
                                            notification.success({
                                                message: "Đã sao chép liên kết",
                                                placement: 'topRight',
                                                top: 50,
                                                duration: 3,
                                            });
                                        }}>
                                            <img src="/assets/img/icon-copy.svg" alt="" />
                                        </span>
                                        <a href="#!" onClick={() => this.handleRemoveLesson(index)}>
                                            <img src="/assets/img/icon-delete.svg" alt="" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </Draggable>
                );
            });
        }
    }

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    onDragEndVideo = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = this.reorder(
            this.state.videos,
            result.source.index,
            result.destination.index
        );

        await this.setState({
            videos: items,
        });
    }

    fetchOptionsExam = () => {
        if (this.props.exams instanceof Array) {
            return this.props.exams.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    onChangeExam(val) {
        this.setState({
            exam_id: val
        })
    }

    onSearchExam = async (value) => {
        if (value) {
            await this.props.listExam({
                type: "DE_THI",
                limit: 999,
                keyword: value,
                subject_id: this.state.subject_id,
                creating_type: "ALL"
            });
        }
    };
    handleListExam = async () => {
        const data = {
            type: "DE_THI",
            limit: 20,
            subject_id: this.state.subject_id,
            is_delete: false,
            creating_type: "ALL"
        };
        await this.props.listExam(data);
    }

    handleAddSelectedExam = async () => {
        let { exams } = this.props;
        let exam_id = this.state.exam_id;

        if (exams) {
            let findata = exams.find(el => el._id === exam_id);

            if (findata) {
                let data = {
                    id: exam_id,
                    name: findata.name,
                    num_question: findata.questions ? findata.questions.length : 0
                }

                let listExams = [...this.state.exams];
                listExams.push(data);

                await this.setState({
                    exams: listExams,
                    exam_id: ""
                })
            }
        }
    }

    onSearchChapter = async (value) => {
        if (value) {
            await this.props.listChapter({
                limit: 999,
                keyword: value,
                subject_id: this.state.subject_id,
            });
        }
    };

    onChangeChapter(val) {
        this.setState({
            chapter_id: val
        })
    }

    onFocusDate() {
        console.log('click', this.state.satusOpenDate)
        if (this.state.satusOpenDate === false) {
            document.getElementById('modal-edit-lesson').style.overflowY = 'hidden'
            this.setState({
                satusOpenDate: true
            })
        } else {
            document.getElementById('modal-edit-lesson').style.overflowY = 'auto'
            this.setState({
                satusOpenDate: false
            })
        }
    }

    _onChangeSwitch = e => {
        var name = e.target.name;
        let checked = e.target.checked;
        this.setState({
            [name]: checked,
        });
    };

    handleLinkChange = (id, value) => {
        const updatedRooms = this.state.rooms.map((room) =>
            room.id === id ? { ...room, link: value } : room
        );
        this.setState({ rooms: updatedRooms });
    };

    handleAddRoom = () => {
        const newId = Date.now();
        this.setState((prevState) => ({
            rooms: [...prevState.rooms, { id: newId, link: '' }],
        }));
    };

    handleDeleteRoom = (id) => {
        const updatedRooms = this.state.rooms.filter((room) => room.id !== id);
        this.setState({ rooms: updatedRooms });
    };


    render() {

        let settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1
        };

        return (
            <>
                <div
                    id="modal-edit-lesson"
                    className="modal fade modal-lesson book"
                    data-backdrop="true"
                    style={{
                        display: "none",
                        minWidth: "1000px",
                        zIndex: 1050
                    }}
                    aria-hidden="true"
                >
                    <div
                        className='modal-dialog animate fade-down modal-xl'
                        data-class='fade-down'
                        style={{
                            width: "900px"
                        }}
                    >
                        <div className='modal-content p-24'>
                            <div className='modal-body'>
                                <div className="block-content">
                                    <div className="block-info-lesson">
                                        <h3 className="title">Thông tin bài học</h3>
                                        <div className="input-item-flex">
                                            <div className="form-group w-100">
                                                <label className="text-form-label">Tên bài học</label>
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        onChange={this.onChange}
                                                        value={this.state.name}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="input-item-flex mt-24">
                                            <div className="form-group mr-16">
                                                <label className=" col-form-label">Miễn phí</label>
                                                <div>
                                                    <Radio.Group
                                                        onChange={this.onChange}
                                                        name="is_free"
                                                        value={this.state.is_free}
                                                    >
                                                        <Radio value={true}>Có</Radio>
                                                        <Radio value={false}>Không</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                            <div className="form-group mr-16">
                                                <label className=" col-form-label">Thời gian miễn phí</label>
                                                <div className="group-date" style={{ display: "flex" }}>
                                                    <DatePicker
                                                        onOpenChange={() => this.onFocusDate()}
                                                        format={
                                                            "YYYY/MM/DD HH:mm"
                                                        }
                                                        value={this.state.free_started_at
                                                            ? moment(this.state.free_started_at)
                                                            : null}
                                                        showTime={{ format: 'HH:mm' }}
                                                        placeholder="Từ ngày"
                                                        onChange={this.changeDateStart}
                                                    />
                                                    <DatePicker
                                                        onOpenChange={() => this.onFocusDate()}
                                                        format={
                                                            "YYYY/MM/DD HH:mm"
                                                        }
                                                        value={this.state.free_finished_at
                                                            ? moment(this.state.free_finished_at)
                                                            : null}
                                                        showTime={{ format: 'HH:mm' }}
                                                        placeholder="Đến ngày"
                                                        onChange={this.changeDateEnd}
                                                        className="ml-2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className=" col-form-label">Lượt xem tối đa</label>
                                                <div>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="total_video_time"
                                                        onChange={this.onChange}
                                                        value={this.state.total_video_time}
                                                    />
                                                </div>
                                            </div>
                                            {/*<div className="form-group">*/}
                                            {/*    <label className=" col-form-label">Lượt xem tối đa</label>*/}
                                            {/*    <div>*/}
                                            {/*        <input*/}
                                            {/*            type="number"*/}
                                            {/*            className="form-control"*/}
                                            {/*            name="total_video_time"*/}
                                            {/*            onChange={this.onChange}*/}
                                            {/*            value={this.state.total_video_time}*/}
                                            {/*        />*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </div>

                                        <div className="input-item-flex mt-24">
                                            <div className="form-group mr-16" style={{ width: "220px" }}>
                                                <label className=" col-form-label">Môn học</label>
                                                <div>
                                                    <select
                                                        className="custom-select"
                                                        value={
                                                            this.state.subject_id
                                                        }
                                                        name="subject_id"
                                                        onChange={this.onChange}>
                                                        <option value="">
                                                            -- Chọn môn học --
                                                        </option>
                                                        {this.fetchSubjects()}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group mr-16" style={{ width: "350px" }}>
                                                <label className=" col-form-label">Chương học</label>
                                                <div>
                                                    {/* <select
                                                        className="custom-select"
                                                        value={
                                                            this.state.chapter_id
                                                        }
                                                        name="chapter_id"
                                                        onChange={this.onChange}>
                                                        <option value="">
                                                            -- Chọn chương --
                                                        </option>
                                                        {this.fetchChapters()}
                                                    </select> */}

                                                    <Select
                                                        showSearch
                                                        placeholder="-- Chọn chương học -- "
                                                        optionFilterProp="children"
                                                        onChange={(val) => this.onChangeChapter(val)}
                                                        // onFocus={this.handleListExam}
                                                        onSearch={this.onSearchChapter}
                                                        name="chapter_id"
                                                        value={this.state.chapter_id}
                                                    >
                                                        {this.fetchChapters()}
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="form-group " style={{ width: "150px", marginTop: "10px" }}>
                                                <label className="text-form-label">Link tài liệu bài học (nếu có)</label>
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="doc_link"
                                                        onChange={this.onChange}
                                                        value={this.state.doc_link}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="input-item-flex mt-24">

                                            <div className="form-group" style={{ width: "50%", marginRight: "12px" }}>
                                                <label className="text-form-label">Link đề có đáp án</label>
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="exam_doc_link_1"
                                                        onChange={this.onChange}
                                                        value={this.state.exam_doc_link_1}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group" style={{ width: "50%", marginLeft: "12px" }}>
                                                <label className="text-form-label">Link đề không có đáp án</label>
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="exam_doc_link_2"
                                                        onChange={this.onChange}
                                                        value={this.state.exam_doc_link_2}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="block-attach-product p-0 mt-24">
                                        <div className="title-action">
                                            <h3 className="title-block mb-0 mr-18">Danh sách video</h3>
                                            <div className="col">
                                                <label className="ui-switch ui-switch-md info m-t-xs">
                                                    <input
                                                        type="checkbox"
                                                        name="onOffLivestream"
                                                        value={this.state.onOffLivestream}
                                                        checked={this.state.onOffLivestream === true ? 'checked' : ''}
                                                        onChange={this._onChangeSwitch}
                                                    />
                                                    <i />
                                                </label>
                                                <span> Livestream </span>
                                            </div>
                                        </div>
                                        {
                                            this.state.onOffLivestream ? (
                                                <div className="block-add-livestream">
                                                    <div className="p-4 bg-white rounded shadow-md mx-auto" style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                        <div className="form-group mb-4" style={{ width: '30%', marginRight: '24px' }}>
                                                            <label className="block text-sm font-semibold mb-2">Ngày & Giờ livestream</label>
                                                            <div className="group-date">
                                                                <DatePicker
                                                                    onOpenChange={() => this.onFocusDate()}
                                                                    id="datepickerstart"
                                                                    format={
                                                                        "YYYY/MM/DD HH:mm"
                                                                    }
                                                                    value={this.state.timeLivestream
                                                                        ? moment(this.state.timeLivestream)
                                                                        : null}
                                                                    showTime={{ format: 'HH:mm' }}
                                                                    placeholder="Chọn ngày và giờ"
                                                                    onChange={(date) => this.setState({ timeLivestream: date })}
                                                                    disabledDate={(current) => {
                                                                        return current && current < moment().startOf('minute');
                                                                    }}
                                                                />
                                                            </div>

                                                        </div>
                                                        {/* Link phòng học */}
                                                        <div style={{ flexGrow: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <label className="block text-sm font-semibold mb-2">Link phòng học</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn-submit btn-add-video ml-16"
                                                                    onClick={this.handleAddRoom}
                                                                    style={{ marginBottom: '10px', backgroundColor: "#ff8345", color: '#fff', border: "none", padding: "8px", borderRadius: "4px" }}
                                                                >
                                                                    Thêm phòng học
                                                                </button>
                                                            </div>
                                                            {console.log('this.state.rooms', this.state.rooms)}
                                                            {this.state.rooms.map((room, index) => (
                                                                <div key={room.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <span style={{ minWidth: '70px' }}> Phòng {index + 1}</span>
                                                                    <input
                                                                        type="text"
                                                                        value={room.link}
                                                                        onChange={(e) => this.handleLinkChange(room.id, e.target.value)}
                                                                        className="form-control"
                                                                        style={{ flexGrow: 1, marginRight: '10px' }}
                                                                    />
                                                                    {this.state.rooms.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => this.handleDeleteRoom(room.id)}
                                                                            className="btn btn-icon btn-delete"
                                                                        >
                                                                            <img src="/assets/img/icon-delete.svg" alt="Delete" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : <div className="block-add-video">

                                                <div className="input-item-flex" style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
                                                    <div className="form-group mb-0 mr-16">
                                                        <label className="text-form-label">Tiêu đề</label>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="video_name"
                                                                onChange={this.onChange}
                                                                value={this.state.video_name}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group mb-0 mr-16">
                                                        <label className="text-form-label">Link video</label>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="video_link"
                                                                onChange={this.onChange}
                                                                value={this.state.video_link}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group mb-0 mr-16">
                                                        <label className="text-form-label">Thời gian (phút)</label>
                                                        <div>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="video_duration"
                                                                onChange={this.onChange}
                                                                value={this.state.video_duration}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button type="button" className="btn-submit btn-add-video ml-16" onClick={this.handleAddSelectedVideo}>
                                                        Thêm video
                                                    </button>
                                                </div>

                                            </div>
                                        }


                                        <div className="list-videos-selected">
                                            <DragDropContext onDragEnd={this.onDragEndVideo}>
                                                <Droppable droppableId="droppable">
                                                    {(provided, snapshot) => (
                                                        <table className="table table-theme table-row v-middle" ref={provided.innerRef}>
                                                            <thead className="text-muted">
                                                                <tr>
                                                                    <th style={{ width: 10 }}></th>
                                                                    <th>Tên video</th>
                                                                    <th className="text-left">
                                                                        Link video
                                                                    </th>
                                                                    <th width="125px" className="text-left">
                                                                        Thời gian
                                                                    </th>
                                                                    <th className='text-right'>
                                                                        Thao tác
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>{this.fetchVideoRows()}</tbody>
                                                            {provided.placeholder}
                                                        </table>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </div>
                                    </div>

                                    <div className="block-attach-product block-show-exam mt-24 p-0">
                                        <div className="title-action">
                                            <h3 className="title-block mb-0 mr-18">Đề thi</h3>
                                        </div>

                                        <div className="block-add-video">

                                            <div className="input-item-flex" style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
                                                <div className="form-group mb-0 mr-16" style={{ width: "100%" }}>
                                                    <label className="text-form-label">Tiêu đề</label>
                                                    <div>
                                                        <Select
                                                            showSearch
                                                            placeholder="-- Chọn đề thi -- "
                                                            optionFilterProp="children"
                                                            onChange={(val) => this.onChangeExam(val)}
                                                            onFocus={this.handleListExam}
                                                            onSearch={this.onSearchExam}
                                                            name="exam_id"
                                                            value={this.state.exam_id}
                                                        >
                                                            {this.fetchOptionsExam()}
                                                        </Select>
                                                    </div>
                                                </div>
                                                <button type="button" className="btn-submit btn-add-video ml-16" onClick={this.handleAddSelectedExam}>
                                                    Thêm đề thi
                                                </button>
                                            </div>

                                        </div>

                                        <div className="list-exams-selected">
                                            {
                                                this.state.exams && this.state.exams.length > 0 && this.state.exams.map((item, index) => {
                                                    return (
                                                        <div className="block-exam mt-12" key={index}>
                                                            <div className="action">
                                                                <a href="#!" onClick={() => this.handleRemoveExam(index)}>
                                                                    <img src="/assets/img/icon-close.svg" alt="" />
                                                                </a>
                                                            </div>
                                                            <div className="block-exam-info">
                                                                <div className="form-group">
                                                                    <label className="col-form-label">Tên đề thi</label>
                                                                    <span>{item.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>

                                    <div className="block-description mt-24">
                                        <h3 className="title-block">Mô tả bài học</h3>
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
                                    {
                                        this.state.classroom_id
                                        &&
                                        <>
                                            <div className="input-item-flex mt-24">
                                                <div className="form-group" style={{ marginRight: "12px" }}>
                                                    <label className="text-form-label">Thời phát hành bài giảng</label>
                                                    <div>
                                                        <DatePicker
                                                            onOpenChange={() => this.onFocusDate()}
                                                            format={
                                                                "YYYY/MM/DD"
                                                            }
                                                            value={this.state.publish_at
                                                                ? moment(this.state.publish_at)
                                                                : null}
                                                            placeholder="Thời gian phát hành"
                                                            onChange={this.changePublishAt}
                                                            className="ml-2"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group" style={{ marginRight: "12px" }}>
                                                    <label className="text-form-label">Thời gian mở đề</label>
                                                    <div>
                                                        <DatePicker
                                                            onOpenChange={() => this.onFocusDate()}
                                                            format={
                                                                "YYYY/MM/DD HH:mm"
                                                            }
                                                            value={this.state.exam_started_at
                                                                ? moment(this.state.exam_started_at)
                                                                : null}
                                                            showTime={{ format: 'HH:mm' }}
                                                            placeholder="Thời gian mở đề"
                                                            onChange={this.changeStartedAt}
                                                            className="ml-2"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group" style={{ marginLeft: "12px" }}>
                                                    <label className="text-form-label">Thời gian đóng đề</label>
                                                    <div>
                                                        <DatePicker
                                                            onOpenChange={() => this.onFocusDate()}
                                                            format={
                                                                "YYYY/MM/DD HH:mm"
                                                            }
                                                            value={this.state.exam_finished_at
                                                                ? moment(this.state.exam_finished_at)
                                                                : null}
                                                            placeholder="Thời gian đóng đề"
                                                            showTime={{ format: 'HH:mm' }}
                                                            onChange={this.changeFinishedAt}
                                                            className="ml-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="block-action-footer">
                                    <button data-dismiss='modal' type="button" className="btn-cancel">
                                        <img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
                                        Hủy thay đổi
                                    </button>
                                    <button type="button" className="btn-submit ml-16" onClick={this.handleSubmit}>
                                        Cập nhật
                                        <img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* <ModalAddVideo handleAddVideo={this.handleAddVideo} /> */}
                {/* <ModalAddExam handleAddExam={this.handleAddExam} /> */}
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        subjects: state.subject.subjects,
        chapters: state.chapter.chapters,
        redirect: state.chapter.redirect,
        redirect_cate: state.category.redirect,
        image: state.question.image,
        category: state.category.category,
        exams: state.exam.exams,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listSubject, createChapter, createCategory, uploadImage, showCategory, updateCategory, listExam, listChapter
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ModalEditLesson)
);
