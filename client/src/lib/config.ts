export const config = () => {
  return {
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  };
};
