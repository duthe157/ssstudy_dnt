"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
// import { CDN_LINK } from "../../utils/constants.js";
import { CDN_LINK } from "../../utils/constants";
import { homeService } from "@/services/homeService";
import { useHome } from "@/contexts/HomeContext";
import { ChevronLeft } from "lucide-react";
import { Typography } from "../ui";
import { LessonDetailResponse } from "@/services/lessonService";
import baseHelper from "../helpers/baseHelper";
import { blogService } from "@/services/blogService";
import {
  blogCategoryService,
  type BlogCategoryRecord,
} from "@/services/blogCategoryService";
import NotificationUi from "./NotificationUi";
import { blogCategoryFromOldSource } from "@/services/blogCategoryFromOldSource";
import { classroomService } from "@/services/classroomService";
import { apiService } from "../../services/api";
import { bookidService } from "@/services/bookidService";

import SearchBox from "@/components/ui/SearchBox";

// Helper function to get name placeholder
const getNamePlaceholder = (fullname?: string) => {
  if (!fullname) return "U";
  return fullname.charAt(0).toUpperCase();
};

// --- Start Added Types ---
export interface RootContextType {
  cartCount?: number;
  notifications?: Notification[]; // Use defined Notification type
  user?: {
    fullname?: string;
    avatar?: string;
  };
  isLogin?: boolean;
  totalMessageUnread?: number;
  hideMobileNav?: boolean;
  setHideMobileNav?: (hide: boolean) => void;
  handleLogout: () => void;
  handleAddCart: (payload: {
    item_id: string;
    name: string;
    price: number;
    qty: number;
    type: string;
    image: string;
  }) => void | Promise<void>;
  openQuestionPopup?: (questionId: string) => void;
}

interface MegaMenuHomeItem {
  _id: string;
  name: string;
  list_subjects?: SubjectItem[];
}

interface SubjectItem {
  subject_name: string;
  subject_id: string;
  // Add classroom_group_id here if it comes from the API like this
  classroom_group_id?: string; // Added optional classroom_group_id
}

interface HeaderProps {
  rootContext: RootContextType;
  megaMenuHome: MegaMenuHomeItem[] | null | undefined;
}

interface CartIconProps {
  rootContext?: RootContextType;
}

interface Notification {
  _id: string;
  name: string;
  created_at: string; // Or Date object if parsed
  message_user_id: string;
  is_read?: boolean;
}

interface Course {
  name: string;
  subject_id: string;
  classroom_group_id: string;
}

interface CourseCategory {
  title: string;
  courses: Course[];
}

// Type for refs that might hold tooltip-like components with a close method
interface ClosableComponentRef {
  close: () => void;
}
// --- End Added Types ---

