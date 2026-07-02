import React, { Component } from "react";
import { notification, Select } from "antd";
import {
    listClassroom,
    listChapterCategory,
    removeCategory,
    removeChapter,
    addChapter,
    addCategory
} from "../../redux/classroom/action";
import {
    addClassroom,
    removeClassroom,
    getQuestionClassrooms,
} from "../../redux/question/action";
import {
    listChapter,
} from "../../redux/chapter/action";
import {
    listCategory,
} from "../../redux/category/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import LessonRaw from "./LessonRaw";
const { Option } = Select;

class Lesson extends Component {
    constructor(props) {
        super();
        this.state = {
            chapter_id: ""
        };
    }

    fetchOptions() {
        if (this.props.chapters instanceof Array) {
            return this.props.chapters.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    fetchRows() {
        if (this.props.chapterCategories instanceof Array) {
            return this.props.chapterCategories.map((object, i) => {
                return (
                    <LessonRaw
                        obj={object}
                        key={i}
                        index={i} />
                );
            });
        }
    }
    handleChangeTag = async (value) => {
        await this.setState({
            filter: value,
        });
    };

    async componentDidMount() {
        await this.props.listChapter({ limit: 999, subject_id: this.props.subject_id });
        await this.props.listChapterCategory({
            classroom_id: this.props.match.params.id,
        });
    }

    onChange = async (value) => {
        await this.setState({
            chapter_id: value,
        });
    };

    handleSubmit = async () => {
        if (this.state.chappter_id !== "") {
            const data = {
                chapter_id: this.state.chapter_id,
                classroom_id: this.props.match.params.id,
            };
            await this.props.addChapter(data);
            await this.props.listChapterCategory({
                classroom_id: this.props.match.params.id,
            });
        } else {
            notification.warning({
                message: "Vui lòng chọn chương !",
                placement: "topRight",
                top: 50,
                duration: 3,
                style: {
                    zIndex: 1050,
                },
            });
        }
    };

    render() {
        return (
            <div
                className="modal-dialog animate fade-down modal-xl"
                data-class="fade-down"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="modal-title text-md">
                            Chương trình học
						</div>
                        <button className="close" data-dismiss="modal">
                            ×
						</button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-7">
                                <div className="toolbar">
                                    <div className="input-group">
                                        <Select
                                            showSearch
                                            style={{ width: "100%" }}
                                            placeholder="Tìm và chọn chương"
                                            value={this.state.chapter_id}
                                            optionFilterProp="children"
                                            onChange={this.onChange}
                                            onSearch={this.onSearch}
                                            filterOption={(input, option) =>
                                                option.props.children
                                                    .toLowerCase()
                                                    .indexOf(
                                                        input.toLowerCase()
                                                    ) >= 0
                                            }
                                        >
                                            {this.fetchOptions()}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <button
                                    className="btn btn-primary "
                                    onClick={this.handleSubmit}
                                >
                                    Thêm chương
								</button>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-sm-12">
                                <div className="chuongtrinh_title">
                                    <span></span>
                                    <span>Thời gian phát hành</span>
                                    <span>Sắp xếp</span>
                                </div>
                                {this.fetchRows()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        chapters: state.chapter.chapters,
        chapterCategories: state.classroom.chapterCategories,
        categories: state.category.categories,
        questionClassrooms: state.question.questionClassrooms
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listClassroom, addClassroom, removeClassroom, getQuestionClassrooms, listChapter, listChapterCategory, addChapter, removeChapter, addCategory, removeCategory, listCategory },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Lesson)
);
