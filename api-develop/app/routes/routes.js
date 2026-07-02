const express = require("express");
const CheckToken = require("./CheckToken");
const CheckScope = require("./CheckScope");
const BaseHelper = require("../helpers/BaseHelper");

// Include Controllers
const AuthController = require("../controllers/AuthController");
const CategoryController = require("../controllers/CategoryController");
const ReviewController = require("../controllers/ReviewController");
const BillController = require("../controllers/BillController");
const ChapterController = require("../controllers/ChapterController");
const ClassroomController = require("../controllers/ClassroomController");
const ClassroomScheduleController = require("../controllers/ClassroomScheduleController");
const DocumentController = require("../controllers/DocumentController");
const DocumentCategoryController = require("../controllers/DocumentCategoryController");
const ExamController = require("../controllers/ExamController");
const MessageController = require("../controllers/MessageController");
const QuestionController = require("../controllers/QuestionController");
const RegistrationController = require("../controllers/RegistrationController");
const SettingController = require("../controllers/SettingController");
const SubjectController = require("../controllers/SubjectController");
const TestingController = require("../controllers/TestingController");
const UserController = require("../controllers/UserController");
const AppController = require("../controllers/AppController");
const ClassroomGroupController = require("../controllers/ClassroomGroupController");
const ClassroomReviewController = require("../controllers/ClassroomReviewController");
const BookController = require("../controllers/BookController");
const BookIdController = require("../controllers/BookIdController");
const BookIdCourseController = require("../controllers/BookIdCourseController");
const BookCategoryController = require("../controllers/BookCategoryController");
const BookReviewController = require("../controllers/BookReviewController");
const AdultEvalutionController = require("../controllers/AdultEvalutionController");
const BlogController = require("../controllers/BlogController");
const BlogCategoryController = require("../controllers/BlogCategoryController");
const CreditController = require("../controllers/CreditController");
const OrderController = require("../controllers/OrderController");
const ExamCategoryController = require("../controllers/ExamCategoryController");
const CartController = require("../controllers/CartController");
const ReportBugController = require("../controllers/ReportBugController");
const CouponController = require("../controllers/CouponController");
const ReportController = require("../controllers/ReportController");
const AboutController = require("../controllers/AboutController");
const PageController = require("../controllers/PageController");
const FileController = require("../controllers/FileController");
const IframeController = require("../controllers/IframeController");
const TeachersTeamController = require('../controllers/TeachersTeamController');
const ClassroomChapterSubjectController = require("../controllers/ClassroomChapterSubjectController");
const DocxQuestionController = require("../controllers/DocxQuestionController");
// Include new controllers
const DocxPandocController = require("../controllers/DocxPandocController ");
const DocPdfTextController = require("../controllers/DocPdfTextController");
const ExamWordController = require("../controllers/ExamWordController");
const CompetitionPartController = require("../controllers/CompetitionPartController");
const QuestionWordController = require("../controllers/QuestionWordController");
const CeoPageController = require("../controllers/CeoPageController");
const SearchHistoryController = require("../controllers/SearchHistoryControlller");
const LoggingMiddleware = require("../helpers/LoggingMiddleware");
const ActionLogController = require("../controllers/ActionLogController");
const LabelController = require("../controllers/LabelController");
const LabelItemController = require("../controllers/LabelItemController");

// const ClassroomChapterSubjectController = require("../controllers/ClassroomChapterSubjectController");
// MyController
const MyBillController = require("../controllers/MyBillController");
const MyMessageController = require("../controllers/MyMessageController");
const MyClassroomController = require("../controllers/MyClassroomController");
const MyTestingController = require("../controllers/MyTestingController");
const Exam_v2Controller = require("../controllers/Exam_v2Controller");

const FastGiftController = require("../controllers/FastGiftController");
// Link payments
const LinkPaymentController = require("../controllers/LinkPaymentsController")

const router = express.Router();
const config = require("../../config/config");
const appConfig = require("../../config/app");

const publicRoutes = [
  "book-id/detail",
  "book-id/list-public",
  "document/show",
  "document/list-related",
  "document/list-public",
  "document-category/list-public",
  "competition-part/list",
  "exam-word/list",
  "auth/signin",
  "auth/google-auth",
  "hook/payment",
  "auth/signup",
  "auth/signup-iframe",
  "setting/website",
  "user/forgot-password",
  "forgot-password",
  "user/solienlac",
  "registration/create",
  "exam/get-pre-exam",
  "testing/send",
  "question/pre-answer",
  "review/list",
  "review/achievementBoard",
  "app-configs",
  "group/classrooms",
  "classroom-view",
  "classroom-chapter-category",
  "classroom-reviews",
  "classroom-list",
  "subject-list",
  "chapter-list",
  "category-list",
  "teacher-list",
  "exam-list",
  "classroom-group-list",
  "user/view",
  "homepage",
  "home-page",
  "home-page-mobile",
  "about",
  "order/create",
  "order/payment-info",
  "book/view",
  "book/list-book",
  "book/detail",
  "book/list-category",
  "book/list-reviews",
  "book/list-related",
  "exam-category/list",
  "testing/result",
  "coupon-list",
  "exam-category-list",
  "search",
  "magazine-list",
  "exam-download-s3",
  "add-user-to-classroom",
  "blog/view",
  "blog/list-public",
  "blog/list-student-story",
  "blog/list-filter",
  "blog/top-categories-posts",
  "blog-category/list",
  "blog/detail",
  "blog-category/list-public",
  "blog-category/list-with-count",
  "blog/latest-by-category",
  "blog/featured-by-category",
  "blog/random-by-category-exclude",
  "blog-category/detail",
  "iframe/detail",
  "auth/send-verification-email",
  "auth/verify-email",
  "link-payment/detail",
  "order/create_order_paymentLink",
  "order/payment_payos",
  "order/payos_detail_order",
  "order/payos_update_order",
  "link-payment/update",
  "link-payment/update-status",
  "link-payment/update_user",
  "credit/payos_hook",
  "book/detail",
  "classroom/detail",
  "document/detail",
  // endpoint temporary
  // "link-payment/create",
  // "link-payment/statistics",
  // "link-payment/list",
  "subject/list",
  "docx-question/upload",
  "exam-word",
  "about/detail",
  'blog/detail',
  'teachers-team/detail',
  'adult-evalution/list',
  "ceo-page/detail",
  "label/list-public"
];

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appConfig.LOCAL.DIR_TEMP);
  },
});

const upload = multer({
  storage: storage,
  fieldSize: 50 * 1024 * 1024,
  fileSize: 50 * 1024 * 1024,
});

router.use(BaseHelper.trimBody, async (req, res, next) => {
  next();
});

router.use(async (req, res, next) => {
  const pathRequest = req.path.replace("/1.0/", "/");
  const pathParams = _.split(pathRequest, "/");
  const controllerName = pathParams[1] ? pathParams[1] : "";
  const action = pathParams[2] ? pathParams[2] : "";
  let _path = controllerName;
  if (action) _path += "/" + action;
  const isPublic = parseInt(publicRoutes.indexOf(_path));
  if (isPublic < 0) {
    const checkToken = new CheckToken(req, isPublic);
    let isValid = await checkToken.verify();
    if (!isValid) {
      return response(res, {}, "Bạn không được phép truy cập.", 401);
    }
    const checkScope = new CheckScope(req, res);
    isValid = await checkScope.handle();
    if (!isValid)
      return response(res, {}, "Bạn không có quyền.", statusCode.FORBIDDEN);
  }

  next();
});

// Add logging middleware after authentication
router.use(LoggingMiddleware.middleware());
//Lấy thông tin đề thi theo ID(Admin)
router.post("/page/search-id", async (req, res) => {
  await BookIdController["search"](req, res, req.body);
  return;
});
router.get("/exam-word/detail/get-by-id", async (req, res) => {
  await ExamWordController["detail"](req, res, req.query);
  return;
});
router.post("/ceo-page/detail", async (req, res) => {
  await CeoPageController["detail"](req, res, req.body);
  return;
});
router.post("/ceo-page/update", async (req, res) => {
  await CeoPageController["update"](req, res, req.body);
  return;
});
// Lấy danh sách các đề thi
router.post("/exam-word/list", async (req, res) => {
  await ExamWordController["list"](req, res, req.body);
  return;
});
router.post("/exam-word/list-practice", async (req, res) => {
  await ExamWordController["listPractice"](req, res, req.body);
  return;
});
router.post("/exam-word/check-password", async (req, res) => {
  await ExamWordController["checkPassword"](req, res, req.body);
  return;
});
router.post("/exam-word/check-answer", async (req, res) => {
  await ExamWordController["checkAnswer"](req, res, req.body);
  return;
});
router.post("/exam-word/classrooms", async (req, res) => {
  await ExamWordController["classrooms"](req, res, req.body);
  return;
});
// Sao chép đề thi theo ID (Admin)
router.post('/exam-word/clone', async (req, res) => {
  await ExamWordController['clone'](req, res, req.body);
  return;
});

