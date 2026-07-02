import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showBook } from '../../redux/book/action';
import { showReview, updateReview } from '../../redux/book-review/action';
import { Radio } from 'antd';

const CDN = "https://cdn.luyenthitiendat.vn/";

class BookReviewEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            book_id: props.match.params.book_id,
            review_id: props.match.params.review_id,
            base_url: '/book/' + props.match.params.book_id + '/review',
            comment: '',
            avatar_base64: "",
            rating: 0,
            status: false,
            book: null
        };
    }

    async componentDidMount() {
        await this.props.showReview(this.state.review_id);
        if (this.props.bookReview) {

            var { name, comment, rating, status, book } = this.props.bookReview;

            this.setState({
                name,
                comment,
                status,
                rating,
                book
            });
        }
    }

    _onChange = async e => {
        let name = e.target.name;
		let value = e.target.value;
		if (name === "avatar_base64") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			value = value;
		}
		this.setState({
			[name]: value,
		});
    };

    handleSubmit = e => {
        e.preventDefault();
        const data = {
            id: this.state.review_id,
            name: this.state.name,
            book_id: this.state.book_id,
            comment: this.state.comment,
            avatar_base64: this.state.avatar_base64,
            status: this.state.status,
            rating: parseInt(this.state.rating),
        };

        this.props.updateReview(data);
    };

    render() {
        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                    <h2 className='sss-page-title text-md text-highlight'>
							Đánh giá sách
						</h2>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="card">
                                    <div className="card-header">
                                        <strong>Chỉnh sửa đánh giá sách</strong>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Tên
                                                </label>
                                                <div >
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        onChange={this._onChange}
                                                        value={this.state.name}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <label className="col-form-label">
                                                    Số sao
                                                </label>
                                                <div >
                                                    <select className="form-control" name="rating" value={this.state.rating} onChange={this._onChange}>
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                        <option value={4}>4</option>
                                                        <option value={5}>5</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">

                                                <div className="col-sm-6">
                                                    <label className="col-form-label">
                                                        Avatar
                                                    </label>
                                                    <input
                                                        onChange={this._onChange}
                                                        type="file"
                                                        className="form-control-file"
                                                        name="avatar_base64"
                                                    />
                                                </div>
                                                <div className="col-4 d-flex">
                                                    <img
                                                        alt=""
                                                        src={
                                                            this.props.bookReview ? CDN + this.props.bookReview.avatar : ""
                                                        }
                                                        style={{ width: "200px" }}
                                                    />
                                                </div>

                                                
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Nội dung đánh giá
                                                </label>
                                                <div>
                                                    <textarea
                                                        className="form-control"
                                                        name="comment"
                                                        rows={10}
                                                        onChange={this._onChange}
                                                        value={this.state.comment}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-sm-12">
                                                <label className=" col-form-label">
                                                    Trạng thái
                                                </label>
                                                <div>
                                                    <Radio.Group
                                                        onChange={this._onChange}
                                                        name="status"
                                                        value={this.state.status}
                                                    >
                                                        <Radio value={true}>Hiển thị</Radio>
                                                        <Radio value={false}>Ẩn</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className="form-group row">
                                            <div className="col-sm-12 text-right">
                                                <button
                                                    className="btn btn-primary mt-2"
                                                    onClick={this.handleSubmit}>
                                                    Cập nhật
                                                </button>
                                            </div>
                                        </div>
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
        book: state.book.book,
        bookReview: state.bookReview.bookReview,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ showReview, updateReview, showBook }, dispatch);
}

let ContainerEdit = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(BookReviewEdit),
);

export default ContainerEdit;
