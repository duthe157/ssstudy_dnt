import ReactPaginate from "react-paginate";
import baseHelper from "../../../components/helpers/baseHelper";
import "./order-history.css";
import Breadcrumbs from "@components/ui/breadcrumbs/Breadcrumbs";
import React from "react";

interface OrderItem {
    _id: string;
    item_id: string;
    name: string;
    price: number;
    qty: number;
    type: string;
    order_id: string;
    created_at: string;
    updated_at: string;
}

interface OrderRecord {
    _id: string;
    code: number;
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_email: string;
    customer_code: string;
    discount_code: string | null;
    discount_total: number;
    subtotal: number;
    total: number;
    payment_method: string;
    note: string;
    status: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface Orders {
    records: OrderRecord[];
    totalRecord: number;
    perPage: number;
}

interface OrderFormProps {
    orders: Orders;
    loading: boolean;
    handlePageClick: (event: any) => void;
    calcTotalPage: (totalRecords: number, limit: number) => number;
    getValuePaymentMehod: (method: string) => string;
    getPaymentStatus: (status: string) => string;
    onViewDetail: (orderId: string) => void;
}
function OrderForm({
                       orders,
                       loading,
                       handlePageClick,
                       calcTotalPage,
                       getValuePaymentMehod,
                       getPaymentStatus,
                       onViewDetail,
                   }: OrderFormProps) {
    return (
        <main className="form-area">
            <div className="breadcrumb-wrapper">
                <Breadcrumbs />
            </div>
            <div className="order-form">
                <div className="order-block">
                    <div className="order-table-wrapper">
                        {loading ? (
                            <div className="order-loading">Đang tải dữ liệu...</div>
                        ) : orders && orders.records.length > 0 ? (
                            <table className="order-table">
                                <thead>
                                <tr>
                                    <th>Ngày đặt hàng</th>
                                    <th>Mã đơn hàng</th>
                                    <th>Phương thức</th>
                                    <th>Trạng thái</th>
                                    <th>Số tiền (đ)</th>
                                    <th>Giảm giá (đ)</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.records.map((item: OrderRecord, index: number) => (
                                    <tr key={item._id || index}>
                                        <td data-label="Ngày đặt hàng">
                                            {item.created_at
                                                ? baseHelper.formatDateTimeToString(item.created_at)
                                                : ""}
                                        </td>
                                        <td data-label="Mã đơn hàng">{item?.code}</td>
                                        <td data-label="Phương thức">{getValuePaymentMehod(item.payment_method)}</td>
                                        <td data-label="Trạng thái">{getPaymentStatus(item.status)}</td>
                                        <td className="text-right" data-label="Số tiền (đ)">
                                            {item.total ? baseHelper.currencyFormat(item.total) : 0}
                                        </td>
                                        <td className="text-right" data-label="Giảm giá (đ)">
                                            {item.discount_total
                                                ? baseHelper.currencyFormat(item.discount_total)
                                                : 0}
                                        </td>
                                        <td className="text-right" data-label="">
                                            <button 
                                                className="order-detail-link"
                                                onClick={() => onViewDetail(item._id)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="order-empty">Không có dữ liệu!</div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && orders && orders.totalRecord > 0 && (
                        <div className="order-pagination">
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel=">"
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={3}
                                pageCount={calcTotalPage(orders?.totalRecord, orders?.perPage)}
                                previousLabel="<"
                                renderOnZeroPageCount={null}
                                className="pagination"
                                activeClassName="active"
                                pageClassName="page-item"
                                previousClassName="page-nav"
                                nextClassName="page-nav"
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default OrderForm;