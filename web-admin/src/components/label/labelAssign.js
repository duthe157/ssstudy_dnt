import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Pagination from "react-js-pagination";
import { bulkUpdateLabelItems, listLabelAssign } from "../../redux/label/action";
import { listSubject } from "../../redux/subject/action";
import { listAdmin } from "../../redux/student/action"; // Teacher list :v

// ─── Mock data & helpers ───────────────────────────────────────────────────────
// Đây là component màn "Gán nhãn nhanh cho sách/khóa học"
// Được điều hướng tới khi click vào tên nhãn ở màn LabelManagement

class LabelAssign extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // filter
            level: '',
            subject_id: '',
            teacher_id: '',
            keyword: '',
            item_type: 'BOOK',

            ids: [],        
            checkAll: false, 

            // paging
            page: 1,
            limit: 5,
            // pending changes (chưa submit): Map<itemId, 'assign' | 'unassign'>
            pendingChanges: {},
        };
    }

    async componentDidMount() {
        const data = {
			limit: 999,
			is_delete: false,
		};
        
        const params = {
            user_group: "TEACHER",
            limit: 100,
        };

        await this.props.listSubject(data);
        await this.props.listAdmin(params);
        this.getData();

    }

    // labelId lấy từ route params hoặc props
    getLabelId = () => {
        return this.props.match?.params?.labelId || this.props.labelId || '';
    };

    getLabelName = () => {
        return this.props.match?.params?.labelName
            || this.props.location?.state?.labelName
            || this.props.labelName
            || 'Nhãn';
    };

    getData = () => {
        const { level, item_type, subject_id, teacher_id, keyword, page, limit } = this.state;

        this.props.listLabelAssign({
            label_id: this.getLabelId(),
            level,
            item_type,
            subject_id,
            teacher_id,
            keyword,
            page,
            limit,
        });

        // Reset pending khi load lại data
        this.setState({ pendingChanges: {}, ids: [], checkAll: false });
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, page: 1 }, this.getData);
    };

    handleSearch = (e) => {
        e.preventDefault();
        this.setState({ page: 1 }, this.getData);
    };

    handleChangePage = (page) => {
        this.setState({ page }, this.getData);
    };

    getItemAssignedStatus = (item) => {
        return item.isAssigned !== undefined ? item.isAssigned : item.is_assigned;
    };

    getItemType = (item) => {
        const itemType = item.item_type || item.itemType || item.type || this.state.item_type;
        const typeMap = {
            book: 'BOOK',
            book_id: 'BOOK_ID',
            course: 'CLASSROOM',
            classroom: 'CLASSROOM',
        };

        return typeMap[String(itemType || '').toLowerCase()] || itemType;
    };

    // Toggle trạng thái pending của 1 item
    handleTogglePending = (item) => {
        const id = item._id || item.id;
        this.setState((prev) => {
            const next = { ...prev.pendingChanges };
            if (next[id] !== undefined) {
                // Đã có pending → bỏ pending (revert về trạng thái gốc)
                delete next[id];
            } else {
                // Chưa pending → thêm pending theo chiều ngược lại
                next[id] = this.getItemAssignedStatus(item) ? 'unassign' : 'assign';
            }
            return { pendingChanges: next };
        });
    };

    // Xác nhận: gọi API cho tất cả pending changes
    handleConfirm = async () => {
        const { pendingChanges } = this.state;
        const labelId = this.getLabelId();
        const itemById = (this.props.items || []).reduce((map, item) => {
            map[item._id || item.id] = item;
            return map;
        }, {});

        const items = Object.entries(pendingChanges)
            .map(([id, action]) => {
                const item = itemById[id] || {};

                return {
                    item_id: id,
                    action: action === 'assign' ? 'ADD' : 'REMOVE',
                    item_type: this.getItemType(item),
                };
            })
            .filter((item) => item.item_type);

        if (items.length === 0) return;

        await this.props.bulkUpdateLabelItems({ label_id: labelId, items });
        this.getData();
    };

    getCheckedItems = () => {
        const { items = [] } = this.props;
        const { ids = [] } = this.state;

        return items.filter(item => ids.includes(item._id || item.id));
    };

    getCheckedAction = () => {
        const checkedItems = this.getCheckedItems();
        const hasAssignedItem = checkedItems.some(item => this.getDisplayStatus(item));

        return hasAssignedItem ? 'unassign' : 'assign';
    };

    handleConfirmCheckedItems = () => {
        const checkedItems = this.getCheckedItems();
        if (checkedItems.length === 0) return;

        const shouldAssign = this.getCheckedAction() === 'assign';

        this.setState((prev) => {
            const next = { ...prev.pendingChanges };

            checkedItems.forEach((item) => {
                const id = item._id || item.id;
                const originalAssigned = this.getItemAssignedStatus(item);

                if (originalAssigned === shouldAssign) {
                    delete next[id];
                } else {
                    next[id] = shouldAssign ? 'assign' : 'unassign';
                }
            });

            return { pendingChanges: next };
        });
    };

    // Huỷ → quay lại màn danh mục nhãn
    handleCancel = () => {
        if (this.props.history) {
            this.props.history.goBack();
        }
    };

    // Tính trạng thái hiển thị của 1 item (sau khi áp pending)
    getDisplayStatus = (item) => {
        const id = item._id || item.id;
        const pending = this.state.pendingChanges[id];
        if (pending === 'assign') return true;
        if (pending === 'unassign') return false;
        return this.getItemAssignedStatus(item);
    };

    fetchRows = () => {
        const { items = [], loading } = this.props;

        if (loading) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Đang tải...</td>
                </tr>
            );
        }

        if (items.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">Không có dữ liệu</td>
                </tr>
            );
        }
        return items?.map((item) => {
            const id = item._id || item.id;
            const isAssigned = this.getDisplayStatus(item);
            const isPending = this.state.pendingChanges[id] !== undefined;

            const title = item.title || item.name || '';

            return (
                <tr key={id} style={{ backgroundColor: isAssigned ? '#f0fff4' : 'transparent' }}>
                    <td>
                        <label className="ui-check m-0">
                            <input
                                type="checkbox"
                                name="id"
                                className="checkInputItem"
                                checked={(this.state.ids || []).includes(id)}  
                                onChange={this.handleCheckBox}
                                value={id}
                            />{' '}
                            <i />
                        </label>
                    </td>
                    {/* Ảnh */}
                    <td style={{ width: 60 }}>
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                            />
                        ) : (
                            <div style={{
                                width: 48, height: 48, borderRadius: 6,
                                background: '#e2e8f0', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, color: '#94a3b8'
                            }}>
                                📚
                            </div>
                        )}
                    </td>

                    {/* Tên sách/khóa học */}
                    <td>
                        <div className="font-weight-bold" style={{ fontSize: 14 }}>{title}</div>
                        {item.subtitle && (
                            <div className="text-muted" style={{ fontSize: 12 }}>{item.subtitle}</div>
                        )}
                    </td>

                    {/* Loại */}
                    <td>
                        <span className={`badge badge-pill ${item.type === 'course' ? 'badge-info' : 'badge-secondary'}`}
                            style={{ fontSize: 11, padding: '4px 8px' }}>
                            {item.type === 'course' ? 'Khóa học' : item.type === 'book_id' ? 'Sách ID' : 'Sách'}
                        </span>
                    </td>

                    {/* Cấp học */}
                    <td style={{ whiteSpace: 'nowrap' }}>{item.level || '—'}</td>

                    {/* Môn học */}
                    <td style={{ whiteSpace: 'nowrap' }}>{item.subject?.name || '—'}</td>

                    {/* Giáo viên */}
                    <td style={{ whiteSpace: 'nowrap' }}>{item.teacher|| item.teacher_id || '—'}</td>

                    {/* Thao tác */}
                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                        {isAssigned ? (
                            <button
                                type="button"
                                className="btn btn-sm"
                                style={{
                                    color: '#e53e3e',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    background: isPending ? '#fff5f5' : 'transparent',
                                    border: isPending ? '1px solid #feb2b2' : 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                }}
                                onClick={() => this.handleTogglePending(item)}
                                title="Hủy gán nhãn"
                            >
                                HỦY GÁN NHÃN &nbsp;<span style={{ fontSize: 16, lineHeight: 1 }}>−</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-sm"
                                style={{
                                    color: '#38a169',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    background: isPending ? '#f0fff4' : 'transparent',
                                    border: isPending ? '1px solid #9ae6b4' : 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                }}
                                onClick={() => this.handleTogglePending(item)}
                                title="Gán nhãn"
                            >
                                GÁN NHÃN &nbsp;<span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                            </button>
                        )}
                    </td>
                </tr>
            );
        });
    };

    fetchSubjectRows() {
		if (this.props.subjects instanceof Array) {
			return this.props.subjects.map((obj, i) => {
				return <option key={i} value={obj._id}>{obj.name}</option>;
			});
		}
	}

    fetchTeacherRows() {
        if (this.props.teachers instanceof Array) {
        return this.props.teachers.map((obj, i) => {
            return (
            <option value={obj._id} key={obj._id.toString()}>
                {obj.fullname}
            </option>
            );
        });
        }
    }

    handleCheckAll = (e) => {
        const { items = [] } = this.props;
        const checked = e.target.checked;
        
        const ids = checked ? items.map(item => item._id || item.id) : [];
        this.setState({ ids });
    };

    handleCheckBox = (e) => {
        const { ids = [] } = this.state;
        const value = e.target.value;
        
        const newIds = e.target.checked
            ? [...ids, value]
            : ids.filter(id => id !== value);
        
        this.setState({ ids: newIds });
    };

    handleClearCheckedItems = () => {
        this.setState({ ids: [] });
    };

    render() {
        const { total, loading } = this.props;
        const { level, item_type, subject_id, teacher_id, keyword, page, limit, pendingChanges } = this.state;
        const pendingCount = Object.keys(pendingChanges).length;
        const checkedCount = (this.state.ids || []).length;
        const checkedAction = this.getCheckedAction();
        const checkedActionText = checkedAction === 'unassign' ? 'Hủy gắn nhãn' : 'Gán nhãn';

        const displayFrom = total === 0 ? 0 : (page - 1) * limit + 1;
        const displayTo = Math.min(page * limit, total);

        return (
            <div className="page-content page-container" id="page-content">
                <div className="padding">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h2 className="text-md text-highlight sss-page-title mb-1" style={{ fontSize: 20, fontWeight: 700 }}>
                                Gán nhãn nhanh cho sách/khóa học
                            </h2>
                            <div className="text-muted" style={{ fontSize: 13 }}>
                                Nhãn: <strong style={{ color: '#2d3748' }}>{this.getLabelName()}</strong>
                            </div>
                        </div>
                        <div className="d-flex" style={{ gap: 10 }}>
                            <button
                                type="button"
                                className="btn btn-light"
                                style={{ minWidth: 80, fontWeight: 600 }}
                                disabled={checkedCount === 0}
                                onClick={this.handleClearCheckedItems}
                            >
                                Hủy 
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{
                                    minWidth: 140,
                                    fontWeight: 600,
                                    background: '#e05a1c',
                                    borderColor: '#e05a1c',
                                    position: 'relative',
                                }}
                                disabled={checkedCount === 0}
                                onClick={this.handleConfirmCheckedItems}
                            >
                                {checkedActionText}
                                {checkedCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: -6, right: -6,
                                        background: '#fff',
                                        color: '#e05a1c',
                                        borderRadius: '50%',
                                        width: 20, height: 20,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1.5px solid #e05a1c',
                                        lineHeight: 1,
                                    }}>
                                        {checkedCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3 align-items-end" style={{ gap: '0 0' }}>
                                {/* Sản phẩm */}
                                <div className="col-auto" style={{ minWidth: 160 }}>
                                    <label className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sản phẩm</label>
                                    <select
                                        className="custom-select custom-select-sm"
                                        name="item_type"
                                        value={item_type}
                                        onChange={this.handleChange}
                                    >
                                        <option value="">Tất cả sản phẩm</option>
                                        <option value="BOOK">Sách</option>
                                        <option value="BOOK_ID">Sách ID</option>
                                        <option value="CLASSROOM">Khóa học</option>
                                    </select>
                                </div>

                                {/* Cấp học */}
                                <div className="col-auto" style={{ minWidth: 160 }}>
                                    <label className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cấp học</label>
                                    <select
                                        className="custom-select custom-select-sm"
                                        value={level}
                                        name="level"
                                        onChange={this.handleChange}
                                    >
                                        <option value="">-- Tất cả cấp học --</option>
                                        <option value="1">Lớp 1</option>
                                        <option value="2">Lớp 2</option>
                                        <option value="3">Lớp 3</option>
                                        <option value="4">Lớp 4</option>
                                        <option value="5">Lớp 5</option>
                                        <option value="6">Lớp 6</option>
                                        <option value="7">Lớp 7</option>
                                        <option value="8">Lớp 8</option>
                                        <option value="9">Lớp 9</option>
                                        <option value="10">Lớp 10</option>
                                        <option value="11">Lớp 11</option>
                                        <option value="12">Lớp 12</option>
                                    </select>
                                </div>

                                {/* Môn học */}
                                <div className="col-auto" style={{ minWidth: 160 }}>
                                    <label className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Môn học</label>
                                    <select
                                        className="custom-select custom-select-sm"
                                        name="subject_id"
                                        value={subject_id}
                                        onChange={this.handleChange}
                                    >
                                        <option value="">Tất cả môn học</option>
                                        {this.fetchSubjectRows()}
                                    </select>
                                </div>

                                {/* Giáo viên */}
                                <div className="col-auto" style={{ minWidth: 160 }}>
                                    <label className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Giáo viên</label>
                                    <select
                                        className="custom-select custom-select-sm"
                                        name="teacher_id"
                                        value={teacher_id}
                                        onChange={this.handleChange}
                                    >
                                        <option value="">Tất cả giáo viên</option>
                                        {this.fetchTeacherRows()}
                                    </select>
                                </div>

                                {/* Search */}
                                <div className="col">
                                    <label className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tìm kiếm</label>
                                    <form className="input-group input-group-sm" onSubmit={this.handleSearch}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập tên sách, khóa học..."
                                            name="keyword"
                                            value={keyword}
                                            onChange={(e) => this.setState({ keyword: e.target.value })}
                                        />
                                        <span className="input-group-append">
                                            <button className="btn btn-white btn-sm" type="submit">
                                                <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15}
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx={11} cy={11} r={8} />
                                                    <line x1={21} y1={21} x2="16.65" y2="16.65" />
                                                </svg>
                                            </button>
                                        </span>
                                    </form>
                                </div>
                            </div>

                            {/* Pending notice */}
                            {pendingCount > 0 && (
                                <div className="alert mb-3" style={{
                                    background: '#fffbeb',
                                    border: '1px solid #f6e05e',
                                    borderRadius: 6,
                                    padding: '10px 16px',
                                    fontSize: 13,
                                    color: '#744210',
                                }}>
                                    ⚠️ Bạn có <strong>{pendingCount}</strong> thay đổi chưa được lưu.
                                    Nhấn <strong>"Cập nhật"</strong> để áp dụng.
                                </div>
                            )}

                            {/* Table */}
                            <table className="table table-theme table-row v-middle mt-0">
                                <thead className="text-muted">
                                    <tr>
                                        <th width="10px">
                                            <label className="ui-check m-0">
                                                <input
                                                    type="checkbox"
                                                    name="id"
                                                    checked={
                                                        this.props.items?.length > 0 &&
                                                        (this.state.ids || []).length === this.props.items?.length
                                                    }
                                                    onChange={this.handleCheckAll}
                                                />{' '}
                                                <i />
                                            </label>
                                        </th>
                                        <th style={{ width: 60 }}>Ảnh</th>
                                        <th>Tên sách / Khóa học</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>Loại</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>Cấp học</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>Môn học</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>Giáo viên</th>
                                        <th className="text-right" style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.fetchRows()}
                                </tbody>
                            </table>

                            {/* Footer phân trang */}
                            <div className="row listing-footer">
                                <div className="col-auto">
                                    <select
                                        className="custom-select w-70"
                                        name="limit"
                                        value={limit}
                                        onChange={this.handleChange}
                                    >
                                        <option value="5">5</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                                <div className="col showing-text">
                                    Hiển thị từ <b>{displayFrom}</b> đến <b>{displayTo}</b> trong tổng số <b>{total}</b> mục
                                </div>
                                {total > 0 && (
                                    <div className="col-auto text-right">
                                        <Pagination
                                            activePage={page}
                                            itemsCountPerPage={limit}
                                            totalItemsCount={total}
                                            pageRangeDisplayed={5}
                                            onChange={this.handleChangePage}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Bottom action buttons */}
                            <div className="d-flex justify-content-end mt-3" style={{ gap: 10 }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{
                                        minWidth: 100,
                                        fontWeight: 600,
                                        background: '#e05a1c',
                                        borderColor: '#e05a1c',
                                    }}
                                    disabled={pendingCount === 0}
                                    onClick={this.handleConfirm}
                                >
                                    Cập nhật
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    style={{ minWidth: 80, fontWeight: 600 }}
                                    onClick={this.handleCancel}
                                >
                                    Hủy
                                </button>
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
        items:   state.label.assignItems.records || [],
        total:   state.label.assignItems.totalRecord || 0,
        loading: state.label.assignLoading || false,
        subjects: state.subject.subjects || [],
        teachers: state.student.students || [],
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listLabelAssign, bulkUpdateLabelItems, listSubject, listAdmin }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LabelAssign));
