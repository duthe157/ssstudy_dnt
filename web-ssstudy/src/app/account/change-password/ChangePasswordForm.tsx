"use client";
import React, { useState } from "react";
import "./change-password.css";
import { Eye, EyeOff } from "lucide-react";
import Breadcrumbs from "@components/ui/breadcrumbs/Breadcrumbs";
import { accountService } from "@/services/accountService";
import { toast } from "react-toastify";

interface FormData {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

interface ShowState {
    old: boolean;
    new: boolean;
    confirm: boolean;
}

function ChangePassword() {
    const [formData, setFormData] = useState<FormData>({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [show, setShow] = useState<ShowState>({
        old: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const toggleShow = (field: keyof ShowState) => {
        setShow((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.old_password) {
            newErrors.old_password = "Vui lòng nhập mật khẩu cũ";
        }

        if (!formData.new_password) {
            newErrors.new_password = "Vui lòng nhập mật khẩu mới";
        } else if (formData.new_password.length < 6) {
            newErrors.new_password = "Mật khẩu mới phải có ít nhất 6 ký tự";
        }

        if (!formData.confirm_password) {
            newErrors.confirm_password = "Vui lòng nhập lại mật khẩu mới";
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = "Mật khẩu nhập lại không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const payload = {
                password: formData.old_password,
                new_password: formData.new_password,
                confirm: formData.confirm_password,
            };

            const response = await accountService.changePassword(payload);

            if (response?.code === 200) {
                toast(response?.message || "Đổi mật khẩu thành công", { type: "success" });
                // Reset form
                setFormData({
                    old_password: "",
                    new_password: "",
                    confirm_password: "",
                });
                setErrors({});
            } else {
                toast(response?.message || "Đổi mật khẩu thất bại", { type: "error" });
            }
        } catch (error: any) {
            console.error("Change password error:", error);
            const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu";
            toast(errorMessage, { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="form-area">
            <div className="breadcrumb-wrapper">
                <Breadcrumbs />
            </div>

            <div className="change-password-container">
                <form className="change-password-form" onSubmit={handleSubmit}>
                    <div className="form-group row-between">
                        <div className="input-wrapper">
                            <label>Mật khẩu cũ</label>
                            <div className="input-inner">
                                <input
                                    type={show.old ? "text" : "password"}
                                    name="old_password"
                                    placeholder="Mật khẩu cũ"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    className={errors.old_password ? "input-error" : ""}
                                />
                                <span className="icon" onClick={() => toggleShow("old")}>
                                    {show.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>
                        <a href="/auth/forgot-password" className="forgot-link-inline">
                            Forgot password
                        </a>
                    </div>
                    {errors.old_password && <p className="error-message">{errors.old_password}</p>}

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <div className="input-inner">
                            <input
                                type={show.new ? "text" : "password"}
                                name="new_password"
                                placeholder="Mật khẩu mới"
                                value={formData.new_password}
                                onChange={handleChange}
                                className={errors.new_password ? "input-error" : ""}
                            />
                            <span className="icon" onClick={() => toggleShow("new")}>
                                {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>
                    {errors.new_password && <p className="error-message">{errors.new_password}</p>}

                    <div className="form-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <div className="input-inner">
                            <input
                                type={show.confirm ? "text" : "password"}
                                name="confirm_password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className={errors.confirm_password ? "input-error" : ""}
                            />
                            <span className="icon" onClick={() => toggleShow("confirm")}>
                                {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>
                    {errors.confirm_password && <p className="error-message">{errors.confirm_password}</p>}

                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "XÁC NHẬN"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default ChangePassword;