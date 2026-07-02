import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Row extends Component {
	constructor(props) {
		super();
		this.state = {
			check: false,
			status: true,
			category_id: '',
			is_featured: false,
			ordering: 0,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.check !== nextProps.check) {
			this.setState({
				check: nextProps.check,
			});
		}
	}

	handleCheckBox = e => {
		if (e.target.checked) {
			this.props.handleCheckedIds(this.props.obj._id, 'add');
			this.setState({
				check: e.target.checked
			})
		} else {
			this.props.handleCheckedIds(this.props.obj._id, 'remove');
			this.setState({
				check: e.target.checked
			})
		}
	};

	componentDidMount() {
		this.setState({
			check: false,
			status: this.props.obj.status,
			is_featured: this.props.obj.is_featured ? this.props.obj.is_featured : false,
			category_id: this.props.obj.category ? this.props.obj.category.id : '',
			ordering: this.props.obj.ordering,
		});
	}

	handleChangeStatus = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			status: this.state.status
		};
		await this.props.updateMetaData(data);
	};
	handleChangeFeatured = async e => {
		e.preventDefault();
		var name = e.target.name;
		var checke = e.target.checked;

		await this.setState({
			[name]: checke,
		});

		const data = {
			id: this.props.obj._id,
			is_featured: this.state.is_featured
		};
		await this.props.updateMetaData(data);
	};

	handleChangeOrdering = async e => {
		var name = e.target.name;
		var value = e.target.value;
		await this.setState({
			[name]: value,
		});
		const data = {
			id: this.props.obj._id,
			ordering: this.state.ordering,
		};
		await this.props.updateMetaData(data);
	};


	handleCheck = async (e) => {
		this.props.onDeleteOne(true);
		this.props.addDataRemoveBook({
			ids: this.props.obj._id
		})
	}

	copyTextToClipboard = async (text) => {
		const textarea = document.createElement('textarea');
		textarea.value = text;
	
		document.body.appendChild(textarea);
		textarea.select();
	
		try {
			document.execCommand('copy');
		} catch (err) {
		}
	
		document.body.removeChild(textarea);
	}

	render() {
		const { subject } = this.props.obj;
		console.log('subject', subject)
		console.log('this.props', this.props)
		return (
			<tr className="v-middle table-row-item" data-id={17}>
				<td>
					<label className="ui-check m-0">
						<input
							type="checkbox"
							name="id"
							className="checkInputItem"
							onChange={this.handleCheckBox}
							value={this.props.obj._id}
						/>{' '}
						<i />
					</label>
				</td>
				<td className="flex">
					<span className="item-amount d-none d-sm-block text-sm">
						Form đăng ký
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.classroom_name}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{subject.name}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.classroom_id}
					</span>
				</td>
				<td className="text-left">
					<span className="item-amount d-none d-sm-block text-sm">
						{this.props.obj.created_at}
					</span>
				</td>
				<td className="text-left input-group">
					{/* <input type="text" className="form-control" name="iframe" value={this.props.obj.iframe} readOnly /> */}
					<input type="text" className="form-control" aria-label="iframe text" aria-describedby="basic-addon2" value={this.props.obj.iframe}/>
  					<div className="input-group-append">
    					<button 
						    onClick={() => this.copyTextToClipboard(this.props.obj.iframe)} 
						 	type="button" className="btn btn btn-link" id="basic-addon2"><img src="/assets/img/icon-copy.svg" alt="coppy" /></button>
  					</div>
				</td>
				<td className='text-right'>
					<div className="item-action">
						<Link
							className="mr-14"
							data-toggle='tooltip'
							title='Chỉnh sửa'
							to={'/iframe/' + this.props.obj._id + '/edit'}>
							<img src="/assets/img/icon-edit.svg" alt="" />
						</Link>
						<div
							data-toggle='tooltip'
							title='Xóa'
						>
							<a
								onClick={this.handleCheck}
								data-toggle="modal"
								data-target="#delete-video"
								data-toggle-class="fade-down"
								data-toggle-class-target=".animate"
							>
								<img src="/assets/img/icon-delete.svg" alt="" />
							</a>
						</div>
					</div>
				</td>
			</tr>
		);
	}
}


function mapStateToProps(state) {
	return {
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{},
		dispatch,
	);
}

let Container = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Row),
);
export default Container;