'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  subjects: string[];
  schools: string[];
  teacher_ids: string[];
}

interface TeacherContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    subjects: [],
    schools: [],
    teacher_ids: [],
  });

  return (
    <TeacherContext.Provider value={{ filters, setFilters }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacherContext() {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacherContext must be used within TeacherProvider');
  }
  return context;
}
