import React, { Component } from "react";
import Moment from "moment";
import Pagination from "react-js-pagination";
import axios from "axios";
import {
    listExamCategory,
    deleteExamCategory,
    addDelete,
    checkAll,
    addDataRemoveExamCategory,
    createExamCategory,
    updateExamCategory,
} from "../../redux/examwordcategory/action";
import HeadingSortColumn from "../HeadingSortColumn";

import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import { initAPI } from "../../config/api";


class Row extends Component {
    constructor(props) {
        super();
        this.state = {
            check: false,
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

    handleCheck = async (e) => {
        this.props.onDeleteOne(true);
        this.props.addDataRemoveExamCategory({
            ids: this.props.obj._id
        })
    }

    render() {
        return (
            <tr className='v-middle table-row-item' data-id={17}>
                <td>
                    <label className='ui-check m-0'>
                        <input
                            type='checkbox'
                            name='id'
                            className="checkInputItem"
                            onChange={this.handleCheckBox}
                            value={this.props.obj._id}
                        />{" "}
                        <i />
                    </label>
                </td>
                <td className='flex'>
                    <Link
                        className='item-author text-color'
                        to={"/exam-word/competition-part/" + this.props.obj._id + "/edit"}
                    >
                        {this.props.obj.name}
                    </Link>
                </td>
                <td>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.updated_at &&
                            Moment(this.props.obj.updated_at).format(
                                "DD/MM/YYYY HH:mm:ss"
                            )}
                    </span>
                </td>
                <td className="text-right">
                    <div className='item-action'>
                        {this.props.viewMode === 'all' && (
                            <>
                                <Link
                                    className='btn btn-icon mr-2'
                                    title='Sửa'
                                    to={'/exam-word/competition-part/' + this.props.obj._id + '/edit'}
                                >
                                    <img src="/assets/img/icon-edit.svg" alt="edit" />
                                </Link>
                                <button
                                    type='button'
                                    className='btn btn-icon mr-2'
                                    title='Ẩn'
                                    onClick={() => this.props.onHide(this.props.obj._id)}
                                >
                                    <img src="/assets/img/icon-eye-off.svg" alt="hide" />
                                </button>
                            </>
                        )}
                        {this.props.viewMode === 'hidden' && (
                            <button
                                type='button'
                                className='btn btn-icon mr-2'
                                title='Hiện'
                                onClick={() => this.props.onUnhide(this.props.obj._id)}
                            >
                                <img src="/assets/img/icon-eye.svg" alt="unhide" />
                            </button>
                        )}
                        {this.props.viewMode !== 'deleted' && (
                            <button
                                type='button'
                                className='btn btn-icon text-danger'
                                title='Xóa'
                                data-toggle='modal'
                                data-target='#delete-competition-part'
                                onClick={() => this.props.onOpenDelete(this.props.obj._id)}
                            >
                                <img src="/assets/img/icon-delete.svg" alt="delete" />
                            </button>
                        )}
                        {this.props.viewMode === 'deleted' && (
                            <>
                                <button
                                    type='button'
                                    className='btn btn-icon mr-2'
                                    title='Khôi phục'
                                    onClick={() => this.props.onRestore(this.props.obj._id)}
                                >
                                    <img src="/assets/img/icon-reload.svg" alt="restore" />
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-icon text-danger'
                                    title='Xóa vĩnh viễn'
                                    data-toggle='modal'
                                    data-target='#delete-competition-part'
                                    onClick={() => this.props.onOpenDelete(this.props.obj._id, true)}
                                >
                                    <img src="/assets/img/icon-delete.svg" alt="purge" />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    }
}

class ExamWordCategory extends Component {
    constructor(props) {
        super();
        this.state = {
            data: [],
            page: 1,
            limit: "",
            keyword: "",
            activePage: 1,
            checkAll: false,
            ids: [],
            sort_key: "",
            sort_order: "",
            newCategoryName: "",
            total: 0,
            categories: [],
            check: false,
            dataRemoveExamCategory: null,
            viewMode: 'all',
            countAll: 0,
            countHidden: 0,
            countDeleted: 0,
            renameCategoryId: null,
            renameCategoryName: "",
            deleteSelectedId: null,
            isPurgeDelete: false,
            loading: false,  // Add loading state to prevent UI glitches
            errorMessage: "",  // ✅ Thêm state cho error message
        };
    }

    fetchRows() {
        console.log('fetchRows - this.state.categories:', this.state.categories);
        if (this.state.categories instanceof Array) {
            return this.state.categories.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object._id}
                        index={i}
                        addDelete={this.props.addDelete}
                        listChapter={this.props.listChapter}
                        handleCheckedIds={this.handleCheckedIds}
                        getData={this.getData}
                        check={this.state.check}
                        addDataRemoveExamCategory={this.props.addDataRemoveExamCategory}
                        onDeleteOne={this.onDeleteOne}
                        viewMode={this.state.viewMode}
                        onOpenRename={this.openRenameCategoryModal}
                        onHide={this.handleHideCategory}
                        onUnhide={this.handleUnhideCategory}
                        onOpenDelete={this.openDeleteCategoryModal}
                        onRestore={this.handleRestoreCategory}
                    />
                );
            });
        }
        return null;
    }

