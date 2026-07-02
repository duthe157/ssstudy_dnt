import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import moment from "moment";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { notification, Select } from "antd";

import {
    listCategory,
} from "../../redux/category/action";
import {
    listChapterCategory,
    addCategory,
    removeCategory,
    removeChapter,
    updatePosition,
    updateCategory
} from "../../redux/classroom/action";

const { Option } = Select;

class LessonRow extends Component {
    constructor(props) {
        super();
        this.state = {
            obj: '',
            started_at: "",
            finished_at: "",
            category_id: '',
            position: ''
        };
    }

    fetchOptionsCategory() {
        if (this.props.categories instanceof Array) {
            return this.props.categories.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    onSearchCategory = async (value) => {
        if (this.props.obj && this.props.obj.chapter.id) {
            await this.props.listCategory({ limit: 999, keyword: value, chapter_id: this.props.obj.chapter.id });
        }

    }

    onChange = async (value) => {
        await this.setState({
            category_id: value,
        });
    };

    handleCheck = async () => {

    };

    handleSubmit = async () => {
        if (this.state.category_id !== "" && this.props.obj.chapter.id) {
            const data = {
                category_id: this.state.category_id,
                chapter_id: this.props.obj.chapter.id,
                classroom_id: this.props.obj.classroom_id,
            };
            await this.props.addCategory(data);
            await this.props.listChapterCategory({
                classroom_id: this.props.obj.classroom_id,
            });
        } else {
            notification.warning({
                message: "Vui lòng chọn bài giảng !",
                placement: "topRight",
                top: 50,
                duration: 3,
                style: {
                    zIndex: 1050,
                },
            });
        }
    };

    handlePositionSubmit = async (e, type, obj, pos) => {
        let _ordering = obj.ordering;
        const _id = obj._id;
        const params = {
            ordering: _ordering,
            type,
            id: _id
        };
        if (pos === 'up') {
            params.ordering -= 1;
        }

        if (pos === 'down') {
            params.ordering += 1;
        }
        await this.props.updatePosition(params);
        //document.getElementById('pos-' + _id).textContent = params.ordering;
        await this.props.listChapterCategory({
            classroom_id: this.props.obj.classroom_id,
        });
    };

    handlePosition = async (e, type, id) => {
        //if (e.key === 'Enter') {
        const params = {
            ordering: e.target.value ? parseInt(e.target.value) : 1,
            type,
            id
        };
        document.getElementById('c_' + id).value = e.target.value ? parseInt(e.target.value) : 1;
        await this.props.updatePosition(params);
        //}
    };

    handlePublishAt = async (id, e) => {
        const date = e.target.value ? moment(e.target.value).format('YYYY-MM-DD') : null
        const params = {
            publish_at: date,
            id
        };
        await this.props.updateCategory(params);
        await this.props.listChapterCategory({
            classroom_id: this.props.obj.classroom_id,
        });
    };

    handleRemoveCategory = async (cate) => {
        const params = { id: cate._id };
        await this.props.removeCategory(params);
        await this.props.listChapterCategory({
            classroom_id: this.props.obj.classroom_id,
        });
    };

    handleRemoveChapter = async (cate) => {
        const params = { chapter_id: cate.chapter.id, classroom_id: cate.classroom_id };
        await this.props.removeChapter(params);
        await this.props.listChapterCategory({
            classroom_id: this.props.obj.classroom_id,
        });
    };

    fetchCategoryByChapter(chapter) {
        if (chapter.category && chapter.category.length > 0) {
            return chapter.category.map((object, i) => {
                let _date = null;
                if (object.publish_at) {
                    _date = moment(new Date(object.publish_at)).format('YYYY-MM-DD');
                }
                return (
                    <div key={i} className="category-item">
                        <div className="category-name">
                            <span id={'pos-' + object._id} className="category-position">{object.ordering}</span> - <span>{object.category.name}</span>
                        </div>
                        <div className="publish_at">
                            <input onChange={(e) => this.handlePublishAt(object._id, e)} className="form-control" type="date" defaultValue={_date} />
                        </div>
                        <div className="category-delete">
                            <span className="ordering">
                                <span className="updatePos" onClick={(e) => this.handlePositionSubmit(e, 'CATEGORY', object, 'up')}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                </span>
                                <span className="updatePos" onClick={(e) => this.handlePositionSubmit(e, 'CATEGORY', object, 'down')}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </span>
                            <button className='btn btn-icon' onClick={(e) => this.handleRemoveCategory(object, e)} style={{ cursor: 'pointer' }}>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={16}
                                    height={16}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='feather feather-trash text-muted'
                                >
                                    <polyline points='3 6 5 6 21 6' />
                                    <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            });
        }
    }

    render() {
        if (!this.props.obj)
            return null;
        const _chapter = this.props.obj;
        let _items = null;
        if (_chapter.category && _chapter.category.length > 0) {
            _items = this.fetchCategoryByChapter(_chapter);
        }

        return (
            <div className="chapter-item">
                <div className="chapter-head">
                    <span>{_chapter.chapter.name}</span>
                    <span className="ordering">
                        <span className="updatePos" onClick={(e) => this.handlePositionSubmit(e, 'CHAPTER', _chapter, 'up')}>
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </span>
                        <span className="updatePos" onClick={(e) => this.handlePositionSubmit(e, 'CHAPTER', _chapter, 'down')}>
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>

                    </span>
                    <button className='remove_chapter btn btn-icon' onClick={(e) => this.handleRemoveChapter(_chapter, e)} style={{ cursor: 'pointer' }}>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width={16}
                            height={16}
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth={2}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='feather feather-trash text-muted'
                        >
                            <polyline points='3 6 5 6 21 6' />
                            <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                        </svg>
                    </button>
                </div>
                <div className="category-items">
                    {_items}
                </div>
                <div className="add-category" style={{ display: "flex" }}>
                    <div style={{ width: "75%" }}>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder="Tìm và chọn bài giảng"
                            value={this.state.category_id}
                            optionFilterProp="children"
                            onChange={this.onChange}
                            onSearch={this.onSearchCategory}
                            filterOption={(input, option) =>
                                option.props.children
                                    .toLowerCase()
                                    .indexOf(
                                        input.toLowerCase()
                                    ) >= 0
                            }
                        >
                            {this.fetchOptionsCategory()}
                        </Select>
                    </div>
                    <button onClick={this.handleSubmit} className="btn btn-secondary add-lesson" style={{ cursor: "pointer" }}>Thêm bài giảng</button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        categories: state.category.categories,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listCategory, addCategory, listChapterCategory, removeCategory, removeChapter, updatePosition, updateCategory }, dispatch);
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(LessonRow),
);
