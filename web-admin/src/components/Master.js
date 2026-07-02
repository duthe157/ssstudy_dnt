import React, { useEffect, useState } from "react";
import {
	Link,
	withRouter,
	Switch,
	NavLink,
} from "react-router-dom";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { logout, loadUser, showProfile } from "../redux/auth/action";

import Changepassword from "./Changepassword";
import Profile from "./Profile";
import Student from "./student/Student";
import StudentCreate from "./student/StudentCreate";
import StudentEdit from "./student/StudentEdit";
import Admin from "./admin/Admin";
import AdminCreate from "./admin/AdminCreate";
import AdminEdit from "./admin/AdminEdit";
import Exam from "./exam/Exam";
import ExamCreate from "./exam/ExamCreate";
import Testing from "./testing/Testing";

import Question from "./question/Question";
import QuestionCreate from "./question/QuestionCreate";
import QuestionEdit from "./question/QuestionEdit";

import ExamEdit from "./exam/ExamEdit";
import ExamReport from "./exam/report/ExamReport.js";

import TestingEdit from "./testing/TestingEdit";
import Subject from "./subject/Subject";
import subjectCreate from "./subject/SubjectCreate";
import SubjectEdit from "./subject/SubjectEdit";
import Chapter from "./chapter/chapter";
import ChapterCreate from "./chapter/ChapterCreate";
import chapterEdit from "./chapter/ChapterEdit";
import Category from "./lesson/Lesson";
import CategoryCreate from "./lesson/LessonCreate";
import CategoryEdit from "./lesson/LessonEdit";
import { isUndefined } from "util";

import ClassroomGroup from "./classroom-group/ClassroomGroup";
import ClassroomGroupCreate from "./classroom-group/ClassroomGroupCreate";
import ClassroomGroupEdit from "./classroom-group/ClassroomGroupEdit";

import Classroom from "./classroom/Classroom";
import ClassroomOffline from "./classroom/ClassroomOffline";
import ClassroomCreate from "./classroom/ClassroomCreate";
import ClassroomEdit from "./classroom/ClassroomEdit";
import ClassroomCode from "./classroom/ClassroomCode";
import ClassroomReport from "./classroom/ClassroomReport";
import ClassroomMember from "./classroom/ClassroomMember";

import ListIframe from "./iframe/IframeComponent";

import Document from "./document/Document";
import DocumentCreate from "./document/DocumentCreate";
import DocumentEdit from "./document/DocumentEdit";
import DocumentCategory from "./document/DocumentCategory";
import DocumentCategoryCreate from "./document/DocumentCategoryCreate";
import DocumentCategoryEdit from "./document/DocumentCategoryEdit";

import ListRegister from "./register/ListRegister";
import RegisterEdit from "./register/RegisterEdit";

import Setting from "./setting/Setting.js";
import SettingHomePage from "./setting/HomePage";
import Message from "./message/Message.js";
import MessageCreate from "./message/MessageCreate.js";
import MessageEdit from "./message/MessageEdit.js";
import Schedule from "./schedule/Schedule";
import Home from "./home/Home";
import IntroPage from "./setting/IntroPage";
import TeachersTeam from './setting/TeachersTeam';
import AdminCeo from './setting/AdminCeo';

import Bill from "./bill/Bill";
import BillRefund from "./bill/BillRefund";
import BillCreate from "./bill/BillCreate";
import BillEdit from "./bill/BillEdit";
import BillReport from "./bill/BillReport";
import BillRefundCreate from "./bill/BillRefundCreate";
import BillRefundUpdate from "./bill/BillRefundUpdate";
import PrivateRoute from "../routing/PrivateRoute";
import { isNull } from "lodash";
import CheckCard from "./check-card/CheckCard";
import Diligence from "./diligence/Diligence";

import DiligenceDetail from "./diligence/DiligenceDetail";

import Review from "./review/Review";
import ReviewCreate from "./review/ReviewCreate";
import ReviewEdit from "./review/ReviewEdit";

import Book from "./book/Book";
import BookCreate from "./book/BookCreate";
import BookEdit from "./book/BookEdit";

import BookId from "./book-id/BookId";
import BookIdCreate from "./book-id/bookIdCreate";
import BookIdEdit from "./book-id/bookIdEdit";
import BookIdCode from "./book-id/BookIdCode";
import BookIdMember from "./book-id/BookIdMember";

import BookIdCourse from "./book-id/BookIdCourse";
import BookIdCourseCreate from "./book-id/BookIdCourseCreate";
import BookIdCourseEdit from "./book-id/BookIdCourseEdit";

import BookReview from "./book-review/BookReview";
import BookReviewEdit from "./book-review/BookReviewEdit";
import BookReviewCreate from "./book-review/BookReviewCreate";

import AdultEvaluation from './adult-evaluation/adultEvaluation';
import AdultEvaluationCreate from './adult-evaluation/adultEvaluationCreate';
import AdultEvaluationEdit from './adult-evaluation/adultEvaluationEdit';

import Blog from './blog/Blog';
import BlogCreate from './blog/BlogCreate';
import BlogEdit from './blog/BlogEdit';

import BlogCategory from './blog-category/BlogCategory';
import BlogCategoryCreate from './blog-category/BlogCategoryCreate';
import BlogCategoryEdit from './blog-category/BlogCategoryEdit';

import Credit from './credit/Credit';

import CreditHistory from './credit/Credit';
import QuickPayments from './link-payments/QuickPayments.js';
import LinkPaymentCreate from './link-payments/LinkPaymentCreate.js'


import Order from './order/Order';
import OrderPending from './order/OrderPending';
import OrderPaid from './order/OrderPaid';
import OrderSuccess from './order/OrderSuccess';
import OrderProcessing from './order/OrderProcessing';
import OrderShipping from './order/OrderShipping';
import OrderCancelled from './order/OrderCancelled';
import OrderDetails from './order/OrderDetails';

import Coupon from './coupon/Coupon.js';

import BookCategory from './book-category/BookCategory';
import BookCategoryCreate from './book-category/BookCategoryCreate';
import BookCategoryEdit from './book-category/BookCategoryEdit';