// Lấy đề thi theo ID (User)
router.get("/exam-word/get-by-id", async (req, res) => {
  await ExamWordController["getById"](req, res, req.query);
  return;
});

router.post("/exam-word/create", async (req, res) => {
  await ExamWordController["create"](req, res, req.body);
  return;
});

router.post("/exam-word/update", async (req, res) => {
  await ExamWordController["update"](req, res, req.body);
  return;
});

router.post("/exam-word/delete", async (req, res) => {
  await ExamWordController["delete"](req, res, req.body);
  return;
});
router.post("/exam-word/scoring", async (req, res) => {
  await ExamWordController["scoring"](req, res, req.body);
  return;
});

router.post("/exam-word/explanation", async (req, res) => {
  await ExamWordController["explanation"](req, res, req.body);
  return;
});

router.post("/exam-word/report", async (req, res) => {
  await ExamWordController["report"](req, res, req.body);
  return;
});
router.post("/exam-word/export", async (req, res) => {
  await ExamWordController["exportWord"](req, res, req.body);
  return;
});
// New Routes for CompetitionPartController
router.post("/competition-part/list", async (req, res) => {
  await CompetitionPartController["list"](req, res, req.body);
  return;
});

router.post("/competition-part/detail", async (req, res) => {
  await CompetitionPartController["detail"](req, res, req.body);
  return;
});

router.post("/competition-part/create", async (req, res) => {
  await CompetitionPartController["create"](req, res, req.body);
  return;
});

router.post("/competition-part/update", async (req, res) => {
  await CompetitionPartController["update"](req, res, req.body);
  return;
});

router.post("/competition-part/delete", async (req, res) => {
  await CompetitionPartController["delete"](req, res, req.body);
  return;
});

// New Routes for QuestionWordController

router.post("/question-word/detail", async (req, res) => {
  await QuestionWordController["detail"](req, res, req.body);
  return;
});

router.post("/question-word/create", async (req, res) => {
  await QuestionWordController["create"](req, res, req.body);
  return;
});

router.put("/question-word/update", async (req, res) => {
  await QuestionWordController["update"](req, res, req.body);
  return;
});

router.delete("/question-word/delete", async (req, res) => {
  await QuestionWordController["delete"](req, res, req.body);
  return;
});

router.post("/about", async (req, res) => {
  await AppController["about"](req, res, req.body);
  return;
});

router.post("/search", async (req, res) => {
  await AppController["search"](req, res, req.body);
  return;
});

router.post("/add-user-to-classroom", async (req, res) => {
  await AppController["addUserToClassroom"](req, res, req.body);
  return;
});

/**---BEGIN PUBLIC ROUTE----*/

router.post("/file/upload", upload.any(), async (req, res) => {
  await FileController["upload"](req, res, req.body);
  return;
});

router.post(
  "/docx/upload",
  upload.single("docxFile"),
  async (req, res) => {
    await DocxQuestionController.uploadDocx(req, res, req.body);
    return;
  }
);
router.post(
  "/pdf/upload",
  upload.single("PdfFile"),
  async (req, res) => {
    await DocPdfTextController.uploadPdf(req, res, req.body);
    return;
  }
);
router.post(
  "/docx-question/upload",
  upload.single("docxFile"),
  async (req, res) => {
    await DocxPandocController.uploadDocx(req, res, req.body);
    return;
  }
);
router.post("/page/update", async (req, res) => {
  await PageController["update"](req, res, req.body);
  return;
});

router.post("/page/detail", async (req, res) => {
  await PageController["detail"](req, res, req.body);
  return;
});

// About page
router.post("/about/detail", async (req, res) => {
  await AboutController["detail"](req, res, req.body);
  return;
});
router.post("/about/banner/update", async (req, res) => {
  await AboutController["updateBanner"](req, res, req.body);
  return;
});
router.post("/about/update", async (req, res) => {
  await AboutController["update"](req, res, req.body);
  return;
});
router.post("/about/introductions", async (req, res) => {
  await AboutController["listIntroductions"](req, res, req.body);
  return;
});
router.post("/about/introduction/upsert", async (req, res) => {
  await AboutController["upsertIntroduction"](req, res, req.body);
  return;
});
router.post("/about/introduction/delete", async (req, res) => {
  await AboutController["deleteIntroduction"](req, res, req.body);
  return;
});
router.post("/about/histories", async (req, res) => {
  await AboutController["listHistories"](req, res, req.body);
  return;
});
router.post("/about/history/upsert", async (req, res) => {
  await AboutController["upsertHistory"](req, res, req.body);
  return;
});
router.post("/about/history/delete", async (req, res) => {
  await AboutController["deleteHistory"](req, res, req.body);
  return;
});

router.post("/user/view", async (req, res) => {
  await UserController["view"](req, res, req.body);
  return;
});

router.post("/app/dashboard", async (req, res) => {
  await AppController["dashboard"](req, res, req.body);
  return;
});

router.get("/home-page", async (req, res) => {
  await AppController["homePage"](req, res, req.body);
  return;
});

router.post("/homepage", async (req, res) => {
  await AppController["homepage"](req, res, req.body);
  return;
});

router.get("/home-page-mobile", async (req, res) => {
  await AppController["homePageMobile"](req, res, req.body);
  return;
});

router.post("/classroom/update-relate", async (req, res) => {
  await ClassroomController["updateRelate"](req, res, req.body);
  return;
});

router.post("/classroom-view", async (req, res) => {
  await ClassroomController["view"](req, res, req.body);
  return;
});

router.post("/classroom-reviews", async (req, res) => {
  await ClassroomReviewController["reviews"](req, res, req.body);
  return;
});

router.post("/classroom-by-group", async (req, res) => {
  await ClassroomGroupController["listByGroup"](req, res, req.body);
  return;
});

router.post("/classroom-list", async (req, res) => {
  await ClassroomController["listPublic"](req, res, req.body);
  return;
});

router.get("/classroom-group-list", async (req, res) => {
  await ClassroomGroupController["listPublic"](req, res, req.body);
  return;
});

router.post("/classroom-group-list", async (req, res) => {
  await ClassroomGroupController["listClassroomGroup"](req, res, req.body);
  return;
});

router.get("/classroom-list", async (req, res) => {
  await ClassroomController["listPublic"](req, res, req.body);
  return;
});

router.post("/classroom-chapter-category", async (req, res) => {
  await ClassroomController["listChapterCategory"](req, res, req.body);
  return;
});

router.post("/classroom/list-chapter", async (req, res) => {
  await ClassroomController["listChapter"](req, res, req.body);
  return;
});

/** END PUBLIC ROUTES */

router.post("/forgot-password", async (req, res) => {
  await UserController["forgottenPass"](req, res, req.body);
  return;
});

router.post("/auth/signup", async (req, res) => {
  await AuthController["signup"](req, res, req.body);
  return;
});

router.post("/auth/signup-iframe", async (req, res) => {
  await AuthController["signup_2"](req, res, req.body);
  return;
});

router.post("/auth/signin", async (req, res) => {
  await AuthController["signin"](req, res, req.body);
  return;
});

router.post("/auth/google-auth", async (req, res) => {
  await AuthController["signInGoogle"](req, res, req.body);
  return;
});

router.post("/auth/userinfo", async (req, res) => {
  await AuthController["userinfo"](req, res, req.body);
  return;
});

router.post("/adult-evalution/list", async (req, res) => {
  await AdultEvalutionController["list"](req, res, req.body);
  return;
});
router.post("/adult-evalution/detail", async (req, res) => {
  await AdultEvalutionController["detail"](req, res, req.body);
  return;
});
router.post("/adult-evalution/create", async (req, res) => {
  await AdultEvalutionController["create"](req, res, req.body);
  return;
});
router.post("/adult-evalution/update", async (req, res) => {
  await AdultEvalutionController["update"](req, res, req.body);
  return;
});
router.post("/adult-evalution/delete", async (req, res) => {
  await AdultEvalutionController["delete"](req, res, req.body);
  return;
});

router.post("/coupon-list", async (req, res) => {
  await CouponController["listPublic"](req, res, req.body);
  return;
});

router.post("/coupon/list", async (req, res) => {
  await CouponController["list"](req, res, req.body);
  return;
});
router.post("/coupon/detail", async (req, res) => {
  await CouponController["detail"](req, res, req.body);
  return;
});
router.post("/coupon/create", async (req, res) => {
  await CouponController["create"](req, res, req.body);
  return;
});
router.post("/coupon/update", async (req, res) => {
  await CouponController["update"](req, res, req.body);
  return;
});
router.post("/coupon/delete", async (req, res) => {
  await CouponController["delete"](req, res, req.body);
  return;
});

