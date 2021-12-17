import { BigNumber } from "ethers";

export type Item = {
  price: number;
  tokenId: BigNumber;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
  nftContract: string;
};