export const CartIcon = forwardRef<HTMLAnchorElement, CartIconProps>(
  (props, ref) => {
    return (
      <Link
        href="/gio-hang"
        className="group relative flex cursor-pointer"
        ref={ref}
      >
        <span className="flex flex-row items-center p-2 text-#292929 hover:text-orange-main">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.881 15.3151L8.4183 16.7479L5.77949 7.00462H21.6004L19.881 15.3151Z"
              fill="#9A9DAC"
            />
            <path
              d="M12.0004 20.4999C12.0004 21.3284 11.3288 21.9999 10.5004 21.9999C9.67196 21.9999 9.00039 21.3284 9.00039 20.4999C9.00039 19.6715 9.67196 18.9999 10.5004 18.9999C11.3288 18.9999 12.0004 19.6715 12.0004 20.4999Z"
              fill="#9A9DAC"
            />
            <path
              d="M20.0004 20.4999C20.0004 21.3284 19.3288 21.9999 18.5004 21.9999C17.672 21.9999 17.0004 21.3284 17.0004 20.4999C17.0004 19.6715 17.672 18.9999 18.5004 18.9999C19.3288 18.9999 20.0004 19.6715 20.0004 20.4999Z"
              fill="#9A9DAC"
            />
            <path
              d="M2.40039 1.99268C1.84811 1.99268 1.40039 2.44039 1.40039 2.99268C1.40039 3.54496 1.84811 3.99268 2.40039 3.99268V1.99268ZM4.69293 2.99268L5.65815 2.73126C5.5401 2.29536 5.14453 1.99268 4.69293 1.99268V2.99268ZM8.4183 16.7479L7.45307 17.0093C7.58334 17.4903 8.04786 17.802 8.54234 17.7402L8.4183 16.7479ZM19.881 15.3151L20.005 16.3073C20.4297 16.2543 20.7735 15.9368 20.8602 15.5177L19.881 15.3151ZM21.6004 7.00462L22.5796 7.20722C22.6406 6.91271 22.5657 6.60641 22.3758 6.37319C22.1859 6.13998 21.9011 6.00462 21.6004 6.00462V7.00462ZM5.77949 7.00462L4.81427 7.26603L5.77949 7.00462ZM2.40039 3.99268H4.69293V1.99268H2.40039V3.99268ZM8.54234 17.7402L20.005 16.3073L19.7569 14.3228L8.29427 15.7556L8.54234 17.7402ZM20.8602 15.5177L22.5796 7.20722L20.6211 6.80201L18.9017 15.1125L20.8602 15.5177ZM3.7277 3.25409L4.81427 7.26603L6.74472 6.7432L5.65815 2.73126L3.7277 3.25409ZM4.81427 7.26603L7.45307 17.0093L9.38353 16.4865L6.74472 6.7432L4.81427 7.26603ZM21.6004 6.00462H5.77949V8.00462H21.6004V6.00462ZM11.0004 20.4999C11.0004 20.7761 10.7765 20.9999 10.5004 20.9999V22.9999C11.8811 22.9999 13.0004 21.8807 13.0004 20.4999H11.0004ZM10.5004 20.9999C10.2242 20.9999 10.0004 20.7761 10.0004 20.4999H8.00039C8.00039 21.8807 9.11968 22.9999 10.5004 22.9999V20.9999ZM10.0004 20.4999C10.0004 20.2238 10.2242 19.9999 10.5004 19.9999V17.9999C9.11968 17.9999 8.00039 19.1192 8.00039 20.4999H10.0004ZM10.5004 19.9999C10.7765 19.9999 11.0004 20.2238 11.0004 20.4999H13.0004C13.0004 19.1192 11.8811 17.9999 10.5004 17.9999V19.9999ZM19.0004 20.4999C19.0004 20.7761 18.7765 20.9999 18.5004 20.9999V22.9999C19.8811 22.9999 21.0004 21.8807 21.0004 20.4999H19.0004ZM18.5004 20.9999C18.2242 20.9999 18.0004 20.7761 18.0004 20.4999H16.0004C16.0004 21.8807 17.1197 22.9999 18.5004 22.9999V20.9999ZM18.0004 20.4999C18.0004 20.2238 18.2242 19.9999 18.5004 19.9999V17.9999C17.1197 17.9999 16.0004 19.1192 16.0004 20.4999H18.0004ZM18.5004 19.9999C18.7765 19.9999 19.0004 20.2238 19.0004 20.4999H21.0004C21.0004 19.1192 19.8811 17.9999 18.5004 17.9999V19.9999Z"
              fill="#9A9DAC"
            />
          </svg>
        </span>
        {/*khong xac dinh thi de gia tri 0*/}
        {/*{(props.rootContext?.cartCount ?? 0) > 0 && (*/}
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
          {props.rootContext?.cartCount ?? 0}
        </div>
        {/*)}*/}
      </Link>
    );
  }
);

CartIcon.displayName = "CartIcon";

// Animation variants for dropdown
const dropdownVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.4 },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 },
    },
  },
};

// Animation variants for modals
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

// Tạo ClientOnlyHeader wrapper để đảm bảo Header chỉ render phía client
const ClientOnlyHeader: React.FC<HeaderProps> = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Trả về placeholder trống hoặc skelton loading nếu muốn
    return (
      <div className="hidden lg:block header-menu">
        <div className="bg-[url('/imgs/home/Top.png')] bg-cover bg-no-repeat py-1 flex justify-between items-center px-4">
          <div className="max-w-[1440px] mx-auto bg-cover bg-no-repeat py-1 flex justify-between items-center px-4 pl-0 pr-0 w-full px-2 md:px-4"></div>
        </div>
        <div className="sticky top-0 z-[60] bg-white py-2 shadow-md">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 relative"></div>
        </div>
      </div>
    );
  }

  return <Header {...props} />;
};

