"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {courseService} from "@services/courseService";
import {Modal, Pagination} from "antd";
import {useForm} from "react-hook-form";

import {
    DataReivewCourse,
    RequestBodyRoomReviewCreate,
    RequestRoomReviewList,
} from "@types/course";

import './style.css'
import {authService} from "@services/authService";

type bodyFormAdd = {
    rating: number;
    comment: string;
};

// rating khóa học
function StarRating({rating = 0}) {
    const percentage = `${(rating / 5) * 100}%`;

    return (
        <div className="flex items-center gap-2">
            {
                rating > 0 &&
                <span className="font-medium text-gray-600">
            {rating}
          </span>
            }

            <div className="relative text-yellow-400 text-xl leading-none">
                {/* nền xám */}
                <div className="text-gray-300">
                    ★★★★★
                </div>

                {/* phần vàng */}
                <div
                    className="absolute inset-0 overflow-hidden whitespace-nowrap"
                    style={{width: percentage}}
                >
                    ★★★★★
                </div>
            </div>
        </div>
    );
}

// Nội dung đánh giá khóa học
function ReviewItem({review}: { review: DataReivewCourse }) {
    return (
        <div className="flex gap-4 py-6 border-b border-gray-200">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <Image
                    src={
                        review.avatar?.startsWith("http")
                            ? review.avatar
                            : "https://i.pravatar.cc/100"
                    }
                    alt="avatar"
                    width={48}
                    height={48}
                />
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-lg">{review.name}</p>
                        <p className="text-[#50556f] font-medium text-base">{review.classroom.name}</p>
                    </div>

                    <StarRating rating={review.rating}/>
                </div>

                <p className="text-[#50556f] font-normal text-base mt-3 leading-relaxed whitespace-pre-line">
                    {review.comment}
                </p>
            </div>
        </div>
    );
}

//Thêm khóa học
function AddReivewCourse({
                             refeshApiReview,
                             openModal,
                             classroom_id,
                         }: {
    refeshApiReview: () => void;
    openModal: { open: boolean; setOpen: (open: boolean) => void };
    classroom_id: string;
}) {
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm();

    useEffect(() => {
    }, []);

    const turnOffModal = () => {
        openModal.setOpen(false);
        reset();
    };

    const submitData = (data: bodyFormAdd) => {
        const user = JSON.parse(localStorage.getItem("user") || "");

        const body: RequestBodyRoomReviewCreate = {
            ...data,
            name: user?.fullname || "",
            classroom_id,
            avatar: user.avatar || "",
            status: true,
        };

        courseService.classRoomReviewCreate(body).then(() => {
            turnOffModal();

            //Làm mới api danh sách đánh giá
            refeshApiReview();
        });
    };

    return (
        <Modal
            title="Đánh giá"
            open={openModal.open}
            onCancel={turnOffModal}
            footer={null}
        >
            <form onSubmit={handleSubmit((data) => submitData(data as bodyFormAdd))}>
                {/* register your input into the hook by invoking the "register" function */}
                <span className="block text-sm font-medium text-gray-700 mb-1">
          Số sao
        </span>
                <select
                    {...register("rating", {required: true})}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Chọn đánh giá</option>
                    <option value="5">
                        5 ★
                    </option>
                    <option value="4">
                        4 ★
                    </option>
                    <option value="3">
                        3 ★
                    </option>
                    <option value="2">
                        2 ★
                    </option>
                    <option value="1">
                        1 ★
                    </option>
                </select>
                <div className="mt-1 text-red-500 text-sm">
                    {errors.rating?.type === "required" && (
                        <p role="alert">Cần chọn đánh giá</p>
                    )}
                </div>
                {/* include validation with required or other standard HTML validation rules */}
                <div className="mt-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung đánh giá
          </span>

                    <textarea
                        {...register("comment")}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập nôi dung mô tả"
                    ></textarea>
                </div>
                {/* errors will return when field validation fails  */}
                <input
                    type="submit"
                    value="Gửi đánh giá"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 active:bg-blue-700 transition cursor-pointer w-full"
                />
            </form>
        </Modal>
    );
}

//Đánh giá khóa học
function ReviewSection({classroom_id}: { classroom_id: string }) {
    const [dataSource, setDataSource] = useState<DataReivewCourse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalRecord, setTotalRecord] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [avgRating, setAvgRating] = useState(0);

    const pageSize = 4;

    const [open, setOpen] = useState(false);

    const {isLoggedIn} = authService;

    useEffect(() => {
        fetchApiReview().then();
    }, [page]);

    const refeshApiReview = () => {
        setPage(1);
        fetchApiReview().then();
    };

    const fetchApiReview = async () => {
        const params: RequestRoomReviewList = {
            classroom_id,
            page,
            limit: pageSize,
        };

        setLoading(true);
        const {
            data: {records, perPage, totalRecord, avgRating},
        } = await courseService.classRoomReviewList(params);

        setLoading(false);

        setDataSource(records);

        setPageCount(perPage);

        setTotalRecord(totalRecord);

        setAvgRating(avgRating);
    };

    const handlePageClick = (pageIndex: number) => setPage(pageIndex);

    return (
        <div className="max-w-5xl mx-auto py-3">
            {/* Header */}
            <div className="w-full">
                <StarRating rating={avgRating}/>

                {isLoggedIn() && <p className="text-gray-600 mt-2">
                    Đánh giá khóa học{" "}
                    <button
                        className="text-blue-600 font-medium cursor-pointer underline"
                        onClick={() => setOpen(true)}
                    >
                        tại đây
                    </button>
                </p>
                }
            </div>

            {/* List */}
            <div className="w-full">
                {dataSource.map((reivew, i) => (
                    <ReviewItem key={"review_" + i} review={reivew}/>
                ))}
            </div>

            {/* Pagination */}
            {!loading && totalRecord > 0 && (
                <div className="mt-3 flex justify-center">
                    <Pagination current={page} onChange={handlePageClick} total={totalRecord} pageSize={pageSize}
                                showSizeChanger={false}/>
                </div>
            )}

            <AddReivewCourse
                classroom_id={classroom_id}
                refeshApiReview={refeshApiReview}
                openModal={{open, setOpen}}
            />
        </div>
    );
}

export default ReviewSection;
