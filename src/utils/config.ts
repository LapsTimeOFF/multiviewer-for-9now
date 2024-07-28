export const fetchConfig = async () => {
  await window.mv.config.get();
};
