"use client";

import { useEffect } from "react";
import Banner from "@/components/layout/Banner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryList from "@/components/home/CategoryList";
import {
  BannerSkeleton,
  FeaturedProductsSkeleton,
  CategoryListSkeleton,
} from "@/components/ui/loading-skeleton";
import { useHome } from "@/contexts/HomeContext";
import Statistical from "@/components/home/statistical/index";
import ListCombo from "@/components/home/list-combo";
import FeaturedCoursesSlider from "@/components/home/featured-courses-slider/index";
import AchievementBoard from "@/components/home/achievement-board/index";
import DifferenceValueAt from "@/components/home/difference-value-at/index";
import TeachingStaff from "@/components/home/teaching-staff/index";
import ReviewData from "@/components/home/review-data";
import ParentFeedback from "@/components/home/parent-feedback/index";
import NewsEvents from "@/components/home/news-events/index";
import PartnersSection from '@/components/home/partners';

export default function HomePage() {
  const { dataHomePage, getDataHomePage, isDataLoaded } = useHome();

  useEffect(() => {
    if (!isDataLoaded) {
      getDataHomePage();
    }
  }, [getDataHomePage, isDataLoaded]);

  const bannerSliders = dataHomePage?.sliders || [];
  const statisticalItems = dataHomePage?.contentConfig?.block1 || [];

  if (!isDataLoaded) {
    return (
      <main>
        <div className="container mx-auto py-8">
          <BannerSkeleton />
        </div>
        <FeaturedProductsSkeleton />
        <CategoryListSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen !m-0 !p-0">
      <section
        className="relative -mt-[1rem] min-[1440px]:-mt-6"
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
        }}
      >
        <Banner slidersInput={bannerSliders} />
      </section>
      <Statistical items={statisticalItems} />
      <section
        className="relative"
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ECF8FF 8%, #ECF8FF 90%, #FFFFFF 100%)",
        }}
      >
        <ListCombo megaMenuHome={dataHomePage?.megaMenuHome} />
        <FeaturedCoursesSlider
          data={dataHomePage?.classroomGroupHomeBlocks}
          currentPage={"home"}
        />
        <AchievementBoard items={dataHomePage?.topRanks} />
      </section>
      <DifferenceValueAt />
      <TeachingStaff items={dataHomePage?.teachers} />
      <section
        className="relative"
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ECF8FF 8%, #ECF8FF 90%, #FFFFFF 100%)",
        }}
      >
        <ReviewData reviewData={dataHomePage?.reviewStudent} />
      </section>
      <div className="relative">
        <ParentFeedback items={dataHomePage?.reviews} />
        <section
          className="relative -mt-20 pt-20"
          style={{
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #ECF8FF 8.17%, #ECF8FF 100%)",
            zIndex: 0,
          }}
        >
          <NewsEvents />
          <PartnersSection />
        </section>
      </div>

      <FeaturedProducts products={dataHomePage?.featuredProducts || []} />

      <CategoryList categories={dataHomePage?.categories || []} />
    </main>
  );
}
