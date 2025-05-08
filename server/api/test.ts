export default defineEventHandler((event) => {
  return {
    message: "API is working",
    path: event.path,
  };
});
