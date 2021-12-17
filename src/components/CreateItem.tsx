import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";

import NFT from "../NFT.json";
import NFTMarket from "../NFTMarket.json";
import { nftAddr, nftMarketAddr } from "../config";

const client = ipfsHttpClient({ url: "https://ipfs.infura.io:5001/api/v0" });

function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    desc: "",
  });
  const navigate = useNavigate();

  const onChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received ${prog}`),
      });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (err) {
      console.log(err);
    }
  };

  const createItem = async () => {
    const { name, desc, price } = formInput;
    if (!name || !desc || !price || !fileUrl) return;

    const data = JSON.stringify({
      name,
      descripton: desc,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      //save url on blockchain after ipfs link is created
      createUrl(url);
    } catch (err) {
      console.log(err);
    }
  };

  const createUrl = async (url) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddr, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftMarketAddr, NFTMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftAddr, tokenId, price, {
      value: listingPrice,
    });

    await transaction.wait();
    navigate("/");
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, desc: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && (
          <img
            src={fileUrl}
            alt="Asset Preview"
            className="rounded mt-4"
            width="350"
          />
        )}
        <button
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
}

export default CreateItem;
