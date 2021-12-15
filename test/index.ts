import { expect } from "chai";
import { ethers } from "hardhat";

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("NFTMarket", () => {
  it("Should create and execute market sales", async () => {
    const marketContr = await ethers.getContractFactory("NFTMarket");
    const market = await marketContr.deploy();
    await market.deployed();
    const marketAddr = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddr);
    await nft.deployed();
    const nftContrAddr = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    await nft.createToken("http://mytokenlocation.com");
    await nft.createToken("http://mytokenlocation2.com");

    await market.createMarketItem(nftContrAddr, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.createMarketItem(nftContrAddr, 2, auctionPrice, {
      value: listingPrice,
    });

    const [_, buyerAddress] = await ethers.getSigners();

    console.log(listingPrice);
    await market
      .connect(buyerAddress)
      .createMarketSale(nftContrAddr, 1, { value: auctionPrice });

    let items = await market.getMarketItems();

    items = await Promise.all(
      items.map(
        async (i: {
          price: number;
          tokenId: number;
          seller: string;
          owner: string;
          tokenUri: string;
        }) => {
          const tokenUri = await nft.tokenURI(i.tokenId);
          let item = {
            price: i.price.toString(),
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            tokenUri,
          };
          return item;
        }
      )
    );

    console.log("items: ", items);
  });
});