import ExamCategory from './exam-category/ExamCategory';
import ExamCategoryCreate from './exam-category/ExamCategoryCreate';
import ExamCategoryEdit from './exam-category/ExamCategoryEdit';

import ReportBug from './bug/Bug';
import { useLocation } from "react-router-dom";

import ExamTest from './exam/Test';
import CreateIframe from "./iframe/CreateIframe";
import ExamList from "./exam-new/ExamList";
import ExamNewCreate from "./exam-new/ExamNewCreate";
import ExamV2Report from "./exam-new/report/ExamV2Report.js";
import ExamWordReport from "./exam-word/report/ExamWordReport.js";
import ExamWordEdit from "./exam-word/ExamWordEdit.js";
import ExamWordList from "./exam-word/ExamList";
import ExamWordCreate from "./exam-word/ExamCreate";
import ExamWordCategory from "./exam-word/ExamWordCategory";
import ExamWordTestCategory from "./exam-word/ExamWordTestCategory";
import LuckyMoney from "./lucky-money/LuckyMoney";

import ExamWordTestCategoryEdit from "./exam-word/ExamWordTestCategoryEdit";
import ExamWordCategoryEdit from "./exam-word/ExamWordCategoryEdit";
import FastGift from "./fast-gift/FastGift";
import FastGiftEdit from "./fast-gift/FastGiftEdit";
import LabelManagement from "./label/label.js";
import LabelAssign from "./label/labelAssign.js";

const CDN = "https://cdn.luyenthitiendat.vn/";

