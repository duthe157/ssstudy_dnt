import React from "react";

const Index = ({ items }) => {
  const parentFeedbacks = items
    ?.filter((item) => {
      return item.type === "DANHGIA_PHUHUYNH";
    })
    .slice(0, 6);
  return (
    <div className="container mx-auto py-8 mt-10 relative z-10">
      <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Phản hồi của phụ huynh
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 relative z-10">
        {parentFeedbacks &&
          parentFeedbacks?.length > 0 &&
          parentFeedbacks.map((feedback, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-solid border-[#E8E8E8]"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={feedback.image}
                  alt={feedback.alias}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-[#242A4B]">{feedback.name}</h3>
                  <p className="text-gray-600 text-sm font-medium">
                    {feedback.location}
                  </p>
                </div>
              </div>
              <p className="text-[#4D5D89]">{feedback.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Index;
