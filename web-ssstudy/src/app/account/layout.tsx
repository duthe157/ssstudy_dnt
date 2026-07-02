"use client";
import React, { useState, useEffect } from "react";
import { accountService } from "@/services/accountService";
import Sidebar from "./sidebar/Sidebar";
import "./page.css";

interface AccountLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  fullname?: string;
  avatar?: string;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const res = await accountService.getProfile();
        if (res?.code === 200) {
          const data = res?.data ?? {};
          setUserData({
            fullname: data?.fullname ?? data?.name ?? '',
            avatar: data?.avatar ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }
    getUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="student-page">
        <div className="sidebar">
          <div className="sidebar-profile">
            <div className="avatar-wrapper">
              <div className="avatar-skeleton"></div>
            </div>
            <div className="student-name">
              <div className="name-skeleton"></div>
            </div>
          </div>
          <div className="sidebar-menu-skeleton">
            <div className="menu-item-skeleton"></div>
            <div className="menu-item-skeleton"></div>
            <div className="menu-item-skeleton"></div>
            <div className="menu-item-skeleton"></div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <Sidebar fullname={userData.fullname} avatar={userData.avatar} />
      {children}
    </div>
  );
};

export default AccountLayout;
