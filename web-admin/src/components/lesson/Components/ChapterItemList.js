import React, { Component } from "react";
import { Select } from "antd";
import { withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { map } from "lodash";
const { Option } = Select;

class ChapterItemList extends Component {
    constructor(props) {
        super();
        const initialSelectedSubjectId = props.obj?.selected_subject_id || null;
        this.state = {
            selectedSubjectId: initialSelectedSubjectId, // Khởi tạo từ props
        };
        
    }

    componentDidMount() {
        // Khởi tạo selectedSubjectId từ chapter nếu có và chưa được set
        if (this.props.obj && this.props.obj.selected_subject_id && !this.state.selectedSubjectId) {
            this.setState({
                selectedSubjectId: this.props.obj.selected_subject_id
            });
        }
    }

    componentDidUpdate(prevProps) {
        // Cập nhật selectedSubjectId khi props thay đổi
        const prevSelectedSubjectId = prevProps.obj?.selected_subject_id;
        const currentSelectedSubjectId = this.props.obj?.selected_subject_id;
        
        if (prevSelectedSubjectId !== currentSelectedSubjectId) {
            this.setState({
                selectedSubjectId: currentSelectedSubjectId || null
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {

    }



    getData = (pageNumber = 1) => {
        const data = {
            page: pageNumber,
            limit: this.state.limit,
        };
        if (this.state.keyword != null) {
            data["keyword"] = this.state.keyword;
        }
        if (this.state.subject_id !== "") {
            data["subject_id"] = this.state.subject_id;
        }
        return data;
    };

    // setIsNotOpenBlock = () => {
    //     this.props.handleSetIsNotOpenBlock();
    // }

    getListCategory = (id) => {
        this.props.getListCategory(id);
    }

    setChapterData = (data) => {
        this.props.setChapterData(data);
    }

    handleSetCateId = (id) => {
        this.props.handleSetCateId(id);
    }

    onDragEndCategory = (result) => {
        this.props.onDragEndCategory(result);
    }

    addChapter = (obj) => {
        this.props.handleAddChapter(obj);
    }

    removeChapter = (id) => {
        this.props.handleRemoveChapter(id);
    }

    handleCoppyChapter = (chapterId) => {
        if (chapterId) {
            this.props.handleCoppyChapter(chapterId);
        }
    }

    // Thêm method để handle khi chọn môn học
    handleSubjectChange = (subjectId) => {
        this.setState({ selectedSubjectId: subjectId });
        // Gọi callback function nếu có
        if (this.props.onSubjectChange) {
            this.props.onSubjectChange(subjectId);
        }
        // Gọi callback để cập nhật selectedChapters với subject_id
        if (this.props.handleSubjectChangeForChapter && this.props.obj) {
            this.props.handleSubjectChangeForChapter(this.props.obj._id, subjectId);
        }
    }


    async componentDidMount() {
    }

    render() {
        let { obj, categories, isOpen, selectedChapterId, index, provided, isDragChapter, providedRef, isNotShowAction, isBtnAddChapter, showSubjectSelector = false, subjectList = [] } = this.props;
        return (
            <div
                className="list-item"
            // onMouseLeave={() => this.setIsNotOpenBlock()}
            // ref={provided.innerRef}
            // {...provided.draggableProps}
            // {...provided.dragHandleProps}
            >
                <>
                    {
                        isDragChapter
                            ?
                            <div
                                className="title-action"
                            // {...provided.dragHandleProps}
                            >
                                <div className="title" onClick={() => this.getListCategory(obj._id)}>
                                    <span
                                        className="mr-10"
                                    >
                                        {
                                            isOpen && selectedChapterId == obj._id
                                                ?
                                                <img src="/assets/img/icon-chapter-list-open.svg" alt="" />
                                                :
                                                <img src="/assets/img/icon-chapter-list-close.svg" alt="" />
                                        }
                                    </span>
                                    <div
                                        style={{ display: "flex" }}
                                        {...provided.dragHandleProps}
                                    >

                                        {
                                            obj.level && obj.level != ""
                                            &&
                                            <span className="subject-name mr-10">Lớp {obj.level}</span>
                                        }

                                        <span className="subject-name mr-10">{obj.subject.name}</span>

                                        <h3>{obj.name}</h3>

                                    </div>
                                </div>
                                {showSubjectSelector && (
                                    <div className="subject-selector mb-10">
                                        <Select
                                            placeholder="Chọn môn học"
                                            style={{ width: '100px' }}
                                            value={this.state.selectedSubjectId}
                                            onChange={this.handleSubjectChange}
                                            allowClear
                                        >
                                            {subjectList.map((subject) => (
                                                <Option key={subject._id || subject.id} value={subject._id || subject.id}>
                                                    {subject.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                                {
                                    isOpen && selectedChapterId == obj._id
                                    &&
                                    <div>
                                        {
                                            !isNotShowAction || isNotShowAction == false
                                                ?
                                                <div className="action">
                                                    <span
                                                        className="edit cursor-pointer"
                                                        data-toggle="modal"
                                                        data-target="#modal-edit-chapter"
                                                        data-toggle-className="fade-down"
                                                        data-toggle-class-target=".animate"
                                                        onClick={() => this.setChapterData(obj)}
                                                    >
                                                        <img src="/assets/img/icon-edit.svg" alt="" />
                                                    </span>
                                                    <span
                                                        className="delete cursor-pointer"
                                                        data-toggle="modal"
                                                        data-target="#delete-chapter"
                                                        data-toggle-className="fade-down"
                                                        data-toggle-class-target=".animate"
                                                    >
                                                        <img src="/assets/img/icon-close.svg" alt="" />
                                                    </span>
                                                </div>
                                                :
                                                <div>
                                                    {
                                                        isBtnAddChapter
                                                            ?
                                                            <div className="action custom-btn-add-chapter">
                                                                <button type="button" onClick={() => this.addChapter(obj)}>
                                                                    <img src="/assets/img/icon-arrow-left.svg" alt="" />
                                                                    Thêm
                                                                </button>
                                                            </div>
                                                            :
                                                            <div className="action custom-btn-add-chapter">
                                                                <button type="button" onClick={() => this.removeChapter(obj._id)}>
                                                                    Bỏ ra
                                                                    <img src="/assets/img/icon-arrow-right.svg" alt="" style={{ marginRight: "0px", marginLeft: "12px" }} />
                                                                </button>
                                                            </div>
                                                    }
                                                </div>
                                        }
                                    </div>
                                }
                            </div>
                            :
                            <div
                                className="title-action"
                            >
                                <div className="title" onClick={() => this.getListCategory(obj._id)}>
                                    <span
                                        className="mr-10"
                                    >
                                        {
                                            isOpen && selectedChapterId == obj._id
                                                ?
                                                <img src="/assets/img/icon-chapter-list-open.svg" alt="" />
                                                :
                                                <img src="/assets/img/icon-chapter-list-close.svg" alt="" />
                                        }
                                    </span>
                                    {
                                        obj.level && obj.level != ""
                                        &&
                                        <span className="subject-name mr-10">Lớp {obj.level}</span>
                                    }

                                    <span className="subject-name mr-10">{obj.subject.name}</span>

                                    <h3>{obj.name}</h3>
                                </div>
                                {
                                    isOpen && selectedChapterId == obj._id
                                    &&
                                    <div>
                                        {
                                            !isNotShowAction || isNotShowAction == false
                                                ?
                                                <div className="action">
                                                    <span
                                                        className="edit cursor-pointer"
                                                        data-toggle="modal"
                                                        data-target="#modal-edit-chapter"
                                                        data-toggle-className="fade-down"
                                                        data-toggle-class-target=".animate"
                                                        onClick={() => this.setChapterData(obj)}
                                                    >
                                                        <div data-toggle='tooltip'
                                                            title='Chỉnh sửa'
                                                        >
                                                            <img src="/assets/img/icon-edit.svg" alt="" />
                                                        </div>
                                                    </span>
                                                    <div
                                                        data-toggle='tooltip'
                                                        title='Copy chương học'
                                                    >
                                                        <a className="mr-14" onClick={() => this.handleCoppyChapter(obj._id)}>
                                                            <img src="/assets/img/icon-document.svg" alt="" />
                                                        </a>
                                                    </div>
                                                    <span
                                                        className="delete cursor-pointer"
                                                        data-toggle="modal"
                                                        data-target="#delete-chapter"
                                                        data-toggle-className="fade-down"
                                                        data-toggle-class-target=".animate"
                                                    >
                                                        <img src="/assets/img/icon-close.svg" alt="" />
                                                    </span>
                                                </div>
                                                :
                                                <div>
                                                    {
                                                        isBtnAddChapter
                                                            ?
                                                            <div className="action custom-btn-add-chapter">
                                                                <button type="button" onClick={() => this.addChapter(obj)}>
                                                                    <img src="/assets/img/icon-arrow-left.svg" alt="" />
                                                                    Thêm
                                                                </button>
                                                            </div>
                                                            :
                                                            <div className="action custom-btn-add-chapter">
                                                                <button type="button" onClick={() => this.removeChapter(obj._id)}>
                                                                    Bỏ ra
                                                                    <img src="/assets/img/icon-arrow-right.svg" alt="" style={{ marginRight: "0px", marginLeft: "12px" }} />
                                                                </button>
                                                            </div>
                                                    }
                                                </div>
                                        }
                                    </div>
                                }
                            </div>
                    }


                    {
                        isOpen && selectedChapterId == obj._id
                        &&
                        <div className="list-categories">
                            <DragDropContext onDragEnd={this.onDragEndCategory}>
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <ul
                                            ref={provided.innerRef}
                                            style={{
                                                background: snapshot.isDragging ? "#e8f0fe" : "none",
                                            }}
                                        >
                                            {
                                                categories && categories.length > 0 &&
                                                categories.map((item, index) => {
                                                    return (

                                                        <Draggable
                                                            key={index}
                                                            draggableId={"" + index}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (

                                                                <li
                                                                    className="cate-item"
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                >
                                                                    <span className="icon-lesson-list-arrow">
                                                                        <img src="/assets/img/icon-lesson-list.svg" alt="/" />
                                                                    </span>
                                                                    <div className="block-item-action">
                                                                        <div className="item-move">
                                                                            <img src="/assets/img/icon-move.svg" alt="" {...provided.dragHandleProps} />
                                                                            <span
                                                                                className="cursor-pointer"
                                                                                data-toggle="modal"
                                                                                data-target="#modal-edit-lesson"
                                                                                data-toggle-className="fade-down"
                                                                                data-toggle-class-target=".animate"
                                                                                onClick={() => this.handleSetCateId(item._id)}
                                                                            >{item.name}</span>
                                                                        </div>
                                                                        {
                                                                            !isNotShowAction || isNotShowAction == false
                                                                                ?
                                                                                <div className="action-pull-right">
                                                                                    {
                                                                                        item.is_free
                                                                                        &&
                                                                                        <span className="show-text text-isFree">Miễn phí</span>
                                                                                    }
                                                                                    <span
                                                                                        className="view cursor-pointer"
                                                                                        data-toggle="modal"
                                                                                        data-target="#modal-edit-lesson"
                                                                                        data-toggle-className="fade-down"
                                                                                        data-toggle-class-target=".animate"
                                                                                        onClick={() => this.handleSetCateId(item._id)}
                                                                                    >
                                                                                        <div data-toggle="tooltip" title="Xem chi tiết và chỉnh sửa">
                                                                                            <img src="/assets/img/icon-view.svg" alt="" />
                                                                                        </div>
                                                                                    </span>
                                                                                    <span
                                                                                        className="delete cursor-pointer"
                                                                                        data-toggle="modal"
                                                                                        data-target="#delete-lesson"
                                                                                        data-toggle-className="fade-down"
                                                                                        data-toggle-class-target=".animate"
                                                                                        onClick={() => this.handleSetCateId(item._id)}
                                                                                    >
                                                                                        <img src="/assets/img/icon-close.svg" alt="" />
                                                                                    </span>
                                                                                </div>
                                                                                :
                                                                                ""
                                                                        }
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
                    }
                </>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ChapterItemList)
);
