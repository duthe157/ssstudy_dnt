import React, { Component } from "react";
import Moment from "moment";
import { Select, Badge, notification } from "antd";
import { Link, withRouter } from "react-router-dom";
import Pagination from "react-js-pagination";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import { listExamCategory, showExamCategory } from "../../redux/examwordcategory/action";


import {
    listExamWord,
    deleteExamWord,
    addDelete,
    checkAll,
    addDataRemoveExamWord,
    copyExamWord
} from "../../redux/examword/action";
import { listSubject } from "../../redux/subject/action";

import HeadingSortColumn from "../HeadingSortColumn";

const { Option } = Select;

class Row extends Component {
    constructor(props) {
        super();
        this.state = {
            check: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {

        // ✅ SỬA: Xử lý reset từ parent component
        if (this.props.check !== nextProps.check) {
            this.setState({
                check: nextProps.check,
            });
        }

        // ✅ THÊM: Xử lý checkAll từ parent component
        if (nextProps.checkAll !== this.props.checkAll) {
            // ✅ SỬA: Chỉ sync khi checkAll = true
            // Tránh việc Row tự động uncheck khi parent cập nhật checkAll = false từ handleCheckedIds
            if (nextProps.checkAll === true) {
                this.setState({
                    check: true
                });
            }
            // ✅ SỬA: Không gọi handleCheckedIds ở đây để tránh conflict
            // handleCheckedIds sẽ được xử lý trong handleCheckAll của parent
        }

        // ✅ THÊM: Reset checkbox chỉ khi có resetCheckboxes toggle
        if (nextProps.resetCheckboxes !== this.props.resetCheckboxes) {
            this.setState({
                check: false
            });
        }
    }

    handleCheckBox = e => {
        if (e.target.checked) {
            this.props.handleCheckedIds(this.props.obj.id, 'add');
            this.setState({
                check: e.target.checked
            })
        } else {
            this.props.handleCheckedIds(this.props.obj.id, 'remove');
            this.setState({
                check: e.target.checked
            })
        }
    };

    handleCheck = async (e) => {
        this.props.onDeleteOne(true);
        this.props.addDataRemoveExamWord({
            id: this.props.obj.id
        })
    }

    handleCoppyExam = (examId) => {
        this.props.handleCoppyExam(examId)
    }

    renderExamType = (type) => {
        switch (type) {
            case 'TOT_NGHIEP':
                return 'TỐT NGHIỆP';
            case 'HSA':
                return 'HSA';
            case 'APT':
                return 'APT';
            case 'TSA':
                return 'TSA';
            case 'TRAC_NGHIEM':
                return 'TRẮC NGHIỆM';
            case 'practice':
                return 'THỰC HÀNH';
            case 'exam':
                return 'KIỂM TRA';
            default:
                return type; // Default case returns the type if not matched
        }
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
                            value={this.props.obj.id}
                            checked={this.state.check} // ✅ SỬA: Sử dụng state thay vì không kiểm soát
                        />{" "}
                        <i />
                    </label>
                </td>
                <td className='flex'>
                    <Link
                        className='item-author text-color'
                        to={"/exam-word/edit/?id=" + this.props.obj.id}
                    >
                        {this.props.obj.name}
                    </Link>
                </td>
                {/* <td className='text-center'>{this.props.obj.id || this.props.obj.examId}</td> */}
                <td className='text-center'>{this.props.obj.id || 'Trống'}</td>
                <td className='text-center'>{this.props.obj.subject && this.props.obj.subject.name}</td>
                {/* {console.log("Category Exam:", JSON.stringify(this.props.obj.categoryExam,null,2))} */}
                <td className='text-center'>
                    {this.props.obj.categoryExam?.populate_id?.name || 'Trống'}
                </td>
                <td className='text-center'>
                    {this.props.obj.total_questions || 0}
                </td>
                <td className='text-center'>
                    <span className='item-amount d-none d-sm-block text-sm'>
                        {this.props.obj.updated_at &&
                            Moment(this.props.obj.updated_at).format(
                                "DD/MM/YYYY HH:mm"
                            )}
                    </span>
                </td>
                <td className="text-right">
                    <div className='item-action'>
                        <Link
                            data-toggle='tooltip'
                            title='Chỉnh sửa'
                            className='mr-14'
                            to={"/exam-word/edit/?id=" + this.props.obj.id}
                        >
                            <img src="/assets/img/icon-edit.svg" alt="" />
                        </Link>
                        <div
                            data-toggle='tooltip'
                            title='Copy đề'
                        >
                            <a className='mr-14' onClick={() => this.handleCoppyExam(this.props.obj.id)}>
                                <img src="/assets/img/icon-document.svg" alt="Copy" />
                            </a>
                        </div>
                        <Link
                            className='mr-14'
                            data-toggle='tooltip'
                            title='Báo cáo điểm'
                            to={"/exam-word/" + this.props.obj.id + "/report"}
                        >
                            <img src="/assets/img/icon-chart.svg" alt="" />
                        </Link>
                        <div
                            data-toggle='tooltip'
                            title='Xóa'
                        >
                            <a
                                onClick={this.handleCheck}
                                data-toggle='modal'
                                data-target='#delete-exam'
                                data-toggle-classname='fade-down'
                                data-toggle-class-target='.animate'
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

class ExamList extends Component {
    constructor(props) {
        super();
        this.state = {
            id: [],
            keyword: "",
            tags: [],
            page: 1,
            activePage: 1,
            limit: 20,
            checkAll: false,
            subject_id: "",
            sort_key: "",
            sort_value: "",
            typeExam: "",
            examTypeId: "",
            populate_id: "",
            loadingSubjects: true,
            loadingCategories: true,
            resetCheckboxes: false, // ✅ THÊM: State để quản lý reset checkbox
        };

        // Bind các method để đảm bảo this hoạt động đúng
        this.onChangeSubject = this.onChangeSubject.bind(this);
        this.handleChangeCompetition = this.handleChangeCompetition.bind(this);
        this._onChange = this._onChange.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.getData = this.getData.bind(this);
    }

    fetchRows() {
        // DEV: if a mock saved exam exists in sessionStorage, include it at the top of the list
        let mockExam = null;
        try {
            const raw = sessionStorage.getItem('mock_exam_word_created');
            if (raw) mockExam = JSON.parse(raw);
        } catch (e) {
            mockExam = null;
        }

        const examsToRender = Array.isArray(this.props.exams) ? [...this.props.exams] : [];

        if (mockExam) {
            const normalized = Object.assign({}, mockExam, {
                id: mockExam._id || mockExam.id,
                name: mockExam.name || 'Untitled (mock)',
                code: mockExam.code || '',
                subject: mockExam.subject || {},
                type: mockExam.type || '',
                total_questions: (mockExam.parts || []).reduce((sum, p) => {
                    let c = 0;
                    if (Array.isArray(p.subpart)) {
                        p.subpart.forEach(sp => {
                            if (Array.isArray(sp.children)) {
                                sp.children.forEach(ch => {
                                    if (Array.isArray(ch.questions)) c += ch.questions.length;
                                });
                            }
                        });
                    }
                    return sum + c;
                }, 0),
                updated_at: mockExam.updated_at || mockExam.created_at || new Date().toISOString()
            });

            // Prepend mock if it doesn't already exist in props.exams
            if (!examsToRender.find(e => e.id === normalized.id)) {
                examsToRender.unshift(normalized);
            }
        }

        if (examsToRender instanceof Array) {
            return examsToRender.map((object, i) => {
                return (
                    <Row
                        obj={object}
                        key={object.id}
                        index={i}
                        addDelete={this.props.addDelete}
                        handleCheckedIds={this.handleCheckedIds}
                        addDataRemoveExamWord={this.props.addDataRemoveExamWord}
                        onDeleteOne={this.onDeleteOne}
                        handleCoppyExam={this.handleCoppyExam}
                        tags={this.props.tags}
                        check={this.props.check}
                        checkAll={this.state.checkAll} // ✅ THÊM: Truyền prop checkAll
                        resetCheckboxes={this.state.resetCheckboxes} // ✅ THÊM: Truyền prop reset
                    />
                );
            });
        }
    }

    onDeleteOne = async (onResetIds) => {
        if (onResetIds) {
            await this.setState({
                id: []
            })
        }
    }

    handleCheckedIds = async (id, type = '') => {
        let currentIds = [...this.state.id]; // ✅ SỬA: Tạo copy để tránh mutate trực tiếp
        
        if (type === 'add') {
            // ✅ SỬA: Đơn giản hóa logic, sử dụng cùng kiểu dữ liệu để so sánh
            const existingIndex = currentIds.findIndex(existingId => existingId == id);
            if (existingIndex === -1) {
                currentIds.push(id);
            }
        }
        else if (type === 'remove') {
            // ✅ SỬA: Tìm và xóa đúng item
            const indexToRemove = currentIds.findIndex(existingId => existingId == id);
            if (indexToRemove > -1) {
                currentIds.splice(indexToRemove, 1);
            }
        }
        else if (type === 'remove-all') {
            // ✅ THÊM: Xóa toàn bộ ID đã chọn (chỉ dùng khi uncheck all)
            currentIds = [];
        }

        await this.setState({
            id: currentIds
        });

        // ✅ THÊM: Kiểm tra và cập nhật checkAll state (tránh xung đột)
        if (type !== 'remove-all') { // Chỉ cập nhật checkAll khi không phải remove-all
            const totalItems = this.props.exams ? this.props.exams.length : 0;
            const shouldCheckAll = currentIds.length === totalItems && totalItems > 0;

            if (this.state.checkAll !== shouldCheckAll) {
                await this.setState({
                    checkAll: shouldCheckAll
                });
            }
        }
    }

    handleCoppyExam = async (examId) => {
        await this.props.copyExamWord(examId);

        // Giữ nguyên trang hiện tại và các tiêu chí lọc thay vì về trang 1
        await this.getData(this.state.page, {
            keyword: this.state.keyword,
            subject_id: this.state.subject_id,
            typeExam: this.state.typeExam,
            examTypeId: this.state.examTypeId,
            sort_key: this.state.sort_key,
            sort_value: this.state.sort_value,
            limit: this.state.limit
        });

        // Cập nhật URL để phản ánh trang hiện tại và các tiêu chí lọc
        let { keyword, subject_id, typeExam, examTypeId, limit, page, sort_key, sort_value } = this.state;
        const queryParams = new URLSearchParams({
            keyword: keyword || '',
            subject_id: subject_id || '',
            typeExam: typeExam || '',
            examTypeId: examTypeId || '',
            limit: limit || 20,
            page: page || 1,
            sort_key: sort_key || '',
            sort_value: sort_value || ''
        });
        this.props.history.push(`/exam-word?${queryParams.toString()}`);

    }

    onChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
    };

    // Generic input change handler used by many form controls
    _onChange = async (e) => {
        if (!e || !e.target) return;
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        // Reset một số textfield khi đổi các dropdown chính
        if (name === 'examTypeId') {
            await this.setState({
                [name]: val,
                linkExam: '',
                linkAnswer: '',
                page: 1
            }, () => {
                // ✅ THÊM: Gọi handleFilter sau khi state cập nhật
                this.handleFilter();
            });
            return;
        }

        await this.setState({ [name]: val }, () => {
            // Nếu là các trường lọc khác, thực hiện lọc
            if (['keyword'].includes(name)) {
                this.handleFilter();
            }
        });
    };

    onChangeSubject = async (e) => {
        e.preventDefault();
        const value = e.target.value;

        await this.setState({
            subject_id: value,
            page: 1,
        }, () => {
            // ✅ THÊM: Gọi handleFilter sau khi state cập nhật
            this.handleFilter();
        });
    }

    async componentDidMount() {
        const url = this.props.location.search;
        let params = queryString.parse(url);

        await this.setState({
            keyword: params.keyword ? params.keyword : "",
            subject_id: params.subject_id ? params.subject_id : "",
            typeExam: params.typeExam ? params.typeExam : "",
            examTypeId: params.examTypeId ? params.examTypeId : "",
            populate_id: params.populate_id ? params.populate_id : "",
            sort_key: params.sort_key ? params.sort_key : "",
            sort_value: params.sort_value ? params.sort_value : "",
            limit: params.limit ? params.limit : 20,
            page: params.page ? params.page : 1,
            creating_type: 'MANUAL'
        })

        const data = {
            limit: 999,
            is_delete: false,
        };

        // Load subjects và categories song song
        const [subjectsResult, categoriesResult] = await Promise.all([
            this.props.listSubject(data),
            this.props.listExamCategory(data)
        ]);

        // Set loading states về false sau khi load xong
        await this.setState({
            loadingSubjects: false,
            loadingCategories: false
        });

        // Gọi getData với các filters từ URL
        await this.getData(params.page ? parseInt(params.page) : 1, {
            keyword: params.keyword || "",
            subject_id: params.subject_id || "",
            typeExam: params.typeExam || "",
            examTypeId: params.examTypeId || "",
            populate_id: params.populate_id || "",
            sort_key: params.sort_key || "",
            sort_value: params.sort_value || "",
            limit: params.limit ? parseInt(params.limit) : 20
        });
    }

    componentDidUpdate(prevProps) {
        // Theo dõi thay đổi của total để tự động điều chỉnh trang nếu cần
        if (prevProps.total !== this.props.total && this.props.total !== 0) {
            const currentPage = this.state.page;
            const currentLimit = this.state.limit;

            if (currentLimit !== -1) {
                const maxPage = Math.ceil(this.props.total / currentLimit);
                if (currentPage > maxPage && maxPage > 0) {
                    // Nếu trang hiện tại vượt quá số trang tối đa, quay về trang cuối
                    this.setState({ page: maxPage }, () => {
                        this.getData(maxPage);
                    });
                }
            }
        }

        // ✅ THÊM: Reset checkAll khi dữ liệu exams thay đổi
        if (prevProps.exams !== this.props.exams) {
            this.setState({
                checkAll: false,
                id: []
            });
        }
    }

    getData = async (pageNumber = 1, filters = {}) => {
        // ✅ THÊM: Validate và log filters
        const validatedFilters = {
            keyword: filters.keyword !== undefined ? filters.keyword : this.state.keyword,
            subject_id: filters.subject_id !== undefined ? filters.subject_id : this.state.subject_id,
            typeExam: filters.typeExam !== undefined ? filters.typeExam : this.state.typeExam,
            examTypeId: filters.examTypeId !== undefined ? filters.examTypeId : this.state.examTypeId,
            populate_id: filters.populate_id !== undefined ? filters.populate_id : this.state.populate_id,
            sort_key: filters.sort_key !== undefined ? filters.sort_key : this.state.sort_key,
            sort_value: filters.sort_value !== undefined ? filters.sort_value : this.state.sort_value,
            limit: filters.limit !== undefined ? filters.limit : this.state.limit
        };

        // Validate: Không gửi nếu subject_id hoặc typeExam empty nhưng user đã chọn
        if ((validatedFilters.subject_id && validatedFilters.subject_id.trim() === '') ||
            (validatedFilters.typeExam && validatedFilters.typeExam.trim() === '')) {
            console.warn('[VALIDATION] Skipping API call due to empty filters');
            return;
        }

        const params = {
            keyword: validatedFilters.keyword,
            subject_id: validatedFilters.subject_id,
            populate_id: validatedFilters.populate_id,
            exam_type_id: validatedFilters.examTypeId,
            sort_key: validatedFilters.sort_key,
            sort_value: validatedFilters.sort_value,
            limit: validatedFilters.limit,
            creating_type: 'MANUAL'
        };

        params.page = pageNumber;

        await this.props.listExamWord(params);
    };

    // Hàm thực hiện lọc kết quả
    handleFilter = async () => {
        const { keyword, subject_id, typeExam, examTypeId, limit, populate_id } = this.state;

        // Cập nhật URL với tất cả các tiêu chí lọc hiện tại
        const queryParams = new URLSearchParams({
            populate_id: populate_id || '',
            keyword: keyword || '',
            subject_id: subject_id || '',
            typeExam: typeExam || '',
            examTypeId: examTypeId || '',
            limit: limit || 20,
            page: 1
        });

        this.props.history.push(`/exam-word?${queryParams.toString()}`);

        // Gọi API với các tiêu chí lọc
        await this.getData(1, {
            populate_id,
            keyword,
            subject_id,
            typeExam,
            examTypeId,
            limit
        });
    };

    onSubmit = async (e) => {
        e.preventDefault();
        // Thực hiện lọc với keyword hiện tại
        await this.handleFilter();
    };

    handleChangePage = async (pageNumber) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        await this.setState({
            page: pageNumber
        })
        let { keyword, limit, page } = this.state;

        this.props.history.push(`/exam-word?keyword=${keyword}&limit=${limit}&page=${page}`);

        await this.getData(pageNumber);
    };

    handleChange = async (e) => {
        var name = e.target.name;
        var value = e.target.value;
        await this.setState({
            [name]: value,
        });
        let { keyword, limit, page } = this.state;

        this.props.history.push(`/exam-word?keyword=${keyword}&limit=${limit}&page=${page}`);

        await this.getData(1);
    };

    handleChangeTag = async (value) => {
        await this.setState({
            tags: value,
        });
        this.getData(1);
    };

    fetchOptions() {
        if (this.props.tags instanceof Array) {
            return this.props.tags.map((obj, i) => {
                return <Option key={obj._id.toString()}>{obj.name}</Option>;
            });
        }
    }

    handleDelete = async () => {
        let inputs = document.querySelectorAll('.checkInputItem');

        // Ưu tiên dùng dataRemoveExam (từ việc click nút xóa từng item)
        // thay vì this.state.id (từ checkbox)
        let selectedIds = [];
        if (this.props.dataRemoveExam?.id) {
            // Nếu có dataRemoveExam.id (single ID từ nút xóa individual), chuyển thành array
            selectedIds = [this.props.dataRemoveExam.id];
        }

        // Nếu không có dataRemoveExam, fallback sang this.state.id (từ checkbox)
        if (selectedIds.length === 0 && this.state.id && this.state.id.length > 0) {
            selectedIds = this.state.id;
        }

        if (!selectedIds || selectedIds.length === 0) {
            alert('Vui lòng chọn ít nhất một đề thi để xóa');
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} đề thi đã chọn?`);
        if (!confirmDelete) return;

        try {

            let successCount = 0;
            let failCount = 0;
            const failedIds = [];

            // Xóa tuần tự từng đề thi
            for (const examId of selectedIds) {
                try {
                    await this.props.deleteExamWord({ id: examId }); // Gửi single ID thay vì array
                    successCount++;
                } catch (error) {
                    failCount++;
                    failedIds.push(examId);
                    console.error(`❌ Lỗi xóa đề thi ID ${examId}:`, error);
                }
            }

            // Lấy thông tin trang hiện tại để xử lý pagination
            let currentPage = this.state.page;
            let currentLimit = this.state.limit;
            let totalBeforeDelete = this.props.total;
            let itemsToDelete = selectedIds.length;

            // Tính toán xem có cần thay đổi trang không
            let newPage = currentPage;
            if (currentLimit !== -1) { // Nếu không phải hiển thị tất cả
                const itemsOnCurrentPage = Math.min(currentLimit, totalBeforeDelete - (currentPage - 1) * currentLimit);
                const remainingItems = totalBeforeDelete - successCount;


                // Nếu xóa hết dữ liệu trên trang hiện tại và không phải trang đầu
                if (itemsOnCurrentPage <= successCount && remainingItems > 0 && currentPage > 1) {
                    newPage = currentPage - 1;
                    await this.setState({ page: newPage });

                    // Cập nhật URL nếu có thay đổi trang
                    let { keyword, limit, sort_key, sort_value } = this.state;
                    this.props.history.push(`/exam-word?keyword=${keyword}&limit=${limit}&page=${newPage}&sort_key=${sort_key}&sort_value=${sort_value}`);
                }
            }

            // Hiển thị kết quả cho người dùng
            if (failCount === 0) {
                alert(`✅ Đã xóa thành công ${successCount} đề thi`);
            } else {
                alert(`⚠️ Đã xóa ${successCount} đề thi thành công, ${failCount} đề thi thất bại. Kiểm tra console để xem chi tiết.`);
            }


            // Gọi API với trang mới và các tiêu chí lọc hiện tại
            setTimeout(() => {
                this.getData(newPage, {
                    keyword: this.state.keyword,
                    subject_id: this.state.subject_id,
                    typeExam: this.state.typeExam,
                    examTypeId: this.state.examTypeId,
                    sort_key: this.state.sort_key,
                    sort_value: this.state.sort_value,
                    limit: this.state.limit
                });
            }, 100);

        } catch (error) {
            console.error('Lỗi khi xóa đề thi:', error);
            alert('Có lỗi xảy ra khi xóa đề thi. Vui lòng thử lại.');
        } finally {
            // ✅ SỬA: Reset tất cả checkbox một cách đúng đắn
            // Reset DOM checkbox elements
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].checked = false;
            }

            // Reset checkbox "Chọn tất cả"
            const checkAllInput = document.querySelector('input[name="id"][type="checkbox"]:not(.checkInputItem)');
            if (checkAllInput) {
                checkAllInput.checked = false;
            }

            // ✅ SỬA: Reset state của component cha và trigger reset cho Row components
            await this.setState({
                id: [],
                checkAll: false, // ✅ THÊM: Reset checkAll state
                resetCheckboxes: !this.state.resetCheckboxes // Toggle để trigger reset ở Row components
            });

            // Clear dataRemoveExamWord to prevent conflicts
            this.props.addDataRemoveExamWord(null);
        }
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.checkAll !== nextProps.check) {
            this.setState({
                checkAll: nextProps.check,
            });
        }
    }

    handleCheckAll = async (e) => {
        const isChecked = e.target.checked;
        console.log('handleCheckAll called with isChecked:', isChecked);
        
        // Cập nhật state checkAll để trigger update cho tất cả Row components
        await this.setState({
            checkAll: isChecked
        });

        if (isChecked && this.props.exams && Array.isArray(this.props.exams)) {
            console.log("Check all");
            // ✅ Chọn tất cả: Đảm bảo format ID nhất quán
            const selectedIds = this.props.exams.map(exam => exam.id);
            await this.setState({
                id: selectedIds
            });
        } else if (!isChecked) {
            console.log("Uncheck all");
            // ✅ Bỏ chọn tất cả: Reset tất cả và trigger reset cho Row components
            await this.setState({
                id: [],
                resetCheckboxes: !this.state.resetCheckboxes // Toggle để trigger reset ở Row components
            });
        }
    };

    fetchRowsSubject() {
        if (this.state.loadingSubjects) {
            return [<option key="loading" disabled>Đang tải...</option>];
        }

        if (this.props.subjects instanceof Array) {
            const options = this.props.subjects.map((obj, i) => {
                return (
                    <option value={obj._id} key={obj._id.toString()}>
                        {obj.name}
                    </option>
                );
            });
            return options;
        }
        return null;
    }

    handleClear = async (e) => {
        e.preventDefault();

        await this.setState({
            keyword: "",
            subject_id: "",
            populate_id: "",
            examTypeId: "",
            page: 1
        });

        // Cập nhật URL về trạng thái ban đầu
        this.props.history.push('/exam-word?keyword=&subject_id=&populate_id=&examTypeId=&limit=20&page=1');

        // Gọi API với các tiêu chí lọc rỗng
        await this.getData(1, {
            keyword: "",
            subject_id: "",
            populate_id: "",
            examTypeId: "",
            limit: 20
        });
    };


    sort = async (event) => {
        const { classList } = event.target;

        const name = event.target.getAttribute("name");

        await this.setState({
            sort_key: name,
            sort_value: this.state.sort_value == 1 ? -1 : 1
        });

        let { keyword, limit, page, subject_id, sort_key, sort_value } = this.state;

        this.props.history.push(`/exam-word?keyword=${keyword}&limit=${limit}&page=${page}&subject_id=${subject_id}&sort_key=${sort_key}&sort_value=${sort_value}`);


        await this.getData(1);

    }

    handleChangeCompetition = async (e) => {
        const value = e.target.value;
        await this.setState({
            populate_id: value,
            examTypeId: "",
            page: 1,
            // Reset các textfield khi đổi Kỳ thi (KHÔNG reset tên đề thi)
            linkExam: "",
            linkAnswer: ""
            // Chú ý: KHÔNG reset name (tên đề thi)
        }, () => {
            // ✅ THÊM: Gọi handleFilter sau khi state cập nhật
            this.handleFilter();
        });

        if (value) {
            await this.props.showExamCategory(value);
        }
    };
    fetchCategoryRows() {
        const { examCategories } = this.props; // từ Redux

        if (this.state.loadingCategories) {
            return [<option key="loading" disabled>Đang tải...</option>];
        }

        if (!examCategories || examCategories.length === 0) {
            return null;
        }

        const options = examCategories
            .filter(item => !item.hidden) // ✅ chỉ lấy item hidden = false
            .map(item => (
                <option key={item._id} value={item._id}>
                    {item.name}
                </option>
            ));

        return options;
    }
    fetchExamTypeRows() {
        const { examCategory } = this.props;
        if (!examCategory || !examCategory.parts) return null;

        return examCategory.parts
            .filter(item => !item.hidden) // ✅ chỉ lấy part không ẩn
            .map(item => (
                <option key={item.id} value={item.name}>
                    {item.name}
                </option>
            ));
    }

    render() {
        let displayFrom =
            this.props.page === 1
                ? 1
                : (parseInt(this.props.page) - 1) * this.props.limit;
        let displayTo =
            this.props.page === 1
                ? this.props.limit
                : displayFrom + this.props.limit;
        displayTo = displayTo > this.props.total ? this.props.total : displayTo;
        return (
            <div>
                <div className='page-content page-container' id='page-content'>
                    <div className='padding'>
                        <h2 className="text-md text-highlight sss-page-title">Quản lý đề thi</h2>
                        <div className='block-table-exam'>
                            <div className='toolbar'>
                                <div className='input-group'>
                                    <form
                                        className='flex w-100'
                                        onSubmit={this.onSubmit}
                                    >
                                        <div className='input-group'>
                                            <input
                                                type='text'
                                                className='form-control form-control-theme keyword-custom'
                                                placeholder='Nhập từ khoá tìm kiếm...'
                                                onChange={this.onChange}
                                                name='keyword'
                                                value={this.state.keyword}
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
                                            <div className="ml-16">
                                                <select
                                                    className="custom-select"
                                                    value={this.state.subject_id}
                                                    name="subject_id"
                                                    onChange={this.onChangeSubject}
                                                >
                                                    <option value=''>
                                                        -- Môn học --
                                                    </option>
                                                    {this.fetchRowsSubject()}
                                                </select>
                                            </div>
                                            <div className="ml-16">
                                                <select
                                                    className="custom-select"
                                                    value={this.state.populate_id}
                                                    name="populate_id"
                                                    onChange={this.handleChangeCompetition}
                                                >
                                                    <option value=''>
                                                        -- Kỳ thi --
                                                    </option>
                                                    {this.fetchCategoryRows()}
                                                </select>
                                            </div>
                                            <button
                                                className="btn btn-primary ml-16"
                                                type='button'
                                                onClick={this.handleFilter}
                                            >
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
                                                    className="feather feather-filter mr-8"
                                                >
                                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                                </svg>
                                                Lọc kết quả
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-sm-12'>
                                    <table className='table table-theme table-row v-middle'>
                                        <thead className='text-muted'>
                                            <tr>
                                                <th width="10px">
                                                    <label className="ui-check m-0">
                                                        <input
                                                            type="checkbox"
                                                            name="id"
                                                            onChange={this.handleCheckAll}
                                                            checked={this.state.checkAll}
                                                        />{' '}
                                                        <i />
                                                    </label>
                                                    {this.state.id.length !== 0 && (
                                                        <button
                                                            className="btn btn-icon ml-16"
                                                            data-toggle="modal"
                                                            data-target="#delete-exam"
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
                                                    content="Đề thi"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                />
                                                <HeadingSortColumn
                                                    name="code"
                                                    content="Mã đề"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                    customClass="text-center"
                                                />
                                                <HeadingSortColumn
                                                    name="subject.id"
                                                    content="Môn học"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                    customClass="text-center"
                                                />
                                                <th className='text-center'>
                                                    Kỳ thi
                                                </th>
                                                <th className='text-center'>
                                                    Tổng số câu
                                                </th>
                                                <HeadingSortColumn
                                                    name="updated_at"
                                                    content="Ngày cập nhật"
                                                    handleSort={this.sort}
                                                    sort_key={this.state.sort_key}
                                                    sort_value={this.state.sort_value}
                                                    customClass="text-center"
                                                />
                                                <th className="text-right">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>{this.fetchRows()}</tbody>
                                    </table>
                                </div>
                            </div>

                            {this.props.total !== 0 ? (
                                <div className="row listing-footer">
                                    <div className="col-sm-1">
                                        <select
                                            className="custom-select w-70"
                                            name="limit"
                                            onChange={this.handleChange}
                                            value={this.state.limit}
                                        >
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                            <option value="-1">ALL</option>
                                        </select>
                                    </div>
                                    <div className="col-sm-6 showing-text">
                                        Hiển thị từ <b>{displayFrom}</b> đến <b>{displayTo}</b> trong tổng số{" "}
                                        <b>{this.props.total}</b>
                                    </div>
                                    <div className="col-sm-5 text-right">
                                        <Pagination
                                            activePage={this.props.page}
                                            itemsCountPerPage={this.props.limit}
                                            totalItemsCount={this.props.total}
                                            pageRangeDisplayed={10}
                                            onChange={this.handleChangePage}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "300px",
                                        fontSize: "20px",
                                        fontWeight: "500",
                                        color: "#555",
                                        textAlign: "center",
                                    }}
                                >
                                    Không có bản ghi nào
                                </div>
                            )}

                            <div
                                id='delete-exam'
                                className='modal fade'
                                data-backdrop='true'
                                style={{ display: "none" }}
                                aria-hidden='true'
                            >
                                <div
                                    className='modal-dialog animate fade-down'
                                    data-classname='fade-down'
                                >
                                    <div className='modal-content'>
                                        <div className='modal-header'>
                                            <div className='modal-title text-md'>
                                                Thông báo
                                            </div>
                                            <button
                                                className='close'
                                                data-dismiss='modal'
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className='modal-body'>
                                            <div className='p-4 text-center'>
                                                <p>
                                                    Bạn chắc chắn muốn xóa bản
                                                    ghi này chứ?
                                                </p>
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
                                                Xoá
                                            </button>
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
        questions: state.question.questions,
        exams: state.examWord.examwords,
        limit: state.examWord.limit,
        page: state.examWord.page,
        total: state.examWord.totalItems,
        id: state.examWord.id,
        check: state.examWord.checkAll,
        dataRemoveExam: state.examWord.dataRemoveExamWord,
        iscopyExamWord: state.examWord.isCopyExamWord,
        subjects: state.subject.subjects,
        examCategories: state.examWordCategory.examCategories,
        examCategory: state.examWordCategory.examCategory,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { listExamWord, deleteExamWord, addDelete, addDataRemoveExamWord, checkAll, listSubject, copyExamWord, listExamCategory, showExamCategory },
        dispatch
    );
}

let RowContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Row)
);
let ExamContainer = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ExamList)
);
export default ExamContainer;
