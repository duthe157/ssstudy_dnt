'use client';

import moment from 'moment';

import { aboutService } from '@/services/aboutService';
import blogCategoryService from '@/services/blogCategoryService';
import { ceoService } from '@/services/ceoService';
import { Tooltip } from 'antd';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './ceo-nguyen-tien-dat.module.scss';

const CATEGORY_NAME = "Báo chí nói về thầy Nguyễn Tiến Đạt";
const PAGE_INDEX = 1;
const PAGE_SIZE = 8;

export default function CEOIntroPageClient() {
  const [aboutCEO, setAboutCEO] = useState<any[]>([]);

  const [ceoDetail, setCeoDetail] = useState<any>(null);
  const [isLoadingCeoDetail, setIsLoadingCeoDetail] = useState(true);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const blogResponse = await aboutService.getBlog(
          PAGE_INDEX,
          PAGE_SIZE,
          CATEGORY_NAME,
          {
            sort_by: 'updated_at',
            sort_order: 'asc',
          }
        );
        if (blogResponse && blogResponse.data && blogResponse.code === 200) {
          const data = blogResponse?.data.records.map((item: any) => ({
            ...item,
            updated_at: moment(item.updated_at).format('DD/MM/YYYY'),
          }));
          setAboutCEO(data || []);
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang giới thiệu:', err);
      }
    }

    async function fetchCeoDetail() {
      try {
        setIsLoadingCeoDetail(true);
        const response = await ceoService.getDetail();
        if (response && response.data) {
          setCeoDetail(response.data);
          console.log('CEO Detail Data:', response.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang giới thiệu CEO:', err);
      } finally {
        setIsLoadingCeoDetail(false);
      }
    }

    fetchAboutData();
    fetchCeoDetail();
  }, []);

  const getURL = async (item: any) => {
    try {
      let alias = '';
      if (item.category?.id) {
        const det = await blogCategoryService.detail({
          id: String(item.category?.id),
        });
        alias = det?.data?.alias || '';
      }
      if (alias && item.alias) {
        window.open(`/${alias}/${item.alias}?id=${item._id}`, '_blank');
      }
    } catch {}
  };

  const htmlToText = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const renderAchievements = () => {
    if (!ceoDetail?.achievements || ceoDetail.achievements.length === 0)
      return null;

    return ceoDetail.achievements.map((item: any) => (
      <div key={item.id} className="flex items-center gap-8">
        <img
          className="w-[50px] h-[50px] rounded-md object-cover"
          src={item.icon || '/imgs/home/image-complete.png'}
          alt="icon"
        />
        <div className="text-base font-bold text-[#242A4B]">
          {item.description}
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="md:max-xl:px-20 pt-[10px] pb-4">
        <nav
          className="flex items-center space-x-2 text-sm text-gray-600"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-800 font-medium">CEO Nguyễn Tiến Đạt</span>
        </nav>
      </div>

      <div className="flex md:max-xl:px-20 max-lg:flex-col gap-8 mb-[90px] justify-between">
        <div className="flex flex-col gap-8 lg:w-[600px]">
          {/* 1. NAME */}
          <div className="font-bold text-[40px] text-[#242A4B]">
            {ceoDetail?.name || 'CEO Nguyễn Tiến Đạt'}
          </div>

          {/* 2. CEO DESCRIPTION */}
          <div className="text-base font-normal text-[#50556F]">
            {ceoDetail?.ceo_description}
          </div>

          {/* 3. ACHIEVEMENTS (Desktop View) */}
          <div className="flex flex-col gap-3 max-lg:hidden">
            {renderAchievements()}
          </div>
        </div>

        {/* 4. AVATAR */}
        <div className={`place-self-center ${styles.heroImageContainer}`}>
          <img
            className={styles.heroImage}
            src={ceoDetail?.avatar || '/imgs/home/teacher_no_bg.png'}
            alt={ceoDetail?.name}
          />
        </div>

        {/* 3. ACHIEVEMENTS (Mobile View) */}
        <div className="flex flex-col gap-4 lg:hidden">
          {renderAchievements()}
        </div>
      </div>

      <div className="mb-[90px] md:max-xl:px-20">
        {/* 5. DESCRIPTION - PHẦN SỬA ĐỔI */}
        {/* Hiển thị HTML trực tiếp, ánh xạ các class của Editor để hiển thị đúng như Admin nhập */}
        {ceoDetail?.description && (
          <div
            className="
              text-base text-[#50556F] font-normal
              
              /* QUAN TRỌNG 1: Giữ nguyên định dạng khoảng trắng, xuống dòng, Tab */
              whitespace-pre-wrap 
              break-words 
              
              /* QUAN TRỌNG 2: Định nghĩa độ rộng Tab (giả lập phím Tab trong Word) */
              [tab-size:32px]

              /* QUAN TRỌNG 3: Ánh xạ các class của Quill Editor (Admin) sang CSS thực tế */
              /* Căn chỉnh */
              [&_.ql-align-center]:text-center
              [&_.ql-align-right]:text-right
              [&_.ql-align-left]:text-left
              [&_.ql-align-justify]:text-justify
              
              /* Thụt đầu dòng (Indentation) */
              [&_.ql-indent-1]:pl-8
              [&_.ql-indent-2]:pl-16
              [&_.ql-indent-3]:pl-24

              /* Cỡ chữ (nếu admin chỉnh size) */
              [&_.ql-size-small]:text-sm
              [&_.ql-size-large]:text-xl
              [&_.ql-size-huge]:text-3xl

              /* QUAN TRỌNG 4: Khôi phục Style cơ bản (Reset của Tailwind làm mất style h1, b, list...) */
              /* Headings */
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#242A4B]
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#242A4B]
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#242A4B]
              [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-[#242A4B]
              
              /* Định dạng chữ */
              [&_strong]:font-bold [&_b]:font-bold
              [&_em]:italic [&_i]:italic
              [&_u]:underline
              [&_s]:line-through
              
              /* Danh sách (Lists) */
              [&_ul]:list-disc [&_ul]:pl-10
              [&_ol]:list-decimal [&_ol]:pl-10
              
              /* Hình ảnh */
              [&_img]:max-w-full [&_img]:h-auto [&_img]:inline-block [&_img]:rounded-lg
              [&_.ql-align-center>img]:mx-auto

              /* Links */
              [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer
            "
            dangerouslySetInnerHTML={{
              __html: ceoDetail.description,
            }}
          />
        )}
      </div>
      {!!aboutCEO.length && (
        <>
          <div className="md:max-xl:px-20">
            <div className="font-bold text-[40px] text-[#242A4B] text-center mb-[60px]">
              Báo chí nói về thầy Nguyễn Tiến Đạt
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutCEO.map((item: any) => (
                <div
                  className={`flex flex-col w-full h-full ${styles.aboutCard}`}
                  key={item._id}
                >
                  <div className="relative w-full aspect-[4/2.5] bg-gray-100 overflow-hidden">
                    <img
                      className="object-cover transition-transform duration-200 group-hover/item:scale-105 object-center h-full w-full"
                      src={item.image}
                      alt=""
                    />
                  </div>
                  <div
                    className={`flex flex-col gap-4 p-4 h-auto`}
                  >
                    <div
                      className={`text-lg font-bold hover:text-blue-500 hover:cursor-pointer`}
                      onClick={() => getURL(item)}
                    >
                      <Tooltip
                        placement="bottom"
                        title={item.name}
                        trigger="hover"
                        className={`${styles.textEllipsis2}`}
                      >
                        {item.name}
                      </Tooltip>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div
                        className={`text-base font-normal text-[#50556F] ${styles.textEllipsis3}`}
                      >
                        <Tooltip
                          placement="bottom"
                          title={htmlToText(item.description)}
                          trigger="hover"
                        >
                          {htmlToText(item.description)}
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-[6px]">
                        <img src="/imgs/home/date-icon.svg" alt="" />
                        <div className="text-base font-medium text-[#50556F]">
                          {item.updated_at}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-5">
            <a
              href="/bao-chi-noi-ve-thay-nguyen-tien-dat"
              target="_blank"
              className="hover:text-blue-500"
            >
              Xem tất cả &rarr;
            </a>
          </div>
        </>
      )}
    </>
  );
}