const Master = ({ loadUser, showProfile, logout, user, history, userInfo }) => {
	let groupUser = 1;
	const location = useLocation();
	const [dataSubMenu, setDataSubMenu] = useState([]);
	const [isShowBlockSubMenu, setIsShowBlockSubMenu] = useState(true);
	const [isShowIntroDropdown, setIsShowIntroDropdown] = useState(false);
	const [openMenu, setOpenMenu] = useState(null);

	const toggleMenu = (menuKey, handler) => {
		if (openMenu === menuKey) {
			setOpenMenu(null);
			setDataSubMenu([]);
		} else {
			setOpenMenu(menuKey);
			if (handler) handler();
		}
	};

	useEffect(() => {
		loadUser();
		showProfile();
	}, []);

	const handleLogout = async (e) => {
		logout();
		history.push("/login");
	};

	useEffect(() => {
		const pathname = location.pathname;
		if (pathname.indexOf('order') >= 0)
			handleSubMenuOrder();

		if (pathname.indexOf('book') >= 0 || pathname.indexOf('book-category') >= 0 || pathname.indexOf('book/review') >= 0)
			handleSubMenuBook();

		if (pathname.indexOf('exam') >= 0 || pathname.indexOf('question') >= 0 || pathname.indexOf('report-bug') >= 0)
			handleSubMenuExam();

		if (pathname.indexOf('examv2') >= 0)
			handleSubMenuExamNew();

		if (pathname.indexOf('exam-word') >= 0 || pathname.indexOf('exam-catalog') >= 0 || pathname.indexOf('test') >= 0)
			handleSubMenuExamWord();

		if (pathname.indexOf('lesson') >= 0 || pathname.indexOf('chapter') >= 0)
			handleSubMenuLesson();

		if (pathname.indexOf('classroom') >= 0 || pathname.indexOf('subject') >= 0)
			handleSubMenuCourse();

		if (pathname.indexOf('iframe') >= 0 || pathname.indexOf('iframe') >= 0)
			handleSubMenuIframe();

		if (pathname.indexOf('student') >= 0 || pathname.indexOf('admin') >= 0)
			handleSubMenuMember();

		if (pathname.indexOf('document') >= 0)
			handleSubMenuRescources();

		if (pathname.indexOf('coupon') >= 0)
			handleSubMenuCoupon();

		if (pathname.indexOf('message') >= 0)
			handleSubMenuNotify();

		if (pathname.indexOf('bill') >= 0)
			handleSubMenuTuition();

		if (pathname.indexOf('testing') >= 0)
			handleSubMenuTest();

		if (
			pathname.indexOf('home-page') >= 0 ||
			pathname.indexOf('intro-page') >= 0 ||
			pathname.indexOf('adult-evaluation') >= 0 ||
			pathname.indexOf('admin-ceo') >= 0 || // 🟢 thêm dòng này
			pathname.indexOf('teachers-team') >= 0 // 🟢 thêm dòng này để ổn định luôn
		) {
			handleSubMenuSetting();
		}


		if (pathname.indexOf('credit-history') >= 0)
			handleSubMenuHistory();

		if (pathname.indexOf('blog') >= 0 || pathname.indexOf('blog-category') >= 0)
			handleSubMenuBlog();

		if (pathname.indexOf('quick-payments') >= 0)
			handleSubMenuQuickPayment()
		if (pathname.indexOf('book-id') >= 0 || pathname.indexOf('book-id/create') >= 0)
			handleSubMenuBookId();

	}, [location])

	const handleSubMenuRescources = () => {
		setDataSubMenu(
			[
				{
					to: "/document",
					classIcon: "icon-all-document",
					name: "Tất cả tài liệu"
				},
				{
					to: "/document/create",
					classIcon: "icon-add-document",
					name: "Thêm mới tài liệu"
				},
				{
					to: "/document-category",
					classIcon: "icon-all-document",
					name: "Tất cả danh mục"
				},
				{
					to: "/document-category/create",
					classIcon: "icon-all-document",
					name: "Thêm danh mục"
				}
			]
		)
	}

	const handleSubMenuQuickPayment = () => {
		setDataSubMenu(
			[
				{
					to: "/quick-payments",
					classIcon: "icon-all-exam",
					name: "Quản lý link"
				},
				{
					to: "/quick-payments/create",
					classIcon: "icon-add-exam",
					name: "Tạo link mới"
				}
			]
		)
	}

	const handleSubMenuExamWord = () => {
		setDataSubMenu(
			[
				{
					to: "/exam-word",
					classIcon: "icon-all-exam",
					name: "Tất cả đề"
				},
				{
					to: "/exam-word/create",
					classIcon: "icon-add-exam",
					name: "Thêm đề bằng file word"
				},
				{
					to: "/exam-word/competition-part",
					classIcon: "icon-dashboard",
					name: "Danh mục kỳ thi"
				},

				{
					to: "/exam-word/exam-catalog",
					classIcon: "icon-dashboard",
					name: "Danh mục bài kiểm tra"
				},
				{
					to: "/exam-word/fast-gift",
					classIcon: "icon-coupon",
					name: "Quà tặng nhanh"
				}
			]
		)
	}

	const handleSubMenuMember = () => {
		setDataSubMenu(
			[
				{
					to: "/student",
					classIcon: "icon-group-user",
					name: "Thành viên"
				},
				{
					to: "/student/create",
					classIcon: "icon-add-user",
					name: "Thêm Thành viên"
				},
				{
					to: "/admin",
					classIcon: "icon-group-user",
					classLineItem: "line-break",
					name: "Quản trị viên"
				},
				{
					to: "/admin/create",
					classIcon: "icon-add-user",
					name: "Thêm quản trị viên"
				}
			]
		)
	}

	const handleSubMenuOrder = () => {
		setDataSubMenu(
			[
				{
					to: "/order",
					classIcon: "icon-dashboard",
					name: "Tất cả đơn hàng"
				},
				{
					to: "/order-pending",
					classIcon: "icon-dashboard",
					name: "Chờ xử lý"
				},
				{
					to: "/order-processing",
					classIcon: "icon-dashboard",
					name: "Đang xử lý"
				},
				{
					to: "/order-paid",
					classIcon: "icon-dashboard",
					name: "Đã thanh toán"
				},
				{
					to: "/order-shipping",
					classIcon: "icon-dashboard",
					name: "Đang giao hàng"
				},
				{
					to: "/order-success",
					classIcon: "icon-dashboard",
					name: "Thành công"
				},
				{
					to: "/order-cancelled",
					classIcon: "icon-dashboard",
					name: "Huỷ đơn"
				},
			]
		)
	}

	const handleSubMenuTuition = () => {
		setDataSubMenu(
			[
				{
					to: "/bill/create",
					classIcon: "icon-tuition",
					name: "Đóng học phí"
				},
				{
					to: "/bill",
					classIcon: "icon-receipts",
					name: "Phiếu thu"
				},
				{
					to: "/bill-refund",
					classIcon: "icon-receipts",
					name: "Phiếu hoàn hủy"
				},
				{
					to: "/bill-refund/create",
					classIcon: "icon-refund-ticket",
					name: "Tạo phiếu hoàn hủy"
				},
				{
					to: "/bill-report",
					classIcon: "icon-sales-report",
					name: "Báo cáo doanh thu"
				},
			]
		)
	}

	const handleSubMenuBook = () => {
		setDataSubMenu(
			[
				{
					to: "/book",
					classIcon: "icon-all-book",
					name: "Tất cả sách"
				},
				{
					to: "/book/create",
					classIcon: "icon-add-book",
					name: "Thêm sách"
				},
				// {
				// 	to: "/book-category",
				// 	classIcon: "icon-dashboard",
				// 	classLineItem: "line-break",
				// 	name: "Danh mục sách"
				// },
				// {
				// 	to: "/book-category/create",
				// 	classIcon: "icon-dashboard",
				// 	name: "Thêm danh mục"
				// },
				{
					to: "/book/review",
					classIcon: "icon-review-book",
					classLineItem: "line-break",
					name: "Đánh giá sách"
				},
				{
					to: "/book/review/create",
					classIcon: "icon-review-book",
					name: "Thêm đánh giá sách"
				}
			]
		)
	}

	const handleSubMenuExam = () => {
		setDataSubMenu(
			[
				{
					to: "/exam",
					classIcon: "icon-all-exam",
					name: "Tất cả đề"
				},
				{
					to: "/exam/create",
					classIcon: "icon-add-exam",
					name: "Thêm đề"
				},
				{
					to: "/exam/category",
					classIcon: "icon-dashboard",
					classLineItem: "line-break",
					name: "Danh mục đề"
				},
				{
					to: "/exam/category/create",
					classIcon: "icon-add-exam",
					name: "Thêm danh mục"
				},
				// {
				// 	to: "/question",
				// 	classIcon: "icon-dashboard",
				// 	classLineItem: "line-break",
				// 	name: "Câu hỏi"
				// },
				// {
				// 	to: "/question/create",
				// 	classIcon: "icon-add-exam",
				// 	name: "Thêm câu hỏi"
				// },
				{
					to: "/report-bug",
					classIcon: "icon-report-bug",
					classLineItem: "line-break",
					name: "Báo lỗi"
				}
			]
		)
	}

	const handleSubMenuExamNew = () => {
		setDataSubMenu(
			[
				{
					to: "/examv2",
					classIcon: "icon-all-exam",
					name: "Tất cả đề"
				},
				{
					to: "/examv2/create",
					classIcon: "icon-add-exam",
					name: "Thêm đề"
				},
				// {
				// 	to: "/exam-new/category",
				// 	classIcon: "icon-dashboard",
				// 	classLineItem: "line-break",
				// 	name: "Danh mục đề"
				// },
				// {
				// 	to: "/exam-new/category/create",
				// 	classIcon: "icon-add-exam",
				// 	name: "Thêm danh mục"
				// },
				// {
				// 	to: "/report-bug",
				// 	classIcon: "icon-report-bug",
				// 	classLineItem: "line-break",
				// 	name: "Báo lỗi"
				// }
			]
		)
	}

	const handleSubMenuLesson = () => {
		setDataSubMenu(
			[
				{
					to: "/lesson",
					classIcon: "icon-all-lesson",
					name: "Tất cả bài học"
				},
				// {
				// 	to: "#",
				// 	classIcon: "icon-add-lesson",
				// 	name: "Thêm bài học",
				// 	dataToggle: "modal",
				// 	dataTarget: "#modal-add-lesson",
				// 	dataToggleClass: "fade-down",
				// 	dataToggleClassTarget: ".animate"
				// },
				// {
				// 	to: "/testing",
				// 	classIcon: "icon-all-lesson",
				// 	name: "Bài kiểm tra"
				// },
			]
		)
	}

	const handleSubMenuTest = () => {
		setDataSubMenu(
			[
				{
					to: "/testing",
					classIcon: "icon-all-lesson",
					name: "Tất cả bài kiểm tra"
				},
			]
		)
	}

	const handleSubMenuCourse = () => {
		setDataSubMenu(
			[
				{
					to: "/classroom-online",
					classIcon: "icon-all-course",
					name: "Lớp Online"
				},
				{
					to: "/classroom-offline",
					classIcon: "icon-all-course",
					name: "Lớp Offline"
				},
				{
					to: "/classroom/create",
					classIcon: "icon-add-course",
					name: "Thêm lớp"
				},

				{
					to: "/subject",
					classIcon: "icon-dashboard",
					classLineItem: "line-break",
					name: "Môn học"
				},

				{
					to: "/subject/create",
					classIcon: "icon-dashboard",
					name: "Thêm môn học"
				},

				{
					to: "/classroom/group",
					classIcon: "icon-dashboard",
					classLineItem: "line-break",
					name: "Danh mục"
				},
				{
					to: "/classroom/group/create",
					classIcon: "icon-add-course",
					name: "Thêm danh mục"
				},
				{
					to: "/classroom/review",
					classIcon: "icon-review-course",
					classLineItem: "line-break",
					name: "Đánh giá khóa học"
				},
				{
					to: "/classroom/review/create",
					classIcon: "icon-review-course",
					name: "Thêm đánh giá"
				},
			]
		)
	}

	const handleSubMenuLabel = () => {
		setDataSubMenu(
			[
				{
					to: "/label",
					classIcon: "icon-all-exam",
					name: "Quản lý nhãn"
				},
			]
		)
	}

	const handleSubMenuIframe = () => {
		setDataSubMenu(
			[
				{
					to: "/iframe",
					classIcon: "icon-all-exam",
					name: "Tất cả form"
				},
				{
					to: "/iframe-create",
					classIcon: "icon-add-exam",
					name: "Thêm form"
				}
			]
		)
	}

	const handleSubMenuCoupon = () => {
		setDataSubMenu(
			[
				{
					to: "/coupon",
					classIcon: "icon-coupon-list",
					name: "Danh sách mã"
				},
				// {
				// 	to: "#",
				// 	classIcon: "icon-add-lesson",
				// 	name: "Tạo mã mới",
				// 	dataToggle: "modal",
				// 	dataTarget: "#modalCoupon",
				// 	dataToggleClass: "fade-down",
				// 	dataToggleClassTarget: ".animate"
				// },
			]
		)
	}
	const handleSubMenuNotify = () => {
		setDataSubMenu(
			[
				{
					to: "/message",
					classIcon: "icon-dashboard",
					name: "Tất cả thông báo"
				},
				{
					to: "/message/create",
					classIcon: "icon-dashboard",
					name: "Thêm mới"
				},
			]
		)
	}

	const handleSubMenuBlog = () => {
		setDataSubMenu(
			[
				{
					to: "/blog",
					classIcon: "icon-dashboard",
					name: "Bài viết"
				},
				{
					to: "/blog/create",
					classIcon: "icon-dashboard",
					name: "Thêm bài viết"
				},
				{
					to: "/blog-category",
					classIcon: "icon-dashboard",
					classLineItem: "line-break",
					name: "Danh mục bài viết"
				},
				{
					to: "/blog-category/create",
					classIcon: "icon-dashboard",
					name: "Thêm danh mục"
				},
			]
		)
	}

	const handleSubMenuSetting = () => {
		setDataSubMenu(
			[
				{
					to: "/settings/home-page",
					classIcon: "icon-dashboard",
					name: "Trang chủ"
				},
				{
					to: "/settings/intro-page",
					classIcon: "icon-course", // dùng tạm biểu tượng "khóa học" cho phần giới thiệu
					name: "Trang giới thiệu",
					hasSubmenu: true,
					submenu: [
						{
							to: "/teachers-team",
							classIcon: "icon-lesson", // icon bài học → đại diện cho đội ngũ giáo viên
							name: "Đội ngũ giáo viên"
						},
						{
							to: "/admin-ceo",
							classIcon: "icon-dashboard", // tạm dùng icon tổng quan, hoặc bạn thêm icon mới
							name: "CEO"
						}
					]
				},
				{
					to: "/adult-evaluation",
					classIcon: "icon-dashboard",
					name: "Đánh giá"
				},
				{
					to: "/adult-evaluation/create",
					classIcon: "icon-dashboard",
					name: "Thêm đánh giá"
				},
			]
		)
	}

	const handleSubMenuHistory = () => {
		setDataSubMenu(
			[
				{
					to: "/credit-history",
					classIcon: "icon-member",
					name: "Tất cả giao dịch"
				},
			]
		)
	}

	const setDefaultMenu = () => {
		const _pathname = window.location.pathname;
		if (_pathname.indexOf('order') >= 0)
			handleSubMenuOrder();
		return;
	}

	const handleShowBlockSubMenu = () => {
		setIsShowBlockSubMenu(false)
	}

	const handleSubMenuBookId = () => {
		setDataSubMenu(
			[
				{
					to: "/book-id",
					classIcon: "icon-all-book",
					name: "Tất cả sách ID"
				},
				{
					to: "/book-id/create",
					classIcon: "icon-add-book",
					name: "Thêm sách ID"
				},
				{
					to: "/book-id-course",
					classIcon: "icon-all-course",
					name: "Khóa học sách ID"
				},
				{
					to: "/book-id-course/create",
					classIcon: "icon-add-course",
					name: "Thêm khóa học"
				},
			]
		)
	}

	// setDefaultMenu();

	return (
		<>
			<div className='layout-row'>
				<div
					id='aside'
					className='page-sidenav no-shrink bg-light nav-dropdown fade'
					aria-hidden='true'
				>
					<div className='sidenav h-100 modal-dialog bg-light block-side-bar-left'>
						<div className='navbar block-logo-home'>
							<a href='/' className='navbar-brand'>
								<img
									alt='LTTD'
									src="/assets/img/logo-ssstudy.svg"
								/>
								<span className='hidden-folded d-inline l-s-n-1x'>
									SSStudy
								</span>
							</a>
						</div>
						<div className='flex hover'>
							<div className='nav-active-text-primary' data-nav>
								{groupUser === 1 ? (
									<ul className='nav list-menu bg'>
								<li className={location.pathname === '/home' || location.pathname === '/' ? 'active' : ''} onClick={() => { setOpenMenu(null); setDataSubMenu([]); }}>
									<NavLink to={`/home`}>
										<i className="icon icon-dashboard"></i>
										<span className='nav-text'>Trang chủ</span>
									</NavLink>
								</li>
								<div className="line-bar"></div>

								{/* Sách */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('book') >= 0 && location.pathname.indexOf('book-id') < 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('book', handleSubMenuBook); }}>
										<i className="icon icon-book" alt="" />
										<span className='nav-text'>Sách</span>
										<i className={`dropdown-arrow ${openMenu === 'book' ? 'open' : ''}`} />
									</a>
									{openMenu === 'book' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Sách Id */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('book-id') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('book-id', handleSubMenuBookId); }}>
										<i className="icon icon-book" alt="" />
										<span className='nav-text'>Sách ID</span>
										<i className={`dropdown-arrow ${openMenu === 'book-id' ? 'open' : ''}`} />
									</a>
									{openMenu === 'book-id' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Mã form */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('iframe') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('iframe', handleSubMenuIframe); }}>
										<i className="icon icon-iframe" alt="" />
										<span className='nav-text'>Mã form</span>
										<i className={`dropdown-arrow ${openMenu === 'iframe' ? 'open' : ''}`} />
									</a>
									{openMenu === 'iframe' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Đề thi */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('exam') >= 0 && location.pathname.indexOf('exam-word') < 0 && location.pathname.indexOf('examv2') < 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('exam', handleSubMenuExam); }}>
										<i className="icon icon-exam" alt="" />
										<span className='nav-text'>Đề thi</span>
										<i className={`dropdown-arrow ${openMenu === 'exam' ? 'open' : ''}`} />
									</a>
									{openMenu === 'exam' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Đề thi mới */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('examv2') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('examv2', handleSubMenuExamNew); }}>
										<i className="icon icon-exam" alt="" />
										<span className='nav-text'>Đề thi mới</span>
										<i className={`dropdown-arrow ${openMenu === 'examv2' ? 'open' : ''}`} />
									</a>
									{openMenu === 'examv2' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Đề thi file Word */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('exam-word') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('exam-word', handleSubMenuExamWord); }}>
										<i className="icon icon-exam" alt="" />
										<span className='nav-text'>Đề thi file Word</span>
										<i className={`dropdown-arrow ${openMenu === 'exam-word' ? 'open' : ''}`} />
									</a>
									{openMenu === 'exam-word' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Bài học */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('lesson') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('lesson', handleSubMenuLesson); }}>
										<i className="icon icon-lesson" alt="" />
										<span className='nav-text'>Bài học</span>
										<i className={`dropdown-arrow ${openMenu === 'lesson' ? 'open' : ''}`} />
									</a>
									{openMenu === 'lesson' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Bài kiểm tra */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('testing') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('testing', handleSubMenuTest); }}>
										<i className="icon icon-lesson" alt="" />
										<span className='nav-text'>Bài kiểm tra</span>
										<i className={`dropdown-arrow ${openMenu === 'testing' ? 'open' : ''}`} />
									</a>
									{openMenu === 'testing' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Khóa học */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('classroom') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('classroom', handleSubMenuCourse); }}>
										<i className="icon icon-course" alt="" />
										<span className='nav-text'>Khóa học</span>
										<i className={`dropdown-arrow ${openMenu === 'classroom' ? 'open' : ''}`} />
									</a>
									{openMenu === 'classroom' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Nhãn */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('label') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('label', handleSubMenuLabel); }}>
										<i className="icon icon-lesson" alt="" />
										<span className='nav-text'>Nhãn</span>
										<i className={`dropdown-arrow ${openMenu === 'label' ? 'open' : ''}`} />
									</a>
									{openMenu === 'label' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Tài liệu */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('document') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('document', handleSubMenuRescources); }}>
										<i className="icon icon-document" />
										<span className='nav-text'>Tài liệu</span>
										<i className={`dropdown-arrow ${openMenu === 'document' ? 'open' : ''}`} />
									</a>
									{openMenu === 'document' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Thành viên */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('student') >= 0 || location.pathname.indexOf('admin') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('member', handleSubMenuMember); }}>
										<i className="icon icon-member" alt="" />
										<span className='nav-text'>Thành viên</span>
										<i className={`dropdown-arrow ${openMenu === 'member' ? 'open' : ''}`} />
									</a>
									{openMenu === 'member' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Đơn hàng */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('order') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('order', handleSubMenuOrder); }}>
										<i className="icon icon-order" alt="" />
										<span className='nav-text'>Đơn hàng</span>
										<i className={`dropdown-arrow ${openMenu === 'order' ? 'open' : ''}`} />
									</a>
									{openMenu === 'order' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Khuyến mãi */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('coupon') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('coupon', handleSubMenuCoupon); }}>
										<i className="icon icon-coupon" alt="" />
										<span className='nav-text'>Khuyến mãi</span>
										<i className={`dropdown-arrow ${openMenu === 'coupon' ? 'open' : ''}`} />
									</a>
									{openMenu === 'coupon' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Tin tức */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('blog') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('blog', handleSubMenuBlog); }}>
										<i className="icon icon-notify" alt="" />
										<span className='nav-text'>Tin tức</span>
										<i className={`dropdown-arrow ${openMenu === 'blog' ? 'open' : ''}`} />
									</a>
									{openMenu === 'blog' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Thông báo */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('message') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('message', handleSubMenuNotify); }}>
										<i className="icon icon-notify" alt="" />
										<span className='nav-text'>Thông báo</span>
										<i className={`dropdown-arrow ${openMenu === 'message' ? 'open' : ''}`} />
									</a>
									{openMenu === 'message' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Quản lý trang */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('settings') >= 0 || location.pathname.indexOf('intro-page') >= 0 || location.pathname.indexOf('teachers-team') >= 0 || location.pathname.indexOf('admin-ceo') >= 0 ? 'active head-line mb-24 pb-24' : 'head-line mb-24 pb-24'}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('settings', handleSubMenuSetting); }}>
										<i className="icon icon-setting" alt="" />
										<span className='nav-text'>Quản lý trang</span>
										<i className={`dropdown-arrow ${openMenu === 'settings' ? 'open' : ''}`} />
									</a>
									{openMenu === 'settings' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<React.Fragment key={idx}>
													<li className={location.pathname === item.to ? 'active' : ''}>
														<NavLink to={item.to} onClick={item.hasSubmenu ? (e) => { setIsShowIntroDropdown(!isShowIntroDropdown); } : undefined}>
															<i className={`icon ${item.classIcon}`} />
															<span className='nav-text'>{item.name}</span>
															{item.hasSubmenu && <i className={`dropdown-arrow sub ${isShowIntroDropdown ? 'open' : ''}`} />}
														</NavLink>
													</li>
													{item.hasSubmenu && isShowIntroDropdown && item.submenu && (
														<ul className="inline-dropdown-menu nested">
															{item.submenu.map((subItem, subIdx) => (
																<li key={subIdx} className={location.pathname === subItem.to ? 'active' : ''}>
																	<NavLink to={subItem.to}><i className={`icon ${subItem.classIcon}`} /><span className='nav-text'>{subItem.name}</span></NavLink>
																</li>
															))}
														</ul>
													)}
												</React.Fragment>
											))}
										</ul>
									)}
								</li>

								{/* Link thanh toán */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('quick-payments') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('quick-payments', handleSubMenuQuickPayment); }}>
										<i className="icon icon-exam" alt="" />
										<span className='nav-text'>Link thanh toán</span>
										<i className={`dropdown-arrow ${openMenu === 'quick-payments' ? 'open' : ''}`} />
									</a>
									{openMenu === 'quick-payments' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Giao dịch */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('credit-history') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('credit', handleSubMenuHistory); }}>
										<i className="icon icon-member" alt="" />
										<span className='nav-text'>Giao dịch</span>
										<i className={`dropdown-arrow ${openMenu === 'credit' ? 'open' : ''}`} />
									</a>
									{openMenu === 'credit' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Học phí */}
								<li className={`dropdown-menu-item ${location.pathname.indexOf('bill') >= 0 ? 'active' : ''}`}>
									<a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('bill', handleSubMenuTuition); }}>
										<i className="icon icon-tuition" alt="" />
										<span className='nav-text'>Học phí</span>
										<i className={`dropdown-arrow ${openMenu === 'bill' ? 'open' : ''}`} />
									</a>
									{openMenu === 'bill' && dataSubMenu.length > 0 && (
										<ul className="inline-dropdown-menu">
											{dataSubMenu.map((item, idx) => (
												<li key={idx} className={location.pathname === item.to ? 'active' : ''}>
													<NavLink to={item.to}><i className={`icon ${item.classIcon}`} /><span className='nav-text'>{item.name}</span></NavLink>
												</li>
											))}
										</ul>
									)}
								</li>

								{/* Thẻ - no submenu */}
								<li className={location.pathname.indexOf('check-card') >= 0 ? 'active' : ''}>
									<NavLink to={`/check-card`} onClick={() => { setOpenMenu(null); setDataSubMenu([]); }}>
										<i className="icon icon-card" alt="" />
										<span className='nav-text'>Thẻ</span>
									</NavLink>
								</li>

								{/* Chuyên cần - no submenu */}
								<li className={location.pathname.indexOf('diligence') >= 0 ? 'active' : ''}>
									<NavLink to={`/diligence`} onClick={() => { setOpenMenu(null); setDataSubMenu([]); }}>
										<i className="icon icon-diligence" alt="" />
										<span className='nav-text'>Chuyên cần</span>
									</NavLink>
								</li>
							</ul>
								) : (
									<ul className='nav bg'>
										<li className='nav-header hidden-folded'>
											<span className='text-muted'>
												Quản lý đào tạo
											</span>
										</li>
										<li>
											<NavLink
												activeStyle={{ color: "#448bff" }}
												to={`/exam`}
											>
												<span className='nav-icon text-primary'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='16'
														height='16'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='2'
														strokeLinecap='round'
														strokeLinejoin='round'
														className='feather feather-package mx-2'
													>
														<path d='M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z'></path>
														<polyline points='2.32 6.16 12 11 21.68 6.16'></polyline>
														<line
															x1='12'
															y1='22.76'
															x2='12'
															y2='11'
														></line>
														<line
															x1='7'
															y1='3.5'
															x2='17'
															y2='8.5'
														></line>
													</svg>
												</span>{" "}
												<span className='nav-text'>
													Kho đề thi
												</span>
											</NavLink>
										</li>

										<li>
											<NavLink
												activeStyle={{ color: "#448bff" }}
												to={`/question`}
											>
												<span className='nav-icon text-primary'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='16'
														height='16'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='2'
														strokeLinecap='round'
														strokeLinejoin='round'
														className='feather feather-bookmark mx-2'
													>
														<path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'></path>
													</svg>
												</span>{" "}
												<span className='nav-text'>
													Kho câu hỏi
												</span>
											</NavLink>
										</li>
									</ul>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className='layout-column flex' style={{ background: "#f5f5f5" }}>
					<div id='header' className='page-header'>
						<div className='navbar navbar-expand-lg'>
							<div className='nav navbar-menu block-avt-action'>
								<div className="notify">
									<span>
										<img src="/assets/img/icon-bell-yl.svg" alt="" />
									</span>
								</div>
								<div className='block-avatar dropdown'>
									<a
										href='/'
										data-toggle='dropdown'
										className='nav-link d-flex align-items-center px-2 text-color'
									>
										<span className="acc_name mr-24">{userInfo && userInfo.fullname ? userInfo.fullname : ""}</span>
										<span
											className='avatar w-48'
											style={{ margin: "-2px" }}
										>
											{
												userInfo && userInfo.avatar
													?
													<img
														src={CDN + userInfo.avatar}
														alt='...'
														style={{
															width: "100%",
															height: "100%",
														}}
													/>
													:
													<img
														src={"https://cdn.luyenthitiendat.vn/assets/img/no-avatar.png"}
														alt='...'
														style={{
															width: "100%",
															height: "100%",
														}}
													/>
											}
										</span>
									</a>
									<div className='dropdown-menu dropdown-menu-right w mt-3 animate fadeIn'>
										<a href='#' className='dropdown-item'>
											{/* <span>
												{!isNull(userInfo) &&
													!isUndefined(userInfo.fullname)
													? userInfo.fullname
													: "Admin"}
											</span>{" "} */}
											<span>{userInfo && userInfo.fullname ? userInfo.fullname : "Admin"}</span>
										</a>
										<a href='#' className='dropdown-item'>
											<span className='badge bg-success text-uppercase'>
												{userInfo && userInfo.user_group ? userInfo.user_group : "Admin"}
											</span>
										</a>
										<div className='dropdown-divider' />

										<Link
											to={"/profile"}
											className='dropdown-item'
										>
											Thông tin cá nhân
										</Link>

										<div className='dropdown-divider' />

										<Link
											to={"/changepassword"}
											className='dropdown-item'
										>
											Đổi mật khẩu
										</Link>

										<a
											className='dropdown-item'
											onClick={(e) => handleLogout(e)}
										>
											Đăng xuất
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className='flex'>
						<Switch>
							<PrivateRoute exact path={`/`} component={Home} />

							<PrivateRoute
								exact={true}
								path={`/classroom/review`}
								component={Review}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/review/create`}
								component={ReviewCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/review/:id/edit`}
								component={ReviewEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/book`}
								component={Book}
							/>
							<PrivateRoute
								exact={true}
								path={`/book/create`}
								component={BookCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/book/:id/edit`}
								component={BookEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/book/review`}
								component={BookReview}
							/>
							<PrivateRoute
								exact={true}
								path={`/book/review/create`}
								component={BookReviewCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/book/:book_id/review`}
								component={BookReview}
							/>

							<PrivateRoute
								exact={true}
								path={`/book/review/:review_id/edit`}
								component={BookReviewEdit}
							/>

							{/*<PrivateRoute*/}
							{/*	exact={true}*/}
							{/*	path={`/book-category`}*/}
							{/*	component={BookCategory}*/}
							{/*/>*/}
							{/*<PrivateRoute*/}
							{/*	exact={true}*/}
							{/*	path={`/book-category/create`}*/}
							{/*	component={BookCategoryCreate}*/}
							{/*/>*/}
							<PrivateRoute
								exact={true}
								path={`/book-category/:id/edit`}
								component={BookCategoryEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id`}
								component={BookId}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id/create`}
								component={BookIdCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id/:id/edit`}
								component={BookIdEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id/:id/code`}
								component={BookIdCode}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id/:id/member`}
								component={BookIdMember}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id-course`}
								component={BookIdCourse}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id-course/create`}
								component={BookIdCourseCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/book-id-course/:id/edit`}
								component={BookIdCourseEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/registration`}
								component={ListRegister}
							/>
							<PrivateRoute
								exact={true}
								path={`/registration/:id/edit`}
								component={RegisterEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/group`}
								component={ClassroomGroup}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/group/create`}
								component={ClassroomGroupCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/group/:id/edit`}
								component={ClassroomGroupEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/classroom-offline`}
								component={ClassroomOffline}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom-online`}
								component={Classroom}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/create`}
								component={ClassroomCreate}
							/>

							<PrivateRoute
								exact={true}
								path={`/classroom/:id/edit`}
								component={ClassroomEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/:id/code`}
								component={ClassroomCode}
							/>
							<PrivateRoute
								exact={true}
								path={`/classroom/:id/report`}
								component={ClassroomReport}
							/>

							<PrivateRoute
								exact={true}
								path={`/classroom/:id/member`}
								component={ClassroomMember}
							/>

							<PrivateRoute
								exact={true}
								path={`/iframe`}
								component={ListIframe}
							/>
							<PrivateRoute
								exact={true}
								path={`/iframe-create`}
								component={CreateIframe}
							/>
							<PrivateRoute
								exact={true}
								path={`/iframe-edit/:id`}
								component={CreateIframe}
							/>

							<PrivateRoute
								exact={true}
								path={`/student`}
								component={Student}
							/>
							<PrivateRoute
								exact={true}
								path={`/student/create`}
								component={StudentCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/student/:id/edit`}
								component={StudentEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/check-card`}
								component={CheckCard}
							/>
							<PrivateRoute
								exact={true}
								path={`/diligence`}
								component={Diligence}
							/>
							<PrivateRoute
								exact={true}
								path={`/diligence/detail`}
								component={DiligenceDetail}
							/>

							<PrivateRoute
								exact={true}
								path={`/admin`}
								component={Admin}
							/>
							<PrivateRoute
								exact={true}
								path={`/admin/create`}
								component={AdminCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/admin/:id/edit`}
								component={AdminEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/testing`}
								component={Testing}
							/>
							<PrivateRoute
								exact={true}
								path={`/testing/:id/edit`}
								component={TestingEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/test-url`}
								component={ExamTest}
							/>
							<PrivateRoute 
								exact={true}
								path={`/label`}
								component={LabelManagement}
							/>
							<PrivateRoute
								exact={true}
								path={`/label/assign/:labelId`}
								component={LabelAssign}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam`}
								component={Exam}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam/create`}
								component={ExamCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam/:id/edit`}
								component={ExamEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam/category`}
								component={ExamCategory}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam/category/create`}
								component={ExamCategoryCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam/category/:id/edit`}
								component={ExamCategoryEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam/:id/report`}
								component={ExamReport}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-v2/:id/report`}
								component={ExamV2Report}
							/>

							<PrivateRoute
								exact={true}
								path={`/examv2`}
								component={ExamList}
							/>
							<PrivateRoute
								exact={true}
								path={`/examv2/create`}
								component={ExamNewCreate}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word`}
								component={ExamWordList}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word/:id/report`}
								component={ExamWordReport}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word/create`}
								component={ExamWordCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam-word/edit`}
								component={ExamWordEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam-word/competition-part`}
								component={ExamWordCategory}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word/competition-part/:id/edit`}
								component={ExamWordCategoryEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word/exam-catalog`}
								component={ExamWordTestCategory}
							/>

							<PrivateRoute
								exact={true}
								path={`/exam-word/fast-gift`}
								component={FastGift}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam-word/fast-gift/:id/edit`}
								component={FastGiftEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam-word/fast-gift/create`}
								component={FastGiftEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/exam-word/category/:id/edit`}
								component={ExamWordTestCategoryEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/question`}
								component={Question}
							/>
							<PrivateRoute
								exact={true}
								path={`/question/create`}
								component={QuestionCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/question/:id/edit`}
								component={QuestionEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/changepassword`}
								component={Changepassword}
							/>
							<PrivateRoute
								exact={true}
								path={`/profile`}
								component={Profile}
							/>

							<PrivateRoute
								exact={true}
								path={`/subject`}
								component={Subject}
							/>
							<PrivateRoute
								exact={true}
								path={`/subject/create`}
								component={subjectCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/subject/:id/edit`}
								component={SubjectEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/chapter`}
								component={Chapter}
							/>
							<PrivateRoute
								exact={true}
								path={`/chapter/create`}
								component={ChapterCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/chapter/:id/edit`}
								component={chapterEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/lesson`}
								component={Category}
							/>
							<PrivateRoute
								exact={true}
								path={`/lesson/create`}
								component={CategoryCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/lesson/:id/edit`}
								component={CategoryEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/document`}
								component={Document}
							/>
							<PrivateRoute
								exact={true}
								path={`/document/create`}
								component={DocumentCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/document/:id/edit`}
								component={DocumentEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/document-category`}
								component={DocumentCategory}
							/>
							<PrivateRoute
								exact={true}
								path={`/document-category/create`}
								component={DocumentCategoryCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/document-category/:id/edit`}
								component={DocumentCategoryEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/settings`}
								component={Setting}
							/>
							<PrivateRoute
								exact={true}
								path={`/settings/home-page`}
								component={SettingHomePage}
							/>
							<PrivateRoute
								exact={true}
								path={`/settings/intro-page`}
								component={IntroPage}
							/>
							<PrivateRoute
								exact={true}
								path={`/message`}
								component={Message}
							/>
							<PrivateRoute
								exact={true}
								path={`/message/create`}
								component={MessageCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/message/:id/edit`}
								component={MessageEdit}
							/>
							<PrivateRoute
								exact={true}
								path={`/schedule`}
								component={Schedule}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill`}
								component={Bill}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill-refund`}
								component={BillRefund}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill/create`}
								component={BillCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/bill/:id/edit`}
								component={BillEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill-report`}
								component={BillReport}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill-refund/create`}
								component={BillRefundCreate}
							/>

							<PrivateRoute
								exact={true}
								path={`/bill-refund/:id/edit`}
								component={BillRefundUpdate}
							/>


							<PrivateRoute
								exact={true}
								path={`/home`}
								component={Home}
							/>

							{/* <PrivateRoute
								exact={true}
								path={`/blog`}
								component={Blog}
							/> */}

							<PrivateRoute
								exact={true}
								path={`/adult-evaluation`}
								component={AdultEvaluation}
							/>
							<PrivateRoute
								exact={true}
								path={`/adult-evaluation/create`}
								component={AdultEvaluationCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/adult-evaluation/:id/edit`}
								component={AdultEvaluationCreate}
							/>

							<PrivateRoute
								exact={true}
								path={`/blog`}
								component={Blog}
							/>

							<PrivateRoute
								exact={true}
								path={`/blog/create`}
								component={BlogCreate}
							/>

							<PrivateRoute
								exact={true}
								path={`/blog/:id/edit`}
								component={BlogEdit}
							/>


							<PrivateRoute
								exact={true}
								path={`/blog-category`}
								component={BlogCategory}
							/>
							<PrivateRoute
								exact={true}
								path={`/blog-category/create`}
								component={BlogCategoryCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/blog-category/:id/edit`}
								component={BlogCategoryEdit}
							/>

							<PrivateRoute
								exact={true}
								path={`/credit`}
								component={Credit}
							/>

							<PrivateRoute
								exact={true}
								path={`/order`}
								component={Order}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-pending`}
								component={OrderPending}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-paid`}
								component={OrderPaid}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-success`}
								component={OrderSuccess}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-processing`}
								component={OrderProcessing}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-shipping`}
								component={OrderShipping}
							/>

							<PrivateRoute
								exact={true}
								path={`/order-cancelled`}
								component={OrderCancelled}
							/>

							<PrivateRoute
								exact={true}
								path={`/order/:id/details`}
								component={OrderDetails}
							/>
							<PrivateRoute
								exact={true}
								path={`/report-bug`}
								component={ReportBug}
							/>
							<PrivateRoute
								exact={true}
								path={`/coupon`}
								component={Coupon}
							/>
							<PrivateRoute
								exact={true}
								path={`/credit-history`}
								component={CreditHistory}
							/>

							<PrivateRoute
								exact={true}
								path={`/quick-payments`}
								component={QuickPayments}
							/>

							<PrivateRoute
								exect={true}
								path={`/quick-payments/create`}
								component={LinkPaymentCreate}
							/>
							<PrivateRoute
								exact={true}
								path={`/teachers-team`}
								component={TeachersTeam}
							/>
							<PrivateRoute
								exact={true}
								path={`/admin-ceo`}
								component={AdminCeo}
							/>
						</Switch>
					</div>
					<div id='footer' className='page-footer'>
						<div className='d-flex p-3'>
							<span className='text-sm text-muted flex'>
								© 2022 CÔNG TY TNHH ĐÀO TẠO VÀ PHÁT TRIỂN GIÁO DỤC ĐẠI CỒ VIỆT. Tất cả các quyền được bảo lưu.
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const mapStateToProps = (state) => ({
	token: state.token,
	user: state.auth.user,
	isAuthenticated: state.auth.isAuthenticated,
	userInfo: state.auth.userInfo
});

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ logout, loadUser, showProfile }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Master));
