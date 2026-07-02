"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import { markCourseRenewed } from "@/hooks/useRenewalNotification";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";

type PaymentStatus = "success" | "pending" | "failed" | "cancelled";

function formatCurrency(value: number | undefined) {
  if (!value || isNaN(Number(value))) return "0đ";
  return Number(value).toLocaleString("vi-VN") + "đ";
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams?.get("id") || "";
  const cancel = searchParams?.get("cancel") || "";
  const statusParam = searchParams?.get("status") || "";
  const code = searchParams?.get("code") || "";
  const orderCodeParam = searchParams?.get("orderCode") || "";

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<PaymentStatus>("pending");
  const [orderCode, setOrderCode] = React.useState<string>("");
  const [amount, setAmount] = React.useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("");
  const [orderPaymentCode, setOrderPaymentCode] = React.useState<string>("");
  const [orderSubtotal, setOrderSubtotal] = React.useState<number>(0);
  const [payosHookSent, setPayosHookSent] = React.useState(false);
  const [quickPaymentId, setQuickPaymentId] = React.useState<string>("");
  const [lastLinkStatus, setLastLinkStatus] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("quick_payment_id") || "";
      if (stored) setQuickPaymentId(stored);
    } catch {}
  }, []);

  React.useEffect(() => {
    const load = async () => {
      // Ưu tiên sử dụng order ID từ localStorage nếu có (cho bank payment)
      let orderIdToUse = id;
      try {
        const storedOrderId = localStorage.getItem("current_order_id");
        if (storedOrderId) {
          orderIdToUse = storedOrderId;
        }
      } catch (e) {
        console.warn("Không thể đọc order ID từ localStorage:", e);
      }

      if (!orderIdToUse) {
        setError("Thiếu mã đơn hàng");
        setLoading(false);
        setStatus("failed");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.paymentInfo({ id: orderIdToUse });
        const code = (res as any)?.code;
        const data = (res as any)?.data || {};
        setOrderCode(String(data?.order?.code || data?.order?._id || id));
        setAmount(
          (() => {
            const a = Number(data?.order?.amount);
            const t = Number(data?.order?.total);
            const s = Number(data?.order?.subtotal);
            if (!isNaN(a) && a > 0) return a;
            if (!isNaN(t) && t >= 0) return t;
            if (!isNaN(s) && s >= 0) return s;
            return 0;
          })(),
        );
        setOrderSubtotal(Number(data?.order?.subtotal) || 0);
        const pm = String(
          data?.order?.payment_method || data?.order?.paymentMethod || "",
        ).toUpperCase();
        setPaymentMethod(pm);
        setOrderPaymentCode(
          String(
            data?.order_payment_method?.code ||
              data?.order?.payment_method_code ||
              "",
          ),
        );
        if (code === 200) {
          const st = String(data?.order?.status || "").toUpperCase();
          if (st === "PAID") setStatus("success");
          else if (st === "CANCELLED") setStatus("cancelled");
          else if (st === "FAILED") setStatus("failed");
          else setStatus("pending");
        } else {
          setStatus("failed");
          setError(
            (res as any)?.message || "Không thể lấy thông tin thanh toán",
          );
        }

        // Sau khi lấy payment info, gọi lại cart/count để đồng bộ số lượng
        try {
          await cartService.getCartCount();
          try {
            window.dispatchEvent(new Event("cartChanged"));
          } catch {}
        } catch {}
      } catch (e) {
        setStatus("failed");
        setError(
          (e as any)?.response?.data?.message ||
            "Không thể lấy thông tin thanh toán",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  // After redirect from PayOS, call detail and update APIs using id from URL and orderId from localStorage
  // Chỉ gọi PayOS APIs khi payment method là BANK_PAYOS
  React.useEffect(() => {
    const run = async () => {
      if (!id) return;

      // Chỉ gọi PayOS APIs khi payment method là BANK_PAYOS
      const isBankPayment =
        String(paymentMethod || "").toUpperCase() === "BANK_PAYOS";
      if (!isBankPayment) return;

      try {
        const orderId =
          typeof window !== "undefined"
            ? localStorage.getItem("payos_order_id") || ""
            : "";
        if (!orderId) return;
        // 1) Detail
        try {
          await orderService.payosDetailOrder({ id, orderId });
        } catch {}
        // 2) Update
        try {
          await orderService.payosUpdateOrder({ id, orderId });
        } catch {}
      } catch {}
    };
    void run();
  }, [id, paymentMethod]);
  // derive status from URL params if provided by PayOS redirect
  // Chỉ xử lý PayOS redirect parameters khi payment method là BANK_PAYOS
  React.useEffect(() => {
    const isBankPayment =
      String(paymentMethod || "").toUpperCase() === "BANK_PAYOS";
    if (!isBankPayment) return;

    const p = String((statusParam || "").toUpperCase());
    if (p === "PAID") setStatus("success");
    else if (p === "CANCELLED") setStatus("cancelled");
    else setStatus("failed");
  }, [statusParam, paymentMethod]);

  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";
  const methodCode = React.useMemo(
    () => String(paymentMethod || "").toUpperCase(),
    [paymentMethod],
  );

  const title = React.useMemo(() => {
    if (methodCode === "BANK_PAYOS") {
      if (isSuccess) return "Thanh toán thành công";
      if (isCancelled) return "Hủy đơn hàng thành công";
    }
    if (isSuccess) return "Tạo đơn hàng thành công";
    if (status === "failed") return "Tạo đơn hàng không thành công";
    if (isCancelled) return "Đã hủy thanh toán";
    return "Đơn hàng đang xử lý";
  }, [methodCode, isSuccess, status, isCancelled]);

  const statusText = isSuccess
    ? "Đã thanh toán"
    : status === "failed"
      ? "Lỗi"
      : isCancelled
        ? "Đã hủy thanh toán"
        : "Chờ thanh toán";
  const methodLabel = React.useMemo(() => {
    if (methodCode === "DIRECTLY") return "Tại cửa hàng";
    if (methodCode === "COD") return "Ship COD (Thanh toán khi nhận hàng)";
    if (methodCode === "BANK_PAYOS") return "Chuyển khoản ngân hàng";
    if (methodCode === "SSS_BALANCE") return "Mua miễn phí";
    return "Tại cửa hàng";
  }, [methodCode]);
  const infoMessage = React.useMemo(() => {
    if (methodCode === "COD") {
      return (
        <>
          Nhân viên chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trước khi
          giao. Hoặc bạn có thể gọi{" "}
          <span className="text-[#E53935] font-semibold">0339793147</span> để
          được hỗ trợ
        </>
      );
    }
    if (isSuccess) {
      if (methodCode === "BANK_PAYOS") {
        return (
          <>
            Đơn hàng của bạn đã thanh toán thành công. Có vấn đề gì xin hãy liên
            hệ với chúng tôi{" "}
            <span className="text-[#E53935] font-semibold">0339793147</span>.
            Cảm ơn bạn đã tin tưởng và đồng hành cùng SSStudy.
          </>
        );
      }
    }
    if (isCancelled && methodCode === "BANK_PAYOS") {
      return (
        <>
          SSStudy rất tiếc vì không thể đồng hành cùng bạn, nếu bạn cần tư vấn
          thêm có thể liên hệ với chúng tôi theo số điện thoại{" "}
          <span className="text-[#E53935] font-semibold">0339.793.147</span> để
          được hỗ trợ
        </>
      );
    }
    return (
      <>
        Vui lòng kiểm tra email để xem thông tin đơn hàng. Nhân viên chúng tôi
        sẽ liên hệ với bạn để chuẩn bị sẵn sàng khi bạn tới lấy. Hoặc bạn có thể
        gọi <span className="text-[#E53935] font-semibold">0339 793 147</span>{" "}
        để được hỗ trợ
      </>
    );
  }, [methodCode, isSuccess, isCancelled]);

  // Đánh dấu các khóa học đã gia hạn thành công → không hiện popup nữa
  React.useEffect(() => {
    if (status !== "success") return;
    try {
      const userId = authService.getUserId();
      if (!userId) return;
      const pendingIds: string[] =
        storage.getItem("pending_renewal_course_ids") || [];
      if (pendingIds.length > 0) {
        pendingIds.forEach((courseId) => markCourseRenewed(userId, courseId));
        storage.removeItem("pending_renewal_course_ids");
      }
    } catch {
      /* noop */
    }
  }, [status]);

  // Trigger hook for successful PayOS payments
  React.useEffect(() => {
    if (payosHookSent) return;
    if (methodCode === "BANK_PAYOS" && isSuccess && orderPaymentCode) {
      setPayosHookSent(true);
      void orderService
        .payosHook({
          code: orderPaymentCode,
          amount: orderSubtotal,
        })
        .catch(() => {
          // allow retry on failure
          setPayosHookSent(false);
        });
    }
  }, [methodCode, isSuccess, orderPaymentCode, orderSubtotal, payosHookSent]);

  React.useEffect(() => {
    if (loading) return;
    const mappedStatus: Record<
      PaymentStatus,
      "PAID" | "PENDING" | "CANCELLED" | "FAILED"
    > = {
      success: "PAID",
      pending: "PENDING",
      cancelled: "CANCELLED",
      failed: "FAILED",
    };
    const statusToSend = mappedStatus[status];
    if (!quickPaymentId) return;
    if (statusToSend === "FAILED") return;
    if (lastLinkStatus === statusToSend) return;

    const run = async () => {
      try {
        await orderService.updatePaymentLinkStatus({
          id: quickPaymentId,
          status: statusToSend,
        });
        localStorage.removeItem("quick_payment_id");
        setLastLinkStatus(statusToSend);
      } catch (e) {
        console.error("Error updating payment link status", e);
      }
    };

    void run();
  }, [loading, status, quickPaymentId, lastLinkStatus]);

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <div className="text-sm text-gray-500 py-3">
        Trang chủ &gt; Giỏ hàng &gt;{" "}
        <span className="font-semibold text-gray-700">Thanh toán</span>
      </div>

      <div className="flex flex-col items-center py-10">
        <div className="mb-6">
          <Image
            src="/imgs/home/thanh-toan.svg"
            alt="Result"
            width={200}
            height={200}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#235CD0] text-center">
          {title}
        </h1>
        <p className="text-center text-gray-600 mt-3 max-w-2xl text-[15px]">
          {infoMessage}
        </p>

        <div className="mt-8 w-full max-w-[720px]">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="text-center text-base text-gray-600">
              Đơn hàng số{" "}
              <span className="font-semibold">#{orderCode || id}</span>
            </div>
            <div className="mt-4 space-y-3 text-[15px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#235CD0"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 17V12"
                      stroke="#235CD0"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="8" r="1" fill="#235CD0" />
                  </svg>
                  <span>
                    Hình thức thanh toán:{" "}
                    <span className="font-medium">{methodLabel}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 21H21"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 16L18 8"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7C8.10457 16 9 15.1046 9 14V10C9 8.89543 8.10457 8 7 8Z"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    />
                    <path
                      d="M19 8H17C15.8954 8 15 8.89543 15 10V14C15 15.1046 15.8954 16 17 16H19C20.1046 16 21 15.1046 21 14V10C21 8.89543 20.1046 8 19 8Z"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>
                    Số tiền thanh toán:{" "}
                    <span className="font-semibold">
                      {formatCurrency(amount)}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="3" fill="#9CA3AF" />
                </svg>
                <span>
                  Trạng thái:{" "}
                  <span
                    className={`${
                      isSuccess
                        ? "text-green-600"
                        : status === "failed"
                          ? "text-red-600"
                          : isCancelled
                            ? "text-orange-600"
                            : "text-gray-700"
                    } font-medium`}
                  >
                    {statusText}
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-[#235CD0] text-white font-semibold hover:bg-blue-700 transition"
              >
                Quay lại trang chủ
              </Link>
              <Link
                href="/chinh-sach/huong-dan-hoc-tai-ssstudy-1751691060547"
                className="w-full inline-flex items-center justify-center h-12 rounded-xl border border-[#235CD0] text-[#235CD0] font-semibold hover:bg-blue-50 transition"
              >
                Hướng dẫn học
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-sm text-gray-500 py-3">
            Trang chủ &gt; Giỏ hàng &gt;{" "}
            <span className="font-semibold text-gray-700">Thanh toán</span>
          </div>
          <div className="flex flex-col items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#235CD0] mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
