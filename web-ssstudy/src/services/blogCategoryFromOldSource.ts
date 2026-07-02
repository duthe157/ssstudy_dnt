export const blogCategoryFromOldSource = {
  async fetchData() {
    try {
      // 1. Fetch danh mục
      const resCat = await fetch(
        "https://api.luyenthitiendat.vn/blog-category/list",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: 1, limit: 100 }),
        }
      );
      const jsonCat = await resCat.json();

      const excluded = [
        "Về Chúng Tôi",
        "Báo chí nói về thầy Nguyễn Tiến Đạt",
        "Đối tác",
        "Chính sách",
        "Báo chí nói về SSStudy",
        "Thông báo",
      ];

      const filteredCategories = jsonCat.data.records.filter(
        (cat: any) => cat.status === true && !excluded.includes(cat.name)
      );

      return filteredCategories ?? [];
    } catch (err) {
      return [];
      console.error("Error fetching data", err);
    }
  },
};
