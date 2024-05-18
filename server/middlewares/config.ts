export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;
console.log(PORT);
export const HEADERS = {
  "Content-Type": "application/json",
};
