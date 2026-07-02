"use client";
import MyCourseForm from "../my-course/MyCourseForm"

interface MetaTag {
    title: string;
    description: string;
    image: string;
    link: string;
    keywords: string;
}

function MyCourse() {
    const metaTag: MetaTag = {
        title: "Khóa học của tôi | SSStudy.vn",
        description: "Khóa học của tôi | SSStudy.vn",
        image: "",
        link: "",
        keywords: "",
    };

    return (
        <MyCourseForm />
    );
}

export default MyCourse;