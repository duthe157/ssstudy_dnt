"use client";
import React from "react";
import Link from "next/link";
import { Book, User, ShoppingBag, Key, LogOut, CreditCard } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import "./Sidebar.css";
import { usePathname } from "next/navigation";

interface SidebarProps {
    fullname?: string | null;
    avatar?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ fullname, avatar }) => {
    const pathname = usePathname();

    const menus = [
        { label: "Khóa học của tôi", href: "/account/my-course", icon: <Book size={18} /> },
        { label: "Thông tin cá nhân", href: "/account", icon: <User size={18} /> },
        { label: "Đơn hàng", href: "/account/order-history", icon: <ShoppingBag size={18} /> },
        { label: "Lịch sử giao dịch", href: "/account/credit-history", icon: <CreditCard size={18} /> },
        { label: "Thay đổi mật khẩu", href: "/account/change-password", icon: <Key size={18} /> },
        { label: "Đăng xuất", href: "/logout", icon: <LogOut size={18} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-profile">
                <div className="avatar-wrapper">
                    <Avatar 
                        src={avatar}
                        fullname={fullname}
                        size="lg"
                        className="avatar-img"
                    />
                </div>
                <div className="student-name">{fullname || "Họ và Tên"}</div>
            </div>

            <ul className="sidebar-options">
                {menus.map((menu, index) => (
                    <li
                        key={index}
                        className={`menu-item ${pathname === menu.href ? "active" : ""}`}
                    >
                        {menu.icon}
                        <Link href={menu.href}>{menu.label}</Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
