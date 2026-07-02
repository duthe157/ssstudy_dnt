import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {listSubject} from '../../redux/subject/action';
import {
	showChapter,
	createChapter,
	updateChapter,
} from '../../redux/chapter/action';


class ChapterEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			name: '',
			subject_id: '',
		};
	}

	async componentDidMount() {
		const data = {
			limit: 999,
			is_delete: false,
		};
		await this.props.listSubject(data);
		await this.props.showChapter(this.props.match.params.id);
		if (this.props.chapter) {
			var {name} = this.props.chapter;
			this.setState({
				name,
				subject_id: this.props.chapter.subject.id,
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
	handleSubmit = e => {
		e.preventDefault();

		const data = {
			id: this.props.match.params.id,
			name: this.state.name,
			subject_id: this.state.subject_id,
		};
		this.props.updateChapter(data);
	};

	fetchRows() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return <option value={obj._id}>{obj.name}</option>;
			});
		}
	}

	render() {
		return (
			<div>
				<div className="page-hero page-container" id="page-hero">
					<div className="padding d-flex">
						<div className="page-title">
							<h2 className="text-md text-highlight">
								Thông tin
							</h2>
						</div>
						<div className="flex" />
						<div>
							<Link
								to={'/chapter'}
								className="btn btn-sm text-white btn-primary">
								<span className="d-none d-sm-inline mx-1">
									Quay lại
								</span>
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
									className="feather feather-arrow-right">
									<line x1={5} y1={12} x2={19} y2={12} />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				<div className="page-content page-container" id="page-content">
					<div className="padding">
						<div className="row">
							<div className="col-md-10">
								<div className="card">
									<div className="card-header">
										<strong>Chi tiết chương</strong>
									</div>
									<div className="card-body">
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Tên chương
											</label>
											<div className="col-sm-8">
												<input
													type="text"
													className="form-control"
													name="name"
													onChange={this._onChange}
													value={this.state.name}
												/>
											</div>
										</div>
										<div className="form-group row">
											<label className="col-sm-4 col-form-label">
												Môn học
											</label>
											<div className="col-sm-8">
												<select
													className="custom-select"
													value={
														this.state.subject_id
													}
													name="subject_id"
													onChange={this._onChange}>
													<option value="">
														-- Chọn môn học --
													</option>
													{this.fetchRows()}
												</select>
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
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		subjects: state.subject.subjects,
		chapter: state.chapter.chapter,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{listSubject, createChapter, showChapter, updateChapter},
		dispatch,
	);
}

let chapterEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ChapterEdit),
);

export default chapterEditContainer;
