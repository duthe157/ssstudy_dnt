import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { showExamCategory, updateExamCategory } from "../../redux/examwordcategory/action";
import { addPart, hidePart, unhidePart, deletePart, restorePart, purgePart, renamePart } from "../../redux/examwordcategory/action";

class ExamWordCategoryEdit extends Component {
    constructor(props) {
        super();
        this.state = {
            name: "",
            loading: false,
            displayMode: "all",
            questionDisplay: "one_per_screen",
            timeSettingMode: "by_section",
            pointTrueFalse: false,
            pointTrueFalse1: 0,
            pointTrueFalse2: 0,
            pointTrueFalse3: 0,
            pointTrueFalse4: 0,
            newSectionName: "",
            viewMode: 'all',
            sectionToDeleteId: null,
            deleteMode: 'soft',
            renameSectionId: null,
            renameSectionName: "",
            statusDisplayAnswer: false,
            e_hidden_answer: false,
            errorMessageAdd: "",  // ✅ Thêm state cho error add
            errorMessageRename: "",  // ✅ Thêm state cho error rename
        };
    }

    componentDidMount() {
        const { id } = this.props.match.params;
        if (id) {
            this.props.showExamCategory(id);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.examCategory && nextProps.examCategory !== this.props.examCategory) {
            const ec = nextProps.examCategory || {};
            const cfg = (ec.config && ec.config[0]) || {};
            const ptf = ec.point_true_false || {};

            this.setState({
                name: ec.name || "",
                displayMode: cfg.viewExamPerPart ? "one_by_one" : "all",
                timeSettingMode: cfg.timePerPart ? "by_section" : "total",
                questionDisplay: cfg.viewOneQuestion ? "one_per_screen" : "list_in_section",
                e_hidden_answer: !!cfg.e_hidden_answer,
                pointTrueFalse: ptf && Object.keys(ptf).length > 0,
                pointTrueFalse1: ptf && ptf["1"] !== undefined ? ptf["1"] : 0,
                pointTrueFalse2: ptf && ptf["2"] !== undefined ? ptf["2"] : 0,
                pointTrueFalse3: ptf && ptf["3"] !== undefined ? ptf["3"] : 0,
                pointTrueFalse4: ptf && ptf["4"] !== undefined ? ptf["4"] : 0,
            });
        }
    }

    handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState({
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { id } = this.props.match.params;
        const { name, displayMode, timeSettingMode, questionDisplay, pointTrueFalse,
            pointTrueFalse1, pointTrueFalse2, pointTrueFalse3, pointTrueFalse4, e_hidden_answer } = this.state;

        if (!name.trim()) {
            alert("Vui lòng nhập tên danh mục");
            return;
        }

        this.setState({ loading: true });

        try {
            const normalizePartForSubmit = (p, overrides = {}) => {
                const isNew = p && p.isNew === true;
                const base = {
                    name: p.name,
                    hidden: !!p.hidden,
                    deleted: !!p.deleted,
                };
                const withOverrides = { ...base, ...overrides };
                if (!isNew && p.id) {
                    withOverrides.id = p.id;
                }
                return withOverrides;
            };

            const partsActive = (this.props.partsActive || []).map(s => normalizePartForSubmit({ ...s, hidden: false, deleted: false }));
            const partsHidden = (this.props.partsHidden || []).map(s => normalizePartForSubmit({ ...s, hidden: true, deleted: false }));
            const partsDeleted = (this.props.partsDeleted || []).map(s => normalizePartForSubmit({ ...s, hidden: false, deleted: true }));

            const payload = {
                id,
                name: name.trim(),
                config: [
                    {
                        viewExamPerPart: displayMode === "one_by_one",
                        timePerPart: timeSettingMode === "by_section",
                        viewOneQuestion: questionDisplay === "one_per_screen",
                        e_hidden_answer: !!e_hidden_answer, // ✅ THÊM: Gửi e_hidden_answer
                    },
                ],
                parts: [...partsActive, ...partsHidden, ...partsDeleted],
            };

            // ✅ Thêm point_true_false logic
            if (pointTrueFalse === true) {
                payload.point_true_false = {
                    "1": Number(pointTrueFalse1) || 0,
                    "2": Number(pointTrueFalse2) || 0,
                    "3": Number(pointTrueFalse3) || 0,
                    "4": Number(pointTrueFalse4) || 0,
                };
            } else {
                payload.point_true_false = {};
            }

            console.log('📤 Payload gửi API:', payload);

            await this.props.updateExamCategory(payload);
            this.props.history.push("/exam-word/competition-part");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        } finally {
            this.setState({ loading: false });
        }
    };

    handleChangeSwitch = (e) => {
        const { name, checked } = e.target;
        console.log(`🔄 Switch changed: ${name} = ${checked}`);
        this.setState({ [name]: checked });
    }

    handleChangeNewSectionName = (e) => {
        this.setState({ newSectionName: e.target.value, errorMessageAdd: "" });  // ✅ Clear error khi input change
    }

    openRenameSectionModal = (id, currentName) => {
        this.setState({ renameSectionId: id, renameSectionName: currentName });
    }

    confirmRenameSection = () => {
        const { renameSectionId, renameSectionName } = this.state;
        const value = (renameSectionName || "").trim();
        if (renameSectionId && value) {
            // ✅ Check trùng tên với tất cả parts (case-insensitive), trừ part hiện tại
            const allParts = [
                ...(this.props.partsActive || []),
                ...(this.props.partsHidden || []),
                ...(this.props.partsDeleted || [])
            ];
            const isDuplicate = allParts.some(part => 
                part && part.id !== renameSectionId && part.name && part.name.trim().toLowerCase() === value.toLowerCase()
            );
            if (isDuplicate) {
                this.setState({ errorMessageRename: "Tên loại đề thi đã tồn tại!" });
                return;
            }

            this.props.renamePart(renameSectionId, value);
            this.setState({ renameSectionId: null, renameSectionName: "", errorMessageRename: "" });
        }
    }

    handleChangeRenameName = (e) => {
        this.setState({ renameSectionName: e.target.value, errorMessageRename: "" });  // ✅ Clear error khi input change
    }

    handleAddSection = () => {
        const { newSectionName } = this.state;
        const value = (newSectionName || "").trim();
        if (!value) return;

        // ✅ Check trùng tên với tất cả parts (case-insensitive)
        const allParts = [
            ...(this.props.partsActive || []),
            ...(this.props.partsHidden || []),
            ...(this.props.partsDeleted || [])
        ];
        const isDuplicate = allParts.some(part => 
            part && part.name && part.name.trim().toLowerCase() === value.toLowerCase()
        );
        if (isDuplicate) {
            this.setState({ errorMessageAdd: "Tên loại đề thi đã tồn tại!" });
            return;
        }

        const newItem = { id: `sec_${Date.now()}`, name: value };
        this.props.addPart(newItem);
        this.setState({ newSectionName: "", errorMessageAdd: "" });
    }

    handleHideSection = (id) => {
        this.props.hidePart(id);
    }

    handleUnhideSection = (id) => {
        this.props.unhidePart(id);
    }

    handleRemoveSection = (id) => {
        this.props.deletePart(id);
    }

    openDeleteSectionModal = (id, mode = 'soft') => {
        this.setState({ sectionToDeleteId: id, deleteMode: mode });
    }

    confirmDeleteSection = () => {
        const { sectionToDeleteId, deleteMode } = this.state;
        if (sectionToDeleteId) {
            if (deleteMode === 'purge') {
                this.props.purgePart(sectionToDeleteId);
            } else {
                this.handleRemoveSection(sectionToDeleteId);
            }
            this.setState({ sectionToDeleteId: null });
        }
    }

    getDisplaySections = () => {
        const { viewMode } = this.state;
        if (viewMode === 'hidden') return this.props.partsHidden || [];
        if (viewMode === 'deleted') return this.props.partsDeleted || [];
        return this.props.partsActive || [];
    }

    render() {
        const { name, loading } = this.state;
        const activeCount = (this.props.partsActive || []).length;
        const hiddenCount = (this.props.partsHidden || []).length;
        const deletedCount = (this.props.partsDeleted || []).length;
        const isPurge = this.state.deleteMode === 'purge';
        const deletingSection = (() => {
            const id = this.state.sectionToDeleteId;
            if (!id) return null;
            const findById = (arr) => (arr || []).find(s => s.id === id);
            return findById(this.props.partsActive) || findById(this.props.partsHidden) || findById(this.props.partsDeleted) || null;
        })();
        const deletingName = deletingSection && deletingSection.name ? deletingSection.name : '';

        return (
            <div>
                <div className="page-content page-container" id="page-content">
                    <div className="padding" style={{ paddingBottom: 0 }}>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="card-title">Chỉnh sửa danh mục kỳ thi</h5>
                                    </div>
                                    <div className="card-body">
                                        <form id="examCategoryForm" onSubmit={this.handleSubmit}>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label className="text-muted">Tên kỳ thi</label>
                                                        <input
                                                            id="examName"
                                                            name="name"
                                                            className="form-control form-control-theme"
                                                            value={name}
                                                            onChange={this.handleChange}
                                                            placeholder="Nhập tên danh mục kỳ thi"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label className="text-muted">Hình thức hiển thị phần thi</label>
                                                        <select
                                                            id="displayMode"
                                                            name="displayMode"
                                                            className="custom-select"
                                                            value={this.state.displayMode}
                                                            onChange={this.handleChange}
                                                        >
                                                            <option value="all">Toàn bộ phần thi</option>
                                                            <option value="one_by_one">Theo từng phần</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label className="text-muted">Cách hiển thị câu hỏi</label>
                                                        <select
                                                            id="questionDisplay"
                                                            name="questionDisplay"
                                                            className="custom-select"
                                                            value={this.state.questionDisplay}
                                                            onChange={this.handleChange}
                                                        >
                                                            <option value="one_per_screen">1 câu trong màn</option>
                                                            <option value="list_in_section">Toàn bộ câu hỏi</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label className="text-muted">Cài đặt thời gian</label>
                                                        <select
                                                            id="timeSettingMode"
                                                            name="timeSettingMode"
                                                            className="custom-select"
                                                            value={this.state.timeSettingMode}
                                                            onChange={this.handleChange}
                                                        >
                                                            <option value="by_section">Theo phần thi</option>
                                                            <option value="total">Tổng thời gian</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-4">
                                                {/* Cấu hình thang điểm đúng sai */}
                                                <div className="col-md-6 d-flex align-items-center mb-3 mb-md-0">
                                                    <label className="mr-2 mb-0">Cấu hình thang điểm câu hỏi đúng sai</label>
                                                    <label className="ui-switch ui-switch-md info m-t-xs mb-0">
                                                        <input
                                                            type="checkbox"
                                                            name="pointTrueFalse"
                                                            checked={this.state.pointTrueFalse === true}
                                                            onChange={this.handleChangeSwitch}
                                                        />
                                                        <i />
                                                    </label>
                                                </div>

                                                {/* Trạng thái hiển thị ký hiệu đáp án */}
                                                <div className="col-md-6 d-flex align-items-center">
                                                    <label className="mr-2 mb-0">Ẩn ký hiệu đáp án</label>
                                                    <label className="ui-switch ui-switch-md info m-t-xs mb-0">
                                                        <input
                                                            type="checkbox"
                                                            name="e_hidden_answer" // ✅ SỬA: từ "hiddenAnswer" thành "e_hidden_answer"
                                                            checked={this.state.e_hidden_answer === true}
                                                            onChange={this.handleChangeSwitch}
                                                        />
                                                        <i />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Nếu cấu hình bật thì hiển thị các input */}
                                            {this.state.pointTrueFalse && (
                                                <div className="row mt-3">
                                                    {[
                                                        { id: "oneCorrect", name: "pointTrueFalse1", label: "Trả lời đúng 1 ý", value: this.state.pointTrueFalse1 },
                                                        { id: "twoCorrect", name: "pointTrueFalse2", label: "Trả lời đúng 2 ý", value: this.state.pointTrueFalse2 },
                                                        { id: "threeCorrect", name: "pointTrueFalse3", label: "Trả lời đúng 3 ý", value: this.state.pointTrueFalse3 },
                                                        { id: "fourCorrect", name: "pointTrueFalse4", label: "Trả lời đúng 4 ý", value: this.state.pointTrueFalse4 },
                                                    ].map((item, idx) => (
                                                        <div className="col-md-6 mb-2 d-flex align-items-center" key={item.id}>
                                                            <label className="mr-2 mb-0" htmlFor={item.id} style={{ whiteSpace: "nowrap" }}>
                                                                {item.label}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id={item.id}
                                                                name={item.name}
                                                                className="form-control"
                                                                style={{ width: "80px" }}   // 👈 input nhỏ lại
                                                                min="0"
                                                                value={item.value}
                                                                onChange={this.handleChange}
                                                            />
                                                            <span className="ml-2">%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-3 mb-2">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="card-title m-0">Quản lý loại đề thi</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group d-flex align-items-center mb-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-theme mr-2"
                                                placeholder="Nhập tên loại đề thi"
                                                value={this.state.newSectionName}
                                                onChange={this.handleChangeNewSectionName}
                                            />
                                            <button type="button" className="btn btn-primary" onClick={this.handleAddSection}>Thêm</button>
                                        </div>
                                        {this.state.errorMessageAdd && (
                                            <div className="text-danger mt-1">{this.state.errorMessageAdd}</div>  // ✅ Hiển thị error add
                                        )}

                                        <div className="mb-3">
                                            <div role="group" aria-label="Filter Sections">
                                                <button type="button" className={`btn btn-sm mr-2 ${this.state.viewMode === 'all' ? 'btn-primary' : 'btn-light text-dark'}`} onClick={() => this.setState({ viewMode: 'all' })}>Tất cả ({activeCount})</button>
                                                <button type="button" className={`btn btn-sm mr-2 ${this.state.viewMode === 'hidden' ? 'btn-primary' : 'btn-light text-dark'}`} onClick={() => this.setState({ viewMode: 'hidden' })}>Ẩn ({hiddenCount})</button>
                                                <button type="button" className={`btn btn-sm mr-2 ${this.state.viewMode === 'deleted' ? 'btn-primary' : 'btn-light text-dark'}`} onClick={() => this.setState({ viewMode: 'deleted' })}>Xoá ({deletedCount})</button>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-theme table-row v-middle">
                                                <thead className="text-muted">
                                                    <tr style={{ borderBottom: '1px solid #000' }}>
                                                        <th className="text-left p-2 text-dark">Loại phần thi</th>
                                                        <th className="text-right p-2 text-dark">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.getDisplaySections() && this.getDisplaySections().length > 0 ? (
                                                        this.getDisplaySections().map((sec) => (
                                                            <tr key={sec.id} className='v-middle table-row-item'>
                                                                <td className="text-left p-2">{sec.name}</td>
                                                                <td className="text-right p-2">
                                                                    {this.state.viewMode === 'all' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-icon mr-2"
                                                                                title="Đổi tên"
                                                                                data-toggle="modal"
                                                                                data-target="#rename-section-modal"
                                                                                onClick={() => this.openRenameSectionModal(sec.id, sec.name)}
                                                                            >
                                                                                <img src="/assets/img/icon-edit.svg" alt="rename" />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-icon mr-2"
                                                                                title="Ẩn"
                                                                                onClick={() => this.handleHideSection(sec.id)}
                                                                            >
                                                                                <img src="/assets/img/icon-eye-off.svg" alt="hide" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {this.state.viewMode === 'hidden' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-icon mr-2"
                                                                            title="Hiện"
                                                                            onClick={() => this.handleUnhideSection(sec.id)}
                                                                        >
                                                                            <img src="/assets/img/icon-eye.svg" alt="unhide" />
                                                                        </button>
                                                                    )}
                                                                    {this.state.viewMode !== 'deleted' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-icon text-danger"
                                                                            title="Xóa"
                                                                            data-toggle="modal"
                                                                            data-target="#delete-section-modal"
                                                                            onClick={() => this.openDeleteSectionModal(sec.id)}
                                                                        >
                                                                            <img src="/assets/img/icon-delete.svg" alt="delete" />
                                                                        </button>
                                                                    )}
                                                                    {this.state.viewMode === 'deleted' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-icon mr-2"
                                                                                title="Khôi phục"
                                                                                onClick={() => this.props.restorePart(sec.id)}
                                                                            >
                                                                                <img src="/assets/img/icon-reload.svg" alt="restore" />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-icon text-danger"
                                                                                title="Xóa vĩnh viễn"
                                                                                data-toggle="modal"
                                                                                data-target="#delete-section-modal"
                                                                                onClick={() => this.openDeleteSectionModal(sec.id, 'purge')}
                                                                            >
                                                                                <img src="/assets/img/icon-delete.svg" alt="purge" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={2} className="text-center text-muted">Không có loại đề thi nào</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-2 mb-0" style={{ marginBottom: '-24px' }}>
                            <div className="col-md-12">
                                <div className="card mb-2" style={{ marginBottom: 0 }}>
                                    <div className="card-body text-right py-2">
                                        <button
                                            type="submit"
                                            form="examCategoryForm"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Đang cập nhật..." : "Cập nhật"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ml-2"
                                            onClick={() => this.props.history.push("/exam-word/competition-part")}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="delete-section-modal" className="modal fade" data-backdrop="true" style={{ display: 'none' }} aria-hidden="true">
                            <div className="modal-dialog animate fade-down" data-class="fade-down">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <div className="modal-title text-md">{isPurge ? 'Xác nhận xoá vĩnh viễn' : 'Thông báo'}</div>
                                        <button className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="p-4 text-center">
                                            {isPurge ? (
                                                <p>Bạn sắp xoá vĩnh viễn "{deletingName}" và không thể hoàn tác. Hành động này sẽ xoá tất cả dữ liệu liên quan và không thể khôi phục.</p>
                                            ) : (
                                                <p>Bạn chắc chắn muốn xóa bản ghi này chứ?</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light" data-dismiss="modal">Đóng</button>
                                        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.confirmDeleteSection}>{isPurge ? 'Xoá vĩnh viễn' : 'Xoá'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="rename-section-modal" className="modal fade" data-backdrop="true" style={{ display: 'none' }} aria-hidden="true">
                            <div className="modal-dialog animate fade-down" data-class="fade-down">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <div className="modal-title text-md">Đổi tên loại đề</div>
                                        <button className="close" data-dismiss="modal">×</button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="p-3">
                                            <label className="text-muted">Tên mới</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-theme"
                                                value={this.state.renameSectionName}
                                                onChange={this.handleChangeRenameName}
                                                placeholder="Nhập tên mới"
                                            />
                                            {this.state.errorMessageRename && (
                                                <div className="text-danger mt-1">{this.state.errorMessageRename}</div>  // ✅ Hiển thị error rename
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light" data-dismiss="modal">Hủy</button>
                                        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.confirmRenameSection}>Xác nhận</button>
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
        examCategory: state.examWordCategory.examCategory,
        partsActive: state.examWordCategory.partsActive,
        partsHidden: state.examWordCategory.partsHidden,
        partsDeleted: state.examWordCategory.partsDeleted,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { showExamCategory, updateExamCategory, addPart, hidePart, unhidePart, deletePart, restorePart, purgePart, renamePart },
        dispatch
    );
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExamWordCategoryEdit)
);
