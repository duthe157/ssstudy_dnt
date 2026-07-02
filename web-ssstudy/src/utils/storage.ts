export const storagePrefix = 'web_ssstudy_';

export const storage = {
  getToken: () => {
    return JSON.parse(
      window.localStorage.getItem(`${storagePrefix}token`) as string
    );
  },
  setToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token));
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`);
  },
  getItem: (key: string) => {
    return JSON.parse(
      window.localStorage.getItem(`${storagePrefix}${key}`) as string
    );
  },
  setItem: (key: string, value: unknown) => {
    window.localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(`${storagePrefix}${key}`);
  },
  clear: () => {
    window.localStorage.clear();
  },
}; 