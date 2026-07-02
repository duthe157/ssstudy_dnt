import React, { Component } from "react";
import { Select } from "antd";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
	listQuestion,
	deleteQuestion,
	addDelete
} from "../../redux/question/action";
import { listChapter } from "../../redux/chapter/action";
import {
	listCategory,
	filterCategory,
	assignValue
} from "../../redux/category/action";
import RowTable from "./RowTable";
import { isUndefined } from "util";
const { Option } = Select;

class ConfigQuestionEdit extends Component {
	constructor(props) {
		super();
		this.state = {
			keyword: null,
			tags: [],
			limit: "",
			filter: [],
			render: true
		};
	}

	fetchRows() {
		if (this.props.categoriesFilter instanceof Array) {
			return this.props.categoriesFilter.map((object, i) => {
				return (
					<RowTable
						obj={object}
						key={object._id.toString()}
						index={i}
						count={this.props.count}
					/>
				);
			});
		}
	}

	convertData = async () => {
		const configs = this.props.configs;

		let count = 0;
		if (typeof configs !== "undefined") {
			configs.forEach(ele => {
				var rs =
					parseInt(ele["NHAN_BIET"]) +
					parseInt(ele["THONG_HIEU"]) +
					parseInt(ele["VAN_DUNG"]) +
					parseInt(ele["VAN_DUNG_CAO"]);
				count += rs;
			});

			const initCategory = configs.map(ele => {
				const total =
					parseInt(ele["NHAN_BIET"]) +
					parseInt(ele["THONG_HIEU"]) +
					parseInt(ele["VAN_DUNG"]) +
					parseInt(ele["VAN_DUNG_CAO"]);
				const newElement = {};
				newElement["category_id"] = ele["category_id"];
				const filted = this.props.categories.filter(
					item => item._id === ele["category_id"]
				);
				if (filted.length !== 0) {
					newElement["chapter_id"] = filted[0].chapter.id;
				}

				newElement["total"] = total;
				return Object.assign({}, newElement);
			});

			const categories = this.props.categories;
			var data = categories.filter(cate => {
				const idsChapter = this.props.chapterProps;
				if (idsChapter.includes(cate.chapter.id)) {
					return Object.assign({}, cate);
				}
			});
			data.map(obj => {
				configs.filter(item => {
					if (item.category_id === obj._id) {
						return Object.assign(obj, item);
					}
				});
				return obj;
			});
			const chapter_ids = this.state.filter;
			if (initCategory.length !== 0 && data.length !== 0) {
				await this.props.assignValue(
					initCategory,
					data,
					configs,
					chapter_ids
				);
			}
		}
	};

	onChange = e => {
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			[name]: value
		});
	};

	getData = () => {
		const data = {
			limit: 999
		};
		return data;
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.subject_id !== nextProps.subject_id) {
			this.setState({
				filter: []
			});
		}
	}

	async componentDidMount() {
		if (this.props.filter) {
			this.setState({
				filter: this.props.filter,
				render: this.props.render
			});
		}
		if (!isUndefined(this.props.configs)) {
			this.setState({
				configs: this.props.configs
			});
		}
		await this.props.listChapter(this.getData());

		if (this.state.render === true) {
			await this.convertData();
			await this.setState({
				render: !this.state.render
			});
		}
	}

	onSubmit = e => {
		e.preventDefault();
		this.props.listQuestion(this.getData());
	};

	handleChangeTag = async value => {
		await this.setState({
			filter: value
		});
		await this.props.listCategory(value);
		await this.props.filterCategory(value);
	};

	fetchOptions() {
		if (this.props.chapters instanceof Array) {
			return this.props.chapters.map((obj, i) => {
				if (obj.subject.id === this.props.subject_id) {
					return <Option key={obj._id.toString()}>{obj.name}</Option>;
				}
			});
		}
	}

	render() {
		return (
			<div>
				{/* <div className="padding"> */}
				<div className="toolbar">
					<div className="input-group">
						<Select
							mode="multiple"
							style={{ width: "100%" }}
							placeholder="Chọn chương..."
							value={this.state.filter}
							onChange={this.handleChangeTag}
						>
							{this.fetchOptions()}
						</Select>
					</div>
				</div>

				<div className="row">
					<div className="col-sm-12">
						<table className="table table-theme table-row v-middle">
							<thead className="text-muted">
								<tr>
									<th className="text-center">Dạng</th>
									<th className="text-center">Nhận biết</th>
									<th className="text-center">Thông hiểu</th>
									<th className="text-center">Vận dụng</th>
									<th className="text-center">
										Vận dụng cao
									</th>
								</tr>
							</thead>
							<tbody>
								{this.props.chapters == null
									? "Không có dữ liệu!"
									: this.fetchRows()}
							</tbody>
						</table>
					</div>
				</div>
				{/* </div> */}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		questions: state.question.questions,
		categoriesFilter: state.category.categoriesFilter,
		categories: state.category.categories,
		chapters: state.chapter.chapters,
		limit: state.question.limit,
		page: state.question.page,
		total: state.question.total,
		ids: state.question.ids
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			listQuestion,
			deleteQuestion,
			addDelete,
			listChapter,
			listCategory,
			filterCategory,
			assignValue
		},
		dispatch
	);
}

let ConfigQuestionEditContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(ConfigQuestionEdit)
);
export default ConfigQuestionEditContainer;
