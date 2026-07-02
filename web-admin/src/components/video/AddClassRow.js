import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { removeClass, listClass } from '../../redux/video/action';

class AddClassRow extends Component {
	constructor(props) {
		super();
		this.state = {
			obj: '',
		};
	}

	handleCheck = async () => {
		const data = {
			video_id: this.props.obj.video_id,
			classroom_id: this.props.obj.classroom.id,
		};
		await this.props.removeClass(data);
		await this.props.listClass({ video_id: this.props.obj.video_id });
	};

	render() {
		return (
			<tr className="v-middle" data-id={17}>
				<td>{this.props.index + 1}</td>
				<td className="flex">{this.props.obj.classroom.name}</td>
				<td>
					<button
						className="btn btn-sm btn-default"
						onClick={this.handleCheck}>
						Bỏ chọn
					</button>
				</td>
			</tr>
		);
	}
}

function mapStateToProps(state) {
	return {};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ removeClass, listClass }, dispatch);
}

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AddClassRow),
);