router.post("/report-bug/list", async (req, res) => {
  await ReportBugController["list"](req, res, req.body);
  return;
});
router.post("/report-bug/detail", async (req, res) => {
  await ReportBugController["detail"](req, res, req.body);
  return;
});
router.post("/report-bug/create", async (req, res) => {
  await ReportBugController["create"](req, res, req.body);
  return;
});
router.post("/report-bug/update", async (req, res) => {
  await ReportBugController["update"](req, res, req.body);
  return;
});
router.post("/report-bug/delete", async (req, res) => {
  await ReportBugController["delete"](req, res, req.body);
  return;
});

router.post("/credit/list", async (req, res) => {
  await CreditController["list"](req, res, req.body);
  return;
});
router.post("/credit/detail", async (req, res) => {
  await CreditController["detail"](req, res, req.body);
  return;
});
router.post("/credit/payos_detail_order", async (req, res) => {
  await CreditController["payOSDetailOrder"](req, res, req.body);
  return;
});
router.post("/credit/payos_update_order", async (req, res) => {
  await CreditController["payOSUpdateOrder"](req, res, req.body);
  return;
});

router.post("/credit/create", async (req, res) => {
  await CreditController["create"](req, res, req.body);
  return;
});
router.post("/credit/payment", async (req, res) => {
  await CreditController["payment"](req, res, req.body);
  return;
});
router.post("/credit/payment_payos", async (req, res) => {
  await CreditController["paymentPayOS"](req, res, req.body);
  return;
});
router.post("/credit/update", async (req, res) => {
  await CreditController["update"](req, res, req.body);
  return;
});
router.post("/credit/delete", async (req, res) => {
  await CreditController["delete"](req, res, req.body);
  return;
});

router.post("/credit/payos_hook", async (req, res) => {
  await CreditController["payOSHook"](req, res, req.body);
  return;
});

router.post("/hook/payment", async (req, res) => {
  await CreditController["hook"](req, res, req.body);
  return;
});

router.get("/hook/payment", async (req, res) => {
  await CreditController["hook"](req, res, req.body);
  return;
});

/** CART **/
router.post("/cart/count", async (req, res) => {
  await CartController["count"](req, res, req.body);
  return;
});

router.post("/cart/apply-coupon", async (req, res) => {
  await CartController["applyCoupon"](req, res, req.body);
  return;
});

router.post("/cart/remove-coupon", async (req, res) => {
  await CartController["removeCoupon"](req, res, req.body);
  return;
});

router.post("/cart/detail", async (req, res) => {
  await CartController["detail"](req, res, req.body);
  return;
});
router.post("/cart/list-product-by-type", async (req, res) => {
  await CartController["listProductByType"](req, res, req.body);
  return;
});
router.post("/cart/product-group", async (req, res) => {
  await CartController["productGroup"](req, res, req.body);
  return;
});
router.post("/cart/update", async (req, res) => {
  await CartController["update"](req, res, req.body);
  return;
});
router.post("/cart/update-info", async (req, res) => {
  await CartController["updateInfo"](req, res, req.body);
  return;
});
router.post("/cart/add", async (req, res) => {
  await CartController["add"](req, res, req.body);
  return;
});
router.post("/cart/delete", async (req, res) => {
  await CartController["delete"](req, res, req.body);
  return;
});

router.post("/order/list", async (req, res) => {
  await OrderController["list"](req, res, req.body);
  return;
});
router.post("/order/detail", async (req, res) => {
  await OrderController["detail"](req, res, req.body);
  return;
});
router.post("/order/payos_detail_order", async (req, res) => {
  await OrderController["payOSDetailOrder"](req, res, req.body);
  return;
});
router.post("/order/payos_update_order", async (req, res) => {
  await OrderController["payOSUpdateOrder"](req, res, req.body);
  return;
});

router.post("/order/create", async (req, res) => {
  await OrderController["create"](req, res, req.body);
  return;
});
router.post("/order/payment", async (req, res) => {
  await OrderController["payment"](req, res, req.body);
  return;
});
router.post("/order/payment-info", async (req, res) => {
  await OrderController["paymentInfo"](req, res, req.body);
  return;
});
router.post("/order/payment_payos", async (req, res) => {
  await OrderController["paymentPayOs"](req, res, req.body);
  return;
});
router.post("/order/update", async (req, res) => {
  await OrderController["update"](req, res, req.body);
  return;
});
router.post("/order/update-status", async (req, res) => {
  await OrderController["updateStatus"](req, res, req.body);
  return;
});
router.post("/order/delete", async (req, res) => {
  await OrderController["delete"](req, res, req.body);
  return;
});

router.post('/order/create_order_paymentLink', async (req, res) => {
  await OrderController['createOrderPaymentLink'](req, res, req.body);
  return;
});

router.post("/magazine/list", async (req, res) => {
  await BlogController["list"](req, res, req.body);
  return;
});
router.post("/magazine-list", async (req, res) => {
  await BlogController["listPublic"](req, res, req.body);
  return;
});
router.post("/magazine/detail", async (req, res) => {
  await BlogController["detail"](req, res, req.body);
  return;
});
router.post("/magazine/create", async (req, res) => {
  await BlogController["create"](req, res, req.body);
  return;
});
router.post("/magazine/update", async (req, res) => {
  await BlogController["update"](req, res, req.body);
  return;
});
router.post("/magazine/delete", async (req, res) => {
  await BlogController["delete"](req, res, req.body);
  return;
});

router.post("/blog/list", async (req, res) => {
  await BlogController["list"](req, res, req.body);
  return;
});
router.post("/blog-list", async (req, res) => {
  await BlogController["listPublic"](req, res, req.body);
  return;
});
router.post("/blog/detail", async (req, res) => {
  await BlogController["detail"](req, res, req.body);
  return;
});
router.post("/blog/create", async (req, res) => {
  await BlogController["create"](req, res, req.body);
  return;
});
router.post("/blog/update", async (req, res) => {
  await BlogController["update"](req, res, req.body);
  return;
});
router.post("/blog/delete", async (req, res) => {
  await BlogController["delete"](req, res, req.body);
  return;
});

router.post("/blog/view", async (req, res) => {
  await BlogController["view"](req, res, req.body);
  return;
});

router.post("/blog/list-public", async (req, res) => {
  await BlogController["listPublic"](req, res, req.body);
  return;
});
router.post("/blog/list-student-story", async (req, res) => {
  await BlogController["listStudentStory"](req, res, req.body);
  return;
});

router.post("/blog/list-filter", async (req, res) => {
  await BlogController["listFilter"](req, res, req.body);
  return;
});

router.post("/blog/top-categories-posts", async (req, res) => {
  await BlogController["topCategoriesPosts"](req, res, req.body);
  return;
});

router.post("/blog/latest-by-category", async (req, res) => {
  await BlogController["latestByCategory"](req, res, req.body);
  return;
});

router.post("/blog/featured-by-category", async (req, res) => {
  await BlogController["featuredByCategory"](req, res, req.body);
  return;
});

router.post("/blog/random-by-category-exclude", async (req, res) => {
  await BlogController["randomByCategoryExclude"](req, res, req.body);
  return;
});

router.post("/blog-category/list", async (req, res) => {
  await BlogCategoryController["list"](req, res, req.body);
  return;
});
router.post("/blog-category/list-public", async (req, res) => {
  await BlogCategoryController["listPublic"](req, res, req.body);
  return;
});
router.post("/blog-category/list-with-count", async (req, res) => {
  await BlogCategoryController["listWithCountPublic"](req, res, req.body);
  return;
});
router.get("/blog-category/student/list", async (req, res) => {
  await BlogCategoryController["listStudent"](req, res, req.query);
  return;
});
router.post("/blog-category/detail", async (req, res) => {
  await BlogCategoryController["detail"](req, res, req.body);
  return;
});
router.post("/blog-category/create", async (req, res) => {
  await BlogCategoryController["create"](req, res, req.body);
  return;
});
router.post("/blog-category/update", async (req, res) => {
  await BlogCategoryController["update"](req, res, req.body);
  return;
});
router.post("/blog-category/delete", async (req, res) => {
  await BlogCategoryController["delete"](req, res, req.body);
  return;
});

// Route Classroom

router.post("/book-review/list-review", async (req, res) => {
  await BookReviewController["listReview"](req, res, req.body);
  return;
});


router.post("/book-review/list", async (req, res) => {
  await BookReviewController["list"](req, res, req.body);
  return;
});
router.post("/book-review/create", async (req, res) => {
  await BookReviewController["create"](req, res, req.body);
  return;
});
router.post("/book-review/detail", async (req, res) => {
  await BookReviewController["detail"](req, res, req.body);
  return;
});
router.post("/book-review/update", async (req, res) => {
  await BookReviewController["update"](req, res, req.body);
  return;
});
router.post("/book-review/delete", async (req, res) => {
  await BookReviewController["delete"](req, res, req.body);
  return;
});

