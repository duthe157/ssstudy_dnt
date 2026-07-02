import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';

// Sử dụng hook này thay cho useDispatch thông thường
export const useAppDispatch = () => useDispatch<AppDispatch>(); 