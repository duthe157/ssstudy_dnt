"use client";
import { useState, useEffect } from "react";
import { apiService } from "../../../services/api";
import CreditHistoryForm from "./CreditHistoryForm";

interface CreditRecord {
  _id: string;
  code: number;
  total: number;
  type: "SUB" | "LEAD" | "ADD" | string;
  payment_method: "BANK_TRANSFER" | "SSS_BALANCE" | string;
  user: {
    id: string;
    name: string;
    code: string;
  };
  note?: string | null;
  status: "PENDING" | "PAID" | "SUCCESS" | string;
  created_at: string;
  updated_at: string;
}

interface CreditHistory {
  records: CreditRecord[];
  totalRecord: number;
  perPage: number;
}

interface ApiResponse {
  data: CreditHistory;
  message: string;
  code: number;
}

export default function CreditHistoryClient() {
  const [creditHistory, setCreditHistory] = useState<CreditHistory>({
    records: [],
    totalRecord: 0,
    perPage: 10,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [limit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const calcTotalPage = (totalRecords?: number, limitVal?: number) => {
    if (!totalRecords || !limitVal) return 0;
    return Math.ceil(totalRecords / limitVal);
  };

  useEffect(() => {
    async function getCreditHistory() {
      try {
        setLoading(true);
        const params = { limit, page: currentPage };
        const response = await apiService.post<ApiResponse>(
          "/credit/list",
          params
        );
        if ((response as any)?.code === 200) {
          setCreditHistory((response as any).data);
        }
      } catch (error) {
        console.error("Error fetching credit history:", error);
      } finally {
        setLoading(false);
      }
    }
    getCreditHistory();
  }, [currentPage, limit]);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
    if (typeof window !== "undefined") {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case "ADD":
        return "Nạp tiền";
      case "SUB":
        return "Trừ tiền";
      case "LEAD":
        return "Hoàn tiền";
      default:
        return type;
    }
  };

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "BANK_TRANSFER":
        return "Chuyển khoản";
      case "SSS_BALANCE":
        return "Ví SSStudy";
      default:
        return method;
    }
  };

  const getTransactionStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PAID":
        return "Đã thanh toán";
      case "SUCCESS":
        return "Thành công";
      default:
        return status;
    }
  };

  return (
    <CreditHistoryForm
      creditHistory={creditHistory}
      loading={loading}
      handlePageClick={handlePageClick}
      calcTotalPage={calcTotalPage}
      getTransactionType={getTransactionType}
      getPaymentMethod={getPaymentMethod}
      getTransactionStatus={getTransactionStatus}
    />
  );
}
