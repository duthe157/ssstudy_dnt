import React, {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

// Import RootContextType từ Header để đảm bảo nhất quán
import { RootContextType } from "../components/layout/Header";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { notificationService } from "@/services/notificationService";
import { QuestionPopup } from "@/components/common/QuestionPopup";
import { RenewalNotificationPopup } from "@/components/common/RenewalNotificationPopup";
import { useRenewalNotification } from "@/hooks/useRenewalNotification";

// Tạo context với giá trị mặc định
export const RootContext = createContext<RootContextType | undefined>(
  undefined,
);

// Tạo Provider component
export const RootProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState<{ fullname?: string; avatar?: string }>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [totalMessageUnread, setTotalMessageUnread] = useState<number>(0);
  const [notifications, setNotifications] = useState<
    Array<{
      _id: string;
      name: string;
      created_at: string;
      message_user_id: string;
      is_read?: boolean;
    }>
  >([]);
  const [hideMobileNav, setHideMobileNav] = useState<boolean>(false);
  const [questionPopupId, setQuestionPopupId] = useState<string | null>(null);
  const [isQuestionPopupOpen, setIsQuestionPopupOpen] = useState(false);

  const openQuestionPopup = (id: string) => {
    setQuestionPopupId(id);
    setIsQuestionPopupOpen(true);
  };

  const {
    courses: renewalCourses,
    isOpen: isRenewalOpen,
    handleClose: handleRenewalClose,
  } = useRenewalNotification();

  // Đồng bộ guest_cart lên server sau khi đăng nhập
  const syncGuestCartToServer = async () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("guest_cart");
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr) || arr.length === 0) return;
      // Xóa ngay để tránh gọi trùng lặp do nhiều listener
      localStorage.setItem("guest_cart", JSON.stringify([]));
      for (const g of arr) {
        try {
          const isClassroom =
            String(g?.type || "").toUpperCase() === "CLASSROOM";
          const payload = {
            item_id: String(g?.item_id || ""),
            name: String(g?.name || ""),
            price: Number(g?.price) || 0,
            qty: isClassroom ? 1 : Number(g?.qty) || 1,
            type: String(g?.type || ""),
            image: String(g?.image || ""),
          };
          const res = await cartService.addToCart(payload as any);
          const msg = (res as any)?.message || (res as any)?.data?.message;
          if (msg) {
            try {
              const mod = await import("react-toastify");
              mod.toast.success(msg);
            } catch {
              /* noop */
            }
          }
        } catch {
          /* noop */
        }
      }
      // Cập nhật lại số lượng sau khi sync
      try {
        const res = await cartService.getCartCount();
        let count = 0;
        if (typeof (res as any) === "number") count = res as any as number;
        else if (typeof (res as any)?.data === "number")
          count = (res as any).data as number;
        else if (typeof (res as any)?.data?.qty === "number")
          count = (res as any).data.qty as number;
        setCartCount(Number(count) || 0);
      } catch {
        /* noop */
      }
      try {
        window.dispatchEvent(new Event("cartChanged"));
      } catch {
        /* noop */
      }
    } catch {
      /* noop */
    }
  };

  const loadUserInfo = () => {
    const isLoggedIn = authService.isLoggedIn();
    setIsLogin(isLoggedIn);

    if (isLoggedIn) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser({
          fullname: currentUser.fullname || "",
          avatar: currentUser.avatar || "",
        });
      }
    } else {
      setUser({});
      // Reset totalMessageUnread và notifications khi logout
      setTotalMessageUnread(0);
      setNotifications([]);
    }
  };

  // Hàm để fetch số lượng tin nhắn chưa đọc
  const fetchTotalMessageUnread = async () => {
    if (!authService.isLoggedIn()) {
      setTotalMessageUnread(0);
      return;
    }

    try {
      const response = await notificationService.getTotalUnread();
      let count = 0;

      if (typeof response === "number") {
        count = response;
      } else if (typeof response?.data === "number") {
        count = response.data;
      }

      setTotalMessageUnread(Number(count) || 0);
    } catch (error) {
      console.error("Error fetching total message unread:", error);
    }
  };

  // Hàm để fetch danh sách thông báo
  const fetchNotifications = async () => {
    if (!authService.isLoggedIn()) {
      setNotifications([]);
      return;
    }

    try {
      const response = await notificationService.getMyMessages();
      const records = response?.data?.records || [];

      // Map data từ API vào format Notification
      const mappedNotifications = records.map((item) => ({
        _id: item._id || "",
        name: item.name || "",
        created_at: item.created_at || "",
        message_user_id: item.message_user_id || "",
        is_read: item.is_read ?? false,
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Debounced, unified refresh for auth and cart to avoid redundant requests
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshAtRef = useRef<number>(0);

  const refreshAuthAndCart = async (opts?: { syncGuest?: boolean }) => {
    if (isRefreshingRef.current) return;
    const now = Date.now();
    // guard: avoid refresh storms (< 300ms)
    if (now - (lastRefreshAtRef.current || 0) < 300) return;
    isRefreshingRef.current = true;
    lastRefreshAtRef.current = now;

    try {
      loadUserInfo();
      if (authService.isLoggedIn()) {
        if (opts?.syncGuest) {
          try {
            await syncGuestCartToServer();
          } catch {
            /* noop */
          }
        }
        try {
          const res = await cartService.getCartCount();
          let count = 0;
          if (typeof (res as any) === "number") count = res as any as number;
          else if (typeof (res as any)?.data === "number")
            count = (res as any).data as number;
          else if (typeof (res as any)?.data?.qty === "number")
            count = (res as any).data.qty as number;
          setCartCount(Number(count) || 0);
          // try {
          //   window.dispatchEvent(new Event("cartChanged"));
          // } catch {
          //   /* noop */
          // }
        } catch {
          /* keep current count on error */
        }

        // Fetch total message unread và notifications khi user đã login
        try {
          await fetchTotalMessageUnread();
        } catch {
          /* keep current value on error */
        }

        try {
          await fetchNotifications();
        } catch {
          /* keep current value on error */
        }
      } else if (typeof window !== "undefined") {
        // guest: compute from localStorage only (no server call)
        try {
          const raw = localStorage.getItem("guest_cart");
          const arr = raw ? JSON.parse(raw) : [];
          const totalQty = Array.isArray(arr)
            ? arr.reduce((s: number, it: any) => s + (Number(it?.qty) || 0), 0)
            : 0;
          setCartCount(totalQty);
        } catch {
          setCartCount(0);
        }
        // Reset totalMessageUnread và notifications cho guest
        setTotalMessageUnread(0);
        setNotifications([]);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const debouncedRefresh = (opts?: { syncGuest?: boolean }) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      void refreshAuthAndCart(opts);
    }, 300);
  };

  // Khởi tạo + listeners
  useEffect(() => {
    // initial load
    void refreshAuthAndCart({ syncGuest: false });

    const handleStorageChange = () => {
      debouncedRefresh({ syncGuest: false });
    };

    const handleUpdateLoginStatus = () => {
      // when login status changes, allow syncing guest cart once
      debouncedRefresh({ syncGuest: true });
    };

    let focusLastRun = 0;
    const handleFocus = () => {
      const now = Date.now();
      if (now - focusLastRun < 1000) return; // throttle focus
      focusLastRun = now;
      debouncedRefresh({ syncGuest: false });
    };

    const handleCartChanged = () => {
      debouncedRefresh({ syncGuest: false });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "updateLoginStatus",
      handleUpdateLoginStatus as EventListener,
    );
    window.addEventListener("focus", handleFocus);
    window.addEventListener("cartChanged", handleCartChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "updateLoginStatus",
        handleUpdateLoginStatus as EventListener,
      );
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("cartChanged", handleCartChanged);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    authService.signOut();
    setIsLogin(false);
    setUser({});
    // Reset totalMessageUnread và notifications khi logout
    setTotalMessageUnread(0);
    setNotifications([]);

    // Thông báo đăng xuất thành công
    if (typeof window !== "undefined") {
      // Sử dụng dynamic import để tránh lỗi khi SSR
      import("react-toastify")
        .then(({ toast }) => {
          toast.success("Đăng xuất thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
        })
        .catch(() => {
          // Xử lý nếu không thể import
        });
    }

    // Kích hoạt sự kiện để thông báo các component khác
    if (typeof window !== "undefined") {
      const logoutEvent = new CustomEvent("updateLoginStatus", {
        detail: { isLogin: false },
      });
      window.dispatchEvent(logoutEvent);
      window.dispatchEvent(new Event("storage"));
    }

    // Sau khi đăng xuất, chuyển hướng về trang đăng nhập
    router.push("/auth/signin");
  };

  // Thêm giỏ hàng (guest vs logged-in)
  const handleAddCart: RootContextType["handleAddCart"] = async (payload) => {
    try {
      if (!authService.isLoggedIn()) {
        // Guest cart -> localStorage
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("guest_cart");
          const arr = raw ? JSON.parse(raw) : [];

          // Hợp nhất qty nếu trùng item_id, giới hạn CLASSROOM = 1
          const idx = Array.isArray(arr)
            ? arr.findIndex(
                (x: any) => String(x?.item_id) === String(payload.item_id),
              )
            : -1;

          if (idx >= 0) {
            const isClassroom =
              String(arr[idx]?.type || payload.type || "").toUpperCase() ===
              "CLASSROOM";
            if (isClassroom) {
              arr[idx] = { ...arr[idx], qty: 1 };
            } else {
              const nextQty =
                (Number(arr[idx]?.qty) || 0) + (Number(payload.qty) || 1);
              arr[idx] = { ...arr[idx], qty: nextQty };
            }
          } else {
            const isClassroom =
              String(payload.type || "").toUpperCase() === "CLASSROOM";
            const safeQty = isClassroom ? 1 : Number(payload.qty) || 1;
            arr.push({ ...payload, qty: safeQty });
          }
          localStorage.setItem("guest_cart", JSON.stringify(arr));

          // Cập nhật count theo tổng qty
          const totalQty = Array.isArray(arr)
            ? arr.reduce((s: number, it: any) => s + (Number(it?.qty) || 0), 0)
            : 0;
          setCartCount(totalQty);

          // kích hoạt storage event nội bộ
          window.dispatchEvent(new Event("storage"));
          // Dispatch cartChanged event để đảm bảo cập nhật ở các component khác
          try {
            window.dispatchEvent(new Event("cartChanged"));
          } catch (e) {
            // Error dispatching cartChanged
          }
          try {
            const mod = await import("react-toastify");
            mod.toast.success("Đã thêm vào giỏ hàng");
          } catch (e) {
            // Error showing toast
          }
        }
      } else {
        // Logged-in -> increment quantity by 1 (or add new if not exists)
        const isClassroom =
          String(payload.type || "").toUpperCase() === "CLASSROOM";
        let updated = false;
        try {
          const detail = await cartService.getCartDetail();
          const items = (detail as any)?.data?.cart_items || [];

          const existing = Array.isArray(items)
            ? items.find(
                (it: any) =>
                  String(it?.item_id) === String(payload.item_id) &&
                  String(it?.type || "").toUpperCase() ===
                    String(payload.type || "").toUpperCase(),
              )
            : undefined;

          if (existing) {
            const nextQty = isClassroom ? 1 : Number(existing.qty || 0) + 1;
            const updatePayload = {
              id: String(existing._id || existing.id),
              item_id: String(existing.item_id),
              price: Number(existing.price || payload.price || 0),
              qty: nextQty,
              type: String(existing.type || payload.type || ""),
              is_selected: true,
              image: String(existing.image || payload.image || ""),
            };
            await cartService.updateCartItem(updatePayload);
            updated = true;
          }
        } catch (e) {
          // Error checking/updating existing item
        }

        if (!updated) {
          const addPayload = {
            item_id: String(payload.item_id),
            name: String(payload.name || ""),
            price: Number(payload.price || 0),
            qty: isClassroom ? 1 : 1,
            type: String(payload.type || ""),
            image: String(payload.image || ""),
          };
          try {
            await cartService.addToCart(addPayload as any);

            // Verify item was added by fetching cart detail again
            const verifyDetail = await cartService.getCartDetail();
            const verifyItems = (verifyDetail as any)?.data?.cart_items || [];
            const verifyItem = Array.isArray(verifyItems)
              ? verifyItems.find(
                  (it: any) =>
                    String(it?.item_id) === String(payload.item_id) &&
                    String(it?.type || "").toUpperCase() ===
                      String(payload.type || "").toUpperCase(),
                )
              : undefined;
          } catch (addError) {
            throw addError; // Re-throw to be caught by outer catch
          }
        }

        // refresh cart count từ server
        try {
          const res = await cartService.getCartCount();

          let count = 0;
          if (typeof (res as any) === "number") {
            count = res as any as number;
          } else if (typeof (res as any)?.data === "number") {
            count = (res as any).data as number;
          } else if (typeof (res as any)?.data?.qty === "number") {
            count = (res as any).data.qty as number;
          }
          setCartCount(Number(count) || 0);
        } catch (e) {
          // Error fetching cart count
        }

        // toast thông báo chung đảm bảo chỉ hiển thị một lần
        try {
          const mod = await import("react-toastify");
          mod.toast.success("Đã thêm vào giỏ hàng");
        } catch (e) {
          // Error showing toast
        }
      }
    } catch (e) {
      try {
        const mod = await import("react-toastify");
        const message =
          (e as any)?.response?.data?.message || "Không thể thêm vào giỏ hàng";
        mod.toast.error(message);
      } catch (toastError) {
        // Error showing error toast
      }
    }
  };

  // Tạo giá trị context
  const contextValue: RootContextType = {
    cartCount: cartCount,
    notifications: notifications,
    user,
    isLogin,
    totalMessageUnread: totalMessageUnread,
    hideMobileNav,
    setHideMobileNav,
    handleLogout,
    handleAddCart,
    openQuestionPopup,
  };

  return (
    <RootContext.Provider value={contextValue}>
      {children}
      <QuestionPopup
        isOpen={isQuestionPopupOpen}
        questionId={questionPopupId}
        onClose={() => setIsQuestionPopupOpen(false)}
      />
      <RenewalNotificationPopup
        courses={renewalCourses}
        isOpen={isRenewalOpen}
        onClose={handleRenewalClose}
      />
    </RootContext.Provider>
  );
};
