import Breadcrumbs from "../../../components/ui/breadcrumbs/Breadcrumbs";
import NewsGrid from "./NewsGrid";
import NewsList from "./NewsList";
import CategorySidebar from "./CategorySidebar";
import FeaturedArticle from "./FeaturedArticle";
import Script from "next/script";
import { apiService } from '../../../services/api';

interface EventsPageProps {
  params: {
    alias: string;
  };
}

interface BlogPost {
  _id: string;
  name: string;
  alias: string;
  external_link: string;
  description: string;
  content: string;
  status: boolean;
  is_featured: boolean;
  level: string;
  subject_id: string;
  category: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// Hàm fetch danh mục
async function getCategories() {
  try {
    const res = await apiService.post('blog-category/list', {}) as any;
    return res;
  } catch (err) {
    console.error("Error fetching data", err);
  }

}

// Hàm fetch danh sách bài viết
async function getBlogPosts() {
 
  try {
    const res = await apiService.post('blog/list-public', {}) as any;
    return res;
   } catch (err) {
    console.error("Error fetching data", err);
   }
 
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { alias } = await params;

  // Fetch categories
  const categoriesData = await getCategories();
  const category = categoriesData.data.records.find(
    (item: any) => item.alias === alias
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  // Fetch blog posts
  const blogData = await getBlogPosts();
  const allPosts: BlogPost[] = blogData.data.records;

  // Lọc các bài post có category.name trùng với category.name và status = true
  const filteredPosts = allPosts.filter(
    (post) => post?.category?.name === category?.name && post?.status === true
  );

  // Sắp xếp theo updated_at giảm dần
  const sortedPosts = [...filteredPosts].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Lọc các bài không phải featured cho grid và list
  const nonFeaturedPosts = sortedPosts.filter(
    (post) => post.is_featured !== true
  );

  // Lấy 4 bài đầu tiên cho NewsGrid
  const gridPosts = nonFeaturedPosts.slice(0, 4);

  // Còn lại cho NewsList
  const listPosts = nonFeaturedPosts.slice(4);

  // Lấy các bài is_featured = true
  const featuredPosts = filteredPosts.filter(
    (post) => post.is_featured === true
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs />

        {/* Top News Grid */}
        <NewsGrid
          category_name={category.name}
          category_alias={alias}
          posts={gridPosts}
        />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* News List */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-[#1E2A5E] mb-4">
              {category?.name}
            </h2>
            <NewsList
              category_name={category.name}
              category_alias={alias}
              posts={listPosts}
            />
          </div>

          {/* Sidebar */}
          <div>
            <CategorySidebar />
            <FeaturedArticle
              category_name={category.name}
              category_alias={alias}
              posts={featuredPosts}
            />
          </div>
        </div>
      </div>

      <Script id="change-bg" strategy="afterInteractive">
        {`
            const container = document.querySelector(".min-h-screen.bg-white");
            if (container) {
                container.style.backgroundColor = "hsla(228, 33%, 97%, 1)";
            }

        
        `}
      </Script>
    </div>
  );
}