router.post("/book-review/send-review", async (req, res) => {
  await BookReviewController["sendReview"](req, res, req.body);
  return;
});

router.post("/book/update-relate", async (req, res) => {
  await BookController["updateRelate"](req, res, req.body);
  return;
});

router.post("/book/update-meta-data", async (req, res) => {
  await BookController["updateMetaData"](req, res, req.body);
  return;
});

router.post("/book/list", async (req, res) => {
  await BookController["list"](req, res, req.body);
  return;
});
router.post("/book/list-related", async (req, res) => {
  await BookController["listRelated"](req, res, req.body);
  return;
});
router.post("/book/detail", async (req, res) => {
  await BookController["detail"](req, res, req.body);
  return;
});
router.post("/book/create", async (req, res) => {
  await BookController["create"](req, res, req.body);
  return;
});
router.post("/book/update", async (req, res) => {
  await BookController["update"](req, res, req.body);
  return;
});
router.post("/book/delete", async (req, res) => {
  await BookController["delete"](req, res, req.body);
  return;
});

router.post("/book/view", async (req, res) => {
  await BookController["view"](req, res, req.body);
  return;
});

router.post("/book/list-book", async (req, res) => {
  await BookController["listBook"](req, res, req.body);
  return;
});
router.post("/book/list-category", async (req, res) => {
  await BookCategoryController["listCategory"](req, res, req.body);
  return;
});

router.post("/book-id/list", async (req, res) => {
  await BookIdController["list"](req, res, req.body);
  return;
});
router.post("/book-id/list-public", async (req, res) => {
  await BookIdController["listPublic"](req, res, req.body);
  return;
});
router.post("/book-id/list-related", async (req, res) => {
  await BookIdController["listRelated"](req, res, req.body);
  return;
});
router.post("/book-id/detail", async (req, res) => {
  await BookIdController["detail"](req, res, req.body);
  return;
});
router.post("/book-id/create", async (req, res) => {
  await BookIdController["create"](req, res, req.body);
  return;
});
router.post("/book-id/get-noti", async (req, res) => {
  await BookIdController["getExpiringBooks"](req, res, req.body);
  return;
});
router.post("/book-id/update", async (req, res) => {
  await BookIdController["update"](req, res, req.body);
  return;
});
router.post("/book-id/delete", async (req, res) => {
  await BookIdController["delete"](req, res, req.body);
  return;
});
router.post("/book-id/update-meta-data", async (req, res) => {
  await BookIdController["updateMetaData"](req, res, req.body);
  return;
});
router.post("/book-id/access-by-code", async (req, res) => {
  await BookIdController["accessByCode"](req, res, req.body);
  return;
});
router.post("/book-id-course/list-owned", async (req, res) => {
  await BookIdCourseController["listUserCoursesFromBooks"](req, res, req.body);
  return;
});
router.get("/book-id-course/next-item-code/:id", async (req, res) => {
  await BookIdCourseController["getNextItemCode"](req, res, req.params);
  return;
});
router.post(
  "/book-id/generate-access-code",
  upload.any(),
  async (req, res) => {
    await BookIdController["generateAccessCode"](req, res, req.body);
    return;
  }
);

router.post("/book-id/codes", upload.any(), async (req, res) => {
  await BookIdController["codes"](req, res, req.body);
  return;
});

router.post("/book-id/export-code", upload.any(), async (req, res) => {
  await BookIdController["exportCode"](req, res, req.body);
  return;
});
router.post("/book-id/delete-code", async (req, res) => {
  await BookIdController["deleteCode"](req, res, req.body);
  return;
});
router.post("/book-id/list-member", async (req, res) => {
  await BookIdController["listMember"](req, res, req.body);
  return;
});
router.post("/book-id/remove-member", async (req, res) => {
  await BookIdController["removeMember"](req, res, req.body);
  return;
});
router.post("/book-id/info-export", async (req, res) => {
  await BookIdController["getInfo"](req, res, req.body);
  return;
});
router.post("/book-id/export-test", async (req, res) => {
  await BookIdController["exportDocx"](req, res, req.body);
  return;
});
router.post("/book-id-course/list", async (req, res) => {
  await BookIdCourseController["list"](req, res, req.body);
  return;
});
router.post("/book-id-course/list-public", async (req, res) => {
  await BookIdCourseController["listPublic"](req, res, req.body);
  return;
});
router.post("/book-id-course/list-related", async (req, res) => {
  await BookIdCourseController["listRelated"](req, res, req.body);
  return;
});
router.post("/book-id-course/detail", async (req, res) => {
  await BookIdCourseController["detail"](req, res, req.body);
  return;
});
router.post("/book-id-course/create", async (req, res) => {
  await BookIdCourseController["create"](req, res, req.body);
  return;
});
router.post("/book-id-course/add-chapter", async (req, res) => {
  await BookIdCourseController["addChapter"](req, res, req.body);
  return;
});
router.post("/book-id-course/remove-chapter", async (req, res) => {
  await BookIdCourseController["removeChapter"](req, res, req.body);
  return;
});
router.post("/book-id-course/update-group-chapter", async (req, res) => {
  await BookIdCourseController["UpdateGroupChapter"](req, res, req.body);
  return;
});
router.post("/book-id-course/update", async (req, res) => {
  await BookIdCourseController["update"](req, res, req.body);
  return;
});
router.post("/book-id-course/update-meta-data", async (req, res) => {
  await BookIdCourseController["updateMetaData"](req, res, req.body);
  return;
});
router.post("/book-id-course/delete", async (req, res) => {
  await BookIdCourseController["delete"](req, res, req.body);
  return;
});
router.post("/book-id-course/view", async (req, res) => {
  await BookIdCourseController["view"](req, res, req.body);
  return;
});
router.post("/book-category/list", async (req, res) => {
  await BookCategoryController["list"](req, res, req.body);
  return;
});
router.post("/book-category/detail", async (req, res) => {
  await BookCategoryController["detail"](req, res, req.body);
  return;
});
router.post("/book-category/create", async (req, res) => {
  await BookCategoryController["create"](req, res, req.body);
  return;
});
router.post("/book-category/update", async (req, res) => {
  await BookCategoryController["update"](req, res, req.body);
  return;
});
router.post("/book-category/delete", async (req, res) => {
  await BookCategoryController["delete"](req, res, req.body);
  return;
});

// Route Classroom
router.post("/classroom-group/list", async (req, res) => {
  await ClassroomGroupController["list"](req, res, req.body);
  return;
});
router.post("/classroom-group/detail", async (req, res) => {
  await ClassroomGroupController["detail"](req, res, req.body);
  return;
});
router.post("/classroom-group/create", async (req, res) => {
  await ClassroomGroupController["create"](req, res, req.body);
  return;
});
router.post("/classroom-group/update", async (req, res) => {
  await ClassroomGroupController["update"](req, res, req.body);
  return;
});
router.post("/classroom-group/delete", async (req, res) => {
  await ClassroomGroupController["delete"](req, res, req.body);
  return;
});

router.post("/classroom-review/list", async (req, res) => {
  await ClassroomReviewController["list"](req, res, req.body);
  return;
});
router.post("/classroom-review/create", async (req, res) => {
  await ClassroomReviewController["create"](req, res, req.body);
  return;
});
router.post("/classroom-review/detail", async (req, res) => {
  await ClassroomReviewController["detail"](req, res, req.body);
  return;
});
router.post("/classroom-review/update", async (req, res) => {
  await ClassroomReviewController["update"](req, res, req.body);
  return;
});
router.post("/classroom-review/delete", async (req, res) => {
  await ClassroomReviewController["delete"](req, res, req.body);
  return;
});

router.post("/classroom-review/send-review", async (req, res) => {
  await ClassroomReviewController["sendReview"](req, res, req.body);
  return;
});

router.post("/classroom-schedule/list", async (req, res) => {
  await ClassroomScheduleController["list"](req, res, req.body);
  return;
});

router.post("/classroom-schedule/create", upload.any(), async (req, res) => {
  await ClassroomScheduleController["create"](req, res, req.body);
  return;
});

router.post("/classroom-schedule/update", upload.any(), async (req, res) => {
  await ClassroomScheduleController["update"](req, res, req.body);
  return;
});

router.post("/classroom-schedule/delete", async (req, res) => {
  await ClassroomScheduleController["delete"](req, res, req.body);
  return;
});

router.post("/classroom-schedule/detail", async (req, res) => {
  await ClassroomScheduleController["detail"](req, res, req.body);
  return;
});

