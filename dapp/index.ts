import { getBuiltGraphSDK, getTokensQuery } from "./.graphclient";

export const { getTokens } = getBuiltGraphSDK();


async function main() {
  const data = await getTokens({ where: { isListed: true } });
  console.log(data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
