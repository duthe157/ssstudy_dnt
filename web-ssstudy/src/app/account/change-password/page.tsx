"use client";
import ChangePasswordForm from "../change-password/ChangePasswordForm"

interface MetaTag {
    title: string;
    description: string;
    image: string;
    link: string;
    keywords: string;
}

function ChangePasswordPage() {
    const metaTag: MetaTag = {
        title: "Đổi mật khẩu | SSStudy.vn",
        description: "Đổi mật khẩu | SSStudy.vn",
        image: "",
        link: "",
        keywords: "",
    };

    return (
        <ChangePasswordForm />
    );
}

export default ChangePasswordPage;