router.post("/classroom-chapter-subject/list", async (req, res) => {
  await ClassroomChapterSubjectController["list"](req, res, req.body);
  return;
});

router.post("/classroom-chapter-subject/upsert", async (req, res) => {
  await ClassroomChapterSubjectController["update"](req, res, req.body);
  return;
});

// Route Classroom
router.post("/classroom/list", async (req, res) => {
  await ClassroomController["list"](req, res, req.body);
  return;
});

router.post("/classroom/create", upload.any(), async (req, res) => {
  await ClassroomController["create"](req, res, req.body);
  return;
});

router.post("/classroom/update", upload.any(), async (req, res) => {
  await ClassroomController["update"](req, res, req.body);
  return;
});

router.post("/classroom/update-meta-data", upload.any(), async (req, res) => {
  await ClassroomController["updateMetaData"](req, res, req.body);
  return;
});

router.post("/classroom/delete", async (req, res) => {
  await ClassroomController["delete"](req, res, req.body);
  return;
});

router.post("/classroom/detail", async (req, res) => {
  await ClassroomController["detail"](req, res, req.body);
  return;
});

router.post("/classroom/members", async (req, res) => {
  await ClassroomController["members"](req, res, req.body);
  return;
});

router.post("/classroom/list-member", async (req, res) => {
  await ClassroomController["listMember"](req, res, req.body);
  return;
});

router.post("/classroom/overview", async (req, res) => {
  await ClassroomController["overview"](req, res, req.body);
  return;
});

router.post("/classroom/access-by-code", async (req, res) => {
  await ClassroomController["accessByCode"](req, res, req.body);
  return;
});

router.post(
  "/classroom/generate-access-code",
  upload.any(),
  async (req, res) => {
    await ClassroomController["generateAccessCode"](req, res, req.body);
    return;
  }
);

router.post("/classroom/codes", upload.any(), async (req, res) => {
  await ClassroomController["codes"](req, res, req.body);
  return;
});

router.post("/classroom/export-code", upload.any(), async (req, res) => {
  await ClassroomController["exportCode"](req, res, req.body);
  return;
});

router.post("/classroom/report", async (req, res) => {
  await ClassroomController["report"](req, res, req.body);
  return;
});

router.post("/classroom/add-member", async (req, res) => {
  await ClassroomController["addMember"](req, res, req.body);
  return;
});

router.post("/classroom/add-member-by-file", upload.any(), async (req, res) => {
  await ClassroomController["addMemberByFile"](req, res, req.body);
  return;
});

router.post("/classroom/remove-member", async (req, res) => {
  await ClassroomController["removeMember"](req, res, req.body);
  return;
});

router.post("/classroom/update-lesson-view-month", async (req, res) => {
  await ClassroomController["updateLessonViewMonth"](req, res, req.body);
  return;
});

router.post("/classroom/update-buoihoc", async (req, res) => {
  await ClassroomController["updateBuoihoc"](req, res, req.body);
  return;
});

router.post("/classroom/diff-buoi-da-hoc", async (req, res) => {
  await ClassroomController["diffBuoiDaHoc"](req, res, req.body);
  return;
});

router.post("/classroom/check-classroom-attend", async (req, res) => {
  await ClassroomController["checkClassroomAttend"](req, res, req.body);
  return;
});

router.post("/classroom/check-attend", async (req, res) => {
  await ClassroomController["checkAttend"](req, res, req.body);
  return;
});

router.post("/classroom/delete-code", async (req, res) => {
  await ClassroomController["deleteCode"](req, res, req.body);
  return;
});

router.post("/classroom/list-chapter", async (req, res) => {
  await ClassroomController["listChapter"](req, res, req.body);
  return;
});

router.get("/chapter-list", async (req, res) => {
  await ChapterController["listPublic"](req, res, req.body);
  return;
});

router.post("/classroom/list-chapter-category", async (req, res) => {
  await ClassroomController["listChapterCategory"](req, res, req.body);
  return;
});
router.post("/classroom/list-related", async (req, res) => {
  await ClassroomController["listRelated"](req, res, req.body);
  return;
});
router.post("/classroom/add-chapter", async (req, res) => {
  await ClassroomController["addChapter"](req, res, req.body);
  return;
});

router.post("/classroom/add-category", async (req, res) => {
  await ClassroomController["addCategory"](req, res, req.body);
  return;
});
router.post("/classroom/update-group-chapter", async (req, res) => {
  await ClassroomController["UpdateGroupChapter"](req, res, req.body);
  return;
});
router.post("/classroom/remove-category", async (req, res) => {
  await ClassroomController["removeCategory"](req, res, req.body);
  return;
});

router.post("/classroom/remove-chapter", async (req, res) => {
  await ClassroomController["removeChapter"](req, res, req.body);
  return;
});

router.post("/classroom/update-position", async (req, res) => {
  await ClassroomController["updatePosition"](req, res, req.body);
  return;
});

router.post("/classroom/update-category", async (req, res) => {
  await ClassroomController["updateCategory"](req, res, req.body);
  return;
});

// Route Review
router.get("/review/achievementBoard", async (req, res) => {
  await ReviewController["achievementBoard"](req, res);
  return;
});

router.post("/review/list", async (req, res) => {
  await ReviewController["list"](req, res, req.body);
  return;
});

router.post("/review/detail", async (req, res) => {
  await ReviewController["detail"](req, res, req.body);
  return;
});

router.post("/review/create", upload.any(), async (req, res) => {
  await ReviewController["create"](req, res, req.body);
  return;
});

router.post("/review/updates", upload.any(), async (req, res) => {
  await ReviewController["updates"](req, res, req.body);
  return;
});

router.post("/review/updateReview", upload.any(), async (req, res) => {
  await ReviewController["updateReview"](req, res, req.body);
  return;
});

router.post("/review/delete", async (req, res) => {
  await ReviewController["delete"](req, res, req.body);
  return;
});

// Route Category
router.post("/category/list", async (req, res) => {
  await CategoryController["list"](req, res, req.body);
  return;
});

router.post("/category/detail", async (req, res) => {
  await CategoryController["detail"](req, res, req.body);
  return;
});

router.post("/category/create", upload.any(), async (req, res) => {
  await CategoryController["create"](req, res, req.body);
  return;
});

router.post("/category/update", upload.any(), async (req, res) => {
  await CategoryController["update"](req, res, req.body);
  return;
});

router.post("/category/update-meta-data", upload.any(), async (req, res) => {
  await CategoryController["updateMetaData"](req, res, req.body);
  return;
});

router.post("/category/ordering", upload.any(), async (req, res) => {
  await CategoryController["ordering"](req, res, req.body);
  return;
});

router.post("/category/delete", async (req, res) => {
  await CategoryController["delete"](req, res, req.body);
  return;
});

router.post("/category/add-exam", async (req, res) => {
  await CategoryController["addExam"](req, res, req.body);
  return;
});

router.post("/category/remove-exam", async (req, res) => {
  await CategoryController["removeExam"](req, res, req.body);
  return;
});

router.post("/category/list-exam", async (req, res) => {
  await CategoryController["listExam"](req, res, req.body);
  return;
});

router.post("/category/list-video", async (req, res) => {
  await CategoryController["listVideo"](req, res, req.body);
  return;
});
router.post("/category/create-video", async (req, res) => {
  await CategoryController["createVideo"](req, res, req.body);
  return;
});
router.post("/category/update-video", async (req, res) => {
  await CategoryController["updateVideo"](req, res, req.body);
  return;
});
router.post("/category/delete-video", async (req, res) => {
  await CategoryController["deleteVideo"](req, res, req.body);
  return;
});
router.post("/category/view-video", async (req, res) => {
  await CategoryController["viewVideo"](req, res, req.body);
  return;
});

router.post("/category/register-livestream", async (req, res) => {
  await CategoryController["registerLivestream"](req, res, req.body);
  return;
});

// Route Chapter
router.post("/chapter/list", async (req, res) => {
  await ChapterController["list"](req, res, req.body);
  return;
});

router.post("/chapter/detail", async (req, res) => {
  await ChapterController["detail"](req, res, req.body);
  return;
});

router.post("/chapter/create", upload.any(), async (req, res) => {
  await ChapterController["create"](req, res, req.body);
  return;
});

router.post("/chapter/copy", upload.any(), async (req, res) => {
  await ChapterController["copy"](req, res, req.body);
  return;
});

router.post("/chapter/update", upload.any(), async (req, res) => {
  await ChapterController["update"](req, res, req.body);
  return;
});

router.post("/chapter/update-meta-data", upload.any(), async (req, res) => {
  await ChapterController["updateMetaData"](req, res, req.body);
  return;
});

router.post("/chapter/ordering", upload.any(), async (req, res) => {
  await ChapterController["ordering"](req, res, req.body);
  return;
});

