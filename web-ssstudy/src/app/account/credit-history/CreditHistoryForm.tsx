"use client";
import React from "react";
import ReactPaginate from "react-paginate";
import moment from "moment";

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

interface CreditHistoryFormProps {
  creditHistory: CreditHistory;
  loading: boolean;
  handlePageClick: (event: { selected: number }) => void;
  calcTotalPage: (totalRecords?: number, limit?: number) => number;
  getTransactionType: (type: string) => string;
  getPaymentMethod: (method: string) => string;
  getTransactionStatus: (status: string) => string;
}

const CreditHistoryForm: React.FC<CreditHistoryFormProps> = ({
  creditHistory,
  loading,
  handlePageClick,
  calcTotalPage,
  getTransactionType,
  getPaymentMethod,
  getTransactionStatus,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ADD":
        return "text-green-600";
      case "SUB":
        return "text-red-600";
      case "LEAD":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="credit-history-container">
        <div className="credit-history-header">
          <h2>Lịch sử giao dịch</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-history-container">
      <div className="credit-history-header">
        <h2>Lịch sử giao dịch</h2>
        <p className="total-records">
          Tổng cộng: {creditHistory.totalRecord} giao dịch
        </p>
      </div>

      <div className="credit-history-content">
        {creditHistory.records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="#9CA3AF"
                />
              </svg>
            </div>
            <h3>Chưa có giao dịch nào</h3>
            <p>Bạn chưa có giao dịch nào trong hệ thống.</p>
          </div>
        ) : (
          <>
            <div className="credit-table-container">
              <table className="credit-table">
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Loại giao dịch</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.records.map((record) => (
                    <tr key={record._id}>
                      <td className="transaction-code">#{record.code}</td>
                      <td>
                        <span
                          className={`transaction-type ${getTypeColor(
                            record.type
                          )}`}
                        >
                          {getTransactionType(record.type)}
                        </span>
                      </td>
                      <td className="amount">
                        <span className={getTypeColor(record.type)}>
                          {record.type === "SUB" ? "-" : "+"}
                          {formatCurrency(record.total)}
                        </span>
                      </td>
                      <td>{getPaymentMethod(record.payment_method)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getTransactionStatus(record.status)}
                        </span>
                      </td>
                      <td className="date">
                        {moment(record.created_at).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="note">{record.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {creditHistory.totalRecord > creditHistory.perPage && (
              <div className="pagination-container">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Tiếp theo >"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={5}
                  pageCount={calcTotalPage(
                    creditHistory.totalRecord,
                    creditHistory.perPage
                  )}
                  previousLabel="< Trước"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="active"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditHistoryForm;
