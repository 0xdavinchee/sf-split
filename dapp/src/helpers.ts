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

export const getNetworkLink = (network?: number) => {
  switch (network) {
    case 80001:
      return "https://mumbai.polygonscan.com";
    default:
      return "";
  }
};

export const getAddressLink = (address: string, network?: number) => {
  return `${getNetworkLink(network)}/address/${address}`;
};
