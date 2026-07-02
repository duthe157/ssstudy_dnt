import CustomAvatarIcon from '../icons/Group';
import Trophy from '../icons/Trophy';
import ChatDots from '../icons/ChatDots';

const HeroSection = () => {
  return (
    <section className="container mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left content */}
        <div>
          <h2 className="text-[32px] font-bold text-[#111827] mb-4">Cộng đồng học tập</h2>
          <p className="text-[#374151] text-base mb-4 leading-relaxed">
            Chúng tôi hoạt động trong lĩnh vực giáo dục đào tạo, tập trung vào việc ứng dụng công nghệ và phương pháp giảng dạy hiện đại nhất cho thế hệ trẻ Việt Nam, cung cấp các chương trình học trực tuyến và trực tiếp.
          </p>
          <p className="text-[#374151] text-base mb-8 leading-relaxed">
            Với mục tiêu phát triển tư duy sáng tạo, chúng tôi không ngừng cải tiến để mang lại giá trị tri thức, giúp học sinh tự tin trong học tập và phát triển kỹ năng sống, hướng tới trở thành công dân toàn cầu. Sứ mệnh của chúng tôi là đồng hành cùng thế hệ trẻ, dẫn dắt họ đến thành công và góp phần xây dựng một tương lai tốt đẹp hơn.
          </p>

          {/* Icon rows */}
          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-lg flex items-center justify-center shrink-0">
                <CustomAvatarIcon />
              </div>
              <div className="pt-1.5">
                <p className="text-[#1F2937] text-base font-bold">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-lg flex items-center justify-center shrink-0">
                <Trophy />
              </div>
              <div className="pt-1.5">
                <p className="text-[#1F2937] text-base font-bold">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-lg flex items-center justify-center shrink-0">
                <ChatDots />
              </div>
              <div className="pt-1.5">
                <p className="text-[#1F2937] text-base font-bold">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right images layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top two images */}
          <div className="col-span-2 flex gap-4">
            <div className="flex-1 h-[200px] rounded-lg overflow-hidden">
              <img
                src="/imgs/cong-dong/image-1.png"
                alt="Community learning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 h-[200px] rounded-lg overflow-hidden">
              <img
                src="/imgs/cong-dong/image-2.png"
                alt="Community learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom full width image */}
          <div className="col-span-2 h-[283px] rounded-lg overflow-hidden">
            <img
              src="/imgs/cong-dong/image-3.png"
              alt="Community learning"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
