import { AppConfig } from '@/types';
import { config as devConfig } from './environments/development';
import { config as stagingConfig } from './environments/staging';
import { config as prodConfig } from './environments/production';

// Nếu muốn phân biệt môi trường staging, sử dụng biến tùy chỉnh
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';

let config: AppConfig;
if (appEnv === 'production') {
  config = prodConfig;
} else if (appEnv === 'staging') {
  config = stagingConfig;
} else {
  // Default cho development và các môi trường khác
  config = devConfig;
}

export default config; 