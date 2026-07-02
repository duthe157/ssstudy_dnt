"use client";

import SearchableSelect from "@/components/ui/searchable-select";

interface FilterOption {
  _id: string;
  name: string;
  min?: number;
  max?: number;
}

interface TeacherOption {
  _id: string;
  fullname: string;
}

interface GradeOption {
  _id: string;
  name: string;
}

interface BookTypeOption {
  _id: string;
  name: string;
}

interface SubjectOption {
  _id: string;
  name: string;
}

interface BookFiltersProps {
  dataPriceList: { records: FilterOption[] };
  dataTeacherList: { records: TeacherOption[] };
  dataGradeList: { records: GradeOption[] };
  dataBookTypeList: { records: BookTypeOption[] };
  dataSubjectList: { records: SubjectOption[] };
  onFilterChange: (key: string, value: string | number) => void;
  currentFilters: {
    level: string;
    priceRange: string;
    teacherId: string;
    type: string;
    subjectId: string;
  };
}

export default function BookFilters({
  dataPriceList,
  dataTeacherList,
  dataGradeList,
  dataBookTypeList,
  dataSubjectList,
  onFilterChange,
  currentFilters,
}: BookFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Search Input */}
      {/* <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Tìm kiếm
          </button>
        </div>
      </div> */}

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Subject Filter */}
        <SearchableSelect
          options={dataSubjectList.records}
          value={currentFilters.subjectId}
          onChange={(value) => onFilterChange("subject_id", value)}
          placeholder="Môn học"
          nameKey="name"
        />

        {/* Grade Filter */}
        <SearchableSelect
          options={dataGradeList.records}
          value={currentFilters.level}
          onChange={(value) => onFilterChange("level", value)}
          placeholder="Cấp học"
          nameKey="name"
        />

        {/* Teacher Filter */}
        <SearchableSelect
          options={dataTeacherList.records}
          value={currentFilters.teacherId}
          onChange={(value) => onFilterChange("teacherId", value)}
          placeholder="Giảng viên"
          nameKey="fullname"
        />

        {/* Price Filter */}
        <SearchableSelect
          options={dataPriceList.records}
          value={currentFilters.priceRange}
          onChange={(value) => onFilterChange("priceRange", value)}
          placeholder="Mức giá"
          nameKey="name"
        />

        {/* Type Filter */}
        <SearchableSelect
          options={dataBookTypeList.records}
          value={currentFilters.type}
          onChange={(value) => onFilterChange("type", value)}
          placeholder="Phân loại"
          nameKey="name"
        />
      </div>

      {/* Clear Filters */}
      {(currentFilters.level ||
        currentFilters.priceRange ||
        currentFilters.teacherId ||
        currentFilters.type ||
        currentFilters.subjectId) && (
        <div className="mt-4">
          <button
            onClick={() => {
              onFilterChange("level", "");
              onFilterChange("priceRange", "");
              onFilterChange("teacherId", "");
              onFilterChange("type", "");
              onFilterChange("subject_id", "");
              onFilterChange("keyword", "");
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