router.post("/chapter/delete", async (req, res) => {
  await ChapterController["delete"](req, res, req.body);
  return;
});

// Route Document
router.post("/document-category/list", async (req, res) => {
  await DocumentCategoryController["list"](req, res, req.body);
  return;
});

router.post("/document-category/list-public", async (req, res) => {
  await DocumentCategoryController["listCategory"](req, res, req.body);
  return;
});

router.post("/document-category/detail", async (req, res) => {
  await DocumentCategoryController["detail"](req, res, req.body);
  return;
});

router.post("/document-category/create", upload.any(), async (req, res) => {
  await DocumentCategoryController["create"](req, res, req.body);
  return;
});

router.post("/document-category/update", upload.any(), async (req, res) => {
  await DocumentCategoryController["update"](req, res, req.body);
  return;
});

router.post("/document-category/delete", async (req, res) => {
  await DocumentCategoryController["delete"](req, res, req.body);
  return;
});

// Route Document
router.post("/document/list", async (req, res) => {
  await DocumentController["list"](req, res, req.body);
  return;
});

router.post("/document/list-related", async (req, res) => {
  await DocumentController["listRelated"](req, res, req.body);
  return;
});

router.post("/document/list-public", async (req, res) => {
  await DocumentController["listPublic"](req, res, req.body);
  return;
});

router.post("/document/detail", async (req, res) => {
  await DocumentController["detail"](req, res, req.body);
  return;
});
router.post("/document/show", async (req, res) => {
  await DocumentController["show"](req, res, req.body);
  return;
});
router.post("/document/create", upload.any(), async (req, res) => {
  await DocumentController["create"](req, res, req.body);
  return;
});

router.post("/document/update", upload.any(), async (req, res) => {
  await DocumentController["update"](req, res, req.body);
  return;
});

router.post("/document/delete", async (req, res) => {
  await DocumentController["delete"](req, res, req.body);
  return;
});

// Route Exam
router.get("/exam-list", async (req, res) => {
  await ExamController["listPublic"](req, res, req.body);
  return;
});

router.post("/exam/list", async (req, res) => {
  await ExamController["list"](req, res, req.body);
  return;
});

router.post("/exam/copy", async (req, res) => {
  await ExamController["copy"](req, res, req.body);
  return;
});

router.post("/exam/bulk-update-video-vimeo-question", async (req, res) => {
  await ExamController["bulkUpdateVideoVimeoQuestion"](req, res, req.body);
  return;
});

router.post("/exam/get-pre-exam", async (req, res) => {
  await ExamController["getPreExam"](req, res, req.body);
  return;
});

router.get("/exam-download-s3", async (req, res) => {
  await ExamController["downloadExamS3"](req, res, req.body);
  return;
});

router.post("/exam/detail", async (req, res) => {
  await ExamController["detail"](req, res, req.body);
  return;
});

router.post("/exam/create", upload.any(), async (req, res) => {
  await ExamController["create"](req, res, req.body);
  return;
});

router.post("/exam/preview-api", upload.any(), async (req, res) => {
  await ExamController["createByApi"](req, res, req.body);
  return;
});

router.post("/exam/update", upload.any(), async (req, res) => {
  await ExamController["update"](req, res, req.body);
  return;
});

router.post("/exam/delete", async (req, res) => {
  await ExamController["delete"](req, res, req.body);
  return;
});

router.post("/exam/count-pending", async (req, res) => {
  await ExamController["countPending"](req, res, req.body);
  return;
});

router.post("/exam/report", async (req, res) => {
  await ExamController["report"](req, res, req.body);
  return;
});

router.post("/exam/export-point-excel", upload.any(), async (req, res) => {
  await ExamController["exportPointExcel"](req, res, req.body);
  return;
});

router.post("/exam/preview", async (req, res) => {
  await ExamController["preview"](req, res, req.body);
  return;
});

router.post("/exam/classrooms", async (req, res) => {
  await ExamController["classrooms"](req, res, req.body);
  return;
});

router.post("/exam/add-classroom", async (req, res) => {
  await ExamController["addClassroom"](req, res, req.body);
  return;
});

router.post("/exam/remove-classroom", async (req, res) => {
  await ExamController["removeClassroom"](req, res, req.body);
  return;
});

router.post("/exam/import-result", upload.any(), async (req, res) => {
  await ExamController["importResult"](req, res, req.body);
  return;
});

router.post("/exam/send", upload.any(), async (req, res) => {
  await ExamController["send"](req, res, req.body);
  return;
});

router.post("/exam-category-list", async (req, res) => {
  await ExamCategoryController["listPublic"](req, res, req.body);
  return;
});

router.post("/exam-category/list", async (req, res) => {
  await ExamCategoryController["list"](req, res, req.body);
  return;
});
router.post("/exam-word-category/list", async (req, res) => {
  await ExamCategoryController["listWord"](req, res, req.body);
  return;
});
router.post("/exam-category/detail", async (req, res) => {
  await ExamCategoryController["detail"](req, res, req.body);
  return;
});
router.post("/exam-category/create", async (req, res) => {
  await ExamCategoryController["create"](req, res, req.body);
  return;
});
router.post("/exam-category/update", async (req, res) => {
  await ExamCategoryController["update"](req, res, req.body);
  return;
});
router.post("/exam-category/delete", async (req, res) => {
  await ExamCategoryController["delete"](req, res, req.body);
  return;
});

// Route Message
router.post("/message/list", async (req, res) => {
  await MessageController["list"](req, res, req.body);
  return;
});

router.post("/message/detail", async (req, res) => {
  await MessageController["detail"](req, res, req.body);
  return;
});

router.post("/message/create", upload.any(), async (req, res) => {
  await MessageController["create"](req, res, req.body);
  return;
});

router.post("/message/update", upload.any(), async (req, res) => {
  await MessageController["update"](req, res, req.body);
  return;
});

router.post("/message/delete", async (req, res) => {
  await MessageController["delete"](req, res, req.body);
  return;
});

router.post("/message/my", async (req, res) => {
  await MessageController["newMy"](req, res, req.body);
  return;
});

router.post("/message/send", upload.any(), async (req, res) => {
  await MessageController["newSend"](req, res, req.body);
  return;
});

router.post("/message/total-unread", async (req, res) => {
  await MessageController["totalUnread"](req, res, req.body);
  return;
});

// Route Question
router.post("/question/list", async (req, res) => {
  await QuestionController["list"](req, res, req.body);
  return;
});

router.post("/question/detail", async (req, res) => {
  await QuestionController["detail"](req, res, req.body);
  return;
});

router.post("/question/create", upload.any(), async (req, res) => {
  await QuestionController["create"](req, res, req.body);
  return;
});

router.post("/question/update", upload.any(), async (req, res) => {
  await QuestionController["update"](req, res, req.body);
  return;
});

router.post("/question/delete", async (req, res) => {
  await QuestionController["delete"](req, res, req.body);
  return;
});

router.post("/question/answer", async (req, res) => {
  await QuestionController["answer"](req, res, req.body);
  return;
});

router.post("/question/pre-answer", async (req, res) => {
  await QuestionController["preAnswer"](req, res, req.body);
  return;
});

router.post("/question/classrooms", async (req, res) => {
  await QuestionController["classrooms"](req, res, req.body);
  return;
});

router.post("/question/get-video", async (req, res) => {
  await QuestionController["getVideo"](req, res, req.body);
  return;
});

router.post("/question/upload", upload.any(), async (req, res) => {
  await QuestionController["upload"](req, res, req.body);
  return;
});

// Route Registration
router.post("/registration/list", async (req, res) => {
  await RegistrationController["list"](req, res, req.body);
  return;
});

router.post("/registration/detail", async (req, res) => {
  await RegistrationController["detail"](req, res, req.body);
  return;
});

router.post("/registration/create", upload.any(), async (req, res) => {
  await RegistrationController["create"](req, res, req.body);
  return;
});

router.post("/registration/update", upload.any(), async (req, res) => {
  await RegistrationController["update"](req, res, req.body);
  return;
});

router.post("/registration/delete", async (req, res) => {
  await RegistrationController["delete"](req, res, req.body);
  return;
});

// Route Setting
router.post("/setting/detail", async (req, res) => {
  await SettingController["detail"](req, res, req.body);
  return;
});

router.post("/setting/website", async (req, res) => {
  await SettingController["website"](req, res, req.body);
  return;
});

router.post("/setting/update", upload.any(), async (req, res) => {
  await SettingController["update"](req, res, req.body);
  return;
});

router.post("/subject-list", async (req, res) => {
  await SubjectController["listPublic"](req, res, req.body);
  return;
});

// Route Subject
router.post("/subject/list", async (req, res) => {
  await SubjectController["list"](req, res, req.body);
  return;
});

router.post("/subject/detail", async (req, res) => {
  await SubjectController["detail"](req, res, req.body);
  return;
});

