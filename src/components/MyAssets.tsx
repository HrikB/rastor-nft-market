import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { Item } from "../types/types";

import NFT from "../NFT.json";
import NFTMarket from "../NFTMarket.json";
import { nftAddr, nftMarketAddr } from "../config";

function MyAssets() {
  const [nfts, setNfts] = useState<Item[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  useEffect(() => {
    loadNfts();
  }, []);

  const loadNfts = async () => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContr = new ethers.Contract(
      nftMarketAddr,
      NFTMarket.abi,
      signer
    );
    const tokenContr = new ethers.Contract(nftAddr, NFT.abi, provider);
    const data = await marketContr.getMyNFTs();
    const items = await Promise.all(
      data.map(async (i: Item) => {
        const tokenUri = await tokenContr.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          nftContract: i.nftContract,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState(true);
  };

  if (loadingState && nfts.length === 0)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={`${nft.nftContract}/${nft.tokenId}`}
              className="border shadow rounded-xl overflow-hidden"
            >
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">{`Price - ${nft.price} ETH`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyAssets;
