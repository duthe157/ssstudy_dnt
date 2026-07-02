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

	handleMove = async (type ,id) => {
		// this.props.onHandleMove(type, data);
		var data = this.props.examQuestions;
		var from = null;
		var to = null;
		
			for (var i = 0; i < data.length; i++) {
				if (data[i]._id === id ) {
					if (type === 'MoveUp') {
						from = i;
						to = i - 1;
					}
					if (type === 'MoveDown') {
						from = i;
						to = i + 1;
					}
				}
			}
			if (to >= data.length) {
				to = data.length;
			}
			if (to <= 0) {
				to = 0;
			}
			data.splice(to, 0, data.splice(from,1)[0]);
			
			var arrIds = [];
			for (let i = 0 ; i < data.length; i++) {
				arrIds.push(data[i]._id);
			}

			await this.props.onChangExamQuestions(data, arrIds);

	}

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
				<td>
					<span style={{marginRight: '10px'}} onClick={() => this.handleMove('MoveUp', this.props.obj._id)}>
						<a style={{color: 'inherit'}}>
							<i className="fa fa-chevron-up"></i>
						</a>
					</span>
					<span>
						<a style={{color: 'inherit'}} onClick={() => this.handleMove('MoveDown', this.props.obj._id)}>
							<i className="fa fa-chevron-down"></i>
						</a>
					</span>
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
