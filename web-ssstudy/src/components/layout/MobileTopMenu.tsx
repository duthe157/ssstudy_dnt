"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Menu,
  Search,
  X,
  Info,
  Book,
  Newspaper,
  LogOut,
  Award,
  ChevronDown,
  Key,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useHome } from "@/contexts/HomeContext";
import {
  blogCategoryService,
  type BlogCategoryRecord,
} from "@/services/blogCategoryService";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CartIcon, type RootContextType } from "./Header";
import NotificationUi from "./NotificationUi";
import { classroomService } from "@/services/classroomService";
import { apiService } from '../../services/api';
import {
  searchHistoryService,
  type SearchHistoryItem,
} from "@/services/searchHistoryService";
import { bookidService } from "@/services/bookidService";


// Component để tránh hydration mismatch
function ClientOnlyLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

interface MegaMenuHomeItem {
  _id: string;
  name: string;
  list_subjects?: SubjectItem[];
}

interface SubjectItem {
  subject_name: string;
  subject_id: string;
  classroom_group_id?: string;
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
        return null;
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
    .filter((group): group is CourseCategory => group !== null);
};

interface MobileTopMenuProps {
  rootContext?: RootContextType;
}

export default function MobileTopMenu({ rootContext }: MobileTopMenuProps) {
  const [open, setOpen] = useState(false);
  const [valueSearch, setValueSearch] = useState("");
  const [newsCategories, setNewsCategories] = useState<BlogCategoryRecord[]>(
    []
  );
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [bookIdMode, setBookIdMode] = useState(false);
  const [bookIdValue, setBookIdValue] = useState("");
  const [bookActivationCode, setBookActivationCode] = useState("");
  const { dataHomePage, getDataHomePage } = useHome();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Search history states
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<HTMLDivElement>(null);

  async function fetchNewsCategories() { // 
    const normalizeString = (str: string) => str.toLowerCase().trim();
    try {
      // 1. Fetch danh mục
      const jsonCat = await apiService.post('blog-category/list', {}) as any;

      const excluded = [
        "Về Chúng Tôi",
        "Báo chí nói về thầy Nguyễn Tiến Đạt",
        "Đối tác",
        "Chính sách",
        "Chính Sách",
        "Báo chí nói về SSStudy",
        "Về SSStudy"
      ];

      const excludedNormalized = excluded.map(normalizeString);
      const filteredCategories = jsonCat.data.records.filter(
        (cat: any) => cat.status === true && !excludedNormalized.includes(normalizeString(cat.name))
      );

      setNewsCategories(filteredCategories);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  }

  // Check if we're on course detail page
  const isCourseDetailPage = useMemo(() => {
    if (!pathname) return false;
    // Match pattern /khoa-hoc/[id] but not /khoa-hoc (list page)
    return /^\/khoa-hoc\/[^/]+$/.test(pathname);
  }, [pathname]);

  const isTextSearchAllowed = useMemo(() => {
    if (!pathname) return false;
    return (
      pathname === "/sach" ||
      pathname.startsWith("/sach/") ||
      pathname === "/khoa-hoc" ||
      pathname.startsWith("/khoa-hoc/")
    );
  }, [pathname]);

  const handleSearchIdRedirect = useCallback(
    (resData: any) => {
      if (!resData) return false;
      const { type, id, book_id, course_id, data: nestedData } = resData;

      if (type === "book_id" && book_id && course_id) {
        router.push(`/sach-id/${book_id}/${course_id}`);
        setValueSearch("");
        setOpen(false);
        return true;
      }

      if (type === "lesson" && id) {
        router.push(`/lesson/${id}`);
        setValueSearch("");
        setOpen(false);
        return true;
      }

      if (type === "exam" && nestedData?.id) {
        const examId = nestedData.id;
        const examType = nestedData.type;
        if (examType === "SACH_ID") {
          router.push(`/thi-thu/result/${examId}/explanation?mode=view`);
          setValueSearch("");
          setOpen(false);
          return true;
        } else if (examType === "WORD") {
          router.push(`/thi-thu/word-exam/${examId}/ready`);
          setValueSearch("");
          setOpen(false);
          return true;
        }
      }

      if (type === "question" && id) {
        if (rootContext?.openQuestionPopup) {
          rootContext.openQuestionPopup(id);
          setValueSearch("");
          setOpen(false);
          return true;
        }
      }

      return false;
    },
    [router, rootContext]
  );

  // Fetch data khi component mount
  useEffect(() => {
    // Lấy keyword từ URL khi component mount
    if (searchParams) {
      const keyword = searchParams.get("keyword");
      if (keyword) {
        setValueSearch(keyword);
      }
    }

    getDataHomePage();

    // Fetch news categories
    fetchNewsCategories();

  }, [getDataHomePage, searchParams]);

  // Transform course categories
  const courseCategories: CourseCategory[] = useMemo(
    () => transformMegaMenuToCourseCategories(dataHomePage?.megaMenuHome),
    [dataHomePage?.megaMenuHome]
  );

  // Intro options (static)
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

  // Handle course click
  const handleCourseClick = (course: Course) => {
    const courseHref = `/khoa-hoc?subject_id=${course.subject_id}&group_id=${course.classroom_group_id}`;
    router.push(courseHref);
    setOpen(false);
  };

  // Handle push route for notifications
  const handlePushRoute = (path: string) => {
    router.push(path);
  };

  // Fetch search history from API
  const fetchSearchHistory = useCallback(async () => {
    if (!rootContext?.isLogin) {
      setSearchHistory([]);
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      const response = await searchHistoryService.getSearchHistory();
      if (response?.code === 200 && response?.data) {
        setSearchHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [rootContext?.isLogin]);

  // Add keyword to search history
  const addToSearchHistory = useCallback(async (keyword: string) => {
    if (!rootContext?.isLogin || !keyword.trim()) return;
    
    try {
      await searchHistoryService.addSearchHistory(keyword.trim());
    } catch (error) {
      console.error("Error adding to search history:", error);
    }
  }, [rootContext?.isLogin]);

  // Delete keyword from search history
  const deleteFromSearchHistory = useCallback(async (keyword: string) => {
    if (!rootContext?.isLogin) return;
    
    try {
      await searchHistoryService.deleteSearchHistory(keyword);
      setSearchHistory((prev) => prev.filter((item) => item.keyword !== keyword));
    } catch (error) {
      console.error("Error deleting from search history:", error);
    }
  }, [rootContext?.isLogin]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setShowSearchHistory(true);
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  // Handle click on history item
  const handleHistoryItemClick = useCallback(async (keyword: string) => {
    setValueSearch(keyword);
    setShowSearchHistory(false);

    if (!isTextSearchAllowed) {
      try {
        const res = await searchHistoryService.searchById(keyword);
        if (res?.code === 200 && res?.data) {
          const success = handleSearchIdRedirect(res.data);
          if (success) return;
        }
      } catch (error) {
        // Fallback to normal search or ignore
      }
    }

    const searchUrl = `/tim-kiem?keyword=${encodeURIComponent(keyword)}&type=CLASSROOM`;
    router.push(searchUrl);
    setOpen(false);
  }, [router, isTextSearchAllowed, handleSearchIdRedirect]);

  // Click outside to close search history dropdown
  useEffect(() => {
    const handleClickOutsideSearchHistory = (event: MouseEvent) => {
      if (
        searchHistoryRef.current &&
        event.target instanceof Node &&
        !searchHistoryRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearchHistory);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearchHistory);
    };
  }, []);

  // Handle search
  const handleSearch = async () => {
    const keyword = valueSearch.trim();
    if (!keyword) return;

    await addToSearchHistory(keyword);
    setShowSearchHistory(false);

    if (!isTextSearchAllowed) {
      try {
        const res = await searchHistoryService.searchById(keyword);
        if (res?.code === 200 && res?.data) {
          const success = handleSearchIdRedirect(res.data);
          if (success) return;
        }
      } catch (error) {
        // Ignore error and proceed to normal search if it's not actually an ID
      }
    }

    const searchUrl = `/tim-kiem?keyword=${encodeURIComponent(
      keyword
    )}&type=CLASSROOM`;
    router.push(searchUrl);
    setOpen(false);
  };

  // Handle key down for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle course activation
  const handleActivate = async () => {
    if (!activationCode.trim()) {
      // Show error toast
      const { toast } = await import("react-toastify");
      toast.error("Vui lòng nhập mã kích hoạt");
      return;
    }

    if (isActivating) return;

    setIsActivating(true);
    try {
      const response = await classroomService.accessByCode({
        code: activationCode.trim(),
      });

      if (response.code === 200) {
        const { toast } = await import("react-toastify");
        toast.success("Kích hoạt thành công");

        // Close modal and reset code
        setIsActivationModalOpen(false);
        setActivationCode("");

        // Reload page to refresh course data
        router.refresh();
      } else {
        // Invalid code
        const { toast } = await import("react-toastify");
        toast.error(response.message || "Mã kích hoạt không hợp lệ");
      }
    } catch (error: any) {
      // Handle error
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Mã kích hoạt không hợp lệ";

      const { toast } = await import("react-toastify");
      toast.error(errorMessage);
    } finally {
      setIsActivating(false);
    }
  };

  // Handle book activation
  const handleBookActivate = async () => {
    if (!bookIdValue.trim()) {
      const { toast } = await import("react-toastify");
      toast.error("Vui lòng nhập ID sách");
      return;
    }
    if (!bookActivationCode.trim()) {
      const { toast } = await import("react-toastify");
      toast.error("Vui lòng nhập mã kích hoạt");
      return;
    }

    if (isActivating) return;

    setIsActivating(true);
    try {
      const response: any = await bookidService.accessByCode({
        book_id: bookIdValue.trim(),
        code: bookActivationCode.trim(),
      });

      const { toast } = await import("react-toastify");
      const msg = response?.message || "";
      if (response.code === 200) {
        toast.success("Kích hoạt thành công");
        setIsActivationModalOpen(false);
        setBookIdValue("");
        setBookActivationCode("");
        router.push("/account/my-course");
      } else {
        if (msg.toLowerCase().includes("sử dụng trước đó") || msg.toLowerCase().includes("đã được sử dụng")) {
          toast.success("Mã đã được bạn sử dụng trước đó!");
          setIsActivationModalOpen(false);
          setBookIdValue("");
          setBookActivationCode("");
          router.push("/account/my-course");
        } else {
          toast.error(msg || "Có lỗi xảy ra");
        }
      }
    } catch (error: any) {
      const { toast } = await import("react-toastify");
      const errorMessage = error.response?.data?.message || "Kích hoạt không thành công";
      
      if (errorMessage.toLowerCase().includes("sử dụng trước đó") || errorMessage.toLowerCase().includes("đã được sử dụng")) {
        toast.success("Mã đã được bạn sử dụng trước đó!");
        setIsActivationModalOpen(false);
        setBookIdValue("");
        setBookActivationCode("");
        router.push("/account/my-course");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsActivating(false);
    }
  };

  // Build menu items
  const menuItems = useMemo(() => {
    const items: any[] = [];

    // Giới thiệu
    items.push({
      label: "Giới thiệu",
      icon: <Info className="w-5 h-5" />,
      children: introOptions.flatMap((group) =>
        group.childs.map((child) => ({
          label: child.label,
          href: child.value,
        }))
      ),
    });

    // Khóa học
    if (courseCategories.length > 0) {
      items.push({
        label: "Khóa học",
        icon: <Book className="w-5 h-5" />,
        children: courseCategories.map((category) => ({
          label: category.title,
          children: category.courses.map((course) => ({
            label: course.name,
            subject_id: course.subject_id,
            classroom_group_id: course.classroom_group_id,
          })),
        })),
      });
    }

    // Sách
    items.push({
      label: "Sách",
      icon: <Book className="w-5 h-5" />,
      href: "/sach",
    });

    // Sách ID
    items.push({
      label: "Sách ID",
      icon: <Book className="w-5 h-5" />,
      href: "/sach-id",
    });

    // Bản tin
    if (newsCategories.length > 0) {
      items.push({
        label: "Bản tin",
        icon: <Newspaper className="w-5 h-5" />,
        children: newsCategories.map((cat) => ({
          label: cat.name,
          href: `/${cat.alias}`,
        })),
      });
    }

    return items;
  }, [courseCategories, newsCategories, introOptions]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/icon/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="object-contain"
          />
        </Link>

        {/* Search Input or Activation Button */}
        {isCourseDetailPage && rootContext?.isLogin ? (
          // Show activation button on course detail page
          <button
            onClick={() => setIsActivationModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#235CD0] hover:bg-[#1e4eb3] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            aria-label="Kích hoạt khóa học"
          >
            <Key size={16} />
            <span>Kích hoạt</span>
          </button>
        ) : (
          // Show search input on other pages
          <div className="relative flex items-center gap-2 flex-1 max-w-[200px]">
            <div className="flex-1 h-8 inline-flex justify-center items-center">
              <div className="flex-1 self-stretch px-2 py-1 bg-slate-100 rounded-[50px] flex justify-between items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={isTextSearchAllowed ? "Nội dung tìm kiếm" : "Tra ID"}
                  className="bg-transparent border-none outline-none text-gray-500 text-sm font-normal font-['Inter'] leading-normal flex-1 w-0"
                  value={valueSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isTextSearchAllowed) {
                      setValueSearch(val);
                    } else {
                      // Chỉ cho phép nhập số nếu không phải trang cho phép tìm kiếm text
                      const numericVal = val.replace(/[^0-9]/g, "");
                      setValueSearch(numericVal);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={handleSearchFocus}
                />
                <div
                  className="w-4 h-4 flex items-center justify-center cursor-pointer ml-1 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  aria-label="Tìm kiếm"
                >
                  <Search size={16} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Mobile Search History Dropdown */}
            {showSearchHistory && rootContext?.isLogin && (
              <div
                ref={searchHistoryRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden"
                style={{ width: 'calc(100vw - 140px)', maxWidth: '350px' }}
              >
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Lịch sử tìm kiếm
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingHistory ? (
                    <div className="px-3 py-3 text-center text-gray-400 text-xs">
                      Đang tải...
                    </div>
                  ) : searchHistory.length === 0 ? (
                    <div className="px-3 py-3 text-center text-gray-400 text-xs">
                      Chưa có lịch sử
                    </div>
                  ) : (
                    searchHistory.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div
                          className="flex items-center gap-2 flex-1 min-w-0"
                          onClick={() => handleHistoryItemClick(item.keyword)}
                        >
                          <Search size={12} className="flex-shrink-0 text-gray-400" />
                          <span className="text-xs text-gray-700 truncate">
                            {item.keyword}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromSearchHistory(item.keyword);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200"
                          aria-label="Xóa lịch sử"
                        >
                          <X size={12} className="text-gray-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {!rootContext?.isLogin && (
              <ClientOnlyLink
                href="/auth/signin"
                className="flex items-center gap-1 rounded-full bg-[#0064E1] px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 transition whitespace-nowrap"
              >
                <span>Đăng nhập</span>
              </ClientOnlyLink>
            )}
          </div>
        )}

        {/* Icons */}
        <div className="flex items-center gap-3 text-gray-500">
          <NotificationUi
            rootContext={rootContext}
            handlePushRoute={handlePushRoute}
          />
          <CartIcon rootContext={rootContext} />

          {/* Menu button */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="p-1" aria-label="Toggle menu" suppressHydrationWarning>
                {open ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              {/* Overlay */}
              <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

              {/* Panel trượt từ trái */}
              <Dialog.Content className="fixed top-12 left-0 h-[calc(100%-48px)] w-80 bg-white shadow-lg overflow-y-auto z-50 p-4 flex flex-col justify-between data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut">
                <Dialog.Title className="sr-only">Menu điều hướng</Dialog.Title>
                <div>
                  {/* Menu Items */}
                  <nav className="space-y-2">
                    {menuItems.map((item, idx) =>
                      item.children && item.children.length > 0 ? (
                        <Accordion.Root key={idx} type="single" collapsible>
                          <Accordion.Item value={`item-${idx}`}>
                            <Accordion.Trigger className="flex items-center justify-between w-full py-2 px-2 rounded-md hover:bg-gray-50 [&[data-state=open]>svg:last-child]:rotate-180">
                              <div className="flex items-center gap-2">
                                {item.icon}
                                <span>{item.label}</span>
                              </div>
                              <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                            </Accordion.Trigger>
                            <Accordion.Content className="ml-8 space-y-1 pb-2">
                              {item.children.map((sub: any, subIdx: number) => (
                                <div key={subIdx}>
                                  {sub.children ? (
                                    <div className="mt-1">
                                      <p className="font-medium text-gray-700">
                                        {sub.label}
                                      </p>
                                      <ul className="ml-3 space-y-1 mt-1">
                                        {sub.children.map(
                                          (leaf: any, leafIdx: number) => (
                                            <li key={leafIdx}>
                                              {leaf.href ? (
                                                <Link
                                                  href={leaf.href}
                                                  onClick={() => setOpen(false)}
                                                  className="block text-gray-600 hover:text-blue-600 text-sm"
                                                >
                                                  {leaf.label}
                                                </Link>
                                              ) : (
                                                <button
                                                  onClick={() => {
                                                    if (
                                                      leaf.subject_id &&
                                                      leaf.classroom_group_id
                                                    ) {
                                                      handleCourseClick({
                                                        name: leaf.label,
                                                        subject_id:
                                                          leaf.subject_id,
                                                        classroom_group_id:
                                                          leaf.classroom_group_id,
                                                      });
                                                    }
                                                  }}
                                                  className="block text-gray-600 hover:text-blue-600 text-sm text-left w-full"
                                                >
                                                  {leaf.label}
                                                </button>
                                              )}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  ) : (
                                    <Link
                                      href={sub.href || "#"}
                                      onClick={() => setOpen(false)}
                                      className="block text-gray-600 hover:text-blue-600 text-sm"
                                    >
                                      {sub.label}
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </Accordion.Content>
                          </Accordion.Item>
                        </Accordion.Root>
                      ) : (
                        <Link
                          key={idx}
                          href={item.href || "#"}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-gray-50"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      )
                    )}
                  </nav>

                  {/* Button Thoát */}
                  <button
                    className="mt-4 flex items-center gap-2 text-gray-600 hover:text-red-600 py-2 px-2 rounded-md hover:bg-gray-50"
                    onClick={() => {
                      if (rootContext?.handleLogout) {
                        rootContext.handleLogout();
                      }
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Thoát</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-4 space-y-3">
                  {rootContext?.isLogin && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setIsActivationModalOpen(true);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#235CD0] hover:bg-[#1e4eb3] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        aria-label="Kích hoạt khóa học"
                      >
                        <Key size={16} />
                        <span>Kích hoạt</span>
                      </button>
                    </div>
                  )}
                  <button
                    className="w-full py-2 bg-[#0064E1] text-white rounded-md font-medium"
                    onClick={() => {
                      router.push("/thi-thu");
                      setOpen(false);
                    }}
                  >
                    THI THỬ
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Activation Modal */}
      <Dialog.Root
        open={isActivationModalOpen}
        onOpenChange={setIsActivationModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-[9999] w-[90vw] max-w-md p-6">
            <Dialog.Title className="sr-only">Kích hoạt</Dialog.Title>
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="flex-1" />
                <h2 className="text-2xl font-bold text-gray-900">Kích hoạt</h2>
                <div className="flex-1 flex justify-end">
                <Dialog.Close asChild>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Đóng"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-3 mb-4 justify-center">
                <button
                  className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                    !bookIdMode
                      ? "bg-[#235CD0] text-white border-[#235CD0]"
                      : "bg-white text-[#235CD0] border-[#235CD0] hover:bg-blue-50"
                  }`}
                  onClick={() => setBookIdMode(false)}
                >
                  Khóa học
                </button>
                <button
                  className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                    bookIdMode
                      ? "bg-[#235CD0] text-white border-[#235CD0]"
                      : "bg-white text-[#235CD0] border-[#235CD0] hover:bg-blue-50"
                  }`}
                  onClick={() => setBookIdMode(true)}
                >
                  Sách ID
                </button>
              </div>

              {/* Tab Content */}
              {!bookIdMode ? (
                <>
                  <p className="text-center text-gray-600 mb-4 text-base">
                    Vui lòng nhập mã kích hoạt để truy cập khóa học
                  </p>
                  <div className="w-full flex flex-col gap-3">
                    <input
                      type="text"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="Nhập mã kích hoạt"
                      disabled={isActivating}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isActivating) {
                          handleActivate();
                        }
                      }}
                    />
                    <button
                      onClick={handleActivate}
                      disabled={isActivating || !activationCode.trim()}
                      className="w-full bg-[#235CD0] hover:bg-blue-600 text-white font-bold uppercase tracking-wide px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActivating ? (
                        <>
                          <span>Đang xử lý...</span>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </>
                      ) : (
                        <span>XÁC NHẬN</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-gray-600 mb-4 text-base">
                    Vui lòng nhập đầy đủ thông tin để truy cập sách ID
                  </p>
                  <div className="w-full flex flex-col gap-3">
                    <input
                      type="text"
                      value={bookIdValue}
                      onChange={(e) => setBookIdValue(e.target.value)}
                      placeholder="Nhập ID sách"
                      disabled={isActivating}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isActivating) {
                          handleBookActivate();
                        }
                      }}
                    />
                    <input
                      type="text"
                      value={bookActivationCode}
                      onChange={(e) => setBookActivationCode(e.target.value)}
                      placeholder="Nhập mã kích hoạt"
                      disabled={isActivating}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isActivating) {
                          handleBookActivate();
                        }
                      }}
                    />
                    <button
                      onClick={handleBookActivate}
                      disabled={isActivating || !bookIdValue.trim() || !bookActivationCode.trim()}
                      className="w-full bg-[#235CD0] hover:bg-blue-600 text-white font-bold uppercase tracking-wide px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>XÁC NHẬN</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
