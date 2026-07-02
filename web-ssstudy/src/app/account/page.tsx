"use client";
import { useState, useEffect } from 'react'
import { accountService } from '@/services/accountService'
import { toast } from 'react-toastify'
import moment from 'moment'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import baseHelper from '../../components/helpers/baseHelper'
import "react-datepicker/dist/react-datepicker.css";
import StudentForm from "./information/StudentForm";

// Định nghĩa interface cho dữ liệu form (khớp với StudentForm)
interface FormValues {
    student_code?: string;
    name?: string;
    email?: string;
    phone?: string;
    parent_phone?: string;
    address?: string;
    class?: string;
    school?: string;
    gender?: string;
    dob?: Date | null;
    avatar_base64?: string | null;
}


function TaiKhoan() {
    const [formData, setFormData] = useState<FormValues>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Thêm validatePhone vào Yup
    Yup.addMethod<Yup.StringSchema>(
        Yup.string,
        "validatePhone",
        function (errorMessage: string) {
            return this.test("validate-phone", errorMessage, function (value) {
                const { path, createError } = this;
                return (
                    (value && baseHelper?.validatePhone(value)) ||
                    createError({ path, message: errorMessage })
                );
            });
        }
    );

    const formSchema = Yup.object().shape({
        name: Yup.string().required("Vui lòng nhập họ tên").nullable(true),
        phone: Yup.string()
            .required("Vui lòng nhập số điện thoại")
            // @ts-expect-error - Custom validation method
            .validatePhone("Số điện thoại không đúng định dạng")
            .nullable(true),
        parent_phone: Yup.string()
            .required("Vui lòng nhập số điện thoại phụ huynh")
            // @ts-expect-error - Custom validation method
            .validatePhone("Số điện thoại không đúng định dạng")
            .nullable(true),
        email: Yup.string()
            .required("Vui lòng nhập địa chỉ email")
            .email("Email sai định dạng")
            .nullable(true),
        address: Yup.string().required("Vui lòng nhập địa chỉ").nullable(true),
        dob: Yup.date().required("Vui lòng nhập ngày sinh").nullable(true),
        school: Yup.string().required("Nhập trường đang theo học").nullable(true),
        class: Yup.string().required("Nhập lớp đang theo học").nullable(true),
        gender: Yup.string().nullable(true),
        student_code: Yup.string().nullable(true),
    });

    const formOptions = { resolver: yupResolver(formSchema) as any };

    const { handleSubmit, reset, formState } = useForm<FormValues>(formOptions);
    const { errors } = formState;

    useEffect(() => {
        async function getDataProfile() {
            try {
                setLoading(true);
                const res = await accountService.getProfile();
                if (res?.code === 200) {
                    const data = res?.data ?? {};
                    setFormData({
                        ...formData,
                        // Map API fields to form keys expected by StudentForm
                        student_code: data?.code ?? data?.student_code ?? '',
                        name: data?.fullname ?? data?.name ?? '',
                        email: data?.email ?? '',
                        phone: data?.phone ?? '',
                        parent_phone: data?.parent_phone ?? '',
                        address: data?.address ?? '',
                        class: data?.classroom ?? data?.class ?? '',
                        school: data?.school ?? '',
                        gender: data?.gender ?? '',
                        dob: data?.dob && moment(data?.dob)?.isValid() ? new Date(data?.dob) : null,
                    });
                } else {
                  
                    toast('Có lỗi xảy ra khi lấy thông tin profile', { type: 'error' });
                }
            } catch (error) {
                console.error(error);
                toast('Không thể tải thông tin profile', { type: 'error' });
            } finally {
                setLoading(false);
            }
        }
        getDataProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            reset(formData);
        }
    }, [formData, reset]);

    const onUpdateProfile: SubmitHandler<FormValues> = async (payload) => {
        try {
            setSubmitting(true);
            // Map form data to API payload if necessary (e.g., rename 'name' to 'fullname')
            const apiPayload = {
                ...payload,
                fullname: payload.name, // Assuming API expects 'fullname'
                classroom: payload.class, // Assuming API expects 'classroom'
                code: payload.student_code, // Assuming API expects 'code'
                // Remove original keys if API doesn't accept them
                name: undefined,
                class: undefined,
                student_code: undefined,
                // Format dob to ISO string if it's a Date object
                dob: payload.dob ? moment(payload.dob).toISOString() : null,
            };

            const res = await accountService.updateProfile(apiPayload);
            if (res?.code === 200) {
                toast(res?.message || "Cập nhật thành công", {
                    type: "success",
                });
            } else {
                toast("Cập nhật thất bại", { type: "error" });
            }
        } catch (error) {
            console.error(error);
            toast("Có lỗi xảy ra khi cập nhật thông tin", { type: "error" });
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="form-area">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <StudentForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleSubmit(onUpdateProfile)} 
            errors={errors}
            submitting={submitting}
        />
    );
}

export default TaiKhoan;

