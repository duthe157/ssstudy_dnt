import { Typography } from "@/components/ui";
import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLessonDetail } from ".";
import Avatar from "@/components/ui/avatar";
import { accountService } from "@/services/accountService";
import { useEffect, useState, useContext } from "react";
import SearchBox from "@/components/ui/SearchBox";
import { RootContext } from "@/contexts/RootContext";

export const Header = () => {
  const router = useRouter();
  const { classroomData } = useLessonDetail();
  const [userData, setUserData] = useState<{
    fullname?: string;
    avatar?: string | null;
  }>({});

  const rootContext = useContext(RootContext);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const res = await accountService.getProfile();
        if (res?.code === 200) {
          const data = res?.data ?? {};
          setUserData({
            fullname: data?.fullname ?? data?.name ?? "",
            avatar: data?.avatar ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    getUserProfile();
  }, []);

  const handleExit = () => {
    router.push("/");
  };

  return (
    <div className="bg-grey-200 px-4 h-[54px] flex items-center gap-2">
      <div className="flex items-center overflow-hidden relative gap-2 min-w-0 flex-1">
        <ChevronLeft
          className="size-5 text-blue-500 cursor-pointer"
          onClick={() => router.back()}
        />
        <Typography
          variant={"sm16"}
          className="text-blue-800 font-bold flex-1 line-clamp-1"
        >
          {classroomData?.classroom?.name}
        </Typography>
      </div>

      {/* Search box - dùng chung component SearchBox */}
      <div className="flex-shrink-0 mx-2 sm:mx-4">
        <SearchBox
          className="relative w-24 sm:w-56 h-9 flex justify-center items-center"
          dropdownClassName="absolute top-full -left-5 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden min-w-[350px]"
          openQuestionPopup={rootContext?.openQuestionPopup}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar
            src={userData.avatar}
            fullname={userData.fullname}
            size="sm"
          />
          <Typography
            variant={"xs14"}
            className="text-blue-800 font-medium hidden sm:block"
          >
            {userData.fullname || "User"}
          </Typography>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="text-[#F44336] font-bold flex items-center gap-1 hover:opacity-80"
        >
          <X className="size-4" />
          <span className="hidden sm:inline">Thoát</span>
        </button>
      </div>
    </div>
  );
};
