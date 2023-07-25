export const tryCatchWrapper = async (func?: () => any) => {
  if (!func) return;
  try {
    await func();
  } catch (err) {
    console.error(err);
  }
};

export const isValidPortionInput = (portion: string) =>
portion !== "" && Number(portion) > 0 && Number(portion) < 1000;
