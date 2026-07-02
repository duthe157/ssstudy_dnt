import React, { Component } from "react";
import { Select } from "antd";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listQuestion,
	deleteQuestion,
	addDelete,
} from "../../redux/question/action";
import ExamQuestionRow from "./ExamQuestionRow";
const { Option } = Select;

class ExamQuestion extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: null,
			tags: [],
			limit: "",
			data: [],
		};
	}

	fetchRows() {
		if (this.props.examQuestions instanceof Array) {
			return this.props.examQuestions.map((object, i) => {
				return (
					<ExamQuestionRow
						obj={object}
						key={object._id.toString()}
						index={i}
						tags={this.props.tags}
						selectQuestion={this.selectQuestion}
						onChangExamQuestions={this.onChangExamQuestions}
					/>
				);
			});
		}
	}

	onChangExamQuestions = async (data, arrIds) => {
		this.props.onChangExamQuestions(data, arrIds);
	}


	getData = (pageNumber = 1) => {
		const data = {
			page: pageNumber,
			limit: this.state.limit,
		};
		if (this.state.keyword != null) {
			data["keyword"] = this.state.keyword;
		}
		if (this.state.tags != null) {
			data["tags"] = this.state.tags;
		}
		return data;
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.listQuestion(this.getData());
	};

	fetchOptions() {
		if (this.props.tags instanceof Array) {
			return this.props.tags.map((obj, i) => {
				return <Option key={obj._id.toString()}>{obj.name}</Option>;
			});
		}
	}

	componentDidUpdate = async (prevProps) => {

		if (this.props.subject_id !== prevProps.subject_id) {
			if (this.props.subject_id !== "") {
				await this.props.listQuestion(this.getData());
			}
		}
	};

	// UNSAFE_componentWillReceiveProps(nextProps) {
	// 	console.log(nextProps);
	// }

	async componentDidMount() {

		await this.setState({
			data: this.props.examQuestions,
		});
	}

	render() {
		return (
			<div className="border padding">
				<div className="toolbar">
					<b>Danh sách câu hỏi</b>
				</div>

				<div className="row">
					<div className="col-sm-12">
						<table className="table table-theme table-row v-middle">
							<thead className="text-muted">
								<tr>
									<th>STT</th>
									<th width="">Câu hỏi</th>
									<th width="" className="text-center">
										Đáp án
									</th>
									<th width="100px" />
									<th width="100px" />
								</tr>
							</thead>
							<tbody>{this.fetchRows()}</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		questions: state.question.questions,
		limit: state.question.limit,
		page: state.question.page,
		total: state.question.total,
		ids: state.question.ids,
		examQuestions: state.question.examQuestions,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listQuestion, deleteQuestion, addDelete },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamQuestion)
);
