'use client';

import { createContext, useContext, useState } from 'react';

interface LiveStreamContextProps {
  selectedClass: string[] | null;
  setSelectedClass: (value: string[] | null | ((prev: string[] | null) => string[] | null)) => void;
  selectedSubject: string[] | null;
  setSelectedSubject: (value: string[] | null | ((prev: string[] | null) => string[] | null)) => void;
}

const LiveStreamContext = createContext<LiveStreamContextProps | undefined>(undefined);

export function LiveStreamProvider({ children }: { children: React.ReactNode }) {
  const [selectedClass, setSelectedClass] = useState<string[] | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string[] | null>(null);

  return (
    <LiveStreamContext.Provider
      value={{
        selectedClass,
        setSelectedClass,
        selectedSubject,
        setSelectedSubject,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error('useLiveStream must be used within a LiveStreamProvider');
  }
  return context;
}