    onDeleteOne = async (onResetIds) => {
        if (onResetIds) {
            await this.setState({
                ids: []
            })
        }
    }

    handleCheckedIds = async (id, type = '') => {
        const _ids = this.state.ids;
        if (type === 'add') {
            if (_ids.indexOf(id) < 0) {
                _ids.push(id);
            }
        }
        if (type === 'remove') {
            let index = _ids.indexOf(id);
            if (index > -1) {
                _ids.splice(index, 1);
            }
        }

        await this.setState({
            ids: _ids
        })

    }

    onChange = (e) => {
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value,
        });
    };

    handleChangeNewName = (e) => {
        this.setState({ newCategoryName: e.target.value, errorMessage: "" });  // ✅ Clear error khi input change
    }

    handleCreateCategory = async (e) => {
        e.preventDefault();
        const { newCategoryName } = this.state;
        if (!newCategoryName || newCategoryName.trim() === "") return;

        // ✅ Tự lấy danh sách hiện tại từ state và kiểm tra trùng tên (case-insensitive)
        const trimmedName = newCategoryName.trim();
        const isDuplicate = this.state.categories.some(cat =>
            cat && cat.name && cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            this.setState({ errorMessage: "Tên danh mục đã tồn tại!" });
            return;
        }

        await this.props.createExamCategory({ name: trimmedName });
        await this.setState({ newCategoryName: "", errorMessage: "" });
        await this.getData(this.state.page);

        // ✅ Cập nhật count ngay sau khi tạo thành công
        await this.updateCounts();
    }

    buildUpdatePayload(id, overrides = {}) {
        const found = Array.isArray(this.state.categories)
            ? this.state.categories.find(c => (c && (c._id || c.id)) === id)
            : null;
        const config = Array.isArray(found && found.config) ? found.config : [];
        const normalizedParts = Array.isArray(found && found.parts)
            ? found.parts.map(p => ({
                name: p && p.name ? p.name : '',
                hidden: !!(p && p.hidden),
                delete: !!(p && (p.deleted || p.delete)),
            }))
            : [];
        const payload = {
            id: (found && (found._id || found.id)) || id,
            name: (found && found.name) || '',
            config,
            parts: normalizedParts,
            point_true_false: (found && found.point_true_false) || {},
            ...overrides,
        };
        if ('hidden' in payload && overrides.hidden === undefined) {
            delete payload.hidden;
        }
        return payload;
    }

    openRenameCategoryModal = (id, currentName) => {
        this.setState({ renameCategoryId: id, renameCategoryName: currentName });
    }

    confirmRenameCategory = async () => {
        const { renameCategoryId, renameCategoryName } = this.state;
        const value = (renameCategoryName || "").trim();
        if (renameCategoryId && value) {
            await this.props.updateExamCategory({ id: renameCategoryId, name: value });
            this.setState({ renameCategoryId: null, renameCategoryName: "" });
            await this.getData(1);
            // ✅ Cập nhật count sau khi đổi tên (tuy không ảnh hưởng đến số lượng nhưng để đồng nhất)
            await this.updateCounts();
        }
    }

    handleHideCategory = async (id) => {
        try {
            const payload = this.buildUpdatePayload
                ? this.buildUpdatePayload(id, { hidden: true })
                : { id, hidden: true };
            await this.props.updateExamCategory(payload);
            await this.updateListAfterChange([id]);
            // ✅ Cập nhật count sau khi ẩn
            await this.updateCounts();
        } catch (err) {
            console.error('Error hiding category:', err);
        }
    }

    handleUnhideCategory = async (id) => {
        try {
            const payload = this.buildUpdatePayload
                ? this.buildUpdatePayload(id, { hidden: false })
                : { id, hidden: false };
            await this.props.updateExamCategory(payload);
            await this.updateListAfterChange([id]);
            // ✅ Cập nhật count sau khi bỏ ẩn
            await this.updateCounts();
        } catch (err) {
            console.error('Error unhiding category:', err);
        }
    }


    handleRestoreCategory = async (id) => {
        try {
            const payload = this.buildUpdatePayload
                ? this.buildUpdatePayload(id, { deleted: false })
                : { id, deleted: false };
            await this.props.updateExamCategory(payload);
            await this.updateListAfterChange([id]);
            // ✅ Cập nhật count sau khi khôi phục
            await this.updateCounts();
        } catch (err) {
            console.error('Error restoring category:', err);
        }
    }

    openDeleteCategoryModal = async (id, isPurge = false) => {
        this.setState({ deleteSelectedId: id, isPurgeDelete: isPurge });
        await this.onDeleteOne(true);
        this.props.addDataRemoveExamCategory({ ids: id });
    }

    handleSoftDeleteCategory = async (id) => {
        try {
            const payload = this.buildUpdatePayload
                ? this.buildUpdatePayload(id, { deleted: true })
                : { id, deleted: true };
            await this.props.updateExamCategory(payload);
            await this.updateListAfterChange([id]);
        } catch (err) { }
    }

    async componentDidMount() {
        const url = this.props.location.search;
        let params = queryString.parse(url);

        this.setState({
            keyword: params.keyword ? params.keyword : "",
            sort_key: params.sort_key ? params.sort_key : "",
            sort_order: params.sort_order ? params.sort_order : "",
            limit: params.limit ? params.limit : 20,
            page: params.page ? params.page : 1,
        }, async () => {
            await this.getData(this.state.page);
            await this.updateCounts();  // Cập nhật count ban đầu
        });
    }

    getData = async (pageNumber = 1) => {
        this.setState({ loading: true });
        const params = {
            keyword: this.state.keyword,
            limit: this.state.limit,
            sort_key: this.state.sort_key,
            sort_order: this.state.sort_order,
        };

        if (this.state.viewMode === 'deleted') {
            params.deleted = true;
        }
        if (this.state.viewMode === 'hidden') {
            params.hidden = true;
        }
        if (this.state.viewMode === 'all') {
            params.hidden = false;
        }

        params.page = pageNumber;

        console.log('getData params:', params);
        console.log('getData state:', this.state);
        await this.props.listExamCategory(params);
        this.setState({ loading: false });
    };

    // Phương thức để cập nhật count cho tất cả chế độ
    updateCounts = async () => {
        this.setState({ loading: true });
        const modes = ['all', 'hidden', 'deleted'];
        const counts = { countAll: 0, countHidden: 0, countDeleted: 0 };

        initAPI();  // Initialize API

        // Fetch counts for all modes concurrently
        const promises = modes.map(async (mode) => {
            const params = {
                keyword: this.state.keyword,
                limit: this.state.limit,
                sort_key: this.state.sort_key,
                sort_order: this.state.sort_order,
                page: 1,
            };
            if (mode === 'deleted') params.deleted = true;
            if (mode === 'hidden') params.hidden = true;
            if (mode === 'all') params.hidden = false;

            try {
                const res = await axios.post(`/competition-part/list`, params);
                if (res.data.code === 200) {
                    const total = res.data.data ? res.data.data.totalRecord : 0;
                    return { mode, total };
                } else {
                    return { mode, total: 0 };
                }
            } catch (error) {
                console.error(`Error fetching count for ${mode}:`, error);
                return { mode, total: 0 };
            }
        });

        const results = await Promise.all(promises);
        results.forEach(({ mode, total }) => {
            if (mode === 'all') counts.countAll = total;
            if (mode === 'hidden') counts.countHidden = total;
            if (mode === 'deleted') counts.countDeleted = total;
        });

        this.setState({ ...counts, loading: false });
    };

    // Update tab click handlers to avoid redundant calls
    handleTabChange = async (newViewMode) => {
        if (this.state.viewMode === newViewMode) return;  // Prevent unnecessary updates
        await this.setState({ viewMode: newViewMode, page: 1 });
        await this.getData(1);
        await this.updateCounts();
    };

    onSubmit = async (e) => {
        e.preventDefault();
        let { keyword } = this.state;

        this.props.history.push(`/exam-word/competition-part?keyword=${keyword}`);

        await this.getData(1);
    };

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        this.setState({
            page: pageNumber
        }, async () => {
            let { keyword, page, limit } = this.state;

            this.props.history.push(`/exam-word/competition-part?keyword=${keyword}&page=${page}&limit=${limit}`);

            await this.getData(pageNumber);
        });
    };

    handleDelete = async () => {
        let inputs = document.querySelectorAll('.checkInputItem');
        let data = this.state.dataRemoveExamCategory;

        console.log('dataRemoveExamCategory:', this.state.dataRemoveExamCategory);
        console.log('this.state.ids:', this.state.ids);

        if (this.state.ids && this.state.ids.length > 0) {
            data = {
                ids: this.state.ids
            };
        }

        const idsToProcess = Array.isArray((data || {}).ids)
            ? data.ids
            : (data && typeof data.ids === 'string')
                ? [data.ids]
                : [];

        console.log('Ids cần xử lý:', idsToProcess);

        const isPurge = this.state.viewMode === 'deleted' || this.state.isPurgeDelete === true;

        try {
            if (idsToProcess.length > 0) {
                for (let i = 0; i < idsToProcess.length; i++) {
                    const id = idsToProcess[i];
                    if (isPurge) {
                        console.log('Gọi API delete cho id:', id);
                        await this.props.deleteExamCategory({ id });
                    } else {
                        console.log('Gọi API update (deleted=true) cho id:', id);
                        await this.handleSoftDeleteCategory(id);
                    }
                }
            } else if (data && data.id) {
                if (isPurge) {
                    console.log('Gọi API delete cho id:', data.id);
                    await this.props.deleteExamCategory({ id: data.id });
                } else {
                    console.log('Gọi API update (deleted=true) cho id:', data.id);
                    await this.handleSoftDeleteCategory(data.id);
                }
            }
        } catch (error) {
            console.error('Lỗi khi xử lý xóa:', error);
        }

        // Reset checkbox và state sau khi xóa xong
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }

        await this.setState({
            ids: [],
            isPurgeDelete: false, // Reset flag
            deleteSelectedId: null // Reset selected ID
        });

        // ✅ Cập nhật danh sách và count ngay sau khi xóa
        setTimeout(async () => {
            console.log('Bắt đầu refresh danh sách sau khi thao tác xóa/ẩn');
            await this.updateListAfterChange(idsToProcess);
            // ✅ Cập nhật count ngay sau khi xóa thành công
            await this.updateCounts();
        }, 500); // Giảm thời gian chờ từ 1000ms xuống 500ms
    };

    // ✅ Cập nhật updateListAfterChange để không gọi updateCounts() trùng lặp
    updateListAfterChange = async (affectedIds = []) => {
        // Đếm số item hiện có trong trang hiện tại sau khi thao tác
        const currentIds = Array.isArray(this.state.categories)
            ? this.state.categories.map(c => c && c._id)
            : [];
        const countOnPage = currentIds.length;

        // Nếu trang hiện tại chỉ còn 1 item và vừa bị tác động => lùi trang
        const willBeEmpty = countOnPage <= 1 && this.state.page > 1;
        const nextPage = willBeEmpty ? this.state.page - 1 : this.state.page;

        const { keyword, limit } = this.state;
        if (this.props && this.props.history && this.props.history.push) {
            this.props.history.push(`/exam-word/competition-part?keyword=${keyword}&page=${nextPage}&limit=${limit}`);
        }
        await this.setState({ page: nextPage });
        await this.getData(nextPage);
        // ✅ Bỏ updateCounts() ở đây để tránh gọi trùng lặp
    }

    handleChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;

        this.setState({
            [name]: value,
        }, async () => {
            let { keyword, page, limit } = this.state;

            this.props.history.push(`/exam-word/competition-part?keyword=${keyword}&page=${page}&limit=${limit}`);

            await this.getData(1);
        });
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        console.log('componentWillReceiveProps - nextProps:', nextProps);
        console.log('componentWillReceiveProps - current state:', this.state);

        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }

        if (nextProps.total !== this.state.total) {
            console.log('Updating total from', this.state.total, 'to', nextProps.total);
            this.setState({
                total: nextProps.total,
            });
        }

        if (nextProps.categories && nextProps.categories !== this.state.categories) {
            console.log('Updating categories from', this.state.categories.length, 'to', nextProps.categories.length);
            this.setState({
                categories: nextProps.categories
            });
        }

        // Cập nhật check từ props
        if (nextProps.check !== this.state.check) {
            this.setState({
                check: nextProps.check
            });
        }

        if (nextProps.dataRemoveExamCategory !== this.state.dataRemoveExamCategory) {
            this.setState({
                dataRemoveExamCategory: nextProps.dataRemoveExamCategory
            });
        }
    }

    handleCheckAll = async (e) => {
        var inputs = document.querySelectorAll('.checkInputItem');
        var flag = false;

        if (e.target.checked) {
            flag = true;
        }

        let _ids = [];
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].checked = flag;
            if (flag) {
                _ids.push(inputs[i].value);
            } else {
                _ids = [];
            }
        }

        await this.setState({
            ids: _ids
        })
    };

    sort = async (event) => {
        const name = event.target.getAttribute("name");
        const newSortValue = this.state.sort_order == 1 ? -1 : 1;

        this.setState({
            sort_key: name,
            sort_order: newSortValue
        }, async () => {
            let { keyword, page, limit } = this.state;

            this.props.history.push(`/exam-word/competition-part?keyword=${keyword}&page=${page}&limit=${limit}&sort_key=${name}&sort_order=${newSortValue}`);

            await this.getData(1);
        });
    }

    render() {
        let displayFrom =
            this.state.page === 1
                ? 1
                : (parseInt(this.state.page) - 1) * this.state.limit;
        let displayTo =
            this.state.page === 1
                ? this.state.limit
                : displayFrom + this.state.limit;
        displayTo = displayTo > this.state.total ? this.state.total : displayTo;
        return (
            <div>
                {/* Add loading indicator */}
                {this.state.loading && <div className="loading-spinner">Loading...</div>}
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Danh mục kỳ thi</h2>
                        <div className='block-table-exam-cate'>

                            <div className='row'>
                                <div className='col-sm-4'>
                                    <div className='card'>
                                        <div className='card-header'>
                                            <h5 className='card-title m-0'>Thêm danh mục</h5>
                                        </div>
                                        <div className='card-body'>
                                            <form onSubmit={this.handleCreateCategory}>
                                                <div className='form-group'>
                                                    <label className='text-muted'>Tên danh mục</label>
                                                    <input
                                                        type='text'
                                                        className='form-control form-control-theme'
                                                        placeholder='Tên là cách nó xuất hiện trên trang web của bạn'
                                                        value={this.state.newCategoryName}
                                                        onChange={this.handleChangeNewName}
                                                    />
                                                    {this.state.errorMessage && (
                                                        <div className="text-danger mt-1">{this.state.errorMessage}</div>  // ✅ Hiển thị error
                                                    )}
                                                </div>
                                                <button type='submit' className='btn btn-primary btn-block btn-no-hover'>Thêm danh mục</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-sm-8'>
                                    <div className='card'>
                                        <div className='card-body'>
                                            <div className='toolbar mb-3 justify-content-start' style={{ padding: 0 }}>
                                                <form className='flex' onSubmit={this.onSubmit} style={{ margin: 0 }}>
                                                    <div className='input-group' style={{ maxWidth: 420 }}>
                                                        <input
                                                            type='text'
                                                            className='form-control form-control-theme'
                                                            placeholder='Nhập từ khoá tìm kiếm...'
                                                            onChange={this.onChange}
                                                            value={this.state.keyword}
                                                            name='keyword'
                                                        />{" "}
                                                        <span className='input-group-append'>
                                                            <button
                                                                className='btn btn-white btn-sm'
                                                                type='submit'
                                                            >
                                                                <span className='d-flex text-muted'>
                                                                    <svg
                                                                        xmlns='http://www.w3.org/2000/svg'
                                                                        width={16}
                                                                        height={16}
                                                                        viewBox='0 0 24 24'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        strokeWidth={2}
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                        className='feather feather-search'
                                                                    >
                                                                        <circle
                                                                            cx={11}
                                                                            cy={11}
                                                                            r={8}
                                                                        />
                                                                        <line
                                                                            x1={21}
                                                                            y1={21}
                                                                            x2='16.65'
                                                                            y2='16.65'
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className='mb-3'>
                                                <div role='group' aria-label='Filter categories'>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${this.state.viewMode === 'all' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('all')}
                                                    >
                                                        Tất cả ({this.state.countAll})
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${this.state.viewMode === 'hidden' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('hidden')}
                                                    >
                                                        Ẩn ({this.state.countHidden})
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className={`btn btn-sm mr-2 ${this.state.viewMode === 'deleted' ? 'btn-primary' : 'btn-light text-dark'}`}
                                                        onClick={() => this.handleTabChange('deleted')}
                                                    >
                                                        Xóa ({this.state.countDeleted})
                                                    </button>
                                                </div>
                                            </div>
                                            <table className='table table-theme table-row v-middle mt-0'>
                                                <thead className='text-muted'>
                                                    <tr>
                                                        <th width="10px">
                                                            <label className="ui-check m-0">
                                                                <input
                                                                    type="checkbox"
                                                                    name="id"
                                                                    onChange={this.handleCheckAll}
                                                                />{' '}
                                                                <i />
                                                            </label>
                                                            {this.state.ids.length !== 0 && (
                                                                <button
                                                                    className="btn btn-icon ml-16"
                                                                    data-toggle="modal"
                                                                    data-target="#delete-competition-part"
                                                                    data-toggle-class="fade-down"
                                                                    data-toggle-class-target=".animate"
                                                                    title="Trash"
                                                                    id="btn-trash">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width={16}
                                                                        height={16}
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="feather feather-trash text-muted">
                                                                        <polyline points="3 6 5 6 21 6" />
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                    </svg>
                                                                </button>)
                                                            }
                                                        </th>
                                                        <HeadingSortColumn
                                                            name="name"
                                                            content="Tên"
                                                            handleSort={this.sort}
                                                            sort_key={this.state.sort_key}
                                                            sort_order={this.state.sort_order}
                                                        />
                                                        <HeadingSortColumn
                                                            name="updated_at"
                                                            content="Thời gian cập nhật"
                                                            handleSort={this.sort}
                                                            sort_key={this.state.sort_key}
                                                            sort_order={this.state.sort_order}
                                                        />
                                                        <th className="text-right">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>{this.fetchRows()}</tbody>
                                            </table>
                                            <div className='row listing-footer'>
                                                <div className='col-auto'>
                                                    <select
                                                        className='custom-select w-70'
                                                        name='limit'
                                                        value={this.state.limit}
                                                        onChange={this.handleChange}
                                                    >
                                                        <option value='20'>20</option>
                                                        <option value='50'>50</option>
                                                        <option value='100'>100</option>
                                                        <option value='-1'>ALL</option>
                                                    </select>
                                                </div>
                                                <div className='col showing-text'>
                                                    {" "}
                                                    Hiển thị từ {" "}
                                                    <b>
                                                        {!isNaN(displayFrom) ? displayFrom : 0}
                                                    </b>{" "}
                                                    đến{" "}
                                                    <b>{!isNaN(displayTo) ? displayTo : 0}</b>{" "}
                                                    trong tổng số <b>{this.state.total}</b>
                                                </div>
                                                {this.state.total !== 0 ? (
                                                    <div className='col-auto text-right'>
                                                        <Pagination
                                                            activePage={this.state.page}
                                                            itemsCountPerPage={this.state.limit}
                                                            totalItemsCount={this.state.total}
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

                            <div
                                id='delete-competition-part'
                                className='modal fade'
                                data-backdrop='true'
                                style={{ display: "none" }}
                                aria-hidden='true'
                            >
                                <div
                                    className='modal-dialog animate fade-down'
                                    data-class='fade-down'
                                >
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <div className='modal-title text-md'>{this.state.isPurgeDelete ? 'Xác nhận xoá vĩnh viễn' : 'Thông báo'}</div>
                                            <button
                                                className='close'
                                                data-dismiss='modal'
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='p-4 text-center'>
                                                {this.state.isPurgeDelete ? (
                                                    <p>Bạn sắp xoá vĩnh viễn "{(this.state.categories.find(c => c._id === this.state.deleteSelectedId) || {}).name || ''}" và không thể hoàn tác. Hành động này sẽ xoá tất cả dữ liệu liên quan và không thể khôi phục.</p>
                                                ) : (
                                                    <p>Bạn chắc chắn muốn xóa bản ghi này chứ?</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className='modal-footer'>
                                            <button
                                                type='button'
                                                className='btn btn-light'
                                                data-dismiss='modal'
                                            >
                                                Đóng
                                            </button>
                                            <button
                                                type='button'
                                                onClick={this.handleDelete}

                                                className='btn btn-danger'
                                                data-dismiss='modal'
                                            >
                                                {this.state.isPurgeDelete ? 'Xoá vĩnh viễn' : 'Xoá'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id='rename-category-modal' className='modal fade' data-backdrop='true' style={{ display: 'none' }} aria-hidden='true'>
                                <div className='modal-dialog animate fade-down' data-class='fade-down'>
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <div className='modal-title text-md'>Đổi tên danh mục</div>
                                            <button className='close' data-dismiss='modal'>×</button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='p-3'>
                                                <label className='text-muted'>Tên mới</label>
                                                <input
                                                    type='text'
                                                    className='form-control form-control-theme'
                                                    value={this.state.renameCategoryName}
                                                    onChange={(e) => this.setState({ renameCategoryName: e.target.value })}
                                                    placeholder='Nhập tên mới'
                                                />
                                            </div>
                                        </div>
                                        <div className='modal-footer'>
                                            <button type='button' className='btn btn-light' data-dismiss='modal'>Hủy</button>
                                            <button type='button' className='btn btn-primary' data-dismiss='modal' onClick={this.confirmRenameCategory}>Xác nhận</button>
                                        </div>
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
        categories: state.examWordCategory.examCategories,
        total: state.examWordCategory.total,
        ids: state.examWordCategory.ids,
        check: state.examWordCategory.checkAll,
        dataRemoveExamCategory: state.examWordCategory.dataRemoveExamCategory
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listExamCategory, deleteExamCategory, addDataRemoveExamCategory, addDelete, checkAll, createExamCategory, updateExamCategory },
        dispatch
    );
}

let ExamWordCategoryContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExamWordCategory)
);
export default ExamWordCategoryContainer;