router.post("/subject/create", upload.any(), async (req, res) => {
  await SubjectController["create"](req, res, req.body);
  return;
});

router.post("/subject/update", upload.any(), async (req, res) => {
  await SubjectController["update"](req, res, req.body);
  return;
});

router.post("/subject/delete", async (req, res) => {
  await SubjectController["delete"](req, res, req.body);
  return;
});

// Route Testing
router.post("/testing/list", async (req, res) => {
  await TestingController["list"](req, res, req.body);
  return;
});

router.post("/testing/result", async (req, res) => {
  await TestingController["result"](req, res, req.body);
  return;
});

router.post("/testing/detail", async (req, res) => {
  await TestingController["detail"](req, res, req.body);
  return;
});

router.post("/testing/send", upload.any(), async (req, res) => {
  await TestingController["sendPreTest"](req, res, req.body);
  return;
});

router.post("/testing/create", upload.any(), async (req, res) => {
  await TestingController["create"](req, res, req.body);
  return;
});

router.post("/testing/update", upload.any(), async (req, res) => {
  await TestingController["update"](req, res, req.body);
  return;
});

router.post("/testing/update-point", upload.any(), async (req, res) => {
  await TestingController["updatePoint"](req, res, req.body);
  return;
});

router.post("/testing/classroom", async (req, res) => {
  await TestingController["classroom"](req, res, req.body);
  return;
});

router.post("/testing/delete", async (req, res) => {
  await TestingController["delete"](req, res, req.body);
  return;
});

// Route User
router.post("/user/list", async (req, res) => {
  await UserController["list"](req, res, req.body);
  return;
});

router.post("/user/admins", async (req, res) => {
  await UserController["admins"](req, res, req.body);
  return;
});

router.post("/user/accountants", async (req, res) => {
  await UserController["accountants"](req, res, req.body);
  return;
});

router.post("/user/detail", async (req, res) => {
  await UserController["detail"](req, res, req.body);
  return;
});


router.get("/user/student-detail", async (req, res) => {
  await UserController["getStudentDetail"](req, res, req.query);
  return;
});

router.post("/user/check-code", async (req, res) => {
  await UserController["checkCode"](req, res, req.body);
  return;
});

router.post("/user/create", upload.any(), async (req, res) => {
  await UserController["create"](req, res, req.body);
  return;
});

router.post("/user/update", upload.any(), async (req, res) => {
  await UserController["update"](req, res, req.body);
  return;
});

router.post("/user/update-point", upload.any(), async (req, res) => {
  await UserController["updatePoint"](req, res, req.body);
  return;
});

router.post("/user/profile", async (req, res) => {
  await UserController["profile"](req, res, req.body);
  return;
});

router.post("/user/update-profile", upload.any(), async (req, res) => {
  await UserController["updateProfile"](req, res, req.body);
  return;
});

router.post("/user/update-tag-device", upload.any(), async (req, res) => {
  await UserController["updateTagDevice"](req, res, req.body);
  return;
});

router.post("/user/delete", async (req, res) => {
  await UserController["delete"](req, res, req.body);
  return;
});

router.post("/user/forgotten-pass", async (req, res) => {
  await UserController["forgottenPass"](req, res, req.body);
  return;
});

router.post("/user/reset-password", async (req, res) => {
  await UserController["resetPassword"](req, res, req.body);
  return;
});

router.post("/user/remove-account", async (req, res) => {
  await UserController["removeAccount"](req, res, req.body);
  return;
});

router.post("/user/change-password", async (req, res) => {
  await UserController["changePassword"](req, res, req.body);
  return;
});

router.post("/user/rank", async (req, res) => {
  await UserController["rank"](req, res, req.body);
  return;
});

router.post("/user/statistic", async (req, res) => {
  await UserController["statistic"](req, res, req.body);
  return;
});

router.post("/user/hot-reset-password", async (req, res) => {
  await UserController["hotResetPassword"](req, res, req.body);
  return;
});

router.post("/user/force-activate", async (req, res) => {
  await UserController["forceActivate"](req, res, req.body);
  return;
});

router.get("/teacher-list", async (req, res) => {
  await UserController["listTeacher"](req, res, req.body);
  return;
});

router.post("/teacher-list", async (req, res) => {
  await UserController["listTeacher"](req, res, req.body);
  return;
});

router.post("/user/bills", async (req, res) => {
  await UserController["bills"](req, res, req.body);
  return;
});

router.post("/user/solienlac", async (req, res) => {
  await UserController["solienlac"](req, res, req.body);
  return;
});

router.post("/user/by-code", async (req, res) => {
  await UserController["byCode"](req, res, req.body);
  return;
});

router.get("/user/get-admin-manager", async (req, res) => {
  await UserController["getAdminManager"](req, res, req.body);
  return
})

// Route Bill
router.post("/bill/list", async (req, res) => {
  await BillController["list"](req, res, req.body);
  return;
});

router.post("/bill/export-excel", async (req, res) => {
  await BillController["exportExcel"](req, res, req.body);
  return;
});

router.post("/bill/list-by-user", async (req, res) => {
  await BillController["listByUser"](req, res, req.body);
  return;
});

router.post("/bill/list-history", async (req, res) => {
  await BillController["listHistory"](req, res, req.body);
  return;
});

router.post("/bill/detail", async (req, res) => {
  await BillController["detail"](req, res, req.body);
  return;
});

router.post("/bill/create", upload.any(), async (req, res) => {
  await BillController["create"](req, res, req.body);
  return;
});

router.post("/bill/update", upload.any(), async (req, res) => {
  await BillController["update"](req, res, req.body);
  return;
});

router.post("/bill/delete", async (req, res) => {
  await BillController["delete"](req, res, req.body);
  return;
});

router.post("/bill/report", async (req, res) => {
  await BillController["report"](req, res, req.body);
  return;
});

router.get("/bill/report", async (req, res) => {
  await BillController["report"](req, res, req.body);
  return;
});

router.get("/app-configs", async (req, res) => {
  await AppController["configs"](req, res, req.body);
  return;
});

router.post("/report/revenue-by-staff", async (req, res) => {
  await ReportController["revenueByStaff"](req, res, req.body);
  return;
});

router.post("/report/revenue-by-subject", async (req, res) => {
  await ReportController["revenueBySubject"](req, res, req.body);
  return;
});

router.post("/report/revenue-by-company", async (req, res) => {
  await ReportController["revenueByCompany"](req, res, req.body);
  return;
});

//MyRoutes
router.post("/my-message/list", async (req, res) => {
  await MyMessageController["list"](req, res, req.body);
  return;
});

router.post("/my-message/detail", async (req, res) => {
  await MyMessageController["detail"](req, res, req.body);
  return;
});

router.post("/my-bill/list", async (req, res) => {
  await MyBillController["list"](req, res, req.body);
  return;
});

router.post("/my-bill/detail", async (req, res) => {
  await MyBillController["detail"](req, res, req.body);
  return;
});

router.post("/my-testing/list", async (req, res) => {
  await MyTestingController["list"](req, res, req.body);
  return;
});

router.post("/my-testing/detail", async (req, res) => {
  await MyTestingController["detail"](req, res, req.body);
  return;
});

router.post("/my-classroom/list", async (req, res) => {
  await MyClassroomController["list"](req, res, req.body);
  return;
});

router.post("/my-classroom/overview", async (req, res) => {
  await MyClassroomController["overview"](req, res, req.body);
  return;
});

router.post("/my-classroom/detail", async (req, res) => {
  await MyClassroomController["detail"](req, res, req.body);
  return;
});

router.post("/my-classroom/list-chapter", async (req, res) => {
  await MyClassroomController["listChapter"](req, res, req.body);
  return;
});

router.post("/my-classroom/list-chapter-lesson", async (req, res) => {
  await MyClassroomController["listChapterCategory"](req, res, req.body);
  return;
});

router.post("/my-classroom/list-chapter-lesson2", async (req, res) => {
  await MyClassroomController["listChapterCategory2"](req, res, req.body);
  return;
});

router.post("/iframe/list", async (req, res) => {
  await IframeController["list"](req, res, req.body);
  return;
});

router.post("/iframe/create", async (req, res) => {
  await IframeController["create"](req, res, req.body);
  return;
});

router.post("/iframe/update", async (req, res) => {
  await IframeController["update"](req, res, req.body);
  return;
});

router.post("/iframe/delete", async (req, res) => {
  await IframeController["delete"](req, res, req.body);
  return;
});

router.post("/iframe/detail", async (req, res) => {
  await IframeController["detail"](req, res, req.body);
  return;
});

router.post("/auth/send-verification-email", async (req, res) => {
  await AuthController["sendVerifyEmail"](req, res, req.body);
  return;
});

