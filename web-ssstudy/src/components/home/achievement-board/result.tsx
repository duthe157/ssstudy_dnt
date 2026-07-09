import { Modal } from "antd";
import { X } from "lucide-react";

function ResultPopup({
                       open,
                       data,
                       handleClose,
                     }) {
  return (
    <Modal
      open={open}
      onCancel={handleClose} // Click ngoài hoặc Esc đều gọi
      footer={null}
      closable={false}
      centered
      width="min(90vw, 480px)"
      maskClosable
    >
      <button
        onClick={handleClose}
        className="absolute right-5 top-5 rounded-full p-2 hover:bg-gray-100"
      >
        <X size={22} />
      </button>

      <div className="p-2">
        <div className="mb-4">
          <div className="text-xl font-bold text-[#242A4B]">
            {data?.data_json?.name || data?.name}
          </div>
          <div className="mt-1 text-base text-[#50556F] font-medium">
            {data?.data_json?.school || data?.description}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <img
            src={data?.data_json?.image_popup}
            alt=""
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </Modal>
  );
}

export default ResultPopup;