// Component Header chính
const Header: React.FC<HeaderProps> = ({ rootContext }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIntroDropdownOpen, setIsIntroDropdownOpen] = useState(false);
  const [isComboOpen, setIsComboOpen] = useState(false);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState(false);
  const newsDropdownRef = useRef<HTMLDivElement>(null);
  const [newsCategories, setNewsCategories] = useState<BlogCategoryRecord[]>(
    []
  );



  const searchButtonRef = useRef<ClosableComponentRef | null>(null);
  const notifyRef = useRef<ClosableComponentRef | null>(null);
  const myRef = useRef<ClosableComponentRef | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const introDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const lessonName = searchParams?.get("lessonName") || "";
  const isLessonPage = /^\/lesson\/[^/]+$/.test(pathname || "");

  // Active states for top-level menus
  const isIntroActive = useMemo(() => {
    if (!pathname) return false;
    return (
      // pathname.startsWith("/ve-chung-toi") ||
      pathname.startsWith("/ceo-nguyen-tien-dat") ||
      pathname.startsWith("/giao-vien") ||
      pathname.startsWith("/doi-tac") ||
      pathname.startsWith("/bao-chi-noi-ve-thay-nguyen-tien-dat") ||
      pathname.startsWith("/bao-chi-noi-ve-ssstudy")
    );
  }, [pathname]);

  const isCoursesActive = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/khoa-hoc") || pathname.startsWith("/lesson");
  }, [pathname]);

  const isBooksActive = useMemo(() => {
    if (!pathname) return false;
    return pathname === "/sach" || (pathname.startsWith("/sach/") && !pathname.startsWith("/sach-id"));
  }, [pathname]);

  const isBookIdActive = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/sach-id");
  }, [pathname]);

  const isScoreReviewActive = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/diem-review");
  }, [pathname]);

  const isNewsActive = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/ban-tin") || pathname.startsWith("/tin-tuc");
  }, [pathname]);

  const isDocumentsActive = useMemo(() => {
    if (!pathname) return false;
    return pathname.startsWith("/tai-lieu");
  }, [pathname]);



  function menuTextClass(isActive: boolean) {
    return `flex items-center relative py-2 px-4 group text-base text-center ${isActive ? "text-[#285dcd] font-bold" : "text-[#686868] font-medium"
      } hover:text-blue-500`;
  }

  async function fetchNewsCategories() {
    const normalizeString = (str: string) => str.toLowerCase().trim();
    try {
      // 1. Fetch danh mục
      const jsonCat = (await apiService.post("blog-category/list", {})) as any;

      const excluded = [
        "Về Chúng Tôi",
        "Báo chí nói về thầy Nguyễn Tiến Đạt",
        "Đối tác",
        "Chính sách",
        "Chính Sách",
        "Báo chí nói về SSStudy",
        "Về SSStudy",
      ];

      const excludedNormalized = excluded.map(normalizeString);
      const filteredCategories = jsonCat.data.records.filter(
        (cat: any) =>
          cat.status === true &&
          !excludedNormalized.includes(normalizeString(cat.name))
      );

      setNewsCategories(filteredCategories);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  }

  const { dataHomePage, getDataHomePage } = useHome();

  useEffect(() => {
    // Fetch dataHomePage nếu chưa có
    getDataHomePage();
    fetchNewsCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  const closeTooltip = () => {
    searchButtonRef?.current?.close?.();
    notifyRef?.current?.close?.();
    myRef?.current?.close?.();
  };

  const handlePushRoute = useCallback(
    (path: string, query?: Record<string, string>) => {
      closeTooltip();
      let url = path;
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
      }
      router.push(url);
    },
    [router]
  );

  // const handlePushRoute = (path: string) => {
  //     closeTooltip();
  //     // Trong next/navigation, router.push() không nhận object mà chỉ nhận string
  //     router.push(path);
  // };
  const renderNotification = useMemo(() => {
    if (rootContext?.notifications && rootContext.notifications.length > 0) {
      return (
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {rootContext.notifications.map(
            (notification: Notification, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  handlePushRoute(`/thong-bao/${notification?._id}`, {
                    message_user_id: notification?.message_user_id,
                  });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handlePushRoute(`/thong-bao/${notification?._id}`, {
                      message_user_id: notification?.message_user_id,
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-orange-main rounded">
                    Thông báo
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">
                      {notification?.created_at
                        ? baseHelper?.formatDateCustom(notification?.created_at)
                        : null}
                    </span>
                    {!notification?.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-800 line-clamp-2">
                  {notification?.name}
                </p>
              </div>
            )
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-gray-500">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-sm">Không có thông báo mới</p>
        </div>
      );
    }
  }, [rootContext?.notifications, handlePushRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        event.target instanceof Node &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      const targetNode = event.target instanceof Node ? event.target : null;
      if (!targetNode) return;

      const isClickInsideDropdownItems = Array.from(
        document.querySelectorAll(".dropdown-menu-item")
      ).some((item) => item.contains(targetNode) || item === targetNode);

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(targetNode) &&
        !isClickInsideDropdownItems
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideAbout = (event: MouseEvent) => {
      if (
        introDropdownRef.current &&
        event.target instanceof Node &&
        !introDropdownRef.current.contains(event.target)
      ) {
        setIsIntroDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideAbout);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideAbout);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideNews = (event: MouseEvent) => {
      if (
        newsDropdownRef.current &&
        event.target instanceof Node &&
        !newsDropdownRef.current.contains(event.target)
      ) {
        setIsNewsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideNews);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideNews);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideCombo = (event: MouseEvent) => {
      if (
        comboRef.current &&
        event.target instanceof Node &&
        !comboRef.current.contains(event.target)
      ) {
        setIsComboOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideCombo);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCombo);
    };
  }, []);

  const toggleUserDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsIntroDropdownOpen(false);
    setIsComboOpen(false);
    setIsNewsDropdownOpen(false);
  };

  const toggleIntroDropdown = () => {
    setIsIntroDropdownOpen(!isIntroDropdownOpen);
    setIsDropdownOpen(false);
    setIsNewsDropdownOpen(false);
  };

  const toggleCombo = () => {
    setIsComboOpen(!isComboOpen);
    setIsDropdownOpen(false);
    setIsNewsDropdownOpen(false);
  };

  const toggleNewsDropdown = () => {
    setIsNewsDropdownOpen(!isNewsDropdownOpen);
    setIsDropdownOpen(false);
    setIsIntroDropdownOpen(false);
    setIsComboOpen(false);
  };

  const transformMegaMenuToCourseCategories = (
    menuData: MegaMenuHomeItem[] | null | undefined
  ): CourseCategory[] => {
    if (!Array.isArray(menuData)) {
      return [];
    }

    return menuData
      .map((group) => {
        if (
          !group.list_subjects ||
          !Array.isArray(group.list_subjects) ||
          group.list_subjects.length === 0
        ) {
          // Không trả về nhóm này nếu list_subjects rỗng
          return null; // Trả về null để loại bỏ nhóm này
        }

        const courses: Course[] = group.list_subjects.map(
          (subject: SubjectItem) => ({
            name: subject.subject_name,
            subject_id: subject.subject_id,
            classroom_group_id: group._id,
          })
        );

        return {
          title: group.name,
          courses: courses,
        };
      })
      .filter((group): group is CourseCategory => group !== null); // Lọc bỏ các nhóm null
  };

  const courseCategories: CourseCategory[] = useMemo(
    () => transformMegaMenuToCourseCategories(dataHomePage?.megaMenuHome),
    [dataHomePage?.megaMenuHome]
  );

  const introOptions = [
    {
      childs: [
        // {
        //   label: "Về chúng tôi",
        //   value: "/ve-chung-toi",
        // },
        {
          label: "CEO Nguyễn Tiến Đạt",
          value: "/ceo-nguyen-tien-dat",
        },
      ],
    },
    {
      childs: [
        {
          label: "Giáo viên",
          value: "/giao-vien",
        },
        {
          label: "Đối tác",
          value: "/doi-tac",
        },
      ],
    },
    {
      childs: [
        {
          label: "Báo chí nói về thầy Nguyễn Tiến Đạt",
          value: "/bao-chi-noi-ve-thay-nguyen-tien-dat",
        },
        {
          label: "Báo chí nói về SSStudy",
          value: "/bao-chi-noi-ve-ssstudy",
        },
      ],
    },
  ];

  const getUserInitials = () => {
    let namePlaceholder = "User";
    if (rootContext?.user?.fullname) {
      const nameArr = rootContext?.user?.fullname.trim().split(" ");
      if (nameArr.length > 0) {
        namePlaceholder = nameArr[0][0] + nameArr[nameArr.length - 1][0];
      }
    }
    return namePlaceholder;
  };

  const promoMessages = ["Giảm giá 10% khi áp mã Sale"];

  const goToPromotionPage = () => {
    window.location.href =
      "/tin-tuc/thay-nguyen-tien-dat-la-mot-thay-giao-day-toan-uy-tin-va-duoc-nhieu-hoc-sinh-yeu-men-tai-ha-noi-1713048245649";
  };

  const handleCourseClick = (
    course: Course,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const courseHref = `/khoa-hoc?subject_id=${course.subject_id}&group_id=${course.classroom_group_id}`;
    window.location.href = courseHref;
  };

  const handleIntroClick = (
    option: { label: string; value: string },
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const introHref = option.value;
    window.location.href = introHref;
  };




  // --- Activate modal state & forms ---

  const [activeTab, setActiveTab] = useState<"course" | "book">("course");
  const [courseCode, setCourseCode] = useState("");
  const [bookIdValue, setBookIdValue] = useState("");
  const [bookCodeValue, setBookCodeValue] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (isActivateModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActivateModalOpen]);

  const onCourseSubmit = async () => {
    if (!courseCode.trim()) {
      toast.error("Vui lòng nhập mã kích hoạt");
      return;
    }
    setIsActivating(true);
    try {
      const res = await classroomService.accessByCode({
        code: courseCode.trim(),
      });

      if (res?.code == 200) {
        toast.success("Kích hoạt thành công");
        setIsActivateModalOpen(false);
        setCourseCode("");
      } else {
        toast.error(res?.message || "Mã kích hoạt không hợp lệ");
      }
    } catch (error: unknown) {
      let errorMessage =
        "Kích hoạt không thành công, vui lòng kiểm tra lại mã khoá học";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsActivating(false);
    }
  };

  const onBookSubmit = async () => {
    if (!bookIdValue.trim()) {
      toast.error("Vui lòng nhập ID sách");
      return;
    }
    if (!bookCodeValue.trim()) {
      toast.error("Vui lòng nhập mã kích hoạt");
      return;
    }

    setIsActivating(true);
    try {
      const res: any = await bookidService.accessByCode({
        book_id: bookIdValue.trim(),
        code: bookCodeValue.trim(),
      });

      const msg = res?.message || "";
      if (res?.code === 200) {
        toast.success("Kích hoạt thành công");
        setIsActivateModalOpen(false);
        setBookIdValue("");
        setBookCodeValue("");
        router.push("/account/my-course");
      } else {
        const msg = res?.message || "Có lỗi xảy ra";
        // Case 2: User already activated this code
        if (msg.toLowerCase().includes("sử dụng trước đó") || msg.toLowerCase().includes("đã được sử dụng")) {
          toast.success("Mã đã được bạn sử dụng trước đó!");
          setIsActivateModalOpen(false);
          setBookIdValue("");
          setBookCodeValue("");
          router.push("/account/my-course");
        } else {
          toast.error(msg);
        }
      }
    } catch (error: any) {
      let errorMessage = "Kích hoạt không thành công";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      // Case 2: User already activated this code (via error/500)
      if (errorMessage.toLowerCase().includes("sử dụng trước đó") || errorMessage.toLowerCase().includes("đã được sử dụng")) {
        toast.success("Mã đã được bạn sử dụng trước đó!");
        setIsActivateModalOpen(false);
        setBookIdValue("");
        setBookCodeValue("");
        router.push("/account/my-course");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsActivating(false);
    }
  };

  const activateModalContent = isActivateModalOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key="activate-course-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-1" />
          <h2 className="text-2xl font-bold text-gray-900">Kích hoạt</h2>
          <div className="flex-1 flex justify-end">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsActivateModalOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-4 justify-center">
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              activeTab === "course"
                ? "bg-[#235CD0] text-white border-[#235CD0]"
                : "bg-white text-[#235CD0] border-[#235CD0] hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("course")}
          >
            Khóa học
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              activeTab === "book"
                ? "bg-[#235CD0] text-white border-[#235CD0]"
                : "bg-white text-[#235CD0] border-[#235CD0] hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("book")}
          >
            Sách ID
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "course" ? (
          <>
            <p className="text-center text-gray-600 mb-4">
              Vui lòng nhập mã kích hoạt để truy cập khóa học
            </p>

            <div className="space-y-4">
              <input
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900
                placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                type="text"
                placeholder="Nhập mã kích hoạt"
                autoComplete="off"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                disabled={isActivating}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCourseSubmit();
                }}
              />

              <button
                onClick={onCourseSubmit}
                disabled={isActivating || !courseCode.trim()}
                className="w-full rounded-lg bg-[#235CD0] px-4 py-3 text-white font-bold uppercase tracking-wide hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isActivating ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-4">
              Vui lòng nhập đầy đủ thông tin để truy cập sách ID
            </p>

            <div className="space-y-4">
              <input
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900
                placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                type="text"
                placeholder="Nhập ID sách"
                autoComplete="off"
                value={bookIdValue}
                onChange={(e) => setBookIdValue(e.target.value)}
                disabled={isActivating}
              />

              <input
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900
                placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                type="text"
                placeholder="Nhập mã kích hoạt"
                autoComplete="off"
                value={bookCodeValue}
                onChange={(e) => setBookCodeValue(e.target.value)}
                disabled={isActivating}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onBookSubmit();
                }}
              />

              <button
                onClick={onBookSubmit}
                disabled={isActivating || !bookIdValue.trim() || !bookCodeValue.trim()}
                className="w-full rounded-lg bg-[#235CD0] px-4 py-3 text-white font-bold uppercase tracking-wide hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isActivating ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  ) : null;

  // Function to handle the activate course button click
  const handleActivateCourse = () => {
    setIsActivateModalOpen(true);
  };

  return (
    <div className="hidden lg:block header-menu">
      <div className="bg-[url('/imgs/home/Top.png')] bg-cover bg-no-repeat py-1 flex justify-between items-center px-4">
        <div className="max-w-[1440px] mx-auto bg-cover bg-no-repeat py-1 flex justify-between items-center px-4 pl-0 pr-0 w-full px-2 md:px-4">
          <div className="text-red-500 flex items-center overflow-hidden relative w-1/2">
            {isLessonPage && (
              <>
                <ChevronLeft
                  className="size-5 text-blue-500 mr-4 cursor-pointer"
                  onClick={() => router.back()}
                />
                <Link href="/" className="cursor-pointer">
                  <img
                    src="/icon/logo.svg"
                    alt="Logo"
                    className="h-10"
                    width="50"
                    height="50"
                  />
                </Link>
                <div className="w-[1px] h-[52px] bg-white mx-4" />
                <Typography
                  variant={"sm16"}
                  className="text-blue-800 font-bold"
                >
                  {lessonName}
                </Typography>
              </>
            )}
          </div>
          {rootContext.isLogin ? (
            <div className="flex items-center">
              {rootContext?.user?.avatar ? (
                <Image
                  src={`${CDN_LINK}${rootContext?.user?.avatar}`}
                  alt="User avatar"
                  className="rounded-full mr-2"
                  width={30}
                  height={30}
                />
              ) : (
                <div className="mr-[10px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#235CD0] text-[12px] font-semibold uppercase text-white">
                  {getUserInitials()}
                </div>
              )}
              <div className="relative" ref={userDropdownRef}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={toggleUserDropdown}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleUserDropdown(
                        e as unknown as React.MouseEvent<HTMLDivElement>
                      );
                    }
                  }}
                >
                  <span className="text-[#003899]">
                    {rootContext?.user?.fullname
                      ? rootContext?.user?.fullname
                      : "student account"}
                  </span>
                  <Image
                    src="/imgs/arrow-fill-bottom.svg"
                    alt=""
                    className="ml-1 w-2"
                    width={8}
                    height={8}
                  />
                </div>
                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-md rounded z-[9999] w-48">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      href="/account/change-password"
                      className="block px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Đổi mật khẩu
                    </Link>
                    <Link
                      href="/account/my-course"
                      className="block px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Khóa học của tôi
                    </Link>
                    <Link
                      href="/account/credit-history"
                      className="block px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Lịch sử giao dịch
                    </Link>
                    <Link
                      href="/account/order-history"
                      className="block px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Đơn hàng
                    </Link>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-[#003899] hover:text-[#003899] hover:bg-gray-100"
                      onClick={(e) => {
                        setIsUserDropdownOpen(false);
                        closeTooltip();
                        rootContext.handleLogout();
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              <span className="mx-2">|</span>
              <button
                type="button"
                className="text-[#F44336] font-bold"
                onClick={() => {
                  closeTooltip();
                  rootContext.handleLogout();
                }}
              >
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/auth/signup" className="text-[#235CD0] font-bold">
                Đăng ký
              </Link>
              <span className="mx-2">|</span>
              <Link href="/auth/signin" className="text-[#235CD0] font-bold">
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>

      {!isLessonPage && (
        <div className="sticky top-0 z-[60] bg-white py-2 shadow-md">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 relative">
            <div className="flex-shrink-0">
              <Link href="/" className="cursor-pointer">
                <Image
                  src="/icon/logo.svg"
                  alt="Logo"
                  className="h-10"
                  width={50}
                  height={50}
                />
              </Link>
            </div>
            <nav className="flex space-x-4 flex-1 justify-center">
              <div className="relative" ref={introDropdownRef}>
                <button
                  className={menuTextClass(
                    isIntroActive || isIntroDropdownOpen
                  )}
                  onClick={toggleIntroDropdown}
                >
                  <span className="relative z-10 text-base">Giới thiệu</span>
                  <motion.div
                    className="ml-[5px] h-auto w-[20px]"
                    animate={{ rotate: isIntroDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/icon/dropdown.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </button>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  className={menuTextClass(isCoursesActive || isDropdownOpen)}
                  onClick={toggleDropdown}
                >
                  <span className="relative z-10 text-base">Khóa học</span>
                  <motion.div
                    className="ml-[5px] h-auto w-[20px]"
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/icon/dropdown.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </button>
              </div>
              <a href="/sach" className={menuTextClass(isBooksActive)}>
                <span className="relative z-10 text-base">Sách</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </a>
              <a href="/sach-id" className={menuTextClass(isBookIdActive)}>
                <span className="relative z-10 text-base">Sách ID</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </a>

              {/* <Link
                href="/diem-review"
                className={menuTextClass(isScoreReviewActive)}
              >
                <span className="relative z-10 text-base">
                  Điểm và Review
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link> */}
              <div className="relative" ref={newsDropdownRef}>
                <button
                  className={menuTextClass(isNewsActive || isNewsDropdownOpen)}
                  onClick={toggleNewsDropdown}
                >
                  <span className="relative z-10 text-base">Bản tin</span>
                  <motion.div
                    className="ml-[5px] h-auto w-[20px]"
                    animate={{ rotate: isNewsDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src="/icon/dropdown.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </button>
                <AnimatePresence>
                  {isNewsDropdownOpen && (
                    <motion.div
                      className="absolute w-screen bg-white border shadow-lg p-6 z-[60]"
                      style={{ top: "100%", marginLeft: "calc(-50vw + 50%)" }}
                      initial={dropdownVariants.hidden}
                      animate={dropdownVariants.visible}
                      exit={dropdownVariants.exit}
                    >
                      <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-4 gap-6">
                          {newsCategories.map((cat, index: number) => (
                            <motion.a
                              key={cat._id || index}
                              href={`/${cat.alias}`}
                              className="block text-base font-normal text-[#50556f] hover:text-blue-500 py-1 px-2 rounded-md relative overflow-hidden group dropdown-menu-item"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.04,
                              }}
                              whileHover={{
                                x: 5,
                                transition: { duration: 0.2 },
                              }}
                            >
                              <span className="relative z-10">{cat.name}</span>
                              <motion.span
                                className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 transition-all duration-300"
                                style={{ zIndex: 0, pointerEvents: "none" }}
                              />
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* <a href="/tai-lieu" className={menuTextClass(isDocumentsActive)}>
                <span className="relative z-10 text-base">Tài liệu</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#235CD0] group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </a> */}
            </nav>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <SearchBox isLogin={rootContext?.isLogin} openQuestionPopup={rootContext.openQuestionPopup} />

              {/*<NotificationUi rootContext={rootContext} handlePushRoute={handlePushRoute}/>*/}

              <button type="button" className="relative group">
                <span className="flex flex-row items-center p-2 text-#292929 hover:text-orange-main">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.50763 17.1818H19.4933C19.9097 17.1818 20.1458 16.5379 19.9006 16.169C19.3329 15.3147 18.7814 14.0555 18.7814 12.537L18.8058 10.4599C18.8058 6.33993 15.7588 3 12 3C8.29581 3 5.29296 6.29145 5.29296 10.3517L5.26855 12.537C5.26855 14.0451 4.69736 15.2975 4.10557 16.1514C3.85054 16.5194 4.08602 17.1818 4.50763 17.1818Z"
                      fill="#9A9DAC"
                    />

                    <path
                      d="M9.33333 20.0909C10.041 20.6562 10.9755 21 12 21C13.0245 21 13.959 20.6562 14.6667 20.0909M4.50763 17.1818C4.08602 17.1818 3.85054 16.5194 4.10557 16.1514C4.69736 15.2975 5.26855 14.0451 5.26855 12.537L5.29296 10.3517C5.29296 6.29145 8.29581 3 12 3C15.7588 3 18.8058 6.33993 18.8058 10.4599L18.7814 12.537C18.7814 14.0555 19.3329 15.3147 19.9006 16.169C20.1458 16.5379 19.9097 17.1818 19.4933 17.1818H4.50763Z"
                      stroke="#9A9DAC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                  {rootContext?.totalMessageUnread ?? 0}
                </div>

                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="text-center text-gray-500">
                    {renderNotification}
                  </div>
                </div>
              </button>

              <CartIcon rootContext={rootContext} />

              <button
                className="bg-[#235CD0] text-white px-4 py-1 rounded-[76px]"
                onClick={() => (window.location.href = "/thi-thu")}
              >
                Thi thử
              </button>
              {rootContext.isLogin && (
                <button
                  className="bg-[#235CD0] text-white px-4 py-1 rounded-[76px]"
                  onClick={handleActivateCourse}
                >
                  Mã kích hoạt
                </button>
              )}
            </div>
          </div>
          <AnimatePresence>
            {isIntroDropdownOpen && (
              <motion.div
                className="absolute w-screen bg-white border shadow-lg p-6 z-50"
                style={{ top: "100%", marginLeft: "calc(-50vw + 50%)" }}
                initial={dropdownVariants.hidden}
                animate={dropdownVariants.visible}
                exit={dropdownVariants.exit}
              >
                <div className="container mx-auto max-w-7xl">
                  <div className="grid grid-cols-4 gap-6">
                    {introOptions.map((item, index) => {
                      return (
                        <motion.div
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 1 * 0.08,
                            ease: "easeOut",
                          }}
                        >
                          {item.childs.map((option, childIndex: number) => {
                            return (
                              <motion.a
                                key={index + childIndex}
                                href={option.value}
                                onMouseDown={(
                                  e: React.MouseEvent<HTMLAnchorElement>
                                ) => {
                                  handleIntroClick(option, e);
                                }}
                                className="block whitespace-nowrap text-base font-normal text-[#50556f] hover:text-blue-500 py-1 px-2 rounded-md relative overflow-hidden group dropdown-menu-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.05 + childIndex * 0.04,
                                }}
                                whileHover={{
                                  x: 5,
                                  transition: { duration: 0.2 },
                                }}
                              >
                                <span className="relative z-10">
                                  {option.label}
                                </span>
                                <motion.span
                                  className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 transition-all duration-300"
                                  style={{ zIndex: 0, pointerEvents: "none" }}
                                />
                              </motion.a>
                            );
                          })}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
            {isDropdownOpen && (
              <motion.div
                className="absolute w-screen bg-white border shadow-lg p-6 z-50"
                style={{ top: "100%", marginLeft: "calc(-50vw + 50%)" }}
                initial={dropdownVariants.hidden}
                animate={dropdownVariants.visible}
                exit={dropdownVariants.exit}
              >
                <div className="container mx-auto max-w-7xl">
                  <div className="grid grid-cols-5 gap-6">
                    {courseCategories.map(
                      (category: CourseCategory, index: number) => (
                        <motion.div
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.08,
                            ease: "easeOut",
                          }}
                        >
                          <h3 className="text-base font-bold text-[#686868] mb-3">
                            {category.title}
                          </h3>
                          {category.courses.map(
                            (course: Course, courseIndex: number) => {
                              const courseHref = `/khoa-hoc?subject_id=${course.subject_id}&group_id=${course.classroom_group_id}`;

                              return (
                                <motion.a
                                  key={courseIndex}
                                  href={courseHref}
                                  onClick={(
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => handleCourseClick(course, e)}
                                  onMouseDown={(
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => {
                                    e.stopPropagation();
                                  }}
                                  className="block text-base font-normal text-[#5b5f77] hover:text-blue-500 py-1 px-2 rounded-md relative overflow-hidden group dropdown-menu-item"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: index * 0.05 + courseIndex * 0.04,
                                  }}
                                  whileHover={{
                                    x: 5,
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  <span className="relative z-10">
                                    {course.name}
                                  </span>
                                  <motion.span
                                    className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0 transition-all duration-300"
                                    style={{ zIndex: 0, pointerEvents: "none" }}
                                  />
                                </motion.a>
                              );
                            }
                          )}
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Activate Course Modal */}
      <AnimatePresence initial={false}>
        {activateModalContent}
      </AnimatePresence>
    </div>
  );
};

// Export ClientOnlyHeader thay vì Header trực tiếp
export default ClientOnlyHeader;
