export default function ChinhSachBaoMatPage() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 bg-[#235CD0] px-4 py-3 rounded-lg shadow-sm">
            Chính sách bảo mật
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#235CD0] mb-8 bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-[#235CD0]">
            CHÍNH SÁCH BẢO MẬT THÔNG TIN CÁ NHÂN TẠI SSSTUDY
          </h2>

          <div className="prose max-w-none space-y-8 text-gray-700">
            {/* Mục 1 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                1. Thu thập thông tin
              </h3>
              <p className="mb-4">
                SSSTUDY thu thập các thông tin cá nhân của bạn khi bạn đăng ký tài khoản, đăng ký khóa học, hoặc sử dụng các dịch vụ của chúng tôi. Các thông tin có thể bao gồm:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Họ và tên</li>
                <li>Email</li>
                <li>Số điện thoại</li>
                <li>Địa chỉ</li>
                <li>Thông tin thanh toán</li>
                <li>Thông tin về việc sử dụng dịch vụ</li>
              </ul>
            </section>

            {/* Mục 2 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                2. Mục đích sử dụng thông tin
              </h3>
              <p className="mb-4">
                SSSTUDY sử dụng thông tin cá nhân của bạn cho các mục đích sau:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cung cấp và quản lý dịch vụ học tập</li>
                <li>Xử lý đơn hàng và thanh toán</li>
                <li>Gửi thông báo về khóa học, sự kiện và cập nhật</li>
                <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng</li>
                <li>Hỗ trợ khách hàng và giải đáp thắc mắc</li>
                <li>Tuân thủ các yêu cầu pháp lý</li>
              </ul>
            </section>

            {/* Mục 3 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                3. Bảo vệ thông tin
              </h3>
              <p className="mb-4">
                SSSTUDY cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp bảo mật phù hợp:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mã hóa dữ liệu trong quá trình truyền tải</li>
                <li>Bảo mật hệ thống và cơ sở dữ liệu</li>
                <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên có thẩm quyền</li>
                <li>Thường xuyên kiểm tra và cập nhật các biện pháp bảo mật</li>
              </ul>
            </section>

            {/* Mục 4 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                4. Chia sẻ thông tin
              </h3>
              <p className="mb-4">
                SSSTUDY không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, trừ các trường hợp:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Được sự đồng ý của bạn</li>
                <li>Theo yêu cầu của cơ quan pháp luật có thẩm quyền</li>
                <li>Với các đối tác dịch vụ cần thiết để cung cấp dịch vụ (như nhà cung cấp thanh toán, vận chuyển) với cam kết bảo mật tương đương</li>
              </ul>
            </section>

            {/* Mục 5 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                5. Quyền của người dùng
              </h3>
              <p className="mb-4">
                Bạn có quyền:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Truy cập và xem thông tin cá nhân của mình</li>
                <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
                <li>Yêu cầu xóa thông tin cá nhân (trong phạm vi pháp luật cho phép)</li>
                <li>Từ chối nhận email marketing bằng cách hủy đăng ký</li>
                <li>Khiếu nại về việc xử lý thông tin cá nhân</li>
              </ul>
            </section>

            {/* Mục 6 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                6. Cookie và công nghệ theo dõi
              </h3>
              <p className="mb-4">
                SSSTUDY sử dụng cookie và các công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                <li>Phân tích cách bạn sử dụng website để cải thiện dịch vụ</li>
                <li>Cung cấp nội dung và quảng cáo phù hợp</li>
              </ul>
              <p className="mt-4">
                Bạn có thể quản lý hoặc xóa cookie thông qua cài đặt trình duyệt của mình.
              </p>
            </section>

            {/* Mục 7 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                7. Thay đổi chính sách bảo mật
              </h3>
              <p className="mb-4">
                SSSTUDY có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên website này.
              </p>
              <p>
                Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận chính sách mới.
              </p>
            </section>

            {/* Mục 8 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                8. Liên hệ
              </h3>
              <p className="mb-4">
                Nếu bạn có câu hỏi hoặc yêu cầu về chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email: ssstudy.vn@gmail.com</li>
                <li>Hotline: 0858 882 788</li>
                <li>Địa chỉ: Số 88 Ngõ 27 Phố Đại Cồ Việt, Phường Cầu Dền, Quận Hai Bà Trưng, TP. Hà Nội</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

