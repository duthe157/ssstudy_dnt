export default function DieuKhoanSuDungPage() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 bg-[#235CD0] px-4 py-3 rounded-lg shadow-sm">
            Điều khoản sử dụng
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#235CD0] mb-8 bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-[#235CD0]">
            QUY ĐỊNH VÀ CHÍNH SÁCH KHI THAM GIA HỌC TẬP TẠI SSSTUDY
          </h2>

          <div className="prose max-w-none space-y-8 text-gray-700">
            {/* Mục 1 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                1. Quy định về độ tuổi sử dụng website SSSTUDY.VN
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  SSSTUDY yêu cầu đối tượng được phép sử dụng tài khoản tại SSSTUDY cần đảm bảo trên 15 tuổi.
                </li>
                <li>
                  Nếu bạn dưới 15 tuổi và muốn sử dụng website SSSTUDY, cần có sự cho phép của bố, mẹ hoặc người giám hộ.
                </li>
              </ul>
            </section>

            {/* Mục 2 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                2. Quy định xử lý tranh chấp tài khoản/ vi phạm quy định bảo mật tài khoản
              </h3>
              <p className="mb-4">
                SSSTUDY có toàn quyền kiểm tra và xử lý theo quy định:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#235CD0] mb-2 bg-blue-50 px-3 py-2 rounded-md border-l-4 border-[#235CD0]">
                    1. Trường hợp tranh chấp tài khoản:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Bước 1:</strong> Khóa tài khoản học tập tạm thời trong vòng 30 ngày.
                    </li>
                    <li>
                      <strong>Bước 2:</strong> Trong vòng 30 ngày, xác minh chủ tài khoản dựa vào chứng cứ như thông tin cá nhân, số điện thoại đã xác thực, giấy tờ nạp tiền và đăng ký khóa học. Nếu được xác minh, tài khoản được tiếp tục học. Nếu tranh chấp lần 2, SSSTUDY không hỗ trợ.
                    </li>
                    <li>
                      <strong>Bước 3:</strong> Nếu không xác minh được sau 30 ngày, tài khoản được mở lại nhưng không hỗ trợ phục hồi.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#235CD0] mb-2 bg-blue-50 px-3 py-2 rounded-md border-l-4 border-[#235CD0]">
                    2. Trường hợp vi phạm quy định bảo mật tài khoản:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Hệ thống tự động phát hiện hành vi chia sẻ tài khoản.</li>
                    <li>Tài khoản chia sẻ sẽ bị khóa vĩnh viễn.</li>
                    <li>Quyết định của SSSTUDY là quyết định cuối cùng.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Mục 3 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                3. Quy định về văn hóa ứng xử
              </h3>
              <p className="mb-4">
                Bạn cần giữ thái độ, cử chỉ văn minh, lành mạnh khi sử dụng dịch vụ tại SSSTUDY.
              </p>
              <p className="mb-4">
                Nếu có hành vi ảnh hưởng xấu, tài khoản sẽ bị khóa vĩnh viễn.
              </p>
              <p className="mb-2 font-semibold">Một số hành vi không chấp nhận:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Xúc phạm, sử dụng từ ngữ khiếm nhã.</li>
                <li>Gây mất trật tự lớp học.</li>
                <li>Mua bán, quảng bá sản phẩm.</li>
                <li>Lôi kéo người khác vào hành vi trái pháp luật.</li>
              </ul>
              <p className="mt-4">
                Quyết định của SSSTUDY là quyết định cuối cùng.
              </p>
            </section>

            {/* Mục 4 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                4. Quy định về bản quyền
              </h3>
              <p className="mb-4">
                SSSTUDY tôn trọng và bảo vệ quyền sở hữu trí tuệ.
              </p>
              <p>
                Mọi vi phạm sẽ bị xử lý theo quy định pháp luật Việt Nam hiện hành.
              </p>
            </section>

            {/* Mục 5 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                5. Quy định chung về đổi trả khóa học
              </h3>
              <p>
                Khoá học đã mua không được chuyển đổi, hoàn trả học phí trong mọi trường hợp, trừ các khóa học có thực hiện cam kết đầu ra theo quy định riêng.
              </p>
            </section>

            {/* Mục 6 */}
            <section>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 bg-[#235CD0] px-4 py-2.5 rounded-md shadow-sm">
                6. Quy định chung về quyền sử dụng khóa học
              </h3>
              <p className="mb-4">
                Khách hàng có quyền sử dụng sản phẩm được cung cấp bởi SSSTUDY với đúng mục đích và trong thời hạn đã được quy định của từng sản phẩm.
              </p>
              <p className="mb-4">
                Mọi hành vi lạm dụng, sử dụng sai mục đích gây thiệt hại tới SSSTUDY đều bị nghiêm cấm và sẽ bị xử lý theo quy định của pháp luật Việt Nam hiện hành.
              </p>
              <p>
                Sản phẩm hết thời hạn sử dụng theo quy định không được hỗ trợ gia hạn.
              </p>
              <p className="mt-4">
                Với sản phẩm khoá học có video, số lượt xem tối đa là 20 lượt/video. SSSTUDY không hỗ trợ các trường hợp xem quá số lượng tối đa đã quy định.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

