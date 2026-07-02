"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { getHomePageData, HomePageData } from '@/lib/home-data';

interface HomeContextType {
  dataHomePage: HomePageData | null;
  setDataHomePage: (data: HomePageData) => void;
  getDataHomePage: () => Promise<void>;
  isDataLoaded: boolean;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
  const [dataHomePage, setDataHomePage] = useState<HomePageData | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const apiCalledRef = useRef(false);

  const getDataHomePage = useCallback(async () => {
    if (isDataLoaded || apiCalledRef.current) {
      return;
    }
    
    apiCalledRef.current = true;
    
    try {
      const data = await getHomePageData();
      if (data) {
        setDataHomePage(data);
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isDataLoaded]);

  return (
    <HomeContext.Provider value={{ dataHomePage, setDataHomePage, getDataHomePage, isDataLoaded }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
} 