"use client";

import { Typography, typographyVariants } from "@/components/ui";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ProductSkeleton } from "@/components/ui/loading-skeleton";
import {
  getCategoryList,
  getCompetitionPartList,
  getSubjectList,
} from "@/lib/exam-data";
import {
  CategoryItem,
  CompetitionPart,
  SubjectItem,
} from "@/services/examService";
import { wordExamService } from "@/services/wordExamService";
import { cn } from "@/utils/cn";
import { GRADES, SUBJECTS } from "@/utils/constants";
import { Drawer } from "antd";
import { FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import Card from "./card/Card";
import PracticeExamCard from "./card/PracticeExamCard";
import SideBar from "./slide-bar";
import { RootContext } from "@/contexts/RootContext";

export default function TestExam() {
  const router = useRouter();
  const root = useContext(RootContext);

  const [haveDone, setHaveDone] = useState<boolean>(false);
  const [filterExam, setFilterExam] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [examId, setExamId] = useState<string>("");
  const [vactId, setVactId] = useState<string>("");
  const [tsaId, setTsaId] = useState<string>("");
  const [hsaId, setHsaId] = useState<string>("");
  const [filterVACT, setFilterVACT] = useState<string>("");
  const [filterTSA, setFilterTSA] = useState<string>("");
  const [filterHSA, setFilterHSA] = useState<string>("");

  const [competitionPartList, setCompetitionPartList] = useState<
    CompetitionPart[]
  >([]);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [wordExamList, setWordExamList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [subjectId, setSubjectId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState<string>();
  const [open, setOpen] = useState(false);

  // Practice exam states
  const [practiceExamList, setPracticeExamList] = useState<any[]>([]);
  const [practiceExamLoading, setPracticeExamLoading] =
    useState<boolean>(false);
  type PracticeStatus = "upcoming" | "active" | "ended";
  const [practiceExamTab, setPracticeExamTab] =
    useState<PracticeStatus>("active");

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "tot-nghiep": true,
    "de-thi-thu": true,
    "bai-kiem-tra": true,
    mon: true,
    lop: true,
    apt: false,
    tsa: false,
    hsa: false,
    "thanh-pho": true,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const populateId = useMemo(() => {
    if (filterExam) {
      return examId;
    }
    if (filterHSA) {
      return hsaId;
    }
    if (filterTSA) {
      return tsaId;
    }
    if (filterVACT) {
      return vactId;
    }
    return "";
  }, [
    examId,
    filterExam,
    filterHSA,
    filterTSA,
    filterVACT,
    hsaId,
    tsaId,
    vactId,
  ]);

  const typeExamFilter = useMemo(
    () => filterExam || filterHSA || filterTSA || filterVACT,
    [filterExam, filterHSA, filterTSA, filterVACT]
  );

  useEffect(() => {
    const handleResize = () => {
      // --- THAY ĐỔI 1: Tăng lên 1280 để iPad được tính là mobile ---
      setIsMobile(window.innerWidth < 1280);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const wordExamListData = await wordExamService.getWordExamList({
          page: currentPage + 1,
          limit: 12,
          country: search,
          classes: level,
          subject_name: subjectId,
          type_exam: typeExamFilter,
          exam_category: filterType,
          have_done: haveDone,
          populate_id: populateId,
        });
        const exams = wordExamListData?.data?.data || [];

        const normalExams = exams.filter((exam: any) => !exam.practiceConfig);

        setWordExamList(normalExams);

        const totalPagesFromApi = wordExamListData?.data?.totalPages;
        const totalRecords = wordExamListData?.data?.totalItems ?? 0;
        setTotalPages(
          Math.max(1, totalPagesFromApi ?? Math.ceil(totalRecords / 12))
        );
      } catch (error) {
        setWordExamList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    subjectId,
    level,
    currentPage,
    typeExamFilter,
    filterType,
    search,
    haveDone,
    populateId,
  ]);

  useEffect(() => {
    const fetchPracticeExams = async () => {
      try {
        setPracticeExamLoading(true);
        const practiceStatus = practiceExamTab ?? "ended";

        const practiceExamListData = await wordExamService.getPracticeExamList({
          keyword: search ?? "",
          sort_key: "updated_at",
          sort_value: -1,
          subject_name: subjectId,
          type_exam: typeExamFilter,
          exam_category: filterType,
          have_done: haveDone,
          populate_id: populateId,
          country: search,
          status: practiceStatus,
        });

        const practiceExams =
          practiceExamListData?.data?.data ??
          practiceExamListData?.data?.records ??
          practiceExamListData?.data ??
          [];

        setPracticeExamList(practiceExams);
      } catch (error) {
        setPracticeExamList([]);
      } finally {
        setPracticeExamLoading(false);
      }
    };

    fetchPracticeExams();
  }, [
    practiceExamTab,
    haveDone,
    subjectId,
    typeExamFilter,
    filterType,
    populateId,
    search,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectListData, competitionPartListData, categoryListData] =
          await Promise.all([
            getSubjectList(),
            getCompetitionPartList(),
            getCategoryList(),
          ]);

        setCompetitionPartList(competitionPartListData?.data.records ?? []);
        setCategoryList(categoryListData?.data.records ?? []);

        const subjects =
          subjectListData?.records ??
          subjectListData?.data?.records ??
          subjectListData?.data ??
          [];
        setSubjectList(subjects);
      } catch (error) {
        console.error("Failed to load exam/subject lists", error);
        setSubjectList([]);
        setCompetitionPartList([]);
        setCategoryList([]);
      }
    };
    fetchData();
  }, []);

  const deThiThuOptions = useMemo(
    () =>
      competitionPartList
        .find((part) => {
          const isCheck = part.name.toLowerCase() === "tốt nghiệp";
          if (isCheck) {
            setExamId(part._id);
          }
          return isCheck;
        })
        ?.parts?.map((part) => ({
          _id: part.name,
          name: part.name,
        })) || [],
    [competitionPartList]
  );

  const baiKiemTraOptions = useMemo(
    () =>
      categoryList.map((category) => ({
        _id: category._id,
        name: category.name,
      })),
    [categoryList]
  );

  const aptOptions = useMemo(
    () =>
      competitionPartList
        ?.find((part) => {
          const isCheck = part.name.toUpperCase() === "V-ACT";
          if (isCheck) {
            setVactId(part._id);
          }
          return isCheck;
        })
        ?.parts?.map((part) => ({
          _id: part.name,
          name: part.name,
        })) || [],
    [competitionPartList]
  );

  const tsaOptions = useMemo(
    () =>
      competitionPartList
        ?.find((part) => {
          const isCheck = part.name.toUpperCase() === "TSA";
          if (isCheck) {
            setTsaId(part._id);
          }
          return isCheck;
        })
        ?.parts?.map((part) => ({
          _id: part.name,
          name: part.name,
        })) || [],
    [competitionPartList]
  );

  const hsaOptions = useMemo(
    () =>
      competitionPartList
        ?.find((part) => {
          const isCheck = part.name.toUpperCase() === "HSA";
          if (isCheck) {
            setHsaId(part._id);
          }
          return isCheck;
        })
        ?.parts?.map((part) => ({
          _id: part.name,
          name: part.name,
        })) || [],
    [competitionPartList]
  );

  const renderFilterButtons = (
    options: SubjectItem[],
    currentFilter: string,
    setFilter: (id: string) => void,
    className: string,
    disabled: boolean = false
  ) => (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <button
          key={opt._id}
          style={{
            wordBreak: "keep-all",
            overflowWrap: "normal",
          }}
          disabled={disabled}
          className={cn(
            "px-1 py-1 rounded text-sm",
            typographyVariants({ variant: "xs12" }),
            currentFilter === opt._id
              ? "bg-blue-300 text-white"
              : "bg-white hover:bg-gray-300 border-[0.5px] border-grey-60 text-foundation-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => setFilter(opt._id)}
        >
          {opt.name}
        </button>
      ))}
    </div>
  );

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const handleStartExam = (exam: any) => {
    if (!root?.isLogin) {
      return router.push("/auth/signin");
    }

    const id = exam._id || exam.id;
    if (!id) return;
    try {
      if (typeof window !== "undefined") {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem(`examReturnTo:${id}`, returnTo);
      }
    } catch {}
    router.push(`/thi-thu/word-exam/${id}/ready`);
  };

  const handleStartPracticeExam = (exam: any) => {
    if (!root?.isLogin) {
      return router.push("/auth/signin");
    }

    const id = exam._id || exam.id;
    if (!id) return;
    try {
      if (typeof window !== "undefined") {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem(`examReturnTo:${id}`, returnTo);
      }
    } catch {}
    // Điều hướng tới trang Ready, kèm trạng thái tab hiện tại để xử lý thi lại sau khi đóng
    router.push(
      `/thi-thu/word-exam/${id}/ready?practiceStatus=${practiceExamTab}`
    );
  };

  const filteredPracticeExams = useMemo(
    () => practiceExamList,
    [practiceExamList]
  );

  const handleClearFilter = () => {
    setFilterExam("");
    setFilterType("");
    setCurrentPage(0);
    setFilterHSA("");
    setFilterTSA("");
    setFilterVACT("");
    setSubjectId("");
    setLevel("");
    setSearch(undefined);
  };

  const handleResetFilter = () => {
    setFilterExam("");
    setFilterType("");
    setCurrentPage(0);
    setSubjectId("");
    setLevel("");
  };

  const accordionItems = [
    {
      title: "Đề THPT",
      content: (
        <>
          <div className="border-[0.5px] border-blue-500 rounded shadow-sm">
            <Typography
              variant={"xs14"}
              as={"h4"}
              className="font-bold text-blue-500 pt-1 px-2"
            >
              Đề tốt nghiệp THPT
            </Typography>
            <div className="p-2">
              {renderFilterButtons(
                deThiThuOptions,
                filterExam,
                (id) => {
                  setFilterExam(id);
                  setCurrentPage(0);
                  setFilterHSA("");
                  setFilterTSA("");
                  setFilterVACT("");
                  setFilterType("");
                  setLevel("");
                },
                "grid grid-cols-2 gap-1"
              )}
            </div>
          </div>

          <div className="border-[0.5px] border-blue-500 rounded shadow-sm">
            <Typography
              variant={"xs14"}
              as={"h4"}
              className="font-bold text-blue-500 pt-1 px-2"
            >
              Bài kiểm tra
            </Typography>
            <div className="p-2">
              {renderFilterButtons(
                baiKiemTraOptions,
                filterType,
                (id) => {
                  setFilterType(id);
                  setFilterExam("");
                  setCurrentPage(0);
                },
                "grid grid-cols-2 gap-1"
              )}
            </div>
          </div>
          <div>
            <Typography
              variant={"xs14"}
              as={"h4"}
              className="font-bold text-blue-500 pt-1 px-2"
            >
              Môn
            </Typography>
            <div className="p-2">
              {renderFilterButtons(
                SUBJECTS,
                subjectId,
                setSubjectId,
                "grid grid-cols-2 xl:grid-cols-3 gap-1"
              )}
            </div>
          </div>
          {!filterExam && (
            <div>
              <Typography
                variant={"xs14"}
                as={"h4"}
                className="font-bold text-blue-500 pt-1 px-2"
              >
                Lớp
              </Typography>
              <div className="p-2">
                {renderFilterButtons(
                  GRADES,
                  level,
                  setLevel,
                  "grid grid-cols-2 xl:grid-cols-3 gap-1"
                )}
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: "V-ACT",
      content: renderFilterButtons(
        aptOptions,
        filterVACT,
        (id) => {
          setFilterVACT(id);
          handleResetFilter();
          setFilterHSA("");
          setFilterTSA("");
          setFilterExam("");
        },
        "grid grid-cols-2 gap-1"
      ),
    },
    {
      title: "TSA",
      content: renderFilterButtons(
        tsaOptions,
        filterTSA,
        (id) => {
          setFilterTSA(id);
          handleResetFilter();
          setFilterHSA("");
          setFilterVACT("");
          setFilterExam("");
        },
        "grid grid-cols-2 gap-1"
      ),
    },
    {
      title: "HSA",
      content: renderFilterButtons(
        hsaOptions,
        filterHSA,
        (id) => {
          setFilterHSA(id);
          handleResetFilter();
          setFilterTSA("");
          setFilterVACT("");
          setFilterExam("");
        },
        "grid grid-cols-2 gap-1"
      ),
    },
  ];

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <section>
      <main className="py-8 px-0 xl:px-4">
        <div className="max-w-[1440px] mx-auto flex flex-col xl:flex-row">
          {/* Sidebar */}

          <div className="w-full xl:w-1/4 bg-white border rounded-lg p-6 mr-6 mb-6 xl:mb-0 hidden xl:block">
            <SideBar
              accordionItems={accordionItems}
              expandedSections={expandedSections}
              search={search}
              setSearch={setSearch}
              handleClearFilter={handleClearFilter}
            />
          </div>

          {/* Main Content */}
          <Drawer
            onClose={onClose}
            open={open}
            placement="left"
            closable={false}
            style={{ width: 280 }}
            styles={{
              body: {
                padding: 16,
              },
            }}
          >
            <SideBar
              accordionItems={accordionItems}
              expandedSections={expandedSections}
              search={search}
              setSearch={setSearch}
              handleClearFilter={handleClearFilter}
            />
          </Drawer>
          <section className="flex-1">
            <div className="mb-[18px]">
              <Breadcrumb
                items={[
                  {
                    label: "Trang chủ",
                    href: "/",
                  },
                  {
                    label: "Thi thử",
                  },
                ]}
              />

              <div className="flex items-center justify-between xl:justify-end space-x-2 mt-4 xl:mt-0">
                <button
                  onClick={showDrawer}
                  className="flex items-center xl:hidden gap-2 border border-blue-500 w-[100px] h-8 rounded-full justify-center"
                >
                  <FilterIcon className="size-4 text-blue-500" />
                  <Typography>Bộ lọc</Typography>
                </button>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Typography
                    variant={"sm16"}
                    className="text-foundation-500 font-normal"
                  >
                    Đã thi
                  </Typography>
                  <input
                    type="checkbox"
                    id="status-toggle"
                    className="sr-only peer"
                    checked={haveDone}
                    onChange={(e) => setHaveDone(e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-md dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Practice Exam Section */}
            <div
              className="mb-8 p-4 md:p-6 rounded-lg"
              style={{
                background:
                  "linear-gradient(278.43deg, #C2D8FF 0%, #ECECFF 100%)",
              }}
            >
              {/* Header with Title and Tabs */}
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-4 gap-4">
                <Typography
                  variant="md20"
                  className="text-black font-bold text-center"
                >
                  Đấu trường học tập
                </Typography>

                {/* Tabs */}
                <div className="flex gap-1 border border-gray-200 rounded-full p-1 bg-gray-50 w-full xl:w-auto">
                  <button
                    onClick={() => setPracticeExamTab("upcoming")}
                    className={cn(
                      "flex-1 xl:flex-none px-4 xl:px-6 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      practiceExamTab === "upcoming"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-transparent text-foundation-400 hover:bg-gray-100"
                    )}
                  >
                    Chưa mở
                  </button>
                  <button
                    onClick={() => setPracticeExamTab("active")}
                    className={cn(
                      "flex-1 xl:flex-none px-4 xl:px-6 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      practiceExamTab === "active"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-transparent text-foundation-400 hover:bg-gray-100"
                    )}
                  >
                    Đang mở
                  </button>
                  <button
                    onClick={() => setPracticeExamTab("ended")}
                    className={cn(
                      "flex-1 xl:flex-none px-4 xl:px-6 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      practiceExamTab === "ended"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-transparent text-foundation-400 hover:bg-gray-100"
                    )}
                  >
                    Đã đóng
                  </button>
                </div>
              </div>

              {/* Practice Exam List - Max 3 cards with scroll */}
              <div className="practice-exam-scroll overflow-y-auto overflow-x-hidden h-[460px] md:h-[510px] lg:h-[520px] xl:h-[340px]">
                <div className="flex flex-col gap-4 pr-2">
                  {practiceExamLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))
                  ) : filteredPracticeExams.length > 0 ? (
                    filteredPracticeExams.map((exam: any) => (
                      <PracticeExamCard
                        key={exam._id || exam.id}
                        exam={exam}
                        onStartExam={handleStartPracticeExam}
                        isMobile={isMobile}
                        isLogin={root?.isLogin}
                        status={practiceExamTab}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-foundation-400">
                      {practiceExamTab === "upcoming" ||
                      practiceExamTab === "active"
                        ? "Hiện chưa có đề phù hợp. SSStudy sẽ sớm cập nhật trong thời gian tới."
                        : "Chưa có đề phù hợp. Hãy theo dõi SSStudy để liên tục cập nhật các đợt thi mới sắp tới!"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Word Exam Section */}
            <>
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))
                ) : wordExamList.length > 0 ? (
                  wordExamList.map((exam: any) => {
                    return (
                      <Card
                        key={exam._id || exam.id}
                        exam={exam}
                        onStartExam={handleStartExam}
                        isMobile={isMobile}
                        categoryLabel={""}
                        isLogin={root?.isLogin}
                      />
                    );
                  })
                ) : (
                  <div className="text-center"> Không tìm thấy kết quả </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-8 space-x-2">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel=">"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={1}
                  marginPagesDisplayed={1}
                  pageCount={totalPages}
                  previousLabel="<"
                  containerClassName="flex items-center space-x-2"
                  pageClassName="border rounded px-3 py-1"
                  pageLinkClassName=""
                  activeClassName="bg-blue-600 text-white"
                  breakClassName="px-3 py-1"
                  nextClassName="border rounded px-3 py-1"
                  previousClassName="border rounded px-3 py-1"
                />
              </div>
            </>
          </section>
        </div>
      </main>
    </section>
  );
}
