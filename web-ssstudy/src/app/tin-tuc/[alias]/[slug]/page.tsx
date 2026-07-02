import { notFound } from "next/navigation";
import CategorySidebar from "../CategorySidebar";
import FeaturedArticle from "../FeaturedArticle";
import RelatedPosts from "./RelatedPosts";
import Breadcrumbs from "../../../../components/ui/breadcrumbs/Breadcrumbs";
import Script from "next/script";
import { apiService } from '../../../../services/api';

interface NewsDetailProps {
  params: {
    alias: string;
    slug: string;
  };
}

// Fetch categories
async function getCategories() {

  const res = await apiService.post('blog-category/list', {}) as any ;

  if (!res.data?.records) {
    throw new Error(
      `Failed to fetch categories: ${res.status} ${res.statusText}`
    );
  }

  return res;
}

// Fetch all posts
async function getPosts() {
  
  const res = await apiService.post('blog/list-public', {}) as any;

  if (!res.data?.records) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }

  return res;
}

async function getPostDetail(id: string) {
  
  const res = await apiService.post('blog/detail', {"id": id, "web_user": true}) as any;

  if (!res.data) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }

  return res.data.view_count;
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { alias, slug } = await params;

  // Lấy category
  const categoriesData = await getCategories();
  const category = categoriesData.data.records.find(
    (item: any) => item.alias === alias
  );

  if (!category) {
    notFound();
  }

  // Lấy bài viết
  const postsData = await getPosts();
  const post = postsData.data.records.find((item: any) => item.alias === slug);

  if (!post) {
    notFound();
  }

  const postViewCount = await getPostDetail(post._id);

  // 🔍 Lọc các bài featured cùng category, khác slug
  const featuredPosts = postsData.data.records.filter(
    (p: any) =>
      p.category?.name === category.name &&
      p?.is_featured === true &&
      p?.status === true &&
      p?.alias !== slug
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* News Detail */}
          <div className="lg:col-span-3 bg-white rounded-b-sm">
            <img
              src={
                post.image ||
                "https://w.ladicdn.com/5e5bae5298a7e87bbed7582a/the-gioi-moi-20240328122107-onzj7.png"
              }
              alt={post.name}
              className="w-full h-auto rounded mb-6"
              style={{ objectFit: "contain" }}
            />

            <h1 className="text-2xl font-bold mb-4 pl-4 pr-4">{post.name}</h1>

            {/* Ngày cập nhật */}
            <div className="flex items-center gap-4 text-gray-600 text-sm mb-6 pl-4 pr-4">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
                      00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {new Date(post.updated_at).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422A12.083 12.083 0 0118 
                      20.944M12 14v7.944M12 14L5.84 
                      10.578A12.083 12.083 0 006 20.944"
                  />
                </svg>
                <span>{postViewCount || 9000} lượt xem</span>
              </div>
            </div>

            <div
              className="prose max-w-none pl-4 pr-4 pb-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Sidebar */}
          <div>
            <CategorySidebar />
            <FeaturedArticle
              category_name={category.name}
              category_alias={category.alias}
              posts={featuredPosts}
            />
          </div>
        </div>

        {/* Related posts */}
        <RelatedPosts currentSlug={slug} category_name={category.name} category_alias={category.alias}/>
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