router.post("/auth/verify-email", async (req, res) => {
  await AuthController["verifyTokenEmail"](req, res, req.body);
  return;
});

router.post("/exam/v2/create", async (req, res) => {
  await Exam_v2Controller["create"](req, res, req.body);
  return;
});

router.post("/exam/v2/update", async (req, res) => {
  await Exam_v2Controller["update"](req, res, req.body);
  return;
});

router.post("/exam/section/create", async (req, res) => {
  await Exam_v2Controller["createSectionInExamManual"](req, res, req.body);
  return;
});

router.post("/exam/section/update", async (req, res) => {
  await Exam_v2Controller["updateSection"](req, res, req.body);
  return;
});

router.post("/exam/group/update", async (req, res) => {
  await Exam_v2Controller["updateGroup"](req, res, req.body);
  return;
});

router.post("/exam/v2/detail", async (req, res) => {
  await Exam_v2Controller["detail"](req, res, req.body);
  return;
});

router.post("/question/v2/create", async (req, res) => {
  await Exam_v2Controller["createQuestionv2"](req, res, req.body);
  return;
});

router.post("/exam/v2/delete", async (req, res) => {
  await Exam_v2Controller["deleteExam"](req, res, req.body);
  return;
});

router.post("/exam/v2/let-file", async (req, res) => {
  await Exam_v2Controller["letFile"](req, res, req.body);
  return;
});

router.post("/exam/v2/let-question", async (req, res) => {
  await Exam_v2Controller["letQuestion"](req, res, req.body);
  return;
});

router.post("/exam/section/delete", async (req, res) => {
  await Exam_v2Controller["deleteExamSection"](req, res, req.body);
  return;
});

router.post("/exam/group/delete", async (req, res) => {
  await Exam_v2Controller["deleteExamSectionGroup"](req, res, req.body);
  return;
});

router.post("/question/v2/delete", async (req, res) => {
  await Exam_v2Controller["deleteQuestion"](req, res, req.body);
  return;
});

router.post("/question/v2/update", async (req, res) => {
  await Exam_v2Controller["updateQuestionv2"](req, res, req.body);
  return;
});

router.post("/exam/v2/scoring", async (req, res) => {
  await Exam_v2Controller["scoring"](req, res, req.body);
  return;
});

router.post("/exam/v2/get-score", async (req, res) => {
  await Exam_v2Controller["getScore"](req, res, req.body);
  return;
});

router.post("/exam/v2/answer-link", async (req, res) => {
  await Exam_v2Controller["answerLink"](req, res, req.body);
  return;
});

router.post("/exam/v2/let-score-question", async (req, res) => {
  await Exam_v2Controller["viewScoreDetailExam"](req, res, req.body);
  return;
});

router.post("/exam/v2/let-score-file", async (req, res) => {
  await Exam_v2Controller["viewFileInScoreDetailExam"](req, res, req.body);
  return;
});

router.post("/exam/v2/report", async (req, res) => {
  await Exam_v2Controller["report"](req, res, req.body);
  return;
});

router.post("/exam/v2/verify-exam", async (req, res) => {
  await Exam_v2Controller["verifyExam"](req, res, req.body);
  return;
});

router.post("/exam/v2/stop-exam", async (req, res) => {
  await Exam_v2Controller["stopExam"](req, res, req.body);
  return;
});

router.post("/category/sync-doc-link", async (req, res) => {
  await CategoryController["updateDocLink"](req, res, req.body);
  return;
});

// Link payments
router.post("/link-payment/create", async (req, res) => {
  await LinkPaymentController["createLinkPayment"](req, res, req.body);
  return;
});

router.get("/link-payment/statistics", async (req, res) => {
  await LinkPaymentController["paymentsStatistics"](req, res, req.body);
  return;
});

router.get("/link-payment/list", async (req, res) => {
  await LinkPaymentController["paymentList"](req, res, req.query);
  return;
});

router.post("/link-payment/detail", async (req, res) => {
  await LinkPaymentController["paymentDetail"](req, res, req.body);
  return;
});

router.post("/link-payment/update", async (req, res) => {
  await LinkPaymentController["updateLinkPayment"](req, res, req.body);
  return;
});

router.post("/link-payment/update-status", async (req, res) => {
  await LinkPaymentController["updateLinkPaymentStatus"](req, res, req.body);
  return;
});

router.post('/teachers-team/detail', async (req, res) => {
  await TeachersTeamController['detail'](req, res, req.body);
  return;
});

router.post('/teachers-team/update', async (req, res) => {
  await TeachersTeamController['update'](req, res, req.body);
  return;
});

router.post("/link-payment/update_user", async (req, res) => {
  await LinkPaymentController["updateUserForLinkPayment"](req, res, req.body);
  return;
})

router.post('/teachers-team/detail', async (req, res) => {
  await TeachersTeamController['detail'](req, res, req.body);
  return;
});

router.post('/teachers-team/update', async (req, res) => {
  await TeachersTeamController['update'](req, res, req.body);
  return;
});
// Routers Search History
router.post('/search-history/list', async (req, res) => {
  await SearchHistoryController['list'](req, res, req.body);
  return;
});
router.post('/search-history/add-and-update', async (req, res) => {
  await SearchHistoryController['addAndUpdate'](req, res, req.body);
  return;
});
router.post('/search-history/delete', async (req, res) => {
  await SearchHistoryController['delete'](req, res, req.body);
  return;
});

// Action Log Routes (Admin/Manager only)
router.post('/action-log/list', async (req, res) => {
  await ActionLogController['list'](req, res, req.body);
  return;
});

router.post('/action-log/detail', async (req, res) => {
  await ActionLogController['detail'](req, res, req.body);
  return;
});

router.post('/action-log/export', async (req, res) => {
  await ActionLogController['export'](req, res, req.body);
  return;
});

router.post('/action-log/stats', async (req, res) => {
  await ActionLogController['stats'](req, res, req.body);
  return;
});
// Fast Gift
router.post("/fast-gift/list", async (req, res) => {
  await FastGiftController["list"](req, res, req.body);
  return;
});
router.post("/fast-gift/create", async (req, res) => {
  await FastGiftController["create"](req, res, req.body);
  return;
});
router.post("/fast-gift/update", async (req, res) => {
  await FastGiftController["update"](req, res, req.body);
  return;
});
router.post("/fast-gift/update-status", async (req, res) => {
  await FastGiftController["status"](req, res, req.body);
  return;
});
router.post("/fast-gift/delete", async (req, res) => {
  await FastGiftController["delete"](req, res, req.body);
  return;
});
router.post("/fast-gift/detail", async (req, res) => {
  await FastGiftController["detail"](req, res, req.body);
  return;
});
// Label Management
router.post('/label/list', async (req, res) => {
  await LabelController['list'](req, res, req.body);
  return;
});
router.post('/label/count', async (req, res) => {
  await LabelController['count'](req, res, req.body);
  return;
});
router.post('/label/list-public', async (req, res) => {
  await LabelController['listPublic'](req, res, req.body);
  return;
});
router.post('/label/detail', async (req, res) => {
  await LabelController['detail'](req, res, req.body);
  return;
});
router.post('/label/create', async (req, res) => {
  await LabelController['create'](req, res, req.body);
  return;
});
router.post('/label/update', async (req, res) => {
  await LabelController['update'](req, res, req.body);
  return;
});
router.post('/label/update-status', async (req, res) => {
  await LabelController['updateStatus'](req, res, req.body);
  return;
});
router.post('/label/restore', async (req, res) => {
  await LabelController['restore'](req, res, req.body);
  return;
});
router.post('/label/permanent-delete', async (req, res) => {
  await LabelController['permanentDelete'](req, res, req.body);
  return;
});
router.post('/label/set-primary', async (req, res) => {
  await LabelController['setPrimary'](req, res, req.body);
  return;
});
router.post('/label/update-children-ordering', async (req, res) => {
  await LabelController['updateChildrenOrdering'](req, res, req.body);
  return;
});

// Label Items — gán nhãn cho sản phẩm
router.post('/label/items', async (req, res) => {
  await LabelItemController['items'](req, res, req.body);
  return;
});
router.post('/label/add-item', async (req, res) => {
  await LabelItemController['addItem'](req, res, req.body);
  return;
});
router.post('/label/remove-item', async (req, res) => {
  await LabelItemController['removeItem'](req, res, req.body);
  return;
});
router.post('/label/labels-by-item', async (req, res) => {
  await LabelItemController['labelsByItem'](req, res, req.body);
  return;
});
router.post('/label/sync-labels', async (req, res) => {
  await LabelItemController['syncLabels'](req, res, req.body);
  return;
});
router.post('/label/bulk-update-items', async (req, res) => {
  await LabelItemController['bulkUpdateItems'](req, res, req.body);
  return;
});

/// End MyRoutes
module.exports = router;
