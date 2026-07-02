import React from "react";
import baseHelper from "../../../components/helpers/baseHelper";

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

interface OrderDetail {
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

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetail: OrderDetail | null;
    loading: boolean;
    getValuePaymentMethod: (method: string) => string;
    getPaymentStatus: (status: string) => string;
}

function OrderDetailModal({
    isOpen,
    onClose,
    orderDetail,
    loading,
    getValuePaymentMethod,
    getPaymentStatus,
}: OrderDetailModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Chi tiết đơn hàng</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="modal-loading">Đang tải dữ liệu...</div>
                    ) : orderDetail ? (
                        <div className="order-detail-content">
                            {/* Order Information */}
                            <div className="order-info-section">
                                <h3>Thông tin đơn hàng</h3>
                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <label>Mã đơn hàng:</label>
                                        <span>{orderDetail.code}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Ngày đặt:</label>
                                        <span>
                                            {baseHelper.formatDateTimeToString(orderDetail.created_at)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Trạng thái:</label>
                                        <span className={`status-badge status-${orderDetail.status.toLowerCase()}`}>
                                            {getPaymentStatus(orderDetail.status)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Phương thức thanh toán:</label>
                                        <span>{getValuePaymentMethod(orderDetail.payment_method)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="customer-info-section">
                                <h3>Thông tin khách hàng</h3>
                                <div className="customer-info-grid">
                                    <div className="info-item">
                                        <label>Tên khách hàng:</label>
                                        <span>{orderDetail.customer_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Số điện thoại:</label>
                                        <span>{orderDetail.customer_phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>{orderDetail.customer_email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Địa chỉ:</label>
                                        <span>{orderDetail.customer_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="order-items-section">
                                <h3>Sản phẩm đã đặt</h3>
                                <div className="items-table-wrapper">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Tên sản phẩm</th>
                                                <th>Loại</th>
                                                <th>Số lượng</th>
                                                <th>Đơn giá</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetail.items.map((item) => (
                                                <tr key={item._id}>
                                                    <td data-label="Tên sản phẩm">{item.name}</td>
                                                    <td data-label="Loại">{item.type}</td>
                                                    <td data-label="Số lượng">{item.qty}</td>
                                                    <td data-label="Đơn giá">
                                                        {baseHelper.currencyFormat(item.price)}
                                                    </td>
                                                    <td data-label="Thành tiền">
                                                        {baseHelper.currencyFormat(item.price * item.qty)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="order-summary-section">
                                <h3>Tổng kết đơn hàng</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <label>Tạm tính:</label>
                                        <span>{baseHelper.currencyFormat(orderDetail.subtotal)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <label>Giảm giá:</label>
                                        <span>{baseHelper.currencyFormat(orderDetail.discount_total)}</span>
                                    </div>
                                    <div className="summary-item total">
                                        <label>Tổng cộng:</label>
                                        <span>{baseHelper.currencyFormat(orderDetail.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            {orderDetail.note && (
                                <div className="order-note-section">
                                    <h3>Ghi chú</h3>
                                    <p>{orderDetail.note}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="modal-error">Không thể tải thông tin đơn hàng</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OrderDetailModal;
