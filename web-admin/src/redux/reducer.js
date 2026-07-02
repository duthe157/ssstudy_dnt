import authReducer from "./auth/reducer";
import videoReducer from "./video/reducer";
import questionReducer from "./question/reducer";
import ExamReducer from "./exam/reducer";
import NewExamReducer from "./examv2/reducer";
import ExamWordReducer from "./examword/reducer";
import TestingReducer from "./testing/reducer";
import StudentReducer from "./student/reducer";
import SubjectReducer from "./subject/reducer";
import ChapterReducer from "./chapter/reducer";
import CategoryReducer from "./category/reducer";
import ClassroomReducer from "./classroom/reducer";
import DocumentReducer from "./document/reducer";
import RegistrationReducer from "./register/reducer";
import settingReducer from "./setting/reducer";
import messageReducer from "./message/reducer";
import billReducer from "./bill/reducer";
import scheduleReducer from "./schedule/reducer";
import { combineReducers } from "redux";
import CommentReducer from "./comment/reducer";
import classroomgroupReducer from "./classroomgroup/reducer";
import reviewReducer from "./review/reducer";
import bookReducer from "./book/reducer";
import BookReviewReducer from "./book-review/reducer";
import adultevaluationReducer from './adultEvaluation/reducer';
import BlogReducer from './blog/reducer';
import CreditReducer from './credit/reducer';
import OrderReducer from './order/reducer';
import BookCategoryReducer from './bookcategory/reducer';
import ExamCategoryReducer from './examcategory/reducer';
import ExamWordCategoryReducer from './examwordcategory/reducer';
import ExamWordTestCategoryReducer from './examwordtestcategory/reducer';
import ReportBugReducer from './bug/reducer';
import CouponReducer from './coupon/reducer';
import DashboardReducer from './home/reducer';
import FileReducer from './file/reducer';
import BlogCateroryReducer from './blogCategory/reducer';
import IframeReducer from './iframe/reducer';
import paymentLinks from './paymentLinks/reducer';
import createPaymentLinks from './linkPaymentCreate/reducer';
import fastGiftReducer from './fastGift/reducer';
import bookIdReducer from './book-id/reducer';
import bookIdCourseReducer from './book-id-course/reducer';
import labelReducer from './label/reducer';

const allReducers = combineReducers({
	auth: authReducer,
	video: videoReducer,
	question: questionReducer,
	exam: ExamReducer,
	examV2: NewExamReducer,
	examWord: ExamWordReducer,
	testing: TestingReducer,
	student: StudentReducer,
	subject: SubjectReducer,
	chapter: ChapterReducer,
	category: CategoryReducer,
	classroom: ClassroomReducer,
	document: DocumentReducer,
	register: RegistrationReducer,
	setting: settingReducer,
	message: messageReducer,
	bill: billReducer,
	schedule: scheduleReducer,
	comment: CommentReducer,
	classroomGroup: classroomgroupReducer,
	review: reviewReducer,
	book: bookReducer,
	bookId: bookIdReducer,
	adultEvals: adultevaluationReducer,
	blog: BlogReducer,
	credit: CreditReducer,
	order: OrderReducer,
	bookCategory: BookCategoryReducer,
	examCategory: ExamCategoryReducer,
	examWordCategory: ExamWordCategoryReducer,
	examWordTestCategory: ExamWordTestCategoryReducer,
	reportBug: ReportBugReducer,
	bookReview: BookReviewReducer,
	coupon: CouponReducer,
	dashboard: DashboardReducer,
	file: FileReducer,
	fastGift: fastGiftReducer,
	blogCategory: BlogCateroryReducer,
	iframe: IframeReducer,
	paymentLinks: paymentLinks,
	createPaymentLinks: createPaymentLinks,
	bookIdCourse: bookIdCourseReducer,
	label: labelReducer,
});

export default allReducers;
