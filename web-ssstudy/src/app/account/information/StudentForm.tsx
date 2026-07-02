"use client";
import React from "react";
import "./StudentForm.css";
import Breadcrumbs from '../../../components/ui/breadcrumbs/Breadcrumbs'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface StudentFormProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onSubmit: (e: React.FormEvent) => void; // Add onSubmit handler
    errors: any; // Add errors prop
    submitting?: boolean; // Add submitting prop
}

const StudentForm: React.FC<StudentFormProps> = ({ formData, setFormData, onSubmit, errors, submitting = false }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "radio" ? value : value,
        });
    };

    const handleDateChange = (date: Date | null) => {
        setFormData({
            ...formData,
            dob: date,
        });
    };

    return (
        <main className="form-area">
            <div className="breadcrumb-wrapper">
                <Breadcrumbs />
            </div>
            <form onSubmit={onSubmit} className="form-block">
                <div className="form-row">
                    <div className="form-group">
                        <label>Mã học sinh</label>
                        <input
                            type="text"
                            name="student_code"
                            placeholder="Mã học sinh"
                            value={formData?.student_code || ""}
                            onChange={handleChange}
                            disabled // Disable this input
                            className={errors.student_code ? "input-error" : ""}
                        />
                        {errors.student_code && <p className="error-message">{errors.student_code.message}</p>}
                    </div>

                    <div className="form-group">
                        <label>Giới tính</label>
                        <div className="gender-group">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData?.gender === "male"}
                                    onChange={handleChange}
                                />{" "}
                                Nam
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData?.gender === "female"}
                                    onChange={handleChange}
                                />{" "}
                                Nữ
                            </label>
                        </div>
                        {errors.gender && <p className="error-message">{errors.gender.message}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Họ và tên"
                            value={formData?.name || ""}
                            onChange={handleChange}
                            className={errors.name ? "input-error" : ""}
                        />
                        {errors.name && <p className="error-message">{errors.name.message}</p>}
                    </div>
                    <div className="form-group">
                        <label>Địa chỉ email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData?.email || ""}
                            onChange={handleChange}
                            className={errors.email ? "input-error" : ""}
                        />
                        {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={formData?.phone || ""}
                            onChange={handleChange}
                            className={errors.phone ? "input-error" : ""}
                        />
                        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                    </div>
                    <div className="form-group">
                        <label>Lớp đang học</label>
                        <input
                            type="text"
                            name="class"
                            placeholder="Lớp đang học"
                            value={formData?.class || ""}
                            onChange={handleChange}
                            className={errors.class ? "input-error" : ""}
                        />
                        {errors.class && <p className="error-message">{errors.class.message}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại phụ huynh</label>
                        <input
                            type="text"
                            name="parent_phone"
                            placeholder="Số điện thoại phụ huynh"
                            value={formData?.parent_phone || ""}
                            onChange={handleChange}
                            className={errors.parent_phone ? "input-error" : ""}
                        />
                        {errors.parent_phone && <p className="error-message">{errors.parent_phone.message}</p>}
                    </div>
                    <div className="form-group">
                        <label>Trường đang học</label>
                        <input
                            type="text"
                            name="school"
                            placeholder="Trường đang học"
                            value={formData?.school || ""}
                            onChange={handleChange}
                            className={errors.school ? "input-error" : ""}
                        />
                        {errors.school && <p className="error-message">{errors.school.message}</p>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <DatePicker
                            selected={formData?.dob || null}
                            onChange={handleDateChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            className={`react-datepicker-custom-input ${errors.dob ? "input-error" : ""}`}
                        />
                        {errors.dob && <p className="error-message">{errors.dob.message}</p>}
                    </div>
                    <div className="form-group ">
                        <label>Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Địa chỉ"
                            value={formData?.address || ""}
                            onChange={handleChange}
                            className={errors.address ? "input-error" : ""}
                        />
                        {errors.address && <p className="error-message">{errors.address.message}</p>}
                    </div>
                </div>
                <div>
                    <button type="submit" className="update-button" disabled={submitting}>
                        {submitting ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default StudentForm;
