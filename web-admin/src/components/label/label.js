import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import HeadingSortColumn from "../HeadingSortColumn";
import { DragDropContext } from 'react-beautiful-dnd';
import Pagination from "react-js-pagination";
import LabelRow from "./component/labelRow";
import { listLabel, countLabelByStatus, createLabel, deleteLabel, restoreLabel, updateStatusLabel, updateLabelOrder, updateLabel } from "../../redux/label/action";

// ─── Component chính ──────────────────────────────────────────────────────────
class LabelManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // filter / search
            keyword: '',
            status: '',
            // sort
            sort_key: 'name',
            sort_order: 'asc',
            // paging
            page: 1,
            limit: 20,
            // view mode tabs
            viewMode: 'all',
            // expand/collapse — lưu Set các id đang mở
            expandedIds: new Set(),

            parent_id: '',
            label_name: '',
            // modal rename
            sectionToRenameId: null,
            sectionToRenameName: '',
            sectionToRenameParentId: '',
        };
    }

    componentDidMount() {
        this.getData();
    }

    // Lấy dữ liệu theo state hiện tại
    getData = async () => {
        const { keyword, status, page, limit, viewMode } = this.state;

        // Chuyển viewMode sang status filter cho mock
        let statusFilter = status;
        if (viewMode === 'all') statusFilter = 'ACTIVE';
        if (viewMode === 'hidden') statusFilter = 'HIDDEN';
        if (viewMode === 'deleted') statusFilter = 'DELETED';

        await this.props.listLabel({ keyword, status: statusFilter, page, limit });
        await this.props.countLabelByStatus();
    };

    // Search submit
    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ page: 1 }, this.getData);
    };

    // onChange input / select chung
    handleChange = (e) => {
        const name = e.target.name;
        const value = name === 'limit' ? parseInt(e.target.value, 10) : e.target.value;
        this.setState({ [name]: value, page: 1 }, this.getData);
    };

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    // Đổi trang
    handleChangePage = (page) => {
        this.setState({ page }, this.getData);
    };

    // Đổi tab all/hidden/deleted
    handleTabChange = (viewMode) => {
        this.setState({ viewMode, page: 1, status: '' }, this.getData);
    };

    // Sort column
    sort = (sort_key, sort_order) => {
        this.setState({ sort_key, sort_order, page: 1 }, this.getData);
    };

    // Toggle expand/collapse một node
    handleToggleExpand = (id) => {
        this.setState((prev) => {
            const next = new Set(prev.expandedIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { expandedIds: next };
        });
    };

    openDeleteSectionModal = (id, mode = 'soft') => {
        this.setState({ sectionToDeleteId: id, deleteMode: mode });
    }

    handleRestoreLabel = async (id) => {
        await this.props.restoreLabel(id);
        this.setState({ viewMode: 'deleted' }, this.getData);
    }

    handleShowLabel = async (id) => {
        await this.props.updateStatusLabel(id, 'ACTIVE');
        this.setState({ viewMode: 'all' }, this.getData);
    }

    handleHideLabel = async (id) => {
        await this.props.updateStatusLabel(id, 'HIDDEN');
        this.getData();
    }

    openRenameSectionModal = (id, name, parent_id = '') => {
        this.setState({
            sectionToRenameId: id,
            sectionToRenameName: name || '',
            sectionToRenameParentId: parent_id || '',
        });
    }

    handleRenameChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    confirmRenameSection = async () => {
        const { sectionToRenameId, sectionToRenameName, sectionToRenameParentId } = this.state;

        await this.props.updateLabel({ id: sectionToRenameId, name: sectionToRenameName, parent_id: sectionToRenameParentId });

        this.setState({
            sectionToRenameId: null,
            sectionToRenameName: '',
            sectionToRenameParentId: '',
        }, this.getData);
    }

    // Render tbody
    fetchRows = () => {
        const { labels } = this.props;
        const { expandedIds } = this.state;

        if (!labels || labels.length === 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                            Không có dữ liệu
                        </td>
                    </tr>
                </tbody>
            );
        }

        return labels.map((tag) => (
            <LabelRow
                key={tag._id || tag.id}
                tag={tag}
                level={0}
                expandedIds={expandedIds}
                onToggle={this.handleToggleExpand}
                openRenameSectionModal={this.openRenameSectionModal}
                onDelete={this.openDeleteSectionModal}
                restoreLabel={this.handleRestoreLabel}
                viewMode={this.state.viewMode}
                showLabel={this.handleShowLabel}
                hideLabel={this.handleHideLabel}
            />
        ));
    };

    // Handle drag end from react-beautiful-dnd
    onDragEnd = async (result) => {
        const { destination, source } = result;
        if (!destination) return;

        const droppableId = destination.droppableId || source.droppableId;

        if (destination.droppableId !== source.droppableId) return;
        if (destination.index === source.index) return;

        // We only care about child-list droppables (ids: children-<parentId>)
        if (droppableId && droppableId.startsWith('children-')) {
            const parentId = droppableId.replace('children-', '');
            const getLabelId = (label) => label && (label._id || label.id);
            // find parent in current labels
            const parent = (this.props.labels || []).find((t) => String(getLabelId(t)) === String(parentId));
            if (!parent || !parent.children) return;

            // build new ordered ids
            const newChildren = Array.from(parent.children);
            // move item
            const [moved] = newChildren.splice(source.index, 1);
            if (!moved) return;
            newChildren.splice(destination.index, 0, moved);

            // dispatch action to persist ordering
            if (this.props.updateLabelOrder) {
                await this.props.updateLabelOrder(parentId, newChildren);
                this.getData();
            }
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const name = this.state.label_name;
        const parent_id = this.state.parent_id || null;

        if (!name || name.trim() === '') {
            alert('Tên nhãn không được để trống');
            return;
        }

        await this.props.createLabel({ name, parent_id });
        this.setState({ label_name: '', parent_id: '' }, this.getData);
    }

    confirmDeleteSection = async () => {
        const id =  this.state.sectionToDeleteId;
        if(this.state.deleteMode === 'purge') {
            await this.props.deleteLabel(id, true);
        }else{
            await this.props.updateStatusLabel(id, 'DELETED');
        }
        this.getData();
    }

    render() {
        const {
            total, page, limit, loading,
            countAll, countHidden, countDeleted,
            labels = [],
        } = this.props;

        const { keyword, status, sort_key, sort_order, viewMode } = this.state;

        const displayFrom = total === 0 ? 0 : (page - 1) * limit + 1;
        const displayTo = Math.min(page * limit, total);
        const isPurge = this.state.deleteMode === 'purge';
        const renamingName = this.state.sectionToRenameName || '';
        const renamingParentId = this.state.sectionToRenameParentId || '';
        const deletingSection = (() => {
            const id = this.state.sectionToDeleteId;
            if (!id) return null;

            // Tìm node theo id trong cây labels (duyệt đệ quy)
            const findInTree = (nodes) => {
                if (!nodes || nodes.length === 0) return null;
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    const nodeId = n && (n._id || n.id);
                    if (String(nodeId) === String(id)) return n;
                    if (n && n.children && n.children.length) {
                        const found = findInTree(n.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            // labels chứa cây nhãn; fallback null nếu không tìm thấy
            return findInTree(this.props.labels) || null;
        })();
        const deletingName = deletingSection && deletingSection.name ? deletingSection.name : '';
        return (
            <>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Danh mục nhãn</h2>
                        <div className='block-table-exam-cate'>
                            <div className='row'>

                                {/* ── Form thêm mới ── */}
                                <div className='col-sm-4'>
                                    <div className='card'>
                                        <div className='card-header'>
                                            <h5 className='card-title m-0'>Thêm mới nhãn</h5>
                                        </div>
                                        <div className='card-body'>
                                            <form onSubmit={this.handleSubmit}>
                                                <div className='form-group'>
                                                    <label className='text-muted'>Tên nhãn</label>
                                                    <input
                                                        type='text'
                                                        className='form-control form-control-theme'
                                                        placeholder='Nhập tên nhãn...'
                                                        value={this.state.label_name}
                                                        onChange={(e) => this.setState({ label_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className='form-group'>
                                                    <label className='text-muted'>Nhãn cha</label>
                                                    <select
                                                        className="custom-select"
                                                        name='parent_id'
                                                        style={{ margin: "0 10px 0 0" }}
                                                        value={this.state.parent_id}
                                                        onChange={(e) => this.setState({ parent_id: e.target.value })}
                                                    >
                                                        <option value=''>-- Không có --</option>
                                                        {/* Chỉ render nhãn cha (parent_id === null) vào dropdown */}
                                                        {labels
                                                            .filter((t) => !t.parent_id)
                                                            .map((t) => (
                                                                <option key={t._id} value={t._id}>{t.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <button
                                                    type='submit'
                                                    className='btn btn-primary btn-block btn-no-hover'
                                                >
                                                    Thêm mới
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Danh sách nhãn ── */}
                                <div className='col-sm-8'>
                                    <div className='card'>
                                        <div className='card-body'>

                                            {/* Search & filter */}
                                            <div className='toolbar mb-3 justify-content-start' style={{ padding: 0 }}>
                                                <form className="flex" onSubmit={this.onSubmit}>
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-theme keyword-custom"
                                                            placeholder="Nhập từ khoá tìm kiếm..."
                                                            onChange={this.onChange}
                                                            name="keyword"
                                                            value={keyword}
                                                        />
                                                        <span className="input-group-append">
                                                            <button className="btn btn-white btn-sm" type="submit">
                                                                <span className="d-flex text-muted">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16}
                                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                                                                        className="feather feather-search">
                                                                        <circle cx={11} cy={11} r={8} />
                                                                        <line x1={21} y1={21} x2="16.65" y2="16.65" />
                                                                    </svg>
                                                                </span>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Tab filter: Tất cả / Ẩn / Xóa */}
                                            <div className='mb-3'>
                                                <div role='group' aria-label='Filter categories'>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${viewMode === 'all' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('all')}
                                                    >
                                                        Tất cả ({countAll})
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${viewMode === 'hidden' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('hidden')}
                                                    >
                                                        Ẩn ({countHidden})
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${viewMode === 'deleted' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('deleted')}
                                                    >
                                                        Xóa ({countDeleted})
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <DragDropContext onDragEnd={this.onDragEnd}>
                                                <table className='table table-theme table-row v-middle mt-0'>
                                                    <thead className='text-muted'>
                                                        <tr>
                                                            <HeadingSortColumn
                                                                name="name"
                                                                content="Tên Nhãn"
                                                                handleSort={this.sort}
                                                                sort_key={sort_key}
                                                                sort_order={sort_order}
                                                            />
                                                            <HeadingSortColumn
                                                                name="usage_count"
                                                                content="Số lượng gán"
                                                                handleSort={this.sort}
                                                                sort_key={sort_key}
                                                                sort_order={sort_order}
                                                            />
                                                            <HeadingSortColumn
                                                                name="updated_at"
                                                                content="Cập nhật"
                                                                handleSort={this.sort}
                                                                sort_key={sort_key}
                                                                sort_order={sort_order}
                                                            />
                                                            <th className="text-right">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    {loading ? (
                                                        <tbody>
                                                            <tr key="loading">
                                                                <td colSpan={5} className="text-center py-4">
                                                                    <span className="text-muted">Đang tải...</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    ) : this.fetchRows()}
                                                </table>
                                            </DragDropContext>

                                            {/* Footer phân trang */}
                                            <div className='row listing-footer'>
                                                <div className='col-auto'>
                                                    <select
                                                        className='custom-select w-70'
                                                        name='limit'
                                                        value={limit}
                                                        onChange={this.handleChange}
                                                    >
                                                        <option value='20'>20</option>
                                                        <option value='50'>50</option>
                                                        <option value='100'>100</option>
                                                        <option value='-1'>ALL</option>
                                                    </select>
                                                </div>
                                                <div className='col showing-text'>
                                                    {' '}Hiển thị từ{' '}
                                                    <b>{!isNaN(displayFrom) ? displayFrom : 0}</b>{' '}
                                                    đến{' '}
                                                    <b>{!isNaN(displayTo) ? displayTo : 0}</b>{' '}
                                                    trong tổng số <b>{total}</b>
                                                </div>
                                                {total > 0 ? (
                                                    <div className='col-auto text-right'>
                                                        <Pagination
                                                            activePage={page}
                                                            itemsCountPerPage={limit === -1 ? total : limit}
                                                            totalItemsCount={total}
                                                            pageRangeDisplayed={10}
                                                            onChange={this.handleChangePage}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='col-auto text-right'>Không có bản ghi nào</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal confirm remove */}
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

                {/* Modal update label */}
                <div id="rename-section-modal" className="modal fade" data-backdrop="true" style={{ display: 'none' }} aria-hidden="true">
                    <div className="modal-dialog animate fade-down" data-class="fade-down">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title text-md">Chỉnh sửa nhãn</div>
                                <button className="close" data-dismiss="modal">×</button>
                            </div>
                            <div className="modal-body">
                                <div>
                                    <div className='form-group'>
                                        <label className='text-muted'>Tên nhãn</label>
                                        <input
                                            type='text'
                                            className='form-control form-control-theme'
                                            placeholder='Nhập tên nhãn...'
                                            name='sectionToRenameName'
                                            value={renamingName}
                                            onChange={this.handleRenameChange}
                                        />
                                    </div>
                                    <div className='form-group'>
                                        <label className='text-muted'>Nhãn cha</label>
                                        <select
                                            className='custom-select'
                                            name='sectionToRenameParentId'
                                            value={renamingParentId}
                                            onChange={this.handleRenameChange}
                                        >
                                            <option value=''>-- Không có --</option>
                                            {labels
                                                .filter((t) => !t.parent_id)
                                                .map((t) => (
                                                    <option key={t._id} value={t._id}>{t.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" data-dismiss="modal">Đóng</button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.confirmRenameSection}>Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        labels:       state.label.labels,
        total:        state.label.total,
        page:         state.label.page,
        limit:        state.label.limit,
        loading:      state.label.loading,
        countAll:     state.label.countAll,
        countHidden:  state.label.countHidden,
        countDeleted: state.label.countDeleted,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ listLabel, countLabelByStatus, createLabel, updateLabel, deleteLabel, restoreLabel, updateStatusLabel, updateLabelOrder }, dispatch);
}

let LabelManagementContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(LabelManagement)
);

export default LabelManagementContainer;
