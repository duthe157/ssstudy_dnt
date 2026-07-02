"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/avatar";
import { Book, User, ShoppingBag, Key, LogOut, CreditCard } from "lucide-react";
import { accountService } from "@/services/accountService";
import { RootContext } from "@/contexts/RootContext";

interface NavItem {
  href: string;
  label: string;
  iconSrc: string;
  isActive: (pathname: string) => boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const rootContext = useContext(RootContext);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<{
    fullname?: string;
    avatar?: string | null;
  }>({});
  const [loadedProfile, setLoadedProfile] = useState(false);

  //  Lấy vị trí thật của nút "Cá nhân"
  useLayoutEffect(() => {
    if (accountBtnRef.current) {
      const rect = accountBtnRef.current.getBoundingClientRect();
      setMenuPos({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      });
    }
  }, [accountOpen]);

  //  Đóng menu khi click outside
  useEffect(() => {
    if (!accountOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        accountBtnRef.current &&
        !accountBtnRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  // Load profile lazily when menu opens the first time
  useEffect(() => {
    if (!accountOpen || loadedProfile) return;
    (async () => {
      try {
        const res = await accountService.getProfile();
        if (res?.code === 200) {
          const data = res?.data ?? {};
          setUserData({
            fullname: data?.fullname ?? data?.name ?? "",
            avatar: data?.avatar ?? null,
          });
        }
      } catch (e) {
        // swallow; keep defaults
      } finally {
        setLoadedProfile(true);
      }
    })();
  }, [accountOpen, loadedProfile]);
  useEffect(() => {
    if (accountOpen) {
      document.body.classList.add("account-menu-open");
    } else {
      document.body.classList.remove("account-menu-open");
    }
    return () => document.body.classList.remove("account-menu-open");
  }, [accountOpen]);

  // Hide nav when floating purchase buttons are visible - MUST be after all hooks
  if (rootContext?.hideMobileNav) {
    return null;
  }

  const items: NavItem[] = [
    {
      href: "/",
      label: "Trang chủ",
      iconSrc: "/icon/icon-home.svg",
      isActive: (p) => p === "/",
    },
    {
      href: "/khoa-hoc",
      label: "Khóa học",
      iconSrc: "/icon/icon-khoahoc.svg",
      isActive: (p) => p.startsWith("/khoa-hoc"),
    },
    {
      href: "/thi-thu",
      label: "Thi thử",
      iconSrc: "/icon/icon_thithu.svg",
      isActive: (p) =>
        p.startsWith("/thi-thu") && !p.startsWith("/thi-thu/word-exam/"),
    },
    {
      href: "/gio-hang",
      label: "Giỏ hàng",
      iconSrc: "/icon/icon-giohang.svg",
      isActive: (p) => p.startsWith("/gio-hang"),
    },
    {
      href: "/account",
      label: "Cá nhân",
      iconSrc: "/icon/icon-canhan.svg",
      isActive: (p) => p.startsWith("/account"),
    },
  ];

  // Danh sách có icon giống trang account/sidebar
  const accountMenu = [
    { label: "Thông tin cá nhân", href: "/account", icon: <User size={18} /> },
    {
      label: "Thay đổi mật khẩu",
      href: "/account/change-password",
      icon: <Key size={18} />,
    },
    {
      label: "Khóa học của tôi",
      href: "/account/my-course",
      icon: <Book size={18} />,
    },
    {
      label: "Lịch sử giao dịch",
      href: "/account/credit-history",
      icon: <CreditCard size={18} />,
    },
    {
      label: "Đơn hàng",
      href: "/account/order-history",
      icon: <ShoppingBag size={18} />,
    },
    {
      label: "Đăng xuất",
      href: "#logout",
      icon: <LogOut size={18} />,
      isLogout: true,
    },
  ] as Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    isLogout?: boolean;
  }>;

  return (
    <nav className="min-[1440px]:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <ul className="grid grid-cols-5 gap-1 py-2">
        {items.map((item) => {
          const active = item.isActive(pathname);
          const isAccount = item.label === "Cá nhân";
          return (
            <li key={item.href} className="flex items-center justify-center">
              {isAccount ? (
                <button
                  ref={accountBtnRef}
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex flex-col items-center gap-1"
                >
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={24}
                    height={24}
                  />
                  <span
                    className={`text-[11px] ${
                      active ? "text-blue-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1"
                >
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={24}
                    height={24}
                  />
                  <span
                    className={`text-[11px] ${
                      active ? "text-blue-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* ⚡ Floating Account Menu */}
      <AnimatePresence>
        {accountOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setAccountOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              ref={menuRef}
              key="menu"
              initial={{
                opacity: 0,
                scale: 0.6,
                x: menuPos.x - 160,
                y: menuPos.y - 90,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 240,
                  damping: 16,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.6,
                x: menuPos.x - 160,
                y: menuPos.y - 90,
                transition: { duration: 0.25 },
              }}
              className="fixed left-1 right-1 bottom-[61px] w-auto rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden origin-bottom-right"
            >
              {/* Header: avatar + tên (nếu đã đăng nhập) hoặc 2 nút đăng nhập/đăng ký khi chưa đăng nhập */}
              {rootContext?.isLogin ? (
                <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100 bg-white">
                  <Avatar
                    src={userData.avatar || undefined}
                    fullname={userData.fullname || "Họ và Tên"}
                    size="sm"
                  />
                  <div className="text-[15px] font-semibold text-[#0b5ed7]">
                    {userData.fullname || "Họ và Tên"}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-100 bg-white">
                  <button
                    type="button"
                    className="flex-1 rounded-md bg-white text-[#235CD0] border border-[#235CD0] text-[14px] font-medium py-2"
                    onClick={() => {
                      setAccountOpen(false);
                      router.push("/auth/signup");
                    }}
                  >
                    Đăng ký
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-md bg-[#235CD0] text-white text-[14px] font-medium py-2"
                    onClick={() => {
                      setAccountOpen(false);
                      router.push("/auth/signin");
                    }}
                  >
                    Đăng nhập
                  </button>
                </div>
              )}

              <motion.div
                className="divide-y divide-gray-100"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.08,
                    },
                  },
                }}
              >
                {accountMenu
                  .filter((it) => (rootContext?.isLogin ? true : !it.isLogout))
                  .map((it) => (
                    <motion.button
                      key={it.href}
                      type="button"
                      onClick={() => {
                        if (it.isLogout) {
                          rootContext?.handleLogout();
                        } else if (!rootContext?.isLogin) {
                          setAccountOpen(false);
                          router.push("/auth/signin");
                        } else {
                          setAccountOpen(false);
                          router.push(it.href);
                        }
                      }}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[14px] text-gray-700
                        hover:bg-blue-50/70 hover:text-blue-700
                        active:bg-blue-100 active:text-blue-700
                        transition-all duration-200 ease-out"
                    >
                      <span className="text-blue-700">{it.icon}</span>
                      <span>{it.label}</span>
                    </motion.button>
                  ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default MobileBottomNav;
