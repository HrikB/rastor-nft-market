import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import NFT from "../NFT.json";
import NFTMarket from "../NFTMarket.json";
import { nftAddr, nftMarketAddr } from "../config";
import { Item } from "../types/types";

function CreatorDashboard() {
  const [nfts, setNfts] = useState<Item[]>([]); //Nfts created by curr wallet
  const [sold, setSold] = useState<Item[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  useEffect(() => {
    loadNfts();
  }, []);

  const loadNfts = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContr = new ethers.Contract(
      nftMarketAddr,
      NFTMarket.abi,
      signer
    );
    const tokenContr = new ethers.Contract(nftAddr, NFT.abi, provider);
    const data = await marketContr.getItemsCreated();

    const items = await Promise.all(
      data.map(async (i: Item) => {
        const tokenUri = await tokenContr.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );

    const soldItems = items.filter((i) => i.sold);

    setSold(soldItems);
    setNfts(items);
    setLoadingState(true);
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
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
      <div className="px-4">
        {sold.length !== 0 && (
          <div>
            <h2 className="text-2x py-2">Items Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft) => (
                <div
                  key={`17`}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  {console.log("f", nft)}
                  <img src={nft.image} className="rounded" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">{`Price - ${nft.price} ETH`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatorDashboard;
