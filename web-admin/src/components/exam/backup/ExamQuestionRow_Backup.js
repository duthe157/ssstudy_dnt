import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listQuestion,
	deleteQuestion,
	addDelete,
	disSelectQuestion,
} from "../../redux/question/action";

class ExamQuestionRow extends Component {
	constructor(props) {
		super();
		this.state = {
			obj: "",
		};
	}

	handleCheck = () => {
		this.props.disSelectQuestion(this.props.obj._id, this.props.obj);
	};

	render() {
		return (
			<tr className="v-middle" data-id={17}>
				<td>Câu {this.props.index + 1}</td>
				<td className="flex">
					<Link
						className="item-author text-color"
						to={"/question/" + this.props.obj._id + "/edit"}
					>
						{this.props.obj.code}
					</Link>
				</td>
				<td className="text-center">{this.props.obj.answer}</td>
				<td>
					<button
						className="btn btn-sm btn-default"
						onClick={this.handleCheck}
					>
						Bỏ chọn
					</button>
				</td>
			</tr>
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
		{ listQuestion, deleteQuestion, addDelete, disSelectQuestion },
		dispatch
	);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ExamQuestionRow)
);
