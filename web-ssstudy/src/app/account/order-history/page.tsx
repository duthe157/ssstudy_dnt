"use client";
import { useState, useEffect } from "react";
import { apiService } from "../../../services/api";
import "./order-history.css";
import OrderForm from "./OrderForm";
import OrderDetailModal from "./OrderDetailModal";
import "../page.css";


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
    payment_method: "BANK_TRANSFER" | "SSS_BALANCE" | "COD" | "DIRECTLY" | string;
    note: string;
    status: "PENDING" | "PAID" | "SUCCESS" | string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface Orders {
    records: OrderRecord[];
    totalRecord: number;
    perPage: number;
}

interface ApiResponse {
    data: Orders;
    message: string;
    code: number;
}

interface OrderDetailResponse {
    data: OrderRecord;
    message: string;
    code: number;
}

function Page() {

    const [orders, setOrders] = useState<Orders>({
        records: [],
        totalRecord: 0,
        perPage: 10,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [orderDetail, setOrderDetail] = useState<OrderRecord | null>(null);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);

    const [limit] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const calcTotalPage = (totalRecords?: number, limit?: number) => {
        if (!totalRecords || !limit) return 0;
        return Math.ceil(totalRecords / limit);
    };

    useEffect(() => {
        async function getOrderHistory() {
            try {
                setLoading(true);
                const params = { limit, page: currentPage };
                const response = await apiService.post<ApiResponse>("/order/list", params);
                if (response?.code === 200) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error("Error fetching order history:", error);
            } finally {
                setLoading(false);
            }
        }
        getOrderHistory();
    }, [currentPage, limit]);

    const handlePageClick = (event: { selected: number }) => {
        setCurrentPage(event.selected + 1);
        window.scroll({ top: 0, left: 0, behavior: "smooth" });
    };

    const getValuePaymentMehod = (method: string) => {
        switch (method) {
            case "BANK_TRANSFER":
                return "Chuyển khoản";
            case "SSS_BALANCE":
                return "Ví SSStudy";
            case "COD":
                return "COD";
            case "DIRECTLY":
                return "Trực tiếp";
            default:
                return "";
        }
    };

    const getPaymentStatus = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "PAID":
                return "Đã thanh toán";
            case "SUCCESS":
                return "Thành công";
            default:
                return "";
        }
    };

    const handleViewDetail = async (orderId: string) => {
        try {
            setDetailLoading(true);
            setModalOpen(true);
            const response = await apiService.post<OrderDetailResponse>("/order/detail", { id: orderId });
            if (response?.code === 200) {
                setOrderDetail(response.data);
            }
        } catch (error) {
            console.error("Error fetching order detail:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setOrderDetail(null);
    };

    return (
        <>
            <OrderForm
                orders={orders}
                loading={loading}
                handlePageClick={handlePageClick}
                calcTotalPage={calcTotalPage}
                getValuePaymentMehod={getValuePaymentMehod}
                getPaymentStatus={getPaymentStatus}
                onViewDetail={handleViewDetail}
            />
            <OrderDetailModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                orderDetail={orderDetail}
                loading={detailLoading}
                getValuePaymentMethod={getValuePaymentMehod}
                getPaymentStatus={getPaymentStatus}
            />
        </>
    );
}

export default Page;