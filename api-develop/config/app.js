module.exports = {
  FILE_DOMAIN: "https://cdn.luyenthitiendat.vn",
  FIRST_CLASSROOM_ID: "6114e77d86c16e6021606aae",
  ID_EXAM_CATEGORY_FIXED: [
    "61d5bc9db2e75009a0f536ed",
    "61c9d609e19a15187b41ecee",
    "61c9d611e19a15187b41ecef",
  ],
  LOCAL: {
    DIR_TEMP: "./temp/",
  },
  APP_NAME: "APP NAME",
  VERSION: "1.0",
  CLASSROOM_CONFIG: {
    SHOW_VIDEO_TAB: false,
  },
  SHOW_ACCESS_MENU: true,
  PAGINATION: {
    PAGE: 1,
    LIMIT: 50,
  },
  TAG: {
    TYPE: {
      VIDEO: "VIDEO",
      QUESTION: "QUESTION",
      EXAM: "EXAM",
    },
  },
  STATUS: {
    ACTIVE: true,
    INACTIVE: false,
  },
  TESTING_STATUS: {
    PENDING: "PENDING",
    DONE: "DONE",
  },
  USER_GROUP: {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    ACCOUNTANT: "ACCOUNTANT",
    TEACHER: "TEACHER",
    SUPPORTER: "SUPPORTER",
    EDITOR: "EDITOR",
    STUDENT: "STUDENT",
    SALE_MANAGER: "SALE_MANAGER",
    SALE_STAFF: "SALE_STAFF",
    MEDIA: "MEDIA",
    TRAINING_STAFF: "TRAINING_STAFF"
  },
  QUESTION_LEVEL: {
    NHAN_BIET: "NHAN_BIET",
    THONG_HIEU: "THONG_HIEU",
    VAN_DUNG: "VAN_DUNG",
    VAN_DUNG_CAO: "VAN_DUNG_CAO",
  },
  EXAM_CREATING_TYPE: {
    DEFAULT: "DEFAULT",
    AUTO: "AUTO",
    MANUAL: "MANUAL",
    GROUP_QUESTION: "GROUP_QUESTION",
  },
  EXAM_TYPE: {
    TRAC_NGHIEM: "TRAC_NGHIEM",
    TU_LUAN: "TU_LUAN",
    RE_TEST: "RE_TEST",
  },
  NEW_EXAM_TYPE: {
    TOT_NGHIEP: "TOT_NGHIEP",
    APT: "APT",
    HSA: "HSA",
    TSA: "TSA",
  },
  CALCULATE_SCORE_TYPE: {
    DIVIDE_POINT: "DIVIDE_POINT",
    TOTAL_POINT: "TOTAL_POINT",
    COUNT_TRUE: "COUNT_TRUE",
  },
  EXAM_SECTION_TYPE: {
    DEFAULT: "DEFAULT",
    GROUP_SUBJECT: "GROUP_SUBJECT",
  },

  EXAM_REPORT_SCORE: {
    MAC_DINH: {
      LEVEL_1: 6.5,
      LEVEL_2: 8,
      LEVEL_3: 9,
    },
    APT: {
      LEVEL_1: 600,
      LEVEL_2: 800,
      LEVEL_3: 1000,
    },
    HSA: {
      LEVEL_1: 80,
      LEVEL_2: 100,
      LEVEL_3: 120,
    },
    TSA: {
      LEVEL_1: 60,
      LEVEL_2: 70,
      LEVEL_3: 80,
    },
    TOT_NGHIEP: {
      LEVEL_1: 6.5,
      LEVEL_2: 8,
      LEVEL_3: 9,
    },
  },

  QUESTION_TYPE: {
    TN_SINGLE_CHOICE: "TN_SINGLE_CHOICE", //trắc nghiệm một đáp án
    TN_MULTI_CHOICE: "TN_MULTI_CHOICE", //trắc nghiệm nhiều đáp án
    TN_TRUE_FALSE: "TN_TRUE_FALSE", //trắc nghiệm đúng sai
    ESSAY: "ESSAY", //câu tự luận  (trả lời ngắn, điền số)
    DRAG_DROP: "DRAG_DROP", //kéo thả
    TRUE_FALSE: "TRUE_FALSE", //Đúng sai
  },
  EXAM_GROUP: {
    MAC_DINH: "MAC_DINH",
    THI_THU: "THI_THU",
  },
  EXAM_LINK_TYPE: {
    GOOGLE_DRIVE: "GOOGLE_DRIVE",
    PDF: "PDF",
    DOCX: "DOCX",
  },
  API: {
    FW: {
      LOPHOC: "https://app.faceworks.vn/tiendat/get.php?module=lophoc",
      HOCSINH: "https://app.faceworks.vn/tiendat/get.php?module=hocsinh",
      HOCPHI: "https://app.faceworks.vn/tiendat/get.php?module=phieuthu",
      MONHOC: "https://app.faceworks.vn/tiendat/get.php?module=monhoc",
      DIEM_DANH: "https://app.faceworks.vn/tiendat/get.php?module=diemdanh",
    },
  },
  STUDENT_PASSWORD_DEFAULT: "12345678",
  ONESIGNAL: {
    APP_ID: "28bc3757-9a2f-459a-98fb-0b7d5395a3e7",
    API_KEY: "NjUwZjQwM2EtZmE2OC00OTk0LThhODUtYWUyYTIyYTZkNWIw",
  },
  ONESIGNAL_2: {
    APP_ID: "4c9dd336-abb2-45e7-9306-2d9bc3edfe38",
    API_KEY: "ZGU5OGQzODMtYmUzOS00ZjFjLWJhOGYtYzY4NTY3NjRiNjA2",
  },
  NOTIFY_NOTE:
    "Để nhận đày đủ thông báo từ Trung Tâm. Các em hãy chắc chắn khi cài App đã cho phép Ứng dụng Luyện Thi Đại Cồ Việt nhận thông báo. Nếu các em đã từ chối, hãy xóa Ứng dụng đi và cài đặt lại và lưu ý cho phép Ứng dụng nhận thông báo. Thầy cảm ơn các em!",
  NOTIFY_NOTE_COOKIE_EXP_DAY: 30,
  PAYMENT_METHOD: {
    COD: "COD",
    BANK_TRANSFER: "BANK_TRANSFER",
    BALANCE: "BALANCE",
    DIRECT: "DIRECT",
  },
  SHUB_TOKEN:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcyI6IlIxSlRkVTFPVFZsdFkwcDRaa1l5U2hwbm91WWlRYllFUHpZV3k2b1U1UENINVlYUWVBbmRGMXJndlN0b1N5MHciLCJleHAiOjE2NzY5MTI0MDAsImlkIjoiMWpVVWhuTDRJVmJqa0VaZEwiLCJvcmlnX2lhdCI6MTY1OTQwMDAwMCwicm9sZSI6Imd2In0.nSgAgnhCT1Sh13PN2L18jpM874hy7QiGycRGiQeZhgs",
  BANK_INFO: {
    BANK_NAME: "Ngân hàng Thương mại Cổ phần Tiên Phong",
    BANK_ACCOUNT_NUMBER: "ssstudyvn",
    BANK_ACCOUNT_HOLDER: "Nguyễn Tiến Đạt",
    BANK_NAME: "TP Bank",
    QR_CODE_URL:
      "https://cdn.luyenthitiendat.vn/book/2023/03/19/20230319214259-gqjdni0lww.png",
  },
  HOME_POST: {
    MEDIA: "6619fbab5f1423510a889e2f",
    POST: "66194ad55f1423510a8753eb",
  },
  EMAIL_CANCELED_ORDER_HTML: `<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
      <tbody><tr>
      <td class="es-m-margin" valign="top" style="padding:0;Margin:0">
        <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
          <tbody><tr>
          <td align="center" style="padding:0;Margin:0">
            </td>
          </tr>
        </tbody></table>
        <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
          <tbody><tr>
          <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-top: 30px;"><h3>Hủy đơn hàng thành công</h3></td>
          </tr>
          <tr>
            <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-bottom: 30px;">
                <p>Thân chào <b>{{customer_name}}</b>,</p>
                <p>Đơn hàng của bạn đã được hủy thành  công - Mã đơn hàng:</p>
                <p>SSStudy rất tiếc vì không thể đồng  hành cùng bạn trong khóa học này,  nhưng đừng quên quay lại với SSStudy  để nhận thêm nhiều ưu đãi hấp dẫn hơn
nhé! </p>
            </td>
            </tr>
        </tbody></table>
        <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
          <tbody><tr>
          <td align="center" style="padding:0;Margin:0">
            <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
              <tbody><tr>
              <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:25px 25px 0px 0px">
                <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                  <tbody><tr>
                  <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                      <tbody><tr>
                      <td align="left" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Thông tin đơn hàng</h2></td>
                      </tr>
                    </tbody></table></td>
                  </tr>
                </tbody></table></td>
              </tr>
            </tbody></table></td>
          </tr>
        </tbody></table>
        <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
          <tbody><tr>
          <td align="center" style="padding:0;Margin:0" colspan="2">
            <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;border-top:2px solid rgb(255, 131, 69);border-right:2px solid rgb(255, 131, 69);border-left:2px solid rgb(255, 131, 69);width:600px;border-bottom:2px solid rgb(255, 131, 69)" role="none">
              <tbody><tr>
              <td align="left" colspan="2" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:35px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                  <tbody><tr>
                  <td class="es-m-p20b" align="center" valign="top" style="padding:0;Margin:0;width:268px">
                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                      <tbody><tr>
                      <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Tên khách hàng:</strong> {{customer_name}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Email:</strong> {{customer_email}}</p></td>
                      </tr>
                    </tbody></table></td>
                  </tr>
                </tbody></table><!--[if mso]></td><td style="width:20px"></td><td style="width:268px" valign="top"><![endif]-->
                <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                  <tbody><tr>
                  <td align="left" style="padding:0;Margin:0;width:268px">
                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                      <tbody><tr>
                      <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Mã KH:</strong> {{customer_code}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Số điện thoại:</strong> {{customer_phone}}</p></td>
                      </tr>
                    </tbody></table></td>
                  </tr>
                </tbody></table><!--[if mso]></td></tr></table><![endif]--></td>
              </tr>
              <tr>
                <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Địa chỉ:</strong> {{customer_address}}</p>
                <!--[if mso]></td></tr></table><![endif]--></td>
              </tr>
              <tr>
                <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Phương thức thanh toán:</strong> {{order_payment_method}}</p>
                <!--[if mso]></td></tr></table><![endif]--></td>
              </tr>
              <tr>
                <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-bottom:35px"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                  <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Trạng thái đơn hàng:</strong> {{order_status}}</p>
                <!--[if mso]></td></tr></table><![endif]--></td>
              </tr>
              <tr>
              <td colspan="2" align="left" bgcolor="rgb(255, 131, 69)" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0))">
                <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                  <tbody><tr>
                  <td colspan="2" align="center" valign="top" style="padding:0;Margin:0;width:556px">
                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                      <tbody><tr>
                      <td colspan="2" align="left" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Thông tin sản phẩm</h2></td>
                      </tr>
                    </tbody></table></td>
                  </tr>
                </tbody></table></td>
              </tr>
              <tr>
                <td colspan="2">
                    <table width="100%">
                        <tbody>
                              {{order_line_items}}
                        </tbody>
                    </table>
                </td>
              </tr>
              <tr>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;">Thành tiền</td>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_subtotal}}đ</td>
              </tr>
              <tr>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;">Khuyến mại</td>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_discount_value}}đ</td>
              </tr>
              <tr>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:30px;font-family:Poppins, sans-serif;">Tổng tiền thanh toán</td>
                <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:30px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_total}}đ</td>
              </tr>
            </tbody></table></td>
          </tr>
        </tbody></table>
        <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
          <tbody><tr>
          <td align="center" style="padding:0;Margin:0;">
            <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
              <tbody><tr>
              <td align="left" bgcolor="rgb(255, 131, 69)" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:0px 0px 25px 25px">
                <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                  <tbody><tr>
                  <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                      <tbody><tr>
                      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Cảm ơn bạn đã chọn SSSTUDY!</h2></td>
                      </tr>
                    </tbody></table></td>
                  </tr>
                </tbody></table></td>
              </tr>
            </tbody></table></td>
          </tr>
        </tbody></table>

        <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="margin-top:40px;mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody>
            <tr>
                <td align="center" style="font-family:Poppins, sans-serif;font-size:13px;font-style:normal;">
                    <p><b>CÔNG TY CỔ PHẦN ĐÀO TẠO PHÁT TRIỂN GIÁO DỤC SSSTUDY</b></p>
                    <p>Địa chỉ: Số 88 Ngõ 27 Phố Đại Cồ Việt, Phường Cầu Dền, Quận Hai Bà Trưng, Hà Nội</p>
                    <p>Điện thoại: 0917 573 266 - Email: tiendatnguyen2510@gmail.com</p>
                </td>
            </tr>
        </tbody></table></td>
          </tr>
        </tbody></table></td>
      </tr>
    </tbody></table>`,
  EMAIL_CONFIRM_ORDER_HTML: `<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
    <tbody><tr>
     <td class="es-m-margin" valign="top" style="padding:0;Margin:0">
      <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0">
          </td>
        </tr>
      </tbody></table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-top: 30px;"><h3>XÁC NHẬN ĐƠN HÀNG</h3></td>
        </tr>
        <tr>
           <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-bottom: 30px;">
               <p>Thân chào <b>{{customer_name}}</b>,</p>
               <p>Cảm ơn bạn đã tin tưởng và đặt mua sản phẩm từ SSSTUDY. Dưới đây là thông tin đơn hàng của bạn:</p>
           </td>
          </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tbody><tr>
             <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:25px 25px 0px 0px">
              <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tbody><tr>
                 <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Thông tin đơn hàng</h2></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table></td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0" colspan="2">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;border-top:2px solid rgb(255, 131, 69);border-right:2px solid rgb(255, 131, 69);border-left:2px solid rgb(255, 131, 69);width:600px;border-bottom:2px solid rgb(255, 131, 69)" role="none">
            <tbody><tr>
             <td align="left" colspan="2" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:35px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
              <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                <tbody><tr>
                 <td class="es-m-p20b" align="center" valign="top" style="padding:0;Margin:0;width:268px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Tên khách hàng:</strong> {{customer_name}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Email:</strong> {{customer_email}}</p></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table><!--[if mso]></td><td style="width:20px"></td><td style="width:268px" valign="top"><![endif]-->
              <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                <tbody><tr>
                 <td align="left" style="padding:0;Margin:0;width:268px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Mã KH:</strong> {{customer_code}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Số điện thoại:</strong> {{customer_phone}}</p></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table><!--[if mso]></td></tr></table><![endif]--></td>
            </tr>
            <tr>
               <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Địa chỉ:</strong> {{customer_address}}</p>
               <!--[if mso]></td></tr></table><![endif]--></td>
            </tr>
            <tr>
               <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Phương thức thanh toán:</strong> {{order_payment_method}}</p>
               <!--[if mso]></td></tr></table><![endif]--></td>
            </tr>
            <tr>
               <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-bottom:35px"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Trạng thái đơn hàng:</strong> {{order_status}}</p>
               <!--[if mso]></td></tr></table><![endif]--></td>
            </tr>
            <tr>
             <td colspan="2" align="left" bgcolor="rgb(255, 131, 69)" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0))">
              <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tbody><tr>
                 <td colspan="2" align="center" valign="top" style="padding:0;Margin:0;width:556px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td colspan="2" align="left" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Thông tin sản phẩm</h2></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table></td>
            </tr>
            <tr>
               <td colspan="2">
                   <table width="100%">
                       <tbody>
                            {{order_line_items}}
                       </tbody>
                   </table>
               </td>
            </tr>
            <tr>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;">Thành tiền</td>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_subtotal}}đ</td>
            </tr>
            <tr>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;">Khuyến mại</td>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_discount_value}}đ</td>
            </tr>
            <tr>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:30px;font-family:Poppins, sans-serif;">Tổng tiền thanh toán</td>
               <td align="right" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:15px;padding-bottom:30px;font-family:Poppins, sans-serif;font-weight: bold;">{{order_total}}đ</td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0;">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tbody><tr>
             <td align="left" bgcolor="rgb(255, 131, 69)" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:0px 0px 25px 25px">
              <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tbody><tr>
                 <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Cảm ơn bạn đã chọn SSSTUDY!</h2></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table></td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>

      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="margin-top:40px;mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
       <tbody>
           <tr>
               <td align="center" style="font-family:Poppins, sans-serif;font-size:13px;font-style:normal;">
                   <p><b>CÔNG TY CỔ PHẦN ĐÀO TẠO PHÁT TRIỂN GIÁO DỤC SSSTUDY</b></p>
                   <p>Địa chỉ: Số 88 Ngõ 27 Phố Đại Cồ Việt, Phường Cầu Dền, Quận Hai Bà Trưng, Hà Nội</p>
                   <p>Điện thoại: 0917 573 266 - Email: tiendatnguyen2510@gmail.com</p>
               </td>
           </tr>
      </tbody></table></td>
        </tr>
      </tbody></table></td>
    </tr>
  </tbody></table>`,
  ORDER_STATUS_TEXT: {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    PAID: "Đã thanh toán",
    SHIPPING: "Đang giao",
    SUCCESS: "Thành công",
    CANCELLED: "Đã Hủy Thanh Toán",
  },
  ORDER_PAYMENT_METHOD_TEXT: {
    COD: "COD",
    BANK_TRANSFER: "Chuyển khoản",
    DIRECT: "Tại Trung Tâm",
    BALANCE: "Đơn 0 đồng",
    SSS_BALANCE: "Đơn 0 đồng",
    BANK_PAYOS: "Qua payos",
  },

  EMAIL_NOTI_NEW_USER_TO_SALE: `<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
    <tbody><tr>
     <td class="es-m-margin" valign="top" style="padding:0;Margin:0">
      <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0">
          </td>
        </tr>
      </tbody></table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-top: 30px;"><h3>XÁC NHẬN NGƯỜI DÙNG MỚI</h3></td>
        </tr>
        <tr>
           <td align="center" style="padding:0;Margin:0;font-family:Poppins, sans-serif;padding-bottom: 30px;">
               <p>Thân chào <b>SALE MARKETING</b>,</p>
               <p>Dưới đây là thông tin người dùng đăng ký mới:</p>
           </td>
          </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tbody><tr>
             <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:25px 25px 0px 0px">
              <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tbody><tr>
                 <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Thông tin người dùng</h2></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table></td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0" colspan="2">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;border-top:2px solid rgb(255, 131, 69);border-right:2px solid rgb(255, 131, 69);border-left:2px solid rgb(255, 131, 69);width:600px;border-bottom:2px solid rgb(255, 131, 69)" role="none">
            <tbody><tr>
             <td align="left" colspan="2" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:35px;"><!--[if mso]><table style="width:556px" cellpadding="0" cellspacing="0"><tr><td style="width:268px" valign="top"><![endif]-->
              <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                <tbody><tr>
                 <td class="es-m-p20b" align="center" valign="top" style="padding:0;Margin:0;width:268px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Tên khách hàng:</strong> {{customer_name}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Email:</strong> {{customer_email}}</p></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table><!--[if mso]></td><td style="width:20px"></td><td style="width:268px" valign="top"><![endif]-->
              <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                <tbody><tr>
                 <td align="left" style="padding:0;Margin:0;width:268px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Mã KH:</strong> {{customer_code}}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:28px;color:#4A4E69;font-size:14px"><strong>Số điện thoại:</strong> {{customer_phone}}</p></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table><!--[if mso]></td></tr></table><![endif]--></td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
        <tbody><tr>
         <td align="center" style="padding:0;Margin:0;">
          <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tbody><tr>
             <td align="left" bgcolor="rgb(255, 131, 69)" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background:linear-gradient(135deg, rgb(255, 131, 69), rgb(255, 85, 0));border-radius:0px 0px 25px 25px">
              <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tbody><tr>
                 <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tbody><tr>
                     <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:18px;font-style:normal;font-weight:normal;color:#FFF">Đội ngũ phát triển SSSTUDY!</h2></td>
                    </tr>
                  </tbody></table></td>
                </tr>
              </tbody></table></td>
            </tr>
          </tbody></table></td>
        </tr>
      </tbody></table>

      <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="margin-top:40px;mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
       <tbody>
           <tr>
               <td align="center" style="font-family:Poppins, sans-serif;font-size:13px;font-style:normal;">
                   <p><b>CÔNG TY CỔ PHẦN ĐÀO TẠO PHÁT TRIỂN GIÁO DỤC SSSTUDY</b></p>
                   <p>Địa chỉ: Số 88 Ngõ 27 Phố Đại Cồ Việt, Phường Cầu Dền, Quận Hai Bà Trưng, Hà Nội</p>
                   <p>Điện thoại: 0917 573 266 - Email: tiendatnguyen2510@gmail.com</p>
               </td>
           </tr>
      </tbody></table></td>
        </tr>
      </tbody></table></td>
    </tr>
  </tbody></table>`,
};