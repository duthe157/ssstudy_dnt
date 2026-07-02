import { cache } from 'react';
import { homeService, HomePageResponse } from '@/services/homeService';

export interface HomePageData {
  megaMenuHome?: any;
  sliders?: {
    image: string;
    link: string;
  }[];
  banners: {
    id: number;
    title: string;
    imageUrl: string;
    link: string;
  }[];
  featuredProducts: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
  }[];
  contentConfig?: {
    block1: any[];
  };
  classroomGroupHomeBlocks?: any;
  topRanks?: any[];
  teachers?: any[];
  reviewStudent?: any;
  reviews?: any[];
}

export const getHomePageData = cache(async (): Promise<HomePageData | null> => {
  try {
    const rsHomeData = await homeService.getHomePageData();
    if (rsHomeData?.code === 200 && rsHomeData?.data) {
      return rsHomeData.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return null;
  }
}); 