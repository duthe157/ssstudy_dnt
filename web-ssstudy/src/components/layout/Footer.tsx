'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import config from '@/config';

const Footer = () => {
  const [loadedLogos, setLoadedLogos] = useState<Set<number>>(new Set());

  // Đảm bảo logos chỉ được định nghĩa một lần
  const logos = useMemo(() => [
    { src: "/imgs/home/logoSaostarTapchi.svg", alt: "logoSaostarTapchi", link: "https://www.saostar.vn/sao-hoc-duong/nam-sinh-dat-10-toan-duoc-thay-giao-thuong-nong-xe-sh-202107272102439115.html" },
    { src: "/imgs/home/vtcv2.webp", alt: "vtc", link: "https://vtcnews.vn/thay-giao-9x-dien-trai-cung-phuong-phap-day-doc-dao-khien-nhieu-hoc-sinh-tim-den-ar439903.html" },
    { src: "/imgs/home/znew.png", alt: "Znew", link: "https://znews.vn/thay-giao-tuyen-bo-thuong-xe-sh-cho-hoc-sinh-dat-diem-10-mon-toan-post1244013.html" },
    { src: "/imgs/home/giadinhphapluat.png", alt: "Gia đình và pháp luật", link: "https://giadinhvaphapluat.vn/xuat-sac-dat-diem-10-toan-thi-tot-nghiep-thpt-nam-sinh-duoc-thay-giao-thuong-nong-xe-sh-p88784.html" },
    { src: "/imgs/home/znew.png", alt: "Znew", link: "https://znews.vn/4-thay-giao-luyen-thi-duoc-teen-ha-noi-yeu-men-post726923.html" },
  ], []);

  // Handle logo load
  const handleLogoLoad = (index: number) => {
    setLoadedLogos((prev) => new Set(prev).add(index));
  };

  // Tách riêng LogoSlider thành component con để tối ưu render
  const LogoSlider = useMemo(() => {
    return (
      <div className="slider-container">
        <div style={{ width: "fit-content", display: "flex" }}>
          {/* Chỉ sử dụng một slider thay vì hai để giảm số lượng DOM elements */}
          <div className="slider">
            {/* Duplicate logos đủ để animation mượt */}
            {[...logos, ...logos, ...logos].map((logo, index) => {
              const isLoaded = loadedLogos.has(index);
              return (
                <div key={`logo-${index}`} className="slide">
                  <a href={logo.link} target="_blank" rel="noopener noreferrer" className="relative block">
                    {!isLoaded && (
                      <div className="skeleton-logo" />
                    )}
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={150}
                      height={70}
                      className={`transition-opacity duration-300 w-[120px] h-[50px] sm:w-[140px] sm:h-[60px] lg:w-[150px] lg:h-[70px] object-contain ${
                        isLoaded ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0'
                      }`}
                      onLoad={() => handleLogoLoad(index)}
                      loading="lazy"
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [logos, loadedLogos]);

  // Footer Content - Responsive với Tailwind classes
  const FooterContent = useMemo(() => (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Mobile: 1 cột, Tablet: 3 cột (2 dòng), Laptop: 5 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-start">
        {/* Logo và thông tin liên hệ */}
        <div className='flex flex-col gap-2 sm:gap-3 font-medium text-xs md:text-sm'>
          <Image 
            src="/imgs/home/logo-footer.png" 
            alt="SSSTUDY" 
            width={68}
            height={68}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[68px] lg:h-[68px] object-contain"
            loading="lazy"
          />
          <a 
            href="https://maps.app.goo.gl/cQiVtAxWWLpAwxeG6" 
            target="_blank" 
            rel="noopener noreferrer" 
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors leading-relaxed text-xs md:text-sm'
          >
            <span>
              Số 88 Ngõ 27 Phố Đại Cồ Việt, Phường Cầu <br className="hidden sm:block" /> Dền, Quận Hai Bà Trưng, TP. Hà Nội
            </span>
          </a>
          <div className='flex flex-col gap-0.5 text-[10px] sm:text-xs'>
            <span>Email: ssstudy.vn@gmail.com</span>
            <span>Website: ssstudy.vn</span>
            <span>Mã số thuế: 0110995157</span>
          </div>
        </div>

        {/* Hotline */}
        <div className='flex flex-col gap-1.5 sm:gap-2 lg:items-start min-w-fit'>
          <h3 className="font-bold text-xs sm:text-sm whitespace-nowrap">Hotline</h3>
          <a 
            href="tel:0858882788" 
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap'
          >
            CSKH: 0858 882 788
          </a>
          <a 
            href="tel:0911188912" 
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap'
          >
            Hỗ trợ kĩ thuật: 0911 188 912
          </a>
          <a 
            href="tel:0339793147" 
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap'
          >
            Trung tâm offline: 0339 793 147
          </a>
          <a 
            href="tel:0917573266" 
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap'
          >
            Tư vấn khóa online: 0917 573 266
          </a>
        </div>

        {/* Danh mục - Giới thiệu, Khóa học, Sách */}
        <div className='flex flex-col gap-1.5 sm:gap-2'>
          <h3 className="font-bold text-xs sm:text-sm w-full">Danh mục</h3>
          <a
              href={`${config.baseUrl || 'https://www.ssstudy.vn'}/khoa-hoc`}
              target="_blank"
              rel="noopener noreferrer"
              className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm'
          >
            Khóa học
          </a>
          <a
              href={`${config.baseUrl || 'https://www.ssstudy.vn'}/sach`}
              target="_blank"
              rel="noopener noreferrer"
              className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm'
          >
            Sách
          </a>
          <a
              href={`${config.baseUrl || 'https://www.ssstudy.vn'}/tuyen-dung`}
              target="_blank"
              rel="noopener noreferrer"
              className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm'
          >
            Tuyển Dụng
          </a>
          {/* <span className="text-[10px] sm:text-xs md:text-sm cursor-default lg:w-full lg:text-center">Sự kiện</span>
          <span className="text-[10px] sm:text-xs md:text-sm cursor-default lg:w-full lg:text-center">Tin tức</span> */}
        </div>

        {/* Trợ giúp */}
        <div className='flex flex-col gap-1.5 sm:gap-2 md:col-span-2 lg:col-span-1 lg:items-start'>
          <h3 className="font-bold text-xs sm:text-sm">Trợ giúp</h3>
          <a
              href="/chinh-sach/chinh-sach-va-dieu-khoan-1715697698692"
              className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm break-words'
          >
            Điều khoản sử dụng
          </a>
          <a
              href="/chinh-sach/huong-dan-hoc-tai-ssstudy-1751691060547"
              className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm break-words'
          >
            Hướng dẫn học
          </a>
          {/*<a
            href="/tin-tuc/giao-hang-thanh-toan-1716682139719"
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm break-words'
          >
            Chính sách thanh toán, giao hàng
          </a>
          <a
            href="/tin-tuc/chinh-sach-doi-tra-va-hoan-tien-1716682226222"
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm break-words'
          >
            Chính sách đổi trả, hoàn tiền
          </a>
          <a
            href="/tin-tuc/chinh-sach-bao-mat-1716682351925"
            className='hover:text-[#235CD0] active:text-[#235CD0] transition-colors text-[10px] sm:text-xs md:text-sm break-words'
          >
            Chính sách bảo mật
          </a>*/}
        </div>

        {/* Mạng xã hội */}
        <div className='flex flex-col gap-1.5 sm:gap-2 md:col-span-1 lg:col-span-1 lg:items-center lg:text-center'>
          <h3 className="font-bold text-xs sm:text-sm w-full lg:text-center">Liên kết</h3>
          <div className="flex flex-row gap-2 sm:gap-3 lg:items-center lg:justify-center lg:w-full">
            <a 
              href="https://www.facebook.com/ssstudy.edu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image 
                src='/imgs/footer/face.png' 
                width={40}
                height={40}
                className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain' 
                alt="Facebook"
                loading="lazy" 
              />
            </a>
            <a 
              href="https://www.youtube.com/@thaynguyentiendat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image 
                src='/imgs/footer/youtube.png' 
                width={40}
                height={40}
                className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain' 
                alt="YouTube - Thầy Nguyễn Tiến Đạt"
                loading="lazy" 
              />
            </a>
            <a 
              href="https://www.youtube.com/@SSStudyOfficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image 
                src='/imgs/footer/youtube.png' 
                width={40}
                height={40}
                className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain' 
                alt="YouTube - SSStudy Official"
                loading="lazy" 
              />
            </a>
            <a 
              href="https://www.tiktok.com/@trangtintucssstudy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image 
                src='/imgs/footer/ticktock.png' 
                width={40}
                height={40}
                className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain' 
                alt="TikTok"
                loading="lazy" 
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  ), []);

  // CSS styles - Responsive slider
  const sliderStyles = useMemo(() => `
    .slider-container {
      overflow: hidden;
      position: relative;
      width: 100%;
      padding: 12px 0;
      background-color: white;
    }

    @media (min-width: 640px) {
      .slider-container {
        padding: 16px 0;
      }
    }

    @media (min-width: 1024px) {
      .slider-container {
        padding: 20px 0;
      }
    }

    .slider {
      display: inline-flex;
      animation: scroll 15s linear infinite;
    }

    /* Add pause on hover functionality */
    .slider-container:hover .slider {
      animation-play-state: paused;
    }

    /* Double the animation to ensure no pauses */
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-150px * ${logos.length}));
      }
    }

    .slide {
      height: 50px;
      width: 150px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      border-radius: 8px;
      position: relative;
    }

    @media (min-width: 640px) {
      .slide {
        height: 60px;
        width: 180px;
        padding: 0 10px;
      }
    }

    @media (min-width: 1024px) {
      .slide {
        height: 70px;
        width: 200px;
      }
    }

    .slide a {
      position: relative;
      display: block;
      width: 120px;
      height: 50px;
    }

    @media (min-width: 640px) {
      .slide a {
        width: 140px;
        height: 60px;
      }
    }

    @media (min-width: 1024px) {
      .slide a {
        width: 150px;
        height: 70px;
      }
    }

    /* Add hover effect with border and background */
    .slide:hover {
      border: 2px solid #235CD0;
      background-color: rgba(235, 242, 255, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(35, 92, 208, 0.2);
    }

    .slide img {
      max-width: 120px;
      max-height: 50px;
      object-fit: contain;
    }

    @media (min-width: 640px) {
      .slide img {
        max-width: 140px;
        max-height: 60px;
      }
    }

    @media (min-width: 1024px) {
      .slide img {
        max-width: 150px;
        max-height: 70px;
      }
    }

    .skeleton-logo {
      position: absolute;
      top: 0;
      left: 0;
      width: 120px;
      height: 50px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.4s ease infinite;
      border-radius: 4px;
      z-index: 1;
    }

    @media (min-width: 640px) {
      .skeleton-logo {
        width: 140px;
        height: 60px;
      }
    }

    @media (min-width: 1024px) {
      .skeleton-logo {
        width: 150px;
        height: 70px;
      }
    }

    /* Add a gradient overlay at the edges */
    .slider-container::before,
    .slider-container::after {
      content: "";
      height: 100%;
      position: absolute;
      width: 60px;
      z-index: 2;
      top: 0;
    }

    @media (min-width: 640px) {
      .slider-container::before,
      .slider-container::after {
        width: 80px;
      }
    }

    @media (min-width: 1024px) {
      .slider-container::before,
      .slider-container::after {
        width: 100px;
      }
    }

    .slider-container::before {
      background: linear-gradient(to right, white, transparent);
      left: 0;
    }

    .slider-container::after {
      background: linear-gradient(to left, white, transparent);
      right: 0;
    }
  `, [logos.length]);

  return (
    <footer className="bg-white mt-10 pb-16 sm:pb-0">
      <style jsx>{sliderStyles}</style>

      {/* Logo Slider */}
      <div className="bg-white mb-6 sm:mb-8 lg:mb-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {LogoSlider}
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200"></div>

      {/* Footer Content */}
      <div className="max-w-[1400px] mx-auto">
        {FooterContent}
      </div>

      {/* Copyright */}
      <div className="mx-auto relative text-center mt-6 sm:mt-8 lg:mt-10">
        <Image
          src="/imgs/home/Footer_Bottom_Not_Text.png"
          width={1920}
          height={52}
          className="h-[60px] sm:h-[52px] w-full object-cover"
          alt="Footer Background"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center text-[#235CD0] text-[10px] sm:text-xs md:text-sm px-3 sm:px-4 py-2 sm:py-0 leading-tight sm:leading-normal">
          © 2025 CÔNG TY CỔ PHẦN ĐÀO TẠO GIÁO DỤC SSSTUDY. Tất cả các quyền được bảo lưu.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
