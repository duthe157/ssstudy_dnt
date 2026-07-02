import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { showExamCategory, updateExamCategory, listExamTestCategory } from "../../redux/examwordtestcategory/action";

class ExamWordTestCategoryEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: "",
            loading: false,
            errorMessage: "",  // ✅ Thêm state cho error message
        };
    }

    componentDidMount() {
        const { id } = this.props.match.params;
        if (id) {
            this.props.showExamCategory(id);
            this.props.listExamTestCategory();  // ✅ Load danh sách categories để check trùng
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.examCategory && nextProps.examCategory !== this.props.examCategory) {
            this.setState({
                name: nextProps.examCategory.name || "",
            });
        }
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
            errorMessage: "",  // ✅ Clear error khi input change
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { id } = this.props.match.params;
        const { name } = this.state;

        if (!name.trim()) {
            this.setState({ errorMessage: "Vui lòng nhập tên danh mục" });
            return;
        }

        // ✅ Check trùng tên với categories khác (case-insensitive), trừ danh mục hiện tại
        const trimmedName = name.trim();
        const isDuplicate = this.props.categories.some(cat => 
            cat && cat._id !== id && cat.name && cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            this.setState({ errorMessage: "Tên danh mục đã tồn tại!" });
            return;
        }

        this.setState({ loading: true });

        try {
            await this.props.updateExamCategory({
                id: id,
                name: trimmedName,
            });

            this.props.history.push("/exam-word/exam-catalog");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { name, loading } = this.state;

        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="card-title">Chỉnh sửa danh mục bài kiểm tra</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="form-group">
                                                <label>Tên danh mục <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={name}
                                                    onChange={this.handleChange}
                                                    placeholder="Nhập tên danh mục"
                                                    required
                                                />
                                                {this.state.errorMessage && (
                                                    <div className="text-danger mt-1">{this.state.errorMessage}</div>  // ✅ Hiển thị error
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Đang cập nhật..." : "Cập nhật"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary ml-2"
                                                    onClick={() => this.props.history.push("/exam-word/exam-catalog")}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </form>
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
        examCategory: state.examWordTestCategory.examCategory,
        categories: state.examWordTestCategory.examCategories || [],  // ✅ Thêm categories từ state
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { showExamCategory, updateExamCategory, listExamTestCategory },  // ✅ Thêm listExamTestCategory
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExamWordTestCategoryEdit)
);
