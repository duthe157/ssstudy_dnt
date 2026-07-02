import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createAdmin } from "../../redux/student/action";
import { uploadImage } from "../../redux/category/action";
import { Radio } from "antd";
class AdminCreate extends Component {
	constructor(props) {
		super();
		this.state = {
			code: "",
			fullname: "",
			user_name: "",
			password: "",
			phone: "",
			email: "",
			status: false,
			power: "",
			files: [], 
			avtPreview: ""

		};
	}

	_onChange = async (e) => {
		var name = e.target.name;
		let value = e.target.value;
		let checked = e.target.checked;
		let avtPreview = "";

		if (name === "is_featured" || name === "status") {
			value = checked;
		}

		if (name === "files") {
			value = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(e.target.files[0]);
				reader.onload = () => {
					avtPreview = reader.result;
					resolve(reader.result);
				};
				reader.onerror = (error) => reject(error);
			});
			value = [value];

			this.setState({
				[name]: value,
				avtPreview
			});
		} else {
			this.setState({
				[name]: value,
			});
		}
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		let { box1_num, box2_num, box3_num, box4_num } = this.state.featured_stats_box;
		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			user_group: this.state.user_group,
			password: this.state.password,
			total_classroom: this.state.total_classroom,
			total_student: this.state.total_student,
			avatar_base64: this.state.avatar_base64,
			is_show_profile: this.state.is_show_profile,
			link_fb: this.state.link_fb,
			profile_pic_base64: this.state.profile_pic_base64,
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num),
				box2_num: parseInt(box2_num),
				box3_num: parseInt(box3_num),
				box4_num: parseInt(box4_num),
			},
			featured_text_box: this.state.featured_text_box
		};
		data.description = this.state.description.toString();
		data.content = this.state.content.toString();
		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/admin");
		}
	};

	handleSave = async (e) => {
		e.preventDefault();
		let { box1_num, box2_num, box3_num, box4_num } = this.state.featured_stats_box;

		const data = {
			fullname: this.state.fullname,
			email: this.state.email,
			phone: this.state.phone,
			user_group: this.state.user_group,
			password: this.state.password,
			total_classroom: this.state.total_classroom,
			total_student: this.state.total_student,
			is_show_profile: this.state.is_show_profile,
			avatar_base64: this.state.avatar_base64,
			link_fb: this.state.link_fb,
			profile_pic_base64: this.state.profile_pic_base64,
			featured_stats_box: {
				...this.state.featured_stats_box,
				box1_num: parseInt(box1_num),
				box2_num: parseInt(box2_num),
				box3_num: parseInt(box3_num),
				box4_num: parseInt(box4_num),
			},
			featured_text_box: this.state.featured_text_box
		};
		data.description = this.state.description.toString();
		data.content = this.state.content.toString();
		await this.props.createAdmin(data);
		if (this.props.redirect === true) {
			await this.props.history.push("/admin");
		}
	};

	_handleEditorContentChange = (value, editor) => {
		this.setState({ content: value });
	};
	_handleEditorDescriptionChange = (value, editor) => {
		this.setState({ description: value });
	};

	_uploadImageCallBack = async (blobInfo, success, failure) => {
		let file = blobInfo.blob();
		const data = new FormData();
		data.append("files", file);

		await this.props.uploadImage(data);

		if (this.props.image != null) {
			success(this.props.image);
		} else {
			failure("Upload image fail");
		}
	};

	handleUploaImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").click();
	}

	remoImgHomePage = () => {
		document.getElementById("input-upload-image-homepage").value = "";
		this.setState({
			profile_pic_base64: "",
			homePagePreview: ""
		})
	}

	handleUploadImage = () => {
		document.getElementById("input-upload-image").click();
	}

	remoAvatar = () => {
		document.getElementById("input-upload-image").value = "";
		this.setState({
			files: [],
			avtPreview: ""
		})
	}


	render() {
		return (
			<div>
				<div className="page-content page-container page-edit-student" id="page-content">
					<div className="padding">
						<h2 className="text-md text-highlight sss-page-title">Quản trị viên</h2>
						{/* <div className="block-item-content">
							<h3 className="title-block">Ảnh và thông tin</h3>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="profile_pic_base64"
									id="input-upload-image-homepage"
								/>
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="avatar_base64"
									id="input-upload-avatar"
								/>
								<div className="block-image-avatar">
									<div className="img-home-page item-block-image block-image">
										{
											!this.state.profile_pic_base64 || this.state.profile_pic_base64.length == 0
												?
												<button type="button" onClick={this.handleUploaImgHomePage}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Ảnh trang chủ</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.homePagePreview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgHomePage}>Hủy chọn</div>
													</div>
												</div>
										}
									</div>
									<div className="image-avatar item-block-image block-image">
										{
											!this.state.avatar_base64 || this.state.avatar_base64.length == 0
												?
												<button type="button" onClick={this.handleUploadAvatar}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Ảnh đại diện</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.avtPreview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoAvatar}>Hủy chọn</div>
													</div>
												</div>
										}
									</div>
								</div>
								<div className="block-content">
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Tên giáo viên</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={this.state.fullname}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={this.state.phone}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "33%" }} >
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={this.state.email}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group" style={{ width: "50%" }}>
											<label className="text-form-label">Hiển thị profile</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="is_show_profile"
													value={this.state.is_show_profile}
												>
													<Radio value={true}>Hiển thị</Radio>
													<Radio value={false}>Ẩn</Radio>
												</Radio.Group>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div> */}
						{/* <div className="block-item-content">
							<h3 className="title-block">Thông tin nổi bật</h3>


							<input
								onChange={this._onChangeFeaturedBox}
								type="file"
								className="form-control-file d-none"
								name="box1_img"
								id="input-img-box-1"
							/>
							<input
								onChange={this._onChangeFeaturedBox}
								type="file"
								className="form-control-file d-none"
								name="box2_img"
								id="input-img-box-2"
							/>
							<input
								onChange={this._onChangeFeaturedBox}
								type="file"
								className="form-control-file d-none"
								name="box3_img"
								id="input-img-box-3"
							/>
							<input
								onChange={this._onChangeFeaturedBox}
								type="file"
								className="form-control-file d-none"
								name="box4_img"
								id="input-img-box-4"
							/>

							<div className="block-list-feature-box">
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_stats_box.box1_img || featured_stats_box.box1_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageBox1}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgStatsBox1Preview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgBox1}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Số</label>
										<div>
											<input
												type="number"
												className="form-control"
												name="box1_num"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box1_num}
											/>
										</div>
									</div>
									<div className="form-group">
										<label className="text-form-label">Tiêu đề</label>
										<div>
											<input
												type="text"
												className="form-control"
												name="box1_text"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box1_text}
											/>
										</div>
									</div>
								</div>
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_stats_box.box2_img || featured_stats_box.box2_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageBox2}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgStatsBox2Preview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgBox2}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Số</label>
										<div>
											<input
												type="number"
												className="form-control"
												name="box2_num"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box2_num}
											/>
										</div>
									</div>
									<div className="form-group">
										<label className="text-form-label">Tiêu đề</label>
										<div>
											<input
												type="text"
												className="form-control"
												name="box2_text"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box2_text}
											/>
										</div>
									</div>
								</div>
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_stats_box.box3_img || featured_stats_box.box3_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageBox3}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgStatsBox3Preview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgBox3}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Số</label>
										<div>
											<input
												type="number"
												className="form-control"
												name="box3_num"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box3_num}
											/>
										</div>
									</div>
									<div className="form-group">
										<label className="text-form-label">Tiêu đề</label>
										<div>
											<input
												type="text"
												className="form-control"
												name="box3_text"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box3_text}
											/>
										</div>
									</div>
								</div>
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_stats_box.box4_img || featured_stats_box.box4_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageBox4}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgStatsBox4Preview}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgBox4}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Số</label>
										<div>
											<input
												type="number"
												className="form-control"
												name="box4_num"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box4_num}
											/>
										</div>
									</div>
									<div className="form-group">
										<label className="text-form-label">Tiêu đề</label>
										<div>
											<input
												type="text"
												className="form-control"
												name="box4_text"
												onChange={this._onChangeFeaturedBox}
												value={this.state.featured_stats_box.box4_text}
											/>
										</div>
									</div>
								</div>
							</div>
						</div> */}
						{/* <div className="block-item-content">
							<h3 className="title-block">Con số ấn tượng</h3>


							<input
								onChange={this._onChangeFeaturedText}
								type="file"
								className="form-control-file d-none"
								name="box1_img"
								id="input-img-text-box-1"
							/>
							<input
								onChange={this._onChangeFeaturedText}
								type="file"
								className="form-control-file d-none"
								name="box2_img"
								id="input-img-text-box-2"
							/>
							<input
								onChange={this._onChangeFeaturedText}
								type="file"
								className="form-control-file d-none"
								name="box3_img"
								id="input-img-text-box-3"
							/>

							<div className="block-list-feature-box grid-column-3">
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_text_box.box1_img || featured_text_box.box1_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageTextBox1}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgTextBoxPreview1}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgTextBox1}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Nội dung</label>
										<div>
											<textarea
												type="text"
												className="form-control"
												name="box1_text"
												onChange={this._onChangeFeaturedText}
												value={this.state.featured_text_box.box1_text}
											>

											</textarea>
										</div>
									</div>
								</div>
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_text_box.box2_img || featured_text_box.box2_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageTextBox2}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgTextBoxPreview2}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgTextBox2}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Nội dung</label>
										<div>
											<textarea
												type="text"
												className="form-control"
												name="box2_text"
												onChange={this._onChangeFeaturedText}
												value={this.state.featured_text_box.box2_text}
											>

											</textarea>
										</div>
									</div>
								</div>
								<div className="item-feature-box">
									<div className="block-avatar block-image">
										{
											!featured_text_box.box3_img || featured_text_box.box3_img.length == 0
												?
												<button type="button" onClick={this.handleUploadImageTextBox3}>
													<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
													<span>Thêm ảnh</span>
												</button>
												:
												<div className="block-image-overlay">
													<img
														id="output"
														src={this.state.imgTextBoxPreview3}
														alt="your image"
														className="image"
													/>
													<div class="middle">
														<div class="text" onClick={this.remoImgTextBox3}>Xóa</div>
													</div>
												</div>
										}
									</div>
									<div className="form-group">
										<label className="text-form-label">Nội dung</label>
										<div>
											<textarea
												type="text"
												className="form-control"
												name="box3_text"
												onChange={this._onChangeFeaturedText}
												value={this.state.featured_text_box.box3_text}
											>

											</textarea>
										</div>
									</div>
								</div>
							</div>
						</div> */}

						{/* <div className="block-item-content">
							<h3 className="title-block">Mô tả</h3>
							<div className="content" style={{ display: "block" }}>
								<Editor
									onInit={(evt, editor) => {
										this._handleEditorDescriptionChange(
											this.state.description,
											editor
										);
									}}
									value={this.state.description}
									init={{
										height: 500,
										menubar: false,
										images_file_types:
											"jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp",
										plugins: [
											"advlist autolink lists link image charmap print preview anchor",
											"searchreplace visualblocks code fullscreen",
											"insertdatetime media table paste code help wordcount tiny_mce_wiris",
										],
										external_plugins: {
											tiny_mce_wiris:
												"https://www.wiris.net/demo/plugins/tiny_mce/plugin.js",
										},
										toolbar:
											"undo redo | formatselect | " +
											"bold italic backcolor | image | alignleft aligncenter " +
											"alignright alignjustify | bullist numlist outdent indent | fontselect |  fontsizeselect |" +
											"searchreplace visualblocks code fullscreen | " +
											"lists link advlist insertdatetime media | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry | table paste code removeformat | help",
										fontsize_formats:
											"8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt",
										content_style:
											"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
										draggable_modal: true,
										htmlAllowedTags: [".*"],
										htmlAllowedAttrs: [".*"],
										images_upload_handler: (
											blobInfo,
											success,
											failure
										) =>
											this._uploadImageCallBack(
												blobInfo,
												success,
												failure
											),
									}}
									onEditorChange={
										this._handleEditorDescriptionChange
									}
								/>
							</div>
						</div> */}

						<div className="block-item-content">
							<h3 className="title-block">Thông tin chung</h3>
							<div className="content">
								<input
									onChange={this._onChange}
									type="file"
									className="form-control-file d-none"
									name="files"
									id="input-upload-image"
								/>
								<div className="block-image">
									{
										!this.state.avtPreview
											?
											<button type="button" onClick={this.handleUploadImage}>
												<img src="/assets/img/icon-upload-file.svg" className="mr-10" alt="" />
												<span>Thêm avatar</span>
											</button>
											:
											<div className="block-image-overlay">
												<img
													id="output"
													src={this.state.avtPreview}
													alt="your image"
													className="image"
												/>
												<div className="middle">
													<div className="text" onClick={this.remoAvatar}>Hủy chọn</div>
												</div>
											</div>
									}
								</div>
								<div className="block-content">
									<div className="item-input-text">

										<div className="form-group mr-16" style={{ width: "144px" }}>
											<label className="text-form-label">Mã thành viên</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="code"
													onChange={this._onChange}
													style={{ background: "#ededed" }}
													value={this.state.code}
												/>
											</div>
										</div>

										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tên thành viên</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="fullname"
													onChange={this._onChange}
													value={this.state.fullname}
												/>
											</div>
										</div>

										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Tên đăng nhập</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="user_name"
													onChange={this._onChange}
													value={this.state.user_name}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Mật khẩu</label>
											<div>
												<input
													type="password"
													className="form-control"
													name="password"
													onChange={this._onChange}
													value={this.state.password}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={this.state.phone}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "60%" }}>
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={this.state.email}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "20%" }}>
											<label className=" col-form-label">Trạng thái</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="status"
													value={this.state.status}
												>
													<Radio value={false}>Ẩn</Radio>
													<Radio value={true}>Hiện</Radio>
												</Radio.Group>
											</div>
										</div>
										<div className="form-group" style={{ width: "20%" }}>
											<label className="text-form-label">Quyền hạn</label>
											<div>
												<select
													className="custom-select"
													value={this.state.power}
													name="power"
													onChange={this._onChange}
												>
													<option value="">Quản lý bài viết</option>
													<option value="1">Chỉnh sửa bài viết</option>
													<option value="2">Xóa bài viết</option>
												</select>
											</div>
										</div>
									</div>
									{/* <div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Email</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="email"
													onChange={this._onChange}
													value={email}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Số điện thoại</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="phone"
													onChange={this._onChange}
													value={phone}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Số điện thoại phụ huynh</label>
											<div>
												<input
													type="number"
													className="form-control"
													name="parent_phone"
													onChange={this._onChange}
													value={parent_phone}
												/>
											</div>
										</div>
									</div>
									<div className="item-input-text">
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Mật khẩu</label>
											<div>
												<input
													type="password"
													className="form-control"
													name="password"
													onChange={this._onChange}
													value={password}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Lớp</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="classroom"
													onChange={this._onChange}
													value={classroom}
												/>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Trường</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="school"
													onChange={this._onChange}
													value={school}
												/>
											</div>
										</div>
									</div>
									<div className='item-input-text'>
										<div className="form-group mr-16">
											<label className=" col-form-label">Giới tính</label>
											<div>
												<Radio.Group
													onChange={this._onChange}
													name="gender"
													value={gender}
												>
													<Radio value="Male">Nam</Radio>
													<Radio value="FeMale">Nữ</Radio>
												</Radio.Group>
											</div>
										</div>
										<div className="form-group mr-16" style={{ width: "400px" }}>
											<label className="text-form-label">Điểm</label>
											<div>
												<input
													type="text"
													className="form-control"
													name="point"
													onChange={this._onChange}
													value={point}
												/>
											</div>
										</div>
									</div> */}
								</div>
							</div>
						</div>

						<div className="block-action-footer">
							<button type="button" className="btn-cancel">
								<img src="/assets/img/icon-arrow-left.svg" alt="" className="mr-14" />
								Hủy
							</button>
							<button type="button" className="btn-submit ml-16" onClick={(e) => this.handleSubmit(e)}>
								Tạo mới
								<img src="/assets/img/icon-arrow-right.svg" alt="" className="ml-14" />
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		redirect: state.student.redirect,
		image: state.question.image,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ createAdmin, uploadImage }, dispatch);
}

let ClassCreateContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(AdminCreate)
);

export default ClassCreateContainer;
