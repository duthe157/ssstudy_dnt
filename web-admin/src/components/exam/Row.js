import React, { Component } from "react";
import Moment from "moment";
import { Select, Badge, notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listQuestion,
	deleteQuestion,
	addDelete,
	selectQuestion,
} from "../../redux/question/action";

const { Option } = Select;

class Row extends Component {
	constructor(props) {
		super();
		this.state = {};
	}
	handleCheck = () => {
		if (this.props.ids.includes(this.props.obj._id)) {
			notification.warning({
				message: "Câu hỏi đã được chọn !",
				placement: "topRight",
				top: 50,
				duration: 3,
			});
		} else {
			this.props.selectQuestion(this.props.obj._id, this.props.obj);
		}
	};

	render() {
		return (
			<tr className="v-middle" data-id={17}>
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
					<span className="item-amount d-none d-sm-block text-sm">
						{/* {
                        this.props.tags.map((item, i) => {
                            const arrNew = this.props.obj.tags.filter(ele => ele === item._id)
                            if (arrNew.length !== 0) {
                                arrNew.map((ele, i) => {
                                    return <Badge count={item.name} style={{ backgroundColor: '#52c41a', textOverflow: 'ellipsis', width: '100px', overflow: 'hidden' }} key={i} />
                                })
                            }
                            return null;
                        })
                    } */}
					</span>
				</td>
				<td>
					{this.props.obj.check === true ||
					this.props.check === true ? (
						<button className="btn btn-sm btn-default">
							Đã chọn
						</button>
					) : (
						<button
							className="btn btn-sm btn-default"
							onClick={this.handleCheck}
						>
							Chọn
						</button>
					)}
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
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{ listQuestion, deleteQuestion, addDelete, selectQuestion },
		dispatch
	);
}

let RowContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row)
);
export default RowContainer;
