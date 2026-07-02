import dynamic from 'next/dynamic';
import React from 'react';
import { RootContextType } from './Header';

interface DynamicHeaderProps {
  rootContext: RootContextType;
}

// Placeholder shown during client-side loading
const HeaderPlaceholder: React.FC = () => (
  <div className="hidden xl:block header-menu">
    <div className="bg-[url('/imgs/home/Top.png')] bg-cover bg-no-repeat py-1 flex justify-between items-center px-4">
      <div className="max-w-[1440px] mx-auto bg-cover bg-no-repeat py-1 flex justify-between items-center px-4 pl-0 pr-0 w-full px-2 md:px-4"></div>
    </div>
    <div className="sticky top-0 z-50 bg-white py-2 shadow-md">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 relative"></div>
    </div>
  </div>
);

// Dynamic import with ssr: false to ensure Header only loads on client side
const DynamicHeader = dynamic<DynamicHeaderProps>(
  () => import('./Header'),
  { 
    ssr: false,
    loading: () => <HeaderPlaceholder />
  }
);

export default DynamicHeader; 