export const config = () => {
  return {
    BASE_URL: import.meta.env.VITE_API_URL || "https://meklit-api.negaritsystems.com.et",
  };
};
