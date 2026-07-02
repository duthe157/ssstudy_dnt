import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/store/store';

// Sử dụng hook này thay cho useSelector thông thường
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector; 