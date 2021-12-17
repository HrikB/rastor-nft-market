import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { Item } from "../types/types";

import NFT from "../NFT.json";
import NFTMarket from "../NFTMarket.json";
import { nftAddr, nftMarketAddr } from "../config";

function Home() {
  const [nfts, setNfts] = useState<Item[]>([]);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = await new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545/"
    );
    const tokenContr = await new ethers.Contract(nftAddr, NFT.abi, provider);
    const marketContr = await new ethers.Contract(
      nftMarketAddr,
      NFTMarket.abi,
      provider
    );
    const data = await marketContr.getMarketItems();
    const items: Item[] = await Promise.all(
      data.map(async (i: Item) => {
        const tokenUri = await tokenContr.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState(true);
  };

  const buyNft = async (nft: Item) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftMarketAddr, NFTMarket.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(nftAddr, nft.tokenId, {
      value: price,
    });
    await transaction.wait(); //wait for transaction to finish

    loadNFTs(); //reload nfts
  };

  if (loadingState && nfts.length === 0)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />
              <div className="p-4">
                <p
                  style={{ height: "64px" }}
                  className="text-2xl font-semibold"
                >
                  {nft.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="pg-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price}
                </p>
                <button
                  className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounder"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
