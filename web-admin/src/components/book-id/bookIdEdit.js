import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DatePicker } from "antd";
import moment from "moment";
import { notification } from "antd";
import ModalAttachedClassroom from "./ModalAttachedClassroom";
import ModalAttachedBook from "./ModalAttachedBook";
import ModalExport from "./ModalExport";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
    BookIcon,
    FileText,
    Clock,
    FilePlus,
    PlusSquare,
    Play,
    ImageIcon,
    LinkIcon,
    BarChart,
    Video,
    Star,
    Users,
    Menu,
    CheckSquare,
    ListChecks,
    Layers,
    Info,
    BookOpen,
    FolderPlus,
} from "lucide-react";
import { listSubject } from "../../redux/subject/action";
import {
    showBook,
    updateBook,
    listBook,
    exportTestBook,
} from "../../redux/book-id/action";
import { listAdmin } from "../../redux/student/action";
import { listClassroomGroup } from "../../redux/classroomgroup/action";
import { listBook as listBookIdCourse } from "../../redux/book-id-course/action";
import baseHelpers from "../../helpers/BaseHelpers";
import SelectBox from "../SelectBox";
import { listLabelsByItem, syncLabels } from "../../redux/label/action";

export class BookIdEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            name: "",
            subject_id: "",
            category_id: "",
            description: "",
            content: "",
            status: true,
            combo_mode: false,
            is_featured: false,
            numberStudent: "",
            price: "",
            book_id: "",
            origin_price: "",
            files: [],
            external_link: "",
            ordering: 1,
            demo_link: "",
            teacher_id: null,
            quantity: 0,
            promotion: {
                from_date: null,
                to_date: null,
                type: "BY_DATE_RANGE",
                hour: 0,
                note: "",
            },
            listClassroomAttached: [],
            listClassroomRelates: [],
            listBookRelates: [],
            avtPreview: "",
            level: null,
            isLoading: true,

            expired_time: 0,
            number_of_renewal: 0,
            price_renewal: 0,
            can_renewal_after: 3,
            suspension_date: null,
            // ====== NEW: Highlights & Includes state ======
            bookHighlights: [],
            bookIncludes: [],
            newHighlightText: "",
            newIncludeText: "",
            editingHighlightIndex: null,
            editingIncludeIndex: null,
            editingHighlightText: "",
            editingIncludeText: "",
            newIncludeIcon: "/assets/img/icon-document.svg",
            includeIconPickerOpen: false,
            newIncludeIconKey: "Book",
            editingIncludeIconIndex: null,
            editingIncludeIconKey: "Book",
            includeIconEditPickerOpen: false,
            label_ids: [],
            // ====== end NEW ======
        };
    }

    async componentDidMount() {
        const bookId = this.props.match.params.id;
        if (!bookId) {
            this.props.history.push("/book-id");
            return;
        }

        this.setState({ id: bookId });

        const data = {
            limit: 999,
            is_delete: false,
        };
        await this.props.listSubject(data);

        // Lấy danh sách danh mục từ classroom-group/list
        const categoryData = {
            limit: 100,
        };
        await this.props.listClassroomGroup(categoryData);

        const params = {
            user_group: "TEACHER",
            limit: 100,
        };
        await this.props.listAdmin(params);
        await this.props.listBookIdCourse({ limit: 999 });
        // await this.props.listBook({ limit: 999 });
        await this.props.showBook(bookId);
        this.populateFormWithBookData();
        const labelsByItem = await this.props.listLabelsByItem({
            item_id: bookId,
            item_type: "BOOK_ID",
        });
        this.setLabelIdsFromLabels(labelsByItem);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.book !== this.props.book && this.props.book) {
            this.populateFormWithBookData();
        }
    }

    populateFormWithBookData = () => {
        const book = this.props.book;
        if (!book) return;
        const promotion = book.promotion || {
            from_date: null,
            to_date: null,
            type: "BY_DATE_RANGE",
            hour: 0,
            note: "",
        };

        const highlight = book.highlightInformations?.items || [];
        const includes = book.includes?.items || [];
        this.setState({
            id: book._id,
            name: book.name || "",
            subject_id: book.subject.id || "",
            category_id: book.category.id || "",
            description: book.description || "",
            content: book.content || "",
            status: book.status !== false,
            combo_mode: book.combo_mode || false,
            is_featured: book.is_featured || false,
            numberStudent: Number(book.student_owned) || 0,
            price: Number(book.price) || 0,
            book_id: book.book_id || "",
            origin_price: Number(book.origin_price) || 0,
            external_link: book.external_link || "",
            ordering: Number(book.ordering) || 1,
            teacher_id: book.teacher_id || null,
            quantity: Number(book.quantity) || 0,
            level: book.level || null,
            promotion: promotion,
            demo_link: book.demo_link || "",
            listClassroomAttached: book.classroom_attached || [],
            listClassroomRelates: book.classroom_relates || [],
            listBookRelates: book.bookId_attached || [],
            avtPreview: book.image ? book.image : "",
            files: book.files || [],
            expired_time: Number(book.renewed_bookId?.expired_time) || 0,
            number_of_renewal: Number(book.renewed_bookId?.number_of_renewal) || 0,
            price_renewal: Number(book.renewed_bookId?.price_renewal) || 0,
            suspension_date: book.suspension_date
                ? moment(book.suspension_date)
                : null,
            can_renewal_after: Number(book.renewed_bookId?.can_renewal_after) || 0,
            bookHighlights: highlight.map((it, idx) => ({ id: idx, text: it.text })),
            bookIncludes: includes.map((it, idx) => ({
                id: idx,
                text: it.text,
                iconKey: it.iconKey || "Book",
            })),
            isLoading: false,
        });
    };

    _onChange = async (e) => {
        var name = e.target.name;
        let value = e.target.value;
        let checked = e.target.checked;
        let avtPreview = "";

        if (name === "combo_mode" || name === "is_featured" || name === "status") {
            value = checked;
        }

        // Convert các field số thành number
        if (
            [
                "expired_time",
                "number_of_renewal",
                "price_renewal",
                "can_renewal_after",
                "price",
                "origin_price",
                "quantity",
                "numberStudent",
                "ordering",
            ].includes(name)
        ) {
            value = value === "" ? 0 : Number(value);
        }

        if (name === "files") {
            value = await new Promise((resolve, reject) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    avtPreview = event.target.result;
                    resolve(event.target.result);
                };
                reader.readAsDataURL(file);
            });
            value = [value];
            this.setState({
                [name]: value,
                avtPreview: avtPreview,
            });
        } else {
            this.setState({
                [name]: value,
            });
        }
    };

    _onChangeTypePromotion = async (e) => {
        let { name, value } = e.target;

        this.setState({
            promotion: {
                ...this.state.promotion,
                [name]: value,
            },
        });
    };

    handleSubmit = async () => {
        let {
            id,
            promotion,
            listClassroomAttached,
            listClassroomRelates,
            listBookRelates,
            numberStudent,
        } = this.state;

        // Validate required fields
        if (!this.state.name || this.state.name.trim() === "") {
            notification.warning({
                message: "Tên sản phẩm không được để trống!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }
        if (
            this.state.listClassroomAttached.length <= 0 &&
            !this.state.combo_mode
        ) {
            notification.warning({
                message: "Phải có ít nhất một khóa học!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }
        if (this.state.listBookRelates.length <= 1 && this.state.combo_mode) {
            notification.warning({
                message: "Phải có ít nhất hai sách ID!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }
        if (this.state.expired_time <= 0 && !this.state.combo_mode) {
            notification.warning({
                message: "Thời gian hết hạn phải lớn hơn 0!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }

        if (this.state.number_of_renewal < 0 && !this.state.combo_mode) {
            notification.warning({
                message: "Số lần gia hạn không được âm!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }

        if (this.state.price_renewal < 0 && !this.state.combo_mode) {
            notification.warning({
                message: "Giá gia hạn không được âm!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }

        if (this.state.can_renewal_after < 0 && !this.state.combo_mode) {
            notification.warning({
                message: "Số ngày có thể gia hạn không được âm!",
                placement: "topRight",
                top: 50,
                duration: 3,
            });
            return;
        }

        const data = {
            id: id,
            name: this.state.name,
            subject_id: this.state.subject_id,
            category_id: this.state.category_id,
            is_featured: this.state.is_featured,
            combo_mode: this.state.combo_mode,
            status: this.state.status,
            external_link: this.state.external_link,
            price: this.state.price ? this.state.price : this.state.origin_price,
            student_owned: numberStudent,
            label_ids: this.state.label_ids,
            promotion: promotion,
            origin_price: isNaN(this.state.origin_price)
                ? 0
                : this.state.origin_price,
            ordering: this.state.ordering,
            demo_link: this.state.demo_link,
            content: this.stripPTags(this.state.content),
            description: this.stripPTags(this.state.description),
            teacher_id: this.state.teacher_id,
            book_id: this.state.book_id,
            classroom_attached: listClassroomAttached.map(
                (item) => item && (item.id || item._id || item),
            ),
            classroom_relates: listClassroomRelates.map(
                (item) => item && (item.id || item._id || item),
            ),
            bookId_attached: listBookRelates.map(
                (item) => item && (item.id || item._id || item),
            ),
            quantity: this.state.quantity,
            level: this.state.level,
            renewed_bookId: {
                expired_time: Number(this.state.expired_time),
                number_of_renewal: Number(this.state.number_of_renewal),
                price_renewal: Number(this.state.price_renewal),
                can_renewal_after: Number(this.state.can_renewal_after),
            },
            suspension_date: this.state.suspension_date,
            highlightInformations: {
                items: (this.state.bookHighlights || []).map((it) => ({
                    text: it.text,
                })),
            },
            includes: {
                items: (this.state.bookIncludes || []).map((it) => ({
                    text: it.text,
                    iconKey: it.iconKey,
                })),
            },
        };

        // Thêm file nếu có file mới được upload (giờ là base64 string)
        if (
            this.state.files &&
            this.state.files.length > 0 &&
            typeof this.state.files[0] === "string"
        ) {
            data.files = this.state.files;
        }

        await this.props.updateBook(data);
        if (this.props.redirect) {
            this.props.history.push("/book-id");
        }
    };

    getLabelItems = (labels = this.props.labelsByItem) => {
        if (!(labels instanceof Array)) {
            return labels?.records || labels?.labels || labels?.children || [];
        }

        if (labels[0]?.children instanceof Array) {
            return labels[0].children;
        }

        return labels;
    };

    getLabelId = (label) => label?._id || label?.id || label?.value;

    isLabelSelected = (label) => {
        return Boolean(label?.isAssigned || label?.is_assigned || label?.assigned || label?.checked || label?.selected);
    };

    setLabelIdsFromLabels = (labels) => {
        const selectedIds = this.getLabelItems(labels)
            .filter(this.isLabelSelected)
            .map(this.getLabelId)
            .filter(Boolean);

        this.setState({ label_ids: selectedIds });
    };

    fetchLabelYears() {
        return this.getLabelItems().map((obj) => ({
            value: this.getLabelId(obj),
            label: obj.name || obj.label || obj.title,
        })).filter((obj) => obj.value);
    }

    fetchSubjectRows() {
        if (this.props.subjects instanceof Array) {
            return this.props.subjects.map((obj, i) => {
                return (
                    <option key={i} value={obj._id}>
                        {obj.name}
                    </option>
                );
            });
        }
    }

    fetchCategoryRows() {
        if (this.props.classroomGroups instanceof Array) {
            const activeCategories = this.props.classroomGroups.filter(
                (obj) => obj.status === true,
            );
            return activeCategories.map((obj, i) => {
                return (
                    <option key={i} value={obj._id}>
                        {obj.name}
                    </option>
                );
            });
        }
    }

    handleImageUploadBefore = async (files, info, uploadHandler) => {
        const data = new FormData();
        data.append("files", files[0]);

        const response = {
            result: [
                {
                    url: this.props.image,
                    name: files[0].name,
                    size: files[0].size,
                },
            ],
        };
        await uploadHandler(response);
    };

    _handleEditorContentChange = (content) => {
        this.setState({ content: content });
    };
    _handleEditorDescriptionChange = (content) => {
        this.setState({ description: content });
    };

    stripPTags = (html) => {
        if (!html || typeof html !== "string") return html;
        return html.replace(/<\/?p[^>]*>/gi, "");
    };

    fetchTeacherRows() {
        if (this.props.students instanceof Array) {
            return this.props.students.map((obj, i) => {
                return (
                    <option value={obj._id} key={obj._id.toString()}>
                        {obj.fullname}
                    </option>
                );
            });
        }
    }
    changeDate = (date, dateString) => {
        if (date !== null) {
            this.setState({ suspension_date: date });
        }
    };
    changeDateStart = (date, dateString) => {
        if (date !== null) {
            this.setState({
                promotion: {
                    ...this.state.promotion,
                    from_date: date.format("YYYY/MM/DD HH:mm"),
                },
            });
        } else {
            this.setState({
                promotion: {
                    ...this.state.promotion,
                    from_date: null,
                },
            });
        }
    };

    changeDateEnd = (date, dateString) => {
        if (date !== null) {
            this.setState({
                promotion: {
                    ...this.state.promotion,
                    to_date: date.format("YYYY/MM/DD HH:mm"),
                },
            });
        } else {
            this.setState({
                promotion: {
                    ...this.state.promotion,
                    to_date: null,
                },
            });
        }
    };

    handleAddClassroomAttached = async (data) => {
        let dataList = [...this.state.listClassroomAttached];
        if (data) {
            const isExits = dataList.some((item) => {
                const itemId = item.id || item._id || item;
                return itemId === (data.id || data._id || data);
            });
            if (!isExits) {
                dataList.push(data);
            }
        }

        await this.setState({
            listClassroomAttached: dataList,
        });
    };

    handleAddClassroomRelate = async (data) => {
        let dataList = [...this.state.listClassroomRelates];
        if (data) {
            const isExits = dataList.some((item) => {
                const itemId = item.id || item._id || item;
                return itemId === (data.id || data._id || data);
            });
            if (!isExits) {
                dataList.push(data);
            }
        }

        await this.setState({
            listClassroomRelates: dataList,
        });
    };

    handleAddBookRelate = async (data) => {
        let dataList = [...this.state.listBookRelates];
        if (data) {
            const isExits = dataList.some((item) => {
                const itemId = item.id || item._id || item;
                return itemId === (data.id || data._id || data);
            });
            if (!isExits) {
                dataList.push(data);
            }
        }

        await this.setState({
            listBookRelates: dataList,
        });
    };

    handleRemoveClassroomAttached = async (item) => {
        let { listClassroomAttached } = this.state;
        if (!listClassroomAttached) return;

        const itemId = item.id || item._id || item;
        const dataRemove = listClassroomAttached.filter((value) => {
            const vId = value.id || value._id || value;
            return vId !== itemId;
        });

        this.setState({
            listClassroomAttached: dataRemove,
        });
    };

    handleRemoveClassroomRelate = async (item) => {
        let { listClassroomRelates } = this.state;
        if (!listClassroomRelates) return;

        const itemId = item.id || item._id || item;
        const dataRemove = listClassroomRelates.filter((value) => {
            const vId = value.id || value._id || value;
            return vId !== itemId;
        });

        this.setState({
            listClassroomRelates: dataRemove,
        });
    };

    handleRemoveBookRelate = async (item) => {
        let { listBookRelates } = this.state;
        if (!listBookRelates) return;

        const itemId = item.id || item._id || item;
        const dataRemove = listBookRelates.filter((value) => {
            const vId = value.id || value._id || value;
            return vId !== itemId;
        });

        this.setState({
            listBookRelates: dataRemove,
        });
    };

    handleUploadImage = () => {
        document.getElementById("input-upload-image").click();
    };

    remoAvatar = () => {
        document.getElementById("input-upload-image").value = "";
        this.setState({
            files: [],
            avtPreview: "",
        });
    };

    reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    onDragEndClassroomAttached = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = this.reorder(
            this.state.listClassroomAttached,
            result.source.index,
            result.destination.index,
        );

        await this.setState({
            listClassroomAttached: items,
        });
    };

    onDragEndClassroomRelate = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = this.reorder(
            this.state.listClassroomRelates,
            result.source.index,
            result.destination.index,
        );

        await this.setState({
            listClassroomRelates: items,
        });
    };

    onDragEndBookRelate = async (result) => {
        if (!result.destination) {
            return;
        }

        const items = this.reorder(
            this.state.listBookRelates,
            result.source.index,
            result.destination.index,
        );

        await this.setState({
            listBookRelates: items,
        });
    };

    clearFormDate = async () => {
        console.log(123);
    };

    // ====== NEW: handlers for highlights ======
    handleAddHighlight = async () => {
        const text = (this.state.newHighlightText || "").trim();
        if (!text) return;
        const items = [...(this.state.bookHighlights || [])];
        items.push({ id: Date.now(), text });
        await this.setState({ bookHighlights: items, newHighlightText: "" });
    };

    onDragEndHighlights = async (result) => {
        if (!result.destination) return;
        const items = this.reorder(
            this.state.bookHighlights,
            result.source.index,
            result.destination.index,
        );
        await this.setState({ bookHighlights: items });
    };

    startEditHighlight = (index) => {
        const item = this.state.bookHighlights[index];
        this.setState({
            editingHighlightIndex: index,
            editingHighlightText: item?.text || "",
        });
    };

    saveEditHighlight = async () => {
        const { editingHighlightIndex, editingHighlightText, bookHighlights } =
            this.state;
        if (editingHighlightIndex === null) return;
        const items = [...bookHighlights];
        items[editingHighlightIndex] = {
            ...items[editingHighlightIndex],
            text: (editingHighlightText || "").trim(),
        };
        await this.setState({
            bookHighlights: items,
            editingHighlightIndex: null,
            editingHighlightText: "",
        });
    };

    removeHighlight = async (itemId) => {
        const items = (this.state.bookHighlights || []).filter(
            (it) => it.id !== itemId,
        );
        await this.setState({ bookHighlights: items });
    };
    // ====== end NEW ======

    // ====== NEW: handlers for includes ======
    handleAddInclude = async () => {
        const text = (this.state.newIncludeText || "").trim();
        if (!text) return;
        const items = [...(this.state.bookIncludes || [])];
        items.push({
            id: Date.now(),
            text,
            iconKey: this.state.newIncludeIconKey,
        });
        await this.setState({ bookIncludes: items, newIncludeText: "" });
    };

    onDragEndIncludes = async (result) => {
        if (!result.destination) return;
        const items = this.reorder(
            this.state.bookIncludes,
            result.source.index,
            result.destination.index,
        );
        await this.setState({ bookIncludes: items });
    };

    startEditInclude = (index) => {
        const item = this.state.bookIncludes[index];
        this.setState({
            editingIncludeIndex: index,
            editingIncludeText: item?.text || "",
        });
    };

    saveEditInclude = async () => {
        const { editingIncludeIndex, editingIncludeText, bookIncludes } =
            this.state;
        if (editingIncludeIndex === null) return;
        const items = [...bookIncludes];
        items[editingIncludeIndex] = {
            ...items[editingIncludeIndex],
            text: (editingIncludeText || "").trim(),
        };
        await this.setState({
            bookIncludes: items,
            editingIncludeIndex: null,
            editingIncludeText: "",
        });
    };

    removeInclude = async (itemId) => {
        const items = (this.state.bookIncludes || []).filter(
            (it) => it.id !== itemId,
        );
        await this.setState({ bookIncludes: items });
    };
    // ====== end NEW ======

    // ====== NEW: include icon picker handlers ======
    openIncludeIconPicker = () => {
        this.setState({ includeIconPickerOpen: true });
    };
    closeIncludeIconPicker = () => {
        this.setState({ includeIconPickerOpen: false });
    };
    selectIncludeIcon = (iconKey) => {
        this.setState({ newIncludeIconKey: iconKey, includeIconPickerOpen: false });
    };

    // Icon editing methods
    startEditIncludeIcon = (index) => {
        const item = this.state.bookIncludes[index];
        this.setState({
            editingIncludeIconIndex: index,
            editingIncludeIconKey: item?.iconKey || "Book",
            includeIconEditPickerOpen: true,
        });
    };

    closeIncludeIconEditPicker = () =>
        this.setState({
            includeIconEditPickerOpen: false,
            editingIncludeIconIndex: null,
        });

    selectEditIncludeIcon = async (iconKey) => {
        const { editingIncludeIconIndex, bookIncludes } = this.state;
        if (editingIncludeIconIndex === null) return;
        const items = [...bookIncludes];
        items[editingIncludeIconIndex] = {
            ...items[editingIncludeIconIndex],
            iconKey: iconKey,
        };
        await this.setState({
            bookIncludes: items,
            includeIconEditPickerOpen: false,
            editingIncludeIconIndex: null,
        });
    };
    // ====== end NEW ======

    handleExportTest = () => {
        this.props.exportTestBook({ book_id: this.props.match.params.id });
    };

    render() {
        const { promotion, origin_price, price, isLoading } = this.state;

        if (isLoading) {
            return (
                <div className="page-content page-container">
                    <div className="padding">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
            );
        }

        const discountPercent =
            price && origin_price
                ? (((price - origin_price) / origin_price) * 100).toFixed(0)
                : 0;
        const includeIconMap = {
            Book: BookIcon,
            FileText,
            Clock,
            FilePlus,
            PlusSquare,
            Play,
            Image: ImageIcon,
            Link: LinkIcon,
            BarChart,
            Video,
            Star,
            Users,
            Menu,
            CheckSquare,
            ListChecks,
            Layers,
            Info,
            BookOpen,
            FolderPlus,
        };
        const SelectedIncludeIcon =
            includeIconMap[this.state.newIncludeIconKey] || BookIcon;
        const promotionRowStyle = {
            flexWrap: "wrap",
            gap: "10px 18px",
            alignItems: "flex-start",
        };
        const compactPromotionFieldStyle = { flex: "0 0 138px" };
        const promotionTypeFieldStyle = { flex: "0 0 170px" };
        const promotionDateFieldStyle = { flex: "0 0 270px" };
        const renewalFieldStyle = { flex: "1 1 0", minWidth: 0 };

        return (
            <div>
                <div
                    className="page-content page-container page-create-book"
                    id="page-content"
                >
                    <div className="padding">
                        <h2 className="text-md text-highlight sss-page-title">
                            Chỉnh sửa sách ID
                        </h2>
                        <div className="general-info">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <h3 className="title-block mb-0 ">Thông tin chung</h3>
                                <div
                                    className="content mb-0"
                                    style={{ display: "flex", gap: "12px" }}
                                >
                                    {!this.state.combo_mode && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                this.props.history.push(
                                                    `/book-id/${this.props.match.params.id}/code`,
                                                )
                                            }
                                            style={{
                                                backgroundColor: "#fff",
                                                color: "#ff8345",
                                                border: "1px solid #ff8345",
                                                borderRadius: "5px",
                                                padding: "4px 10px",
                                            }}
                                        >
                                            <span>Mã kích hoạt</span>
                                        </button>

                                    )}
                                    {!this.state.combo_mode && (<button
                                        type="button"
                                        data-toggle="modal"
                                        data-target="#modal-export-data"
                                        data-toggle-class="fade-down"
                                        data-toggle-class-target=".animate"
                                        style={{
                                            backgroundColor: "#fff",
                                            color: "#ff8345",
                                            border: "1px solid #ff8345",
                                            borderRadius: "5px",
                                            padding: "4px 10px",
                                        }}
                                    >
                                        <span>Export</span>
                                    </button>)}

                                    {!this.state.combo_mode && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                this.props.history.push(
                                                    `/book-id/${this.props.match.params.id}/member`,
                                                )
                                            }
                                            style={{
                                                backgroundColor: "#fff",
                                                color: "#ff8345",
                                                border: "1px solid #ff8345",
                                                borderRadius: "5px",
                                                padding: "4px 10px",
                                            }}
                                        >
                                            <span>Học sinh</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="content">
                                <input
                                    onChange={this._onChange}
                                    type="file"
                                    className="form-control-file d-none"
                                    name="files"
                                    id="input-upload-image"
                                />
                                <div className="block-image">
                                    {!this.state.avtPreview ||
                                        this.state.avtPreview.length == 0 ? (
                                        <button type="button" onClick={this.handleUploadImage}>
                                            <img
                                                src="/assets/img/icon-upload-file.svg"
                                                className="mr-10"
                                                alt=""
                                            />
                                            <span>THÊM HÌNH</span>
                                        </button>
                                    ) : (
                                        <div className="block-image-overlay">
                                            <img
                                                id="output"
                                                src={this.state.avtPreview}
                                                alt="your image"
                                                className="image"
                                            />
                                            <div className="middle">
                                                <div className="text" onClick={this.remoAvatar}>
                                                    Hủy chọn
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="block-content" style={{ marginTop: "30px" }}>
                                    <div className="item-input-text">
                                        <div className="form-group mr-16">
                                            <label className="text-form-label">combo</label>
                                            <div className="mt-16">
                                                <div className="float-left">
                                                    <label className="ui-switch ui-switch-md info m-t-xs">
                                                        <input
                                                            type="checkbox"
                                                            name="combo_mode"
                                                            value={this.state.combo_mode}
                                                            checked={
                                                                this.state.combo_mode === true ? "checked" : ""
                                                            }
                                                            onChange={this._onChange}
                                                        />{" "}
                                                        <i />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="form-group mr-16"
                                            style={{ width: "144px" }}
                                        >
                                            <label className="text-form-label">Mã sách ID</label>
                                            <div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="book_id"
                                                    disabled={true}
                                                    value={this.state.book_id}
                                                    placeholder="Tự động sinh"
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, "");
                                                        value = value.replace(/000$/, "");
                                                        this.setState({
                                                            book_id: value + "000",
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group mr-16" style={{ width: "50%" }}>
                                            <label className="text-form-label">Tên sản phẩm</label>
                                            <div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    onChange={this._onChange}
                                                    value={this.state.name}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mr-16" style={{ width: "30%" }}>
                                            <label className="text-form-label">
                                                Link bản xem thử
                                            </label>
                                            <div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="demo_link"
                                                    onChange={this._onChange}
                                                    value={this.state.demo_link}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mr-16" style={{ width: "20%" }}>
                                            <label className="text-form-label">
                                                Ngày ngưng phát hành
                                            </label>
                                            <div className="group-date">
                                                <DatePicker
                                                    format={"YYYY/MM/DD HH:mm"}
                                                    value={
                                                        this.state.suspension_date
                                                            ? moment(this.state.suspension_date)
                                                            : null
                                                    }
                                                    showTime={{ format: "HH:mm" }}
                                                    placeholder="Chọn ngày"
                                                    onChange={this.changeDate}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="item-input-text" style={{ marginTop: "10px" }}>
                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label">Phân loại</label>
                                    <div>
                                        <select
                                            className="custom-select"
                                            value={this.state.level}
                                            name="level"
                                            onChange={this._onChange}
                                            style={{ width: "200px" }}
                                        >
                                            <option value="">-- Chọn cấp học --</option>
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
                                </div>

                                <div className="form-group mr-32 mb-0">
                                    <label className="text-form-label">Môn học</label>
                                    <div>
                                        <select
                                            className="custom-select"
                                            value={this.state.subject_id}
                                            name="subject_id"
                                            onChange={this._onChange}
                                            style={{ width: "200px" }}
                                        >
                                            <option value="">-- Chọn môn học --</option>
                                            {this.fetchSubjectRows()}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label">Danh mục </label>
                                    <div>
                                        <div className="">
                                            <select
                                                className="custom-select"
                                                value={this.state.category_id}
                                                name="category_id"
                                                onChange={this._onChange}
                                                style={{ width: "200px" }}
                                            >
                                                <option value="">-- Chọn danh mục --</option>
                                                {this.fetchCategoryRows()}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label">Giáo viên</label>
                                    <div>
                                        <select
                                            className="custom-select"
                                            value={this.state.teacher_id}
                                            name="teacher_id"
                                            onChange={this._onChange}
                                            style={{ width: "200px" }}
                                        >
                                            <option value="">-- Chọn giáo viên --</option>
                                            {this.fetchTeacherRows()}
                                        </select>
                                    </div>
                                </div>

                                <div
                                    className="form-group mb-0 mr-32"
                                    style={{ width: "180px" }}
                                >
                                    <label className="text-form-label">Số học viên sở hữu</label>
                                    <div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="numberStudent"
                                            onChange={this._onChange}
                                            value={this.state.numberStudent}
                                            style={{ width: "200px" }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label">Nổi bật</label>
                                    <div className="mt-16">
                                        <div className="float-left">
                                            <label className="ui-switch ui-switch-md info m-t-xs">
                                                <input
                                                    type="checkbox"
                                                    name="is_featured"
                                                    value={this.state.is_featured}
                                                    checked={
                                                        this.state.is_featured === true ? "checked" : ""
                                                    }
                                                    onChange={this._onChange}
                                                />{" "}
                                                <i />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-0 mr-32">
                                    <label className="text-form-label">Hiển thị</label>
                                    <div className="mt-16">
                                        <div className="float-left">
                                            <label className="ui-switch ui-switch-md info m-t-xs">
                                                <input
                                                    type="checkbox"
                                                    name="status"
                                                    value={this.state.status}
                                                    checked={this.state.status === true ? "checked" : ""}
                                                    onChange={this._onChange}
                                                />{" "}
                                                <i />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="two-column-layout book-id-pricing-layout">
                            <div className="block-price-discount book-id-price-card">
                                <h3 className="title-block">Giá và khuyến mãi</h3>
                                <div className="content input-group" style={promotionRowStyle}>
                                    <div className="form-group mb-0" style={compactPromotionFieldStyle}>
                                        <label className="text-form-label">Giá sản phẩm (VND)</label>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="origin_price"
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d]/g, "");
                                                    this.setState({
                                                        origin_price: value === "" ? 0 : Number(value),
                                                    });
                                                }}
                                                value={
                                                    this.state.origin_price
                                                        ? new Intl.NumberFormat("vi-VN").format(
                                                            this.state.origin_price,
                                                        )
                                                        : "0"
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mb-0" style={compactPromotionFieldStyle}>
                                        <label className="text-form-label">
                                            Giá khuyến mãi (VND)
                                        </label>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="price"
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^\d]/g, "");
                                                    this.setState({
                                                        price: value === "" ? 0 : Number(value),
                                                    });
                                                }}
                                                value={
                                                    this.state.price
                                                        ? new Intl.NumberFormat("vi-VN").format(
                                                            this.state.price,
                                                        )
                                                        : "0"
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mb-0" style={compactPromotionFieldStyle}>
                                        <label className="text-form-label">Chênh lệch</label>
                                        <div className="percent-difference">
                                            <span>
                                                {" "}
                                                {discountPercent && !isNaN(discountPercent)
                                                    ? discountPercent
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                    <div className="form-group mb-0" style={compactPromotionFieldStyle}>
                                        <label className="text-form-label">Số lượng khuyến mãi</label>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="quantity"
                                                onChange={this._onChange}
                                                value={this.state.quantity}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group mb-0" style={promotionTypeFieldStyle}>
                                        <label className="text-form-label">
                                            Chọn thời gian khuyến mãi
                                        </label>
                                        <div>
                                            <select
                                                className="custom-select"
                                                value={promotion.type}
                                                name="type"
                                                onChange={this._onChangeTypePromotion}
                                            >
                                                <option value="BY_DATE_RANGE">
                                                    Khoảng thời gian cụ thể
                                                </option>
                                                <option value="BY_HOUR">Thời gian kết thúc</option>
                                            </select>
                                        </div>
                                    </div>

                                    {promotion.type == "BY_DATE_RANGE" && (
                                        <div className="form-group mb-0" style={promotionDateFieldStyle}>
                                            <label className="text-form-label">Nhập thời gian</label>
                                            <div className="group-date" style={{ display: "flex", gap: "10px" }}>
                                                <DatePicker
                                                    format={"DD/MM/YYYY HH:mm"}
                                                    style={{ width: "120px" }}
                                                    value={
                                                        promotion.from_date
                                                            ? moment(promotion.from_date)
                                                            : null
                                                    }
                                                    showTime={{ format: "HH:mm" }}
                                                    placeholder="Từ ngày"
                                                    onChange={this.changeDateStart}
                                                />
                                                <DatePicker
                                                    format={"DD/MM/YYYY HH:mm"}
                                                    style={{ width: "120px" }}
                                                    value={
                                                        promotion.to_date ? moment(promotion.to_date) : null
                                                    }
                                                    showTime={{ format: "HH:mm" }}
                                                    placeholder="Đến ngày"
                                                    onChange={this.changeDateEnd}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {promotion.type == "BY_HOUR" && (
                                        <div
                                            className="form-group mb-0"
                                            style={compactPromotionFieldStyle}
                                        >
                                            <label className="text-form-label">Nhập số giờ</label>
                                            <div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="hour"
                                                    onChange={this._onChangeTypePromotion}
                                                    value={promotion.hour}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="content input-group">
                                    <div
                                        className="form-group mb-0"
                                        style={{ width: "100%", padding: "10px 0 0" }}
                                    >
                                        <label className="text-form-label">Ghi chú khuyến mãi</label>
                                        <div>
                                            <textarea
                                                className="form-control "
                                                style={{ minHeight: "70px", resize: "vertical" }}
                                                placeholder="Nhập ghi chú khuyến mãi (nếu có)"
                                                name="promotionNote"
                                                onChange={(e) =>
                                                    this.setState({
                                                        promotion: {
                                                            ...this.state.promotion,
                                                            note: e.target.value,
                                                        },
                                                    })
                                                }
                                                value={this.state.promotion.note}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                {!this.state.combo_mode && (
                                    <div className="content input-group" 
                                        style={{ 
                                            flexWrap: "nowrap",
                                            gap: "10px 18px",
                                            alignItems: "flex-start",
                                            paddingTop: "10px"
                                        }}
                                    >
                                        <div
                                            className="form-group mb-0"
                                            style={renewalFieldStyle}
                                        >
                                            <label className="text-form-label">
                                                Hạn sử dụng (tháng)
                                            </label>
                                            <div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="expired_time"
                                                    onChange={this._onChange}
                                                    value={this.state.expired_time || ""}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="form-group mb-0"
                                            style={renewalFieldStyle}
                                        >
                                            <label className="text-form-label">
                                                Số lần được phép gia hạn
                                            </label>
                                            <div>
                                                <input
                                                    type="number"
                                                    disabled={this.state.can_renewal_after === 0}
                                                    className="form-control"
                                                    name="number_of_renewal"
                                                    onChange={this._onChange}
                                                    value={this.state.number_of_renewal || ""}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="form-group mb-0"
                                            style={renewalFieldStyle}
                                        >
                                            <label className="text-form-label">
                                                Chi phí gia hạn (VND)
                                            </label>
                                            <div>
                                                <input
                                                    type="text"
                                                    disabled={this.state.can_renewal_after === 0}
                                                    className="form-control"
                                                    name="price_renewal"
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, "");
                                                        this.setState({
                                                            price_renewal: value === "" ? 0 : Number(value),
                                                        });
                                                    }}
                                                    value={
                                                        this.state.price_renewal
                                                            ? new Intl.NumberFormat("vi-VN").format(
                                                                this.state.price_renewal,
                                                            )
                                                            : ""
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="form-group mb-0"
                                            style={renewalFieldStyle}
                                        >
                                            <label className="text-form-label">
                                                thời gian gia hạn tối đa (tháng)
                                            </label>
                                            <div>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="can_renewal_after"
                                                    onChange={this._onChange}
                                                    value={this.state.can_renewal_after || ""}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="block-price-discount book-id-label-card">
                                <h3 className="title-block">Gắn nhãn</h3>
                                <div className="form-group mb-0" style={{ width: "100%" }}>
                                    <label className="text-form-label">Năm học</label>
                                    <SelectBox
                                        className="book-id-label-select"
                                        placeholder="-- Chọn năm học --"
                                        value={this.state.label_ids}
                                        onChange={(value) => this.setState({ label_ids: value })}
                                        options={this.fetchLabelYears()}
                                        selectedText={
                                            this.state.label_ids.length
                                                ? `Đã chọn ${this.state.label_ids.length}`
                                                : undefined
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <style>
                            {`
                                .book-id-pricing-layout {
                                    align-items: stretch;
                                    gap: 18px;
                                }

                                .two-column-layout.book-id-pricing-layout .book-id-price-card {
                                    flex: 1 1 0;
                                    min-width: 0;
                                }

                                .two-column-layout.book-id-pricing-layout .book-id-label-card {
                                    flex: 0 0 280px;
                                    min-width: 280px;
                                    align-self: stretch;
                                    height: auto;
                                }

                                .book-id-pricing-layout textarea.form-control {
                                    min-height: 68px;
                                }

                                .book-id-label-card .select-box {
                                    min-width: 0;
                                }

                                .book-id-label-card .select-box__counter {
                                    display: none;
                                }

                                .book-id-label-card .select-box__trigger {
                                    height: 36px;
                                    padding-right: 10px;
                                }
                            `}
                        </style>
                        {!this.state.combo_mode && (
                            <div className="block-attach-product">
                                <div className="title-action">
                                    <h3 className="title-block mb-0 mr-18">Khóa học đi kèm</h3>
                                    {this.state.listClassroomAttached &&
                                        this.state.listClassroomAttached.length > 0 ? null : (
                                        <button
                                            type="button"
                                            data-toggle="modal"
                                            data-target="#classroom-attached"
                                            data-toggle-class="fade-down"
                                            data-toggle-class-target=".animate"
                                        >
                                            Thêm khóa học
                                            <img
                                                src="/assets/img/icon-add.svg"
                                                alt=""
                                                className="ml-12"
                                            />
                                        </button>
                                    )}
                                </div>

                                <div className="block-list-product">
                                    <DragDropContext onDragEnd={this.onDragEndClassroomAttached}>
                                        <Droppable droppableId="droppable" direction="horizontal">
                                            {(provided, snapshot) => (
                                                <ul
                                                    className="list-products ml-0 pl-0"
                                                    ref={provided.innerRef}
                                                    style={{
                                                        background: snapshot.isDragging
                                                            ? "#e8f0fe"
                                                            : "none",
                                                    }}
                                                >
                                                    {this.state.listClassroomAttached &&
                                                        this.state.listClassroomAttached.length > 0 &&
                                                        this.state.listClassroomAttached.map(
                                                            (item, index) => {
                                                                const itemId = item.id || item._id || item;
                                                                const detailedCourse =
                                                                    this.props.bookIdCourses?.find(
                                                                        (c) => c._id === itemId || c.id === itemId,
                                                                    );
                                                                const displayItem = detailedCourse
                                                                    ? {
                                                                        ...detailedCourse,
                                                                        image:
                                                                            detailedCourse.image ||
                                                                            detailedCourse.avatar,
                                                                    }
                                                                    : typeof item === "object"
                                                                        ? item
                                                                        : { id: item };

                                                                return (
                                                                    <Draggable
                                                                        key={index}
                                                                        draggableId={"" + index}
                                                                        index={index}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <li
                                                                                className="list-item"
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    ...provided.draggableProps.style,
                                                                                    userSelect: "none",
                                                                                    background: snapshot.isDragging
                                                                                        ? "#e8f0fe"
                                                                                        : "none",
                                                                                    display: "table-row",
                                                                                }}
                                                                            >
                                                                                <div className="block-content">
                                                                                    <div className="action-head">
                                                                                        <a className="mr-14">
                                                                                            <img
                                                                                                src="/assets/img/icon-move.svg"
                                                                                                alt=""
                                                                                            />
                                                                                        </a>
                                                                                        <a
                                                                                            onClick={() =>
                                                                                                this.handleRemoveClassroomAttached(
                                                                                                    item,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <img
                                                                                                src="/assets/img/icon-close.svg"
                                                                                                alt=""
                                                                                            />
                                                                                        </a>
                                                                                    </div>
                                                                                    <div className="product-info">
                                                                                        <div className="image">
                                                                                            {displayItem.image ? (
                                                                                                <img
                                                                                                    src={displayItem.image}
                                                                                                    alt=""
                                                                                                />
                                                                                            ) : (
                                                                                                <img
                                                                                                    src="/assets/img/no-image.png"
                                                                                                    alt=""
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="name">
                                                                                            {displayItem.name
                                                                                                ? displayItem.name
                                                                                                : ""}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            },
                                                        )}
                                                    {provided.placeholder}
                                                </ul>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </div>
                        )}

                        {this.state.combo_mode && (
                            <div>
                                <div className="block-attach-product">
                                    <div className="title-action">
                                        <h3 className="title-block mb-0 mr-18">
                                            Sách ID trong combo
                                        </h3>
                                        <button
                                            type="button"
                                            className="button"
                                            data-toggle="modal"
                                            data-target="#book-attached"
                                            data-toggle-class="fade-down"
                                            data-toggle-class-target=".animate"
                                        >
                                            Thêm sách ID
                                            <img
                                                src="/assets/img/icon-add.svg"
                                                alt=""
                                                className="ml-12"
                                            />
                                        </button>
                                    </div>

                                    <div className="block-list-product">
                                        <DragDropContext onDragEnd={this.onDragEndBookRelate}>
                                            <Droppable
                                                droppableId="droppable-relate"
                                                direction="horizontal"
                                            >
                                                {(provided, snapshot) => (
                                                    <ul
                                                        className="list-products ml-0 pl-0"
                                                        ref={provided.innerRef}
                                                        style={{
                                                            background: snapshot.isDragging
                                                                ? "#e8f0fe"
                                                                : "none",
                                                        }}
                                                    >
                                                        {this.state.listBookRelates &&
                                                            this.state.listBookRelates.length > 0 &&
                                                            this.state.listBookRelates.map((item, index) => {
                                                                const itemId = item.id || item._id || item;
                                                                const detailedBook = this.props.books?.find(
                                                                    (b) => b._id === itemId || b.id === itemId,
                                                                );
                                                                const displayItem = detailedBook
                                                                    ? {
                                                                        ...detailedBook,
                                                                        image:
                                                                            detailedBook.image ||
                                                                            detailedBook.avatar,
                                                                    }
                                                                    : typeof item === "object"
                                                                        ? item
                                                                        : { id: item, name: item.name || "" };

                                                                return (
                                                                    <Draggable
                                                                        key={index}
                                                                        draggableId={"relate-" + index}
                                                                        index={index}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <li
                                                                                className="list-item"
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    ...provided.draggableProps.style,
                                                                                    userSelect: "none",
                                                                                    background: snapshot.isDragging
                                                                                        ? "#e8f0fe"
                                                                                        : "none",
                                                                                    display: "table-row",
                                                                                }}
                                                                            >
                                                                                <div className="block-content">
                                                                                    <div className="action-head">
                                                                                        <a className="mr-14">
                                                                                            <img
                                                                                                src="/assets/img/icon-move.svg"
                                                                                                alt=""
                                                                                            />
                                                                                        </a>
                                                                                        <a
                                                                                            onClick={() =>
                                                                                                this.handleRemoveBookRelate(
                                                                                                    item,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <img
                                                                                                src="/assets/img/icon-close.svg"
                                                                                                alt=""
                                                                                            />
                                                                                        </a>
                                                                                    </div>
                                                                                    <div className="product-info">
                                                                                        <div className="image">
                                                                                            {displayItem.image ||
                                                                                                displayItem.avatar ? (
                                                                                                <img
                                                                                                    src={
                                                                                                        displayItem.image ||
                                                                                                        displayItem.avatar
                                                                                                    }
                                                                                                    alt=""
                                                                                                />
                                                                                            ) : (
                                                                                                <img
                                                                                                    src="/assets/img/no-image.png"
                                                                                                    alt=""
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="name">
                                                                                            {displayItem.name
                                                                                                ? displayItem.name
                                                                                                : ""}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })}
                                                        {provided.placeholder}
                                                    </ul>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="block-description">
                            <h3 className="title-block">Mô tả ngắn</h3>
                            <div className="content">
                                <SunEditor
                                    onImageUploadBefore={this.handleImageUploadBefore}
                                    height={"400px"}
                                    setContents={this.state.description}
                                    onChange={this._handleEditorDescriptionChange}
                                    setOptions={{
                                        buttonList: baseHelpers.getSunEditorOptions(),
                                        katex: katex,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="block-description">
                            <h3 className="title-block">Giới thiệu</h3>
                            <div className="content">
                                <SunEditor
                                    onImageUploadBefore={this.handleImageUploadBefore}
                                    height={"400px"}
                                    setContents={this.state.content}
                                    onChange={this._handleEditorContentChange}
                                    setOptions={{
                                        buttonList: baseHelpers.getSunEditorOptions(),
                                        katex: katex,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="two-column-layout">
                            <div className="column">
                                <div className="block-highlight-info">
                                    <h3 className="title-block">Điểm nổi bật của sách</h3>
                                    <div className="content">
                                        <div className="highlight-input-section">
                                            <input
                                                type="text"
                                                placeholder="Thêm điểm nổi bật cho sách, ví dụ: 'Kèm đáp án chi tiết'"
                                                className="highlight-input"
                                                value={this.state.newHighlightText}
                                                onChange={(e) =>
                                                    this.setState({ newHighlightText: e.target.value })
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="btn-success btn-add"
                                                onClick={this.handleAddHighlight}
                                            >
                                                Thêm
                                            </button>
                                        </div>

                                        <DragDropContext onDragEnd={this.onDragEndHighlights}>
                                            <Droppable droppableId="book-highlight-droppable">
                                                {(provided, snapshot) => (
                                                    <ul
                                                        className="ml-0 pl-0"
                                                        ref={provided.innerRef}
                                                        style={{
                                                            background: snapshot.isDragging
                                                                ? "#e8f0fe"
                                                                : "none",
                                                        }}
                                                    >
                                                        {this.state.bookHighlights &&
                                                            this.state.bookHighlights.length > 0 ? (
                                                            this.state.bookHighlights.map((item, index) => {
                                                                const isEditing =
                                                                    this.state.editingHighlightIndex === index;
                                                                return (
                                                                    <Draggable
                                                                        key={item.id}
                                                                        draggableId={String(item.id)}
                                                                        index={index}
                                                                    >
                                                                        {(provided2, snapshot2) => (
                                                                            <li
                                                                                className="highlight-item-row"
                                                                                ref={provided2.innerRef}
                                                                                {...provided2.draggableProps}
                                                                                onDoubleClick={() =>
                                                                                    this.startEditHighlight(index)
                                                                                }
                                                                                style={{
                                                                                    ...provided2.draggableProps.style,
                                                                                    background: "#fff",
                                                                                    border: "1px solid #e6edf5",
                                                                                    borderRadius: "8px",
                                                                                    padding: "12px 16px",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "space-between",
                                                                                    marginBottom: "10px",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: "12px",
                                                                                    }}
                                                                                >
                                                                                    <a
                                                                                        {...provided2.dragHandleProps}
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            src="/assets/img/icon-move.svg"
                                                                                            alt=""
                                                                                        />
                                                                                    </a>
                                                                                    {isEditing ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            className="form-control"
                                                                                            style={{ width: "420px" }}
                                                                                            value={
                                                                                                this.state.editingHighlightText
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                this.setState({
                                                                                                    editingHighlightText:
                                                                                                        e.target.value,
                                                                                                })
                                                                                            }
                                                                                            onKeyDown={(e) =>
                                                                                                e.key === "Enter"
                                                                                                    ? this.saveEditHighlight()
                                                                                                    : null
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <span
                                                                                            style={{
                                                                                                fontSize: "16px",
                                                                                                color: "#0f172a",
                                                                                            }}
                                                                                        >
                                                                                            {item.text}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: "20px",
                                                                                    }}
                                                                                >
                                                                                    <a
                                                                                        style={{
                                                                                            color: "#0f172a",
                                                                                            fontWeight: 600,
                                                                                            cursor: "pointer",
                                                                                        }}
                                                                                        onClick={
                                                                                            isEditing
                                                                                                ? this.saveEditHighlight
                                                                                                : () =>
                                                                                                    this.startEditHighlight(
                                                                                                        index,
                                                                                                    )
                                                                                        }
                                                                                    >
                                                                                        {isEditing ? "Lưu" : "Sửa"}
                                                                                    </a>
                                                                                    <a
                                                                                        style={{
                                                                                            color: "#e53935",
                                                                                            fontWeight: 600,
                                                                                            cursor: "pointer",
                                                                                        }}
                                                                                        onClick={() =>
                                                                                            this.removeHighlight(item.id)
                                                                                        }
                                                                                    >
                                                                                        Xóa
                                                                                    </a>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="empty-state">
                                                                Chưa có điểm nổi bật cho sách.
                                                            </span>
                                                        )}
                                                        {provided.placeholder}
                                                    </ul>
                                                )}
                                            </Droppable>
                                        </DragDropContext>

                                        <div className="drag-instruction">
                                            Kéo-thả để sắp xếp. Double-click để chỉnh sửa.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="column">
                                <div className="block-course-includes">
                                    <h3 className="title-block">Sách bao gồm</h3>
                                    <div className="content">
                                        <div className="highlight-input-section">
                                            <input
                                                type="text"
                                                placeholder="Ví dụ: 15+ Chuyên đề"
                                                className="custom-input"
                                                value={this.state.newIncludeText}
                                                onChange={(e) =>
                                                    this.setState({ newIncludeText: e.target.value })
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={this.openIncludeIconPicker}
                                                title="Chọn icon"
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: 8,
                                                    border: "1px solid #e6edf5",
                                                    background: "#fff",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <SelectedIncludeIcon size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-success btn-add"
                                                onClick={this.handleAddInclude}
                                            >
                                                Thêm
                                            </button>
                                        </div>

                                        <DragDropContext onDragEnd={this.onDragEndIncludes}>
                                            <Droppable droppableId="book-includes-droppable">
                                                {(provided, snapshot) => (
                                                    <ul
                                                        className="ml-0 pl-0"
                                                        ref={provided.innerRef}
                                                        style={{
                                                            background: snapshot.isDragging
                                                                ? "#e8f0fe"
                                                                : "none",
                                                        }}
                                                    >
                                                        {this.state.bookIncludes &&
                                                            this.state.bookIncludes.length > 0 ? (
                                                            this.state.bookIncludes.map((item, index) => {
                                                                const RowIcon =
                                                                    includeIconMap[item.iconKey] || BookIcon;
                                                                const isEditingText =
                                                                    this.state.editingIncludeIndex === index;
                                                                return (
                                                                    <Draggable
                                                                        key={item.id}
                                                                        draggableId={String(item.id)}
                                                                        index={index}
                                                                    >
                                                                        {(provided3, snapshot3) => (
                                                                            <li
                                                                                className="include-item-row"
                                                                                ref={provided3.innerRef}
                                                                                {...provided3.draggableProps}
                                                                                style={{
                                                                                    ...provided3.draggableProps.style,
                                                                                    background: "#fff",
                                                                                    border: "1px solid #e6edf5",
                                                                                    borderRadius: "8px",
                                                                                    padding: "12px 16px",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "space-between",
                                                                                    marginBottom: "10px",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: "12px",
                                                                                    }}
                                                                                >
                                                                                    <a
                                                                                        {...provided3.dragHandleProps}
                                                                                        style={{
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            src="/assets/img/icon-move.svg"
                                                                                            alt=""
                                                                                        />
                                                                                    </a>
                                                                                    <a
                                                                                        onDoubleClick={() =>
                                                                                            this.startEditIncludeIcon(index)
                                                                                        }
                                                                                        style={{
                                                                                            cursor: "pointer",
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                        }}
                                                                                    >
                                                                                        <RowIcon size={20} />
                                                                                    </a>
                                                                                    {isEditingText ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            className="form-control"
                                                                                            style={{ width: "340px" }}
                                                                                            value={
                                                                                                this.state.editingIncludeText
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                this.setState({
                                                                                                    editingIncludeText:
                                                                                                        e.target.value,
                                                                                                })
                                                                                            }
                                                                                            onKeyDown={(e) =>
                                                                                                e.key === "Enter"
                                                                                                    ? this.saveEditInclude()
                                                                                                    : null
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <span
                                                                                            onDoubleClick={() =>
                                                                                                this.startEditInclude(index)
                                                                                            }
                                                                                            style={{
                                                                                                fontSize: "16px",
                                                                                                color: "#0f172a",
                                                                                                cursor: "pointer",
                                                                                            }}
                                                                                        >
                                                                                            {item.text}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: "20px",
                                                                                    }}
                                                                                >
                                                                                    <a
                                                                                        style={{
                                                                                            color: "#0f172a",
                                                                                            fontWeight: 600,
                                                                                            cursor: "pointer",
                                                                                        }}
                                                                                        onClick={
                                                                                            isEditingText
                                                                                                ? this.saveEditInclude
                                                                                                : () =>
                                                                                                    this.startEditInclude(index)
                                                                                        }
                                                                                    >
                                                                                        {isEditingText ? "Lưu" : "Sửa"}
                                                                                    </a>
                                                                                    <a
                                                                                        style={{
                                                                                            color: "#e53935",
                                                                                            fontWeight: 600,
                                                                                            cursor: "pointer",
                                                                                        }}
                                                                                        onClick={() =>
                                                                                            this.removeInclude(item.id)
                                                                                        }
                                                                                    >
                                                                                        Xóa
                                                                                    </a>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="empty-state">
                                                                Chưa có tài nguyên kèm theo.
                                                            </span>
                                                        )}
                                                        {provided.placeholder}
                                                    </ul>
                                                )}
                                            </Droppable>
                                        </DragDropContext>

                                        <div className="drag-instruction">
                                            Kéo-thả để sắp xếp. Double-click vào text để chỉnh sửa,
                                            double-click vào icon để đổi icon.
                                        </div>

                                        {this.state.includeIconPickerOpen && (
                                            <div
                                                style={{
                                                    position: "fixed",
                                                    inset: 0,
                                                    background: "rgba(0,0,0,0.35)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    zIndex: 9999,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 480,
                                                        background: "#fff",
                                                        borderRadius: 12,
                                                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            padding: "16px 20px",
                                                            borderBottom: "1px solid #eee",
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 700 }}>Chọn icon</span>
                                                        <a onClick={this.closeIncludeIconPicker}>
                                                            <img
                                                                src="/assets/img/icon-close.svg"
                                                                alt="close"
                                                            />
                                                        </a>
                                                    </div>

                                                    <div style={{ padding: 20 }}>
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "repeat(5, 1fr)",
                                                                gridTemplateRows: "repeat(4, auto)",
                                                                gap: 16,
                                                                justifyItems: "center",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            {[
                                                                "Book",
                                                                "FileText",
                                                                "Clock",
                                                                "FilePlus",
                                                                "PlusSquare",
                                                                "Play",
                                                                "Image",
                                                                "Link",
                                                                "BarChart",
                                                                "Video",
                                                                "Star",
                                                                "Users",
                                                                "Menu",
                                                                "CheckSquare",
                                                                "ListChecks",
                                                                "Layers",
                                                                "Info",
                                                                "BookOpen",
                                                                "FolderPlus",
                                                            ].map((key) => {
                                                                const IconComp = includeIconMap[key];
                                                                return (
                                                                    <a
                                                                        key={key}
                                                                        onClick={() => this.selectIncludeIcon(key)}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            padding: "8px",
                                                                            borderRadius: "8px",
                                                                            transition: "all 0.2s",
                                                                            border:
                                                                                this.state.newIncludeIconKey === key
                                                                                    ? "2px solid #007bff"
                                                                                    : "2px solid transparent",
                                                                        }}
                                                                    >
                                                                        <IconComp size={24} />
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            padding: "12px 20px",
                                                            borderTop: "1px solid #eee",
                                                            textAlign: "right",
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="button"
                                                            onClick={this.closeIncludeIconPicker}
                                                        >
                                                            Đóng
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {this.state.includeIconEditPickerOpen && (
                                            <div
                                                style={{
                                                    position: "fixed",
                                                    inset: 0,
                                                    background: "rgba(0,0,0,0.35)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    zIndex: 9999,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 480,
                                                        background: "#fff",
                                                        borderRadius: 12,
                                                        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            padding: "16px 20px",
                                                            borderBottom: "1px solid #eee",
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 700 }}>Đổi icon</span>
                                                        <a onClick={this.closeIncludeIconEditPicker}>
                                                            <img
                                                                src="/assets/img/icon-close.svg"
                                                                alt="close"
                                                            />
                                                        </a>
                                                    </div>

                                                    <div style={{ padding: 20 }}>
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "repeat(5, 1fr)",
                                                                gridTemplateRows: "repeat(4, auto)",
                                                                gap: 16,
                                                                justifyItems: "center",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            {[
                                                                "Book",
                                                                "FileText",
                                                                "Clock",
                                                                "FilePlus",
                                                                "PlusSquare",
                                                                "Play",
                                                                "Image",
                                                                "Link",
                                                                "BarChart",
                                                                "Video",
                                                                "Star",
                                                                "Users",
                                                                "Menu",
                                                                "CheckSquare",
                                                                "ListChecks",
                                                                "Layers",
                                                                "Info",
                                                                "BookOpen",
                                                                "FolderPlus",
                                                            ].map((key) => {
                                                                const IconComp = includeIconMap[key];
                                                                return (
                                                                    <a
                                                                        key={key}
                                                                        onClick={() =>
                                                                            this.selectEditIncludeIcon(key)
                                                                        }
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            padding: "8px",
                                                                            borderRadius: "8px",
                                                                            transition: "all 0.2s",
                                                                            border:
                                                                                this.state.editingIncludeIconKey === key
                                                                                    ? "2px solid #007bff"
                                                                                    : "2px solid transparent",
                                                                        }}
                                                                    >
                                                                        <IconComp size={24} />
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            padding: "12px 20px",
                                                            borderTop: "1px solid #eee",
                                                            textAlign: "right",
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="button"
                                                            onClick={this.closeIncludeIconEditPicker}
                                                        >
                                                            Đóng
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="block-action-footer">
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => this.props.history.push("/book-id")}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-submit ml-16"
                                onClick={() => this.handleSubmit(1)}
                            >
                                Cập nhật
                            </button>
                        </div>
                        <ModalAttachedClassroom
                            id="classroom-attached"
                            book={this.props.book}
                            handleAddClassroom={this.handleAddClassroomAttached}
                            selectedClassroom={this.state.listClassroomAttached}
                            classroomAttached={this.props.classroomAttached}
                        />
                        <ModalAttachedBook
                            id="book-attached"
                            book={this.props.book}
                            handleAddBook={this.handleAddBookRelate}
                            selectedBooks={this.state.listBookRelates}
                            bookRelates={this.props.bookRelates}
                        />

                        <div
                            id="modal-export-data"
                            className="modal fade"
                            data-backdrop="true"
                            style={{ display: "none" }}
                            aria-hidden="true"
                        >
                            <ModalExport />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        subjects: state.subject.subjects,
        book: state.bookId.bookId,
        classroomGroups: state.classroomGroup
            ? state.classroomGroup.classroomGroups
            : [],
        redirect: state.bookId.redirect,
        image: state.book.image,
        students: state.student.students,
        bookIdCourses: state.bookIdCourse.bookIdCourses,
        books: state.bookId.bookIds,
        labelsByItem: state.label.labelsByItem || [],
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            listSubject,
            showBook,
            updateBook,
            listAdmin,
            listClassroomGroup,
            listBookIdCourse,
            listBook,
            exportTestBook,
            listLabelsByItem,
            syncLabels,
        },
        dispatch,
    );
}

let ContainerEdit = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(BookIdEdit),
);

export default ContainerEdit;
