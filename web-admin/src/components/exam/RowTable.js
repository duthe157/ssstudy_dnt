import React, {Component} from 'react';
import {notification} from 'antd';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {checkCount} from '../../redux/category/action';
import {isUndefined} from 'util';

class RowTable extends Component {
	constructor(props) {
		super();
		this.state = {
			NHAN_BIET: 0,
			THONG_HIEU: 0,
			VAN_DUNG: 0,
			VAN_DUNG_CAO: 0,
		};
	}

	async componentDidMount() {
		if (this.props.obj) {
			const {
				NHAN_BIET,
				THONG_HIEU,
				VAN_DUNG,
				VAN_DUNG_CAO,
			} = this.props.obj;
			this.setState({
				NHAN_BIET: !isUndefined(NHAN_BIET) ? NHAN_BIET : 0,
				THONG_HIEU: !isUndefined(THONG_HIEU) ? THONG_HIEU : 0,
				VAN_DUNG: !isUndefined(VAN_DUNG) ? VAN_DUNG : 0,
				VAN_DUNG_CAO: !isUndefined(VAN_DUNG_CAO) ? VAN_DUNG_CAO : 0,
			});
		}
	}

	handleCheck = () => {
		if (this.props.ids.includes(this.props.obj._id)) {
			notification.warning({
				message: 'Câu hỏi đã được chọn !',
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
		} else {
			this.props.selectQuestion(this.props.obj._id, this.props.obj);
		}
	};

	_onChange = async e => {
		var name = e.target.name;
		var value = parseInt(e.target.value);
		await this.setState({
			[name]: value,
		});

		const config = {...this.state};
		config.category_id = this.props.obj._id;
		config.chapter_id = this.props.obj.chapter.id;

		const total = {category_id: this.props.obj._id, total: this.total()};
		await this.props.checkCount(total, config);
	};

	total = () => {
		const {NHAN_BIET, THONG_HIEU, VAN_DUNG, VAN_DUNG_CAO} = this.state;
		const total =
			parseInt(NHAN_BIET) +
			parseInt(THONG_HIEU) +
			parseInt(VAN_DUNG) +
			parseInt(VAN_DUNG_CAO);
		return total;
	};

	render() {
		return (
			<tr className="v-middle" data-id={17}>
				<td className="flex">
					{this.props.obj.name} - {this.props.obj.chapter.name}
				</td>
				<td className="text-center">
					<input
						type="number"
						value={this.state.NHAN_BIET}
						name="NHAN_BIET"
						onChange={this._onChange}
						min="0"
						style={{width: '90%'}}
						className="form-control"
					/>
				</td>
				<td className="text-center">
					<input
						type="number"
						value={this.state.THONG_HIEU}
						name="THONG_HIEU"
						onChange={this._onChange}
						min="0"
						style={{width: '90%'}}
						className="form-control"
					/>
				</td>
				<td className="text-center">
					<input
						type="number"
						value={this.state.VAN_DUNG}
						name="VAN_DUNG"
						onChange={this._onChange}
						min="0"
						style={{width: '90%'}}
						className="form-control"
					/>
				</td>
				<td className="text-center">
					<input
						type="number"
						value={this.state.VAN_DUNG_CAO}
						name="VAN_DUNG_CAO"
						onChange={this._onChange}
						min="0"
						style={{width: '90%'}}
						className="form-control"
					/>
				</td>
			</tr>
		);
	}
}

function mapStateToProps(state) {
	return {
		countQuestion: state.category.count,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({checkCount}, dispatch);
}

let RowTableContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(RowTable),
);
export default RowTableContainer;
