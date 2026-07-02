import React, { Component } from "react";
import {
    listCategoryVideo,
    createCategoryVideo,
    updateCategoryVideo,
    deleteCategoryVideo
} from "../../redux/category/action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class CategoryVideo extends Component {
    constructor(props) {
        super();
        this.state = {
            category_id: "",
            name: "",
            link: ""
        };
    }

    onSearchExam = async (value) => {
        if (value) {
            await this.props.listCategoryVideo({ limit: 999, keyword: value });
        }
    }

    fetchRows() {
        if (this.props.categoryVideos instanceof Array) {
            return this.props.categoryVideos.map((object, i) => {
                return <div key={i} className="category-item">
                    <div className="category-name">
                        {object.name}
                    </div>
                    <div className="category-name">
                        {object.link}
                    </div>
                    <div className="category-delete">
                        <button className='btn btn-icon' onClick={(e) => this.handleDeleteCategoryVideo(object, e)} style={{ cursor: 'pointer' }}>
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
            });
        }
    }

    _onChange = e => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value,
        });
    };

    async componentDidMount() {
        await this.props.listCategoryVideo({ category_id: this.props.match.params.id });
    }

    handleDeleteCategoryVideo = async (obj) => {
        await this.props.deleteCategoryVideo({ ids: [obj._id] });
        await this.props.listCategoryVideo();
    }

    handleSubmit = async e => {
        e.preventDefault();
        const data = {
            category_id: this.props.match.params.id,
            name: this.state.name,
            link: this.state.link
        };
        await this.props.createCategoryVideo(data);
        await this.props.listCategoryVideo();
        this.setState({
            name: "",
            link: ""
        });
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
                            Danh sách video Bài giảng
                        </div>
                        <button className="close" data-dismiss="modal">
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-sm-5 col-form-div">
                                <div className="form-group">
                                    <label className="col-sm-12 col-form-label">
                                        Tiêu đề
                                    </label>
                                    <div className="col-sm-12">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            onChange={
                                                this._onChange
                                            }
                                            value={
                                                this.state
                                                    .name ==
                                                    "null"
                                                    ? ""
                                                    : this.state
                                                        .name
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-5 col-form-div">
                                <div className="form-group">
                                    <label className="col-sm-12 col-form-label">
                                        Link Video
                                    </label>
                                    <div className="col-sm-12">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="link"
                                            onChange={
                                                this._onChange
                                            }
                                            value={
                                                this.state
                                                    .link ==
                                                    "null"
                                                    ? ""
                                                    : this.state
                                                        .link
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <label className="col-sm-12 col-form-label">
                                </label>
                                <button
                                    className="btn btn-primary "
                                    onClick={this.handleSubmit}
                                >
                                    Thêm mới
                                </button>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-sm-12">
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
        categoryVideos: state.category.categoryVideos
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listCategoryVideo,
            createCategoryVideo,
            updateCategoryVideo,
            deleteCategoryVideo
        },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CategoryVideo)
);
