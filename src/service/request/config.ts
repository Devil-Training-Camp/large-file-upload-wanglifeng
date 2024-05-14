let API_BASE_URL = "";
if (import.meta.env.PROD) {
  API_BASE_URL = "http://localhost:3000";
}
export const TIME_OUT = 10000;
export { API_BASE_URL };
