"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RootContext } from "@/contexts/RootContext";
import {
  CartItem,
  cartService,
  CouponItem,
  AddCartPayload,
} from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { toast } from "react-toastify";

const GUEST_CART_KEY = "guest_cart";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function loadGuestCart(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as any[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function removeGuestCart(item_id: string) {
  if (typeof window === "undefined") return;
  try {
    const arr: AddCartPayload[] = JSON.parse(
      localStorage.getItem(GUEST_CART_KEY) || "[]",
    );
    const next = arr.filter((i) => i.item_id !== item_id);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function CartPage() {
  const router = useRouter();
  const root = React.useContext(RootContext);
  const searchParams = useSearchParams();
  const isRenewal = searchParams.get("renewal") === "1";

  // Prevent hydration mismatch by only rendering dynamic content after mount
  const [mounted, setMounted] = useState(false);

  // Mock cart items (replace with API/state later)
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [voucher, setVoucher] = useState<string>("");
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "bank" | "cod" | "center" | null
  >(null);
  const [discountTotal, setDiscountTotal] = useState<number>(0);

  // Khi là luồng gia hạn, tự động chọn chuyển khoản
  React.useEffect(() => {
    if (isRenewal) setSelectedPayment("bank");
  }, [isRenewal]);

  const [isCouponOpen, setIsCouponOpen] = useState<boolean>(false);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const selectAllRef = React.useRef<HTMLInputElement>(null);
  const parentItems = React.useMemo(
    () => (items as any[]).filter((it: any) => !it?.cart_parent_id),
    [items],
  );
  const allChecked =
    parentItems.length > 0 &&
    parentItems.every((it: any) => Boolean((it as any).is_selected));
  const toggleSelectAll = async (checked: boolean) => {
    // Update local state immediately for better UX
    setItems((prev) =>
      prev.map((it: any) =>
        it?.cart_parent_id ? it : { ...it, is_selected: checked },
      ),
    );

    // If logged in, call API for each item
    if (root?.isLogin) {
      try {
        const promises = parentItems.map(async (it: any) => {
          const row: any = it as any;
          return cartService.updateCartItem({
            id: String(row._id || it._id),
            item_id: String(row.item_id),
            price: Number(row.price) || 0,
            qty: Number(row.qty) || 1,
            type: String(row.type || "CLASSROOM"),
            is_selected: checked,
            image: String(row.image || ""),
          });
        });
        await Promise.all(promises);
        try {
          const { toast } = await import("react-toastify");
          toast.success("Cập nhật giỏ hàng thành công");
        } catch {}
      } catch (e) {
        // Revert local state on error
        setItems((prev) =>
          prev.map((it: any) =>
            it?.cart_parent_id ? it : { ...it, is_selected: !checked },
          ),
        );
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message || "Cập nhật giỏ hàng thất bại",
          );
        } catch {}
      }
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    // Find the item to update
    const current = items.find(
      (it: any) => (it as any)._id === id || (it as any).item_id === id,
    );
    if (!current) return;

    // Update local state immediately for better UX
    setItems((prev) =>
      prev.map((it) => (it._id === id ? { ...it, is_selected: checked } : it)),
    );

    // If logged in, call API
    if (root?.isLogin) {
      try {
        const row: any = current as any;
        await cartService.updateCartItem({
          id: String(row._id || id),
          item_id: String(row.item_id),
          price: Number(row.price) || 0,
          qty: Number(row.qty) || 1,
          type: String(row.type || "CLASSROOM"),
          is_selected: checked,
          image: String(row.image || ""),
        });
        try {
          const { toast } = await import("react-toastify");
          toast.success("Cập nhật sản phẩm thành công");
        } catch {}
      } catch (e) {
        // Revert local state on error
        setItems((prev) =>
          prev.map((it) =>
            it._id === id ? { ...it, is_selected: !checked } : it,
          ),
        );
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message || "Cập nhật sản phẩm thất bại",
          );
        } catch {}
      }
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!selectAllRef.current) return;
    const parents: any[] = (items as any[]).filter(
      (i: any) => !i?.cart_parent_id,
    );
    const selectedParents = parents.filter((i: any) =>
      Boolean((i as any).is_selected),
    ).length;
    selectAllRef.current.indeterminate =
      parents.length > 0 &&
      selectedParents > 0 &&
      selectedParents < parents.length;
  }, [items]);

  // Track if we just logged in to handle guest cart sync
  const prevLoginRef = React.useRef<boolean | undefined>(undefined);

  // Load cart depending on login state
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const guest_cart = loadGuestCart();
        const wasGuest = prevLoginRef.current === false;
        const justLoggedIn = wasGuest && root?.isLogin === true;

        if (root?.isLogin) {
          // When just logged in, wait for guest cart sync to complete
          if (justLoggedIn && guest_cart.length > 0) {
            // Wait for sync to complete (RootContext handles guest cart sync)
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
          // Always fetch from API when logged in
          const res = await cartService.getCartDetail();
          const apiItems = (res as any)?.data?.cart_items || [];
          if (Array.isArray(apiItems) && apiItems.length > 0) {
            setItems(apiItems as CartItem[]);
          } else {
            setItems([]);
          }
          try {
            setDiscountTotal(
              Number((res as any)?.data?.cart?.discount_total) || 0,
            );
          } catch {}
        } else {
          setItems(guest_cart as CartItem[] as any);
          setDiscountTotal(0);
        }

        // Update ref for next render
        prevLoginRef.current = root?.isLogin;
      } catch (e) {
        // fallback to guest cart on error
        setItems(loadGuestCart() as CartItem[] as any);
        setError("Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };
    void load();
  }, [root?.isLogin]);

  // Listen for cartChanged event to refetch cart when logged in (after guest cart sync)
  React.useEffect(() => {
    if (!root?.isLogin) return; // Only listen when logged in

    const handleCartChanged = async () => {
      // Add a small delay to ensure sync is complete
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        const res = await cartService.getCartDetail();
        const apiItems = (res as any)?.data?.cart_items || [];
        if (Array.isArray(apiItems)) {
          setItems(apiItems as CartItem[]);
        }
        try {
          setDiscountTotal(
            Number((res as any)?.data?.cart?.discount_total) || 0,
          );
        } catch {}
      } catch (e) {
        console.error("Error refetching cart after sync:", e);
      }
    };

    // Setup listener immediately
    window.addEventListener("cartChanged", handleCartChanged);

    // Also trigger a refetch after a short delay to catch any missed events
    // This ensures we refetch even if event was dispatched before listener was setup
    const timeoutId = setTimeout(() => {
      void handleCartChanged();
    }, 1000);

    return () => {
      window.removeEventListener("cartChanged", handleCartChanged);
      clearTimeout(timeoutId);
    };
  }, [root?.isLogin]);

  // Persist to guest cart storage (only when not logged in)
  React.useEffect(() => {
    if (!root?.isLogin && hasLoaded) {
      saveGuestCart(items as any);
    }
  }, [items, root?.isLogin, hasLoaded]);

  React.useEffect(() => {
    try {
      if (root?.isLogin && typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          setFullName(u?.fullname || "");
          setPhone(u?.phone || "");
          // Prefer user.user_id per requirement, fallback to id/_id if missing
          setUserId(String(u?.user_id || u?.id || u?._id || ""));
        }
      } else {
        setFullName("");
        setPhone("");
        setUserId("");
      }
    } catch (e) {
      // ignore malformed storage
    }
  }, [root?.isLogin]);

  const totals = useMemo(() => {
    const selected = items.filter((it) => Boolean((it as any).is_selected));
    const subtotal = selected.reduce(
      (sum, it) =>
        sum + (Number((it as any).price) || 0) * (Number((it as any).qty) || 0),
      0,
    );
    const promo = Number(discountTotal) || 0; // from cart detail
    const total = subtotal - promo;
    return { subtotal, promo, total };
  }, [items, discountTotal]);

  const payableTotal = useMemo(() => Math.max(0, totals.total), [totals.total]);

  // Nhóm sản phẩm theo level: parent (level 1) và tặng kèm (level 2)
  const groupedItems = useMemo(() => {
    const parents: any[] = (items as any[]).filter(
      (it: any) => !it?.cart_parent_id,
    );
    const children: any[] = (items as any[]).filter((it: any) =>
      Boolean(it?.cart_parent_id),
    );
    const byParent: Record<string, any[]> = {};
    for (const c of children) {
      const pid = String(c.cart_parent_id);
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(c);
    }
    return parents.map((p: any) => {
      const kids = byParent[String(p._id)] || [];
      const giftsClassroom = kids.filter(
        (k: any) => String(k?.type || "").toUpperCase() === "CLASSROOM",
      );
      const giftsBook = kids.filter(
        (k: any) => String(k?.type || "").toUpperCase() === "BOOK",
      );
      return { parent: p, giftsClassroom, giftsBook };
    });
  }, [items]);

  const handleQuantity = async (id: string, delta: number) => {
    const current = items.find(
      (it: any) => (it as any)._id === id || (it as any).item_id === id,
    );
    if (!current) return;
    const currentQty = Number((current as any).qty) || 1;
    const newQty = Math.max(1, currentQty + delta);

    // Guest cart
    if (!root?.isLogin) {
      setItems(
        (prev: any[]) =>
          prev.map((it: any) => {
            const match = (it as any)._id === id || (it as any).item_id === id;
            return match ? { ...it, qty: newQty } : it;
          }) as any,
      );
      try {
        window.dispatchEvent(new Event("cartChanged"));
      } catch {}
      return;
    }

    // Logged-in -> call API update
    try {
      const row: any = current as any;
      await cartService.updateCartItem({
        id: String(row._id || id),
        item_id: String(row.item_id || id),
        price: Number(row.price) || 0,
        qty: newQty,
        type: String(row.type || "CLASSROOM"),
        is_selected: Boolean(row.is_selected),
        image: String(row.image || ""),
      });
      setItems(
        (prev: any[]) =>
          prev.map((it: any) => {
            const match = (it as any)._id === id || (it as any).item_id === id;
            return match ? { ...it, qty: newQty } : it;
          }) as any,
      );
      try {
        const { toast } = await import("react-toastify");
        toast.success("Cập nhật số lượng thành công");
      } catch {}
    } catch (e) {
      try {
        const { toast } = await import("react-toastify");
        toast.error(
          (e as any)?.response?.data?.message || "Cập nhật số lượng thất bại",
        );
      } catch {}
    }
  };

  const handleRemove = async (id: string) => {
    const current = items.find(
      (it: any) => (it as any)._id === id || (it as any).item_id === id,
    );
    if (!current) return;

    // Guest cart
    if (!root?.isLogin) {
      const itemId = String((current as any).item_id || id);
      removeGuestCart(itemId);
      setItems(
        (prev: any[]) =>
          prev.filter((it: any) => {
            const rowId = (it as any)._id ?? (it as any).item_id;
            return rowId !== id;
          }) as any,
      );
      try {
        const { toast } = await import("react-toastify");
        toast.success("Đã xóa khỏi giỏ hàng");
      } catch {}
      try {
        window.dispatchEvent(new Event("cartChanged"));
      } catch {}
      return;
    }

    // Logged-in -> call API delete
    try {
      const row: any = current as any;
      const rowId = String(row._id || id);
      await cartService.deleteCartItem(rowId);
      setItems(
        (prev: any[]) =>
          prev.filter((it: any) => {
            const rid = (it as any)._id ?? (it as any).item_id;
            return String(rid) !== String(id);
          }) as any,
      );
      try {
        const { toast } = await import("react-toastify");
        toast.success("Đã xóa khỏi giỏ hàng");
      } catch {}
      try {
        window.dispatchEvent(new Event("cartChanged"));
      } catch {}
      // Refresh cart detail from server to ensure consistency (items, discount_total, etc.)
      try {
        const detail = await cartService.getCartDetail();
        const apiItems = (detail as any)?.data?.cart_items || [];
        setItems(apiItems as CartItem[]);
        try {
          setDiscountTotal(
            Number((detail as any)?.data?.cart?.discount_total) || 0,
          );
        } catch {}
      } catch {}
    } catch (e) {
      try {
        const { toast } = await import("react-toastify");
        toast.error(
          (e as any)?.response?.data?.message || "Xóa sản phẩm thất bại",
        );
      } catch {}
    }
  };

  const handleCheckout = async () => {
    if (!root?.isLogin) {
      router.push("/auth/signin?redirect=%2Fgio-hang");
      return;
    }

    // Renewal mode: bắt buộc chuyển khoản, không cần địa chỉ
    if (isRenewal) {
      if (selectedPayment !== "bank") {
        try {
          const { toast } = await import("react-toastify");
          toast.error('Vui lòng chọn "Chuyển khoản đến số tài khoản"');
        } catch {}
        return;
      }
      try {
        setPlacingOrder(true);
        const createPayload = {
          customer_name: fullName || "Người mua hàng",
          customer_phone: phone || "",
          customer_address: "N/A",
          payment_method: "BANK_PAYOS",
          user_id: userId || "",
          app: "Web",
        } as const;

        const createRes = await orderService.create(createPayload);
        const createdId =
          (createRes as any)?.data?._id ||
          (createRes as any)?.data?.id ||
          (createRes as any)?.data?.order_id ||
          (createRes as any)?.id;
        if (!createdId || (createRes as any)?.code !== 200) {
          try {
            const { toast } = await import("react-toastify");
            toast.error((createRes as any)?.message || "Tạo đơn hàng thất bại");
          } catch {}
          setPlacingOrder(false);
          return;
        }
        try {
          if (typeof window !== "undefined" && createdId) {
            localStorage.setItem("current_order_id", String(createdId));
            localStorage.setItem("payos_order_id", String(createdId));
          }
        } catch {}

        const selectedItems = (items as any[]).filter((it: any) =>
          Boolean(it?.is_selected),
        );
        const currentOrigin =
          typeof window !== "undefined" ? window.location.origin : "";
        const payRes = await orderService.paymentPayOS({
          id: String(createdId),
          cartItem: selectedItems as any[],
          cancelUrl: `${currentOrigin}/gio-hang/thanh-toan`,
          returnUrl: `${currentOrigin}/account/my-course`,
        });

        const checkoutUrl = (payRes as any)?.data?.payOS?.checkoutUrl;
        if ((payRes as any)?.code === 200 && checkoutUrl) {
          window.location.href = String(checkoutUrl);
          return;
        }
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (payRes as any)?.message || "Khởi tạo thanh toán thất bại",
          );
        } catch {}
      } catch (e) {
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message ||
              "Không thể khởi tạo thanh toán",
          );
        } catch {}
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    // Require address for all payment methods
    if (!address || !address.trim()) {
      setAddressError("Vui lòng nhập địa chỉ nhận hàng");
      try {
        const { toast } = await import("react-toastify");
        toast.error("Vui lòng nhập địa chỉ nhận hàng");
      } catch {}
      return;
    }
    setAddressError("");

    // Zero-payment flow: create order with SSS_BALANCE (no payment method selection required)
    if (payableTotal <= 0) {
      try {
        setPlacingOrder(true);
        const payload = {
          customer_name: fullName || "Người mua hàng",
          customer_phone: phone || "",
          customer_address: address.trim(),
          payment_method: "SSS_BALANCE",
          user_id: userId || "",
          app: "Web",
        } as const;

        const res = await orderService.create(payload);
        const createdId =
          (res as any)?.data?._id ||
          (res as any)?.data?.id ||
          (res as any)?.data?.order_id ||
          (res as any)?.id;
        if ((res as any)?.code === 200 && createdId) {
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("current_order_id", String(createdId));
            }
          } catch {}
          router.push(
            `/gio-hang/thanh-toan?id=${encodeURIComponent(String(createdId))}`,
          );
        } else {
          try {
            const { toast } = await import("react-toastify");
            toast.error((res as any)?.message || "Tạo đơn hàng thất bại");
          } catch {}
        }
      } catch (e) {
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message || "Không thể tạo đơn hàng",
          );
        } catch {}
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    // Validate for COD requires address
    if (selectedPayment === "cod") {
      if (!address || !address.trim()) {
        setAddressError("Vui lòng nhập địa chỉ nhận hàng");
        try {
          const { toast } = await import("react-toastify");
          toast.error("Vui lòng nhập địa chỉ nhận hàng");
        } catch {}
        return;
      }
      setAddressError("");

      try {
        setPlacingOrder(true);
        const payload = {
          customer_name: fullName || "Người mua hàng",
          customer_phone: phone || "",
          customer_address: address.trim(),
          payment_method: "COD",
          user_id: userId || "",
          app: "Web",
        } as const;

        const res = await orderService.create(payload);
        const createdId =
          (res as any)?.data?._id ||
          (res as any)?.data?.id ||
          (res as any)?.data?.order_id ||
          (res as any)?.id;
        if ((res as any)?.code === 200 && createdId) {
          // Lưu order ID vào localStorage cho COD
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("current_order_id", String(createdId));
            }
          } catch (e) {
            console.warn("Không thể lưu order ID vào localStorage:", e);
          }
          router.push(
            `/gio-hang/thanh-toan?id=${encodeURIComponent(String(createdId))}`,
          );
        } else {
          try {
            const { toast } = await import("react-toastify");
            toast.error((res as any)?.message || "Tạo đơn hàng thất bại");
          } catch {}
        }
      } catch (e) {
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message || "Không thể tạo đơn hàng",
          );
        } catch {}
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    // BANK transfer via PayOS
    if (selectedPayment === "bank") {
      try {
        setPlacingOrder(true);
        // 1) Create order with BANK_PAYOS method
        const createPayload = {
          customer_name: fullName || "Người mua hàng",
          customer_phone: phone || "",
          customer_address: address.trim(),
          payment_method: "BANK_PAYOS",
          user_id: userId || "",
          app: "Web",
        } as const;

        const createRes = await orderService.create(createPayload);
        const createdId =
          (createRes as any)?.data?._id ||
          (createRes as any)?.data?.id ||
          (createRes as any)?.data?.order_id ||
          (createRes as any)?.id;
        if (!createdId || (createRes as any)?.code !== 200) {
          try {
            const { toast } = await import("react-toastify");
            toast.error((createRes as any)?.message || "Tạo đơn hàng thất bại");
          } catch {}
          setPlacingOrder(false);
          return;
        }

        // Lưu order ID vào localStorage để sử dụng sau này
        try {
          if (typeof window !== "undefined" && createdId) {
            localStorage.setItem("current_order_id", String(createdId));
            // Cũng lưu vào payos_order_id để tương thích với code hiện tại
            localStorage.setItem("payos_order_id", String(createdId));
          }
        } catch (e) {
          console.warn("Không thể lưu order ID vào localStorage:", e);
        }

        // 2) Prepare cart items (selected only)
        const selectedItems = (items as any[]).filter((it: any) =>
          Boolean(it?.is_selected),
        );

        // 3) Call PayOS initiation
        const currentOrigin =
          typeof window !== "undefined" ? window.location.origin : "";
        const payRes = await orderService.paymentPayOS({
          id: String(createdId),
          cartItem: selectedItems as any[],
          cancelUrl: `${currentOrigin}/gio-hang/thanh-toan`,
          returnUrl: `${currentOrigin}/gio-hang/thanh-toan`,
        });

        const checkoutUrl = (payRes as any)?.data?.payOS?.checkoutUrl;
        if ((payRes as any)?.code === 200 && checkoutUrl) {
          window.location.href = String(checkoutUrl);
          return;
        }

        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (payRes as any)?.message || "Khởi tạo thanh toán thất bại",
          );
        } catch {}
      } catch (e) {
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message ||
              "Không thể khởi tạo thanh toán",
          );
        } catch {}
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    // DIRECTLY at center
    if (selectedPayment === "center") {
      if (!address || !address.trim()) {
        setAddressError("Vui lòng nhập địa chỉ nhận hàng");
        try {
          const { toast } = await import("react-toastify");
          toast.error("Vui lòng nhập địa chỉ nhận hàng");
        } catch {}
        return;
      }
      setAddressError("");
      try {
        setPlacingOrder(true);
        const payload = {
          customer_name: fullName || "Người mua hàng",
          customer_phone: phone || "",
          customer_address: (address || "").trim(),
          payment_method: "DIRECTLY",
          user_id: userId || "",
          app: "Web",
        } as const;

        const res = await orderService.create(payload);
        const createdId =
          (res as any)?.data?._id ||
          (res as any)?.data?.id ||
          (res as any)?.data?.order_id ||
          (res as any)?.id;
        if ((res as any)?.code === 200 && createdId) {
          // Lưu order ID vào localStorage cho DIRECTLY
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("current_order_id", String(createdId));
            }
          } catch (e) {
            console.warn("Không thể lưu order ID vào localStorage:", e);
          }
          router.push(
            `/gio-hang/thanh-toan?id=${encodeURIComponent(String(createdId))}`,
          );
        } else {
          try {
            const { toast } = await import("react-toastify");
            toast.error((res as any)?.message || "Tạo đơn hàng thất bại");
          } catch {}
        }
      } catch (e) {
        try {
          const { toast } = await import("react-toastify");
          toast.error(
            (e as any)?.response?.data?.message || "Không thể tạo đơn hàng",
          );
        } catch {}
      } finally {
        setPlacingOrder(false);
      }
      return;
    }

    // Other payment methods can be integrated later
    try {
      const { toast } = await import("react-toastify");
      toast.info("Phương thức thanh toán chưa được hỗ trợ.");
    } catch {}
  };

  const openCouponModal = async () => {
    setIsCouponOpen(true);
    setLoadingCoupons(true);
    setCouponError(null);
    try {
      const res = await cartService.getCouponList();
      const data = (res as any)?.data;
      const list = Array.isArray(data) ? data : data?.records || [];
      setCoupons(list as CouponItem[]);
    } catch (e) {
      setCouponError("Không thể tải mã khuyến mại");
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = (voucher || "").trim();
    if (!code) {
      try {
        const { toast } = await import("react-toastify");
        toast.error("Vui lòng nhập mã khuyến mại");
      } catch {}
      return;
    }
    if (!root?.isLogin) {
      try {
        const { toast } = await import("react-toastify");
        toast.info("Vui lòng đăng nhập để áp dụng mã");
      } catch {}
      router.push("/auth/signin?redirect=%2Fgio-hang");
      return;
    }
    try {
      setApplyingCoupon(true);
      const res = await cartService.applyCoupon({ discount_code: code });
      if ((res as any)?.code === 200) {
        try {
          const { toast } = await import("react-toastify");
          toast.success((res as any)?.message || "Áp dụng mã thành công");
        } catch {}
        // Refetch cart when logged in to reflect any pricing changes from server
        if (root?.isLogin) {
          try {
            const detail = await cartService.getCartDetail();
            const apiItems = (detail as any)?.data?.cart_items || [];
            setItems(apiItems as CartItem[]);
            try {
              setDiscountTotal(
                Number((detail as any)?.data?.cart?.discount_total) || 0,
              );
            } catch {}
          } catch {}
        }
      } else {
        try {
          const { toast } = await import("react-toastify");
          toast.error((res as any)?.message || "Áp dụng mã thất bại");
        } catch {}
      }
    } catch (e) {
      try {
        const { toast } = await import("react-toastify");
        toast.error(
          (e as any)?.response?.data?.message || "Không thể áp dụng mã",
        );
      } catch {}
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSelectCoupon = (c: CouponItem) => {
    if (c?.code) setVoucher(c.code);
    setIsCouponOpen(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="text-sm text-gray-500 py-3">
        Trang chủ &gt; Giỏ hàng &gt;{" "}
        <span className="font-semibold text-gray-700">Thanh toán</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold">Thông tin người nhận</h2>

              {mounted && !root?.isLogin && (
                <button
                  className="text-blue-600 text-sm hover:underline"
                  onClick={() => {
                    if (!root?.isLogin)
                      router.push("/auth/signup?redirect=%2Fgio-hang");
                  }}
                >
                  Đăng ký
                </button>
              )}
            </div>

            {!mounted ? (
              <div className="px-4 py-5 text-sm text-gray-500">Đang tải...</div>
            ) : !root?.isLogin ? (
              <div className="px-4 py-5 flex flex-col items-center text-sm text-gray-600">
                <p className="mb-3">Vui lòng đăng nhập để tiếp tục mua hàng</p>
                <div className="flex gap-3">
                  <Link
                    href="/auth/signin?redirect=%2Fgio-hang"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                  >
                    Đăng nhập
                  </Link>
                  {/*<Link href="/auth/signup?redirect=%2Fgio-hang" className="px-4 py-2 border rounded-md text-sm">Đăng ký</Link>*/}
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Họ và tên</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Nhập tên của bạn"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {!isRenewal && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-gray-600 mb-1">
                        Địa chỉ nhận hàng
                      </label>
                      <input
                        className={`w-full border rounded-md px-3 py-2 ${addressError ? "border-red-500" : ""}`}
                        placeholder="Nhập địa chỉ nhận của bạn"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (addressError) setAddressError("");
                        }}
                      />
                      {addressError && (
                        <div className="text-red-500 text-xs mt-1">
                          {addressError}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-600 mb-1">
                        Ghi chú
                      </label>
                      <input
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="Ghi chú cho đơn hàng"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="bg-white border rounded-md">
            <div className="px-4 py-3 border-b text-sm text-gray-600 flex items-center gap-3">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={allChecked}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span>Tất cả sản phẩm</span>
            </div>
            <div className="divide-y">
              {loading && (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Đang tải giỏ hàng...
                </div>
              )}
              {!loading && error && (
                <div className="px-4 py-6 text-sm text-red-600">{error}</div>
              )}
              {!loading && !error && items.length === 0 && (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Giỏ hàng trống
                </div>
              )}
              {!loading &&
                !error &&
                groupedItems.map(
                  ({ parent, giftsClassroom, giftsBook }, idx) => {
                    const imageSrc =
                      (parent as any).image &&
                      typeof (parent as any).image === "string" &&
                      (parent as any).image.trim() !== ""
                        ? (parent as any).image
                        : "/imgs/home/course-1.png";
                    const idKey =
                      (parent as any)._id ??
                      (parent as any).item_id ??
                      `parent-${idx}`;
                    const rowId =
                      (parent as any)._id ?? (parent as any).item_id;
                    return (
                      <div key={idKey} className="">
                        <div className="px-4 py-3 flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-blue-600"
                            checked={Boolean((parent as any).is_selected)}
                            onChange={(e) =>
                              toggleItem(rowId, e.target.checked)
                            }
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative w-[72px] h-[72px] border rounded overflow-hidden">
                              <Image
                                src={imageSrc}
                                alt={(parent as any).name || "Sản phẩm"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium line-clamp-1">
                                {(parent as any).name}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {(parent as any).teacher}
                              </div>
                            </div>
                          </div>
                          {(parent as any).type !== "CLASSROOM" && (
                            <div className="flex items-center gap-2">
                              <button
                                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantity(rowId, -1)}
                                disabled={(parent as any).type === "EXTEND_BOOKID"}
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm">
                                {(parent as any).qty}
                              </span>
                              <button
                                className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantity(rowId, 1)}
                                disabled={(parent as any).type === "EXTEND_BOOKID"}
                              >
                                +
                              </button>
                            </div>
                          )}

                          <div className="w-[120px] text-right text-sm font-semibold text-red-600">
                            {formatCurrency(
                              (Number((parent as any).price) || 0) *
                                (Number((parent as any).qty) || 0),
                            )}
                          </div>

                          <button
                            aria-label="remove"
                            className="ml-3 text-gray-400 hover:text-red-600"
                            onClick={() => handleRemove(rowId)}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5V6H19V4Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>

                        {(giftsClassroom.length > 0 ||
                          giftsBook.length > 0) && (
                          <div className="mx-4 mb-3">
                            {giftsClassroom.length > 0 && (
                              <div className="bg-blue-50 border rounded-md px-4 py-3 mb-3">
                                <div className="text-[#235CD0] font-semibold mb-3">
                                  Khóa học tặng kèm
                                </div>
                                {giftsClassroom.map((g: any) => {
                                  const gImage =
                                    g?.image &&
                                    typeof g.image === "string" &&
                                    g.image.trim() !== ""
                                      ? g.image
                                      : "/imgs/home/course-1.png";
                                  const gKey = g?._id || g?.item_id;
                                  return (
                                    <div
                                      key={gKey}
                                      className="py-3 flex items-center gap-3 border-t first:border-t-0"
                                    >
                                      <div className="relative w-[72px] h-[72px] border rounded overflow-hidden">
                                        <Image
                                          src={gImage}
                                          alt={g?.name || "Tặng kèm"}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium line-clamp-1">
                                          {g?.name}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1">
                                          {g?.teacher}
                                        </div>
                                      </div>
                                      <div className="text-sm font-semibold text-red-600">
                                        {(Number(g?.price) || 0) === 0
                                          ? "Miễn phí"
                                          : formatCurrency(
                                              Number(g?.price) || 0,
                                            )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {giftsBook.length > 0 && (
                              <div className="bg-blue-50 border rounded-md px-4 py-3">
                                <div className="text-[#235CD0] font-semibold mb-3">
                                  Sách tặng kèm
                                </div>
                                {giftsBook.map((g: any) => {
                                  const gImage =
                                    g?.image &&
                                    typeof g.image === "string" &&
                                    g.image.trim() !== ""
                                      ? g.image
                                      : "/imgs/home/course-1.png";
                                  const gKey = g?._id || g?.item_id;
                                  return (
                                    <div
                                      key={gKey}
                                      className="py-3 flex items-center gap-3 border-t first:border-t-0"
                                    >
                                      <div className="relative w-[72px] h-[72px] border rounded overflow-hidden">
                                        <Image
                                          src={gImage}
                                          alt={g?.name || "Tặng kèm"}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium line-clamp-1">
                                          {g?.name}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1">
                                          {g?.teacher}
                                        </div>
                                      </div>
                                      <div className="text-sm font-semibold text-red-600">
                                        {(Number(g?.price) || 0) === 0
                                          ? "Miễn phí"
                                          : formatCurrency(
                                              Number(g?.price) || 0,
                                            )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">Mã khuyến mại</h3>
              <button
                className="text-blue-600 text-sm"
                onClick={openCouponModal}
              >
                Xem tất cả
              </button>
            </div>
            <div className="px-4 py-3 flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm"
                placeholder="Nhập voucher của bạn"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
              />
              <button
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-60"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon}
              >
                {applyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
              </button>
            </div>
          </section>

          <section className="bg-white border rounded-md text-sm">
            <div className="px-4 py-3 border-b font-semibold">Đơn giá</div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phiếu giảm giá</span>
                <span>{formatCurrency(totals.promo)}</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between font-semibold text-red-600">
                <span>Thanh toán</span>
                <span>{formatCurrency(payableTotal)}</span>
              </div>
              <div className="text-[11px] text-right text-gray-500">
                <span>Tiết kiệm </span>
                <span>{formatCurrency(totals.promo)}</span>
              </div>
            </div>
          </section>

          <section className="bg-white border rounded-md text-sm">
            <div className="px-4 py-3 border-b font-semibold">
              Hình thức thanh toán
            </div>
            <div className="px-4 py-3 space-y-3">
              <div
                className={`${payableTotal <= 0 ? "opacity-50 pointer-events-none" : ""}`}
              >
                <label className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === "bank"}
                    disabled={payableTotal <= 0}
                    onChange={() => setSelectedPayment("bank")}
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <div className="font-medium">
                      Chuyển khoản đến số tài khoản
                    </div>
                    <div className="text-gray-500 text-xs">{"\u00A0"}</div>
                  </div>
                </label>

                {!isRenewal && (
                  <>
                    <label className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === "cod"}
                        disabled={payableTotal <= 0}
                        onChange={() => setSelectedPayment("cod")}
                        className="mt-1 accent-blue-600"
                      />
                      <div>
                        <div className="font-medium">
                          Ship COD khi nhận hàng
                        </div>
                        <div className="text-gray-500 text-xs">
                          Ship COD (Thanh toán khi nhận hàng)
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === "center"}
                        disabled={payableTotal <= 0}
                        onChange={() => setSelectedPayment("center")}
                        className="mt-1 accent-blue-600"
                      />
                      <div>
                        <div className="font-medium">
                          Mua trực tiếp tại trung tâm
                        </div>
                        <div className="text-gray-500 text-xs">
                          Mua trực tiếp tại trung tâm: Số 88, ngõ 27 Đại Cồ
                          Việt, Hai Bà Trưng, Hà Nội
                        </div>
                      </div>
                    </label>
                  </>
                )}
              </div>
              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full bg-red-600 text-white py-3 rounded-md font-semibold disabled:opacity-60"
              >
                {placingOrder ? "Đang xử lý..." : "Mua ngay"}
              </button>
            </div>
          </section>
        </aside>
      </div>
      {isCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCouponOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-md shadow-lg">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold">Chọn mã khuyến mại</div>
              <button
                className="text-sm text-gray-500"
                onClick={() => setIsCouponOpen(false)}
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loadingCoupons && (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Đang tải mã khuyến mại...
                </div>
              )}
              {!loadingCoupons && couponError && (
                <div className="px-4 py-6 text-sm text-red-600">
                  {couponError}
                </div>
              )}
              {!loadingCoupons && !couponError && coupons.length === 0 && (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Không có mã khuyến mại khả dụng
                </div>
              )}
              {!loadingCoupons &&
                !couponError &&
                coupons.map((c) => (
                  <div
                    key={c.id || c.code}
                    className="px-4 py-3 border-b flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{c.code}</div>
                      {c.description && (
                        <div className="text-xs text-gray-500">
                          {c.description}
                        </div>
                      )}
                    </div>
                    <button
                      className="px-3 py-1 rounded-md border text-sm"
                      onClick={() => handleSelectCoupon(c)}
                    >
                      Chọn
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
