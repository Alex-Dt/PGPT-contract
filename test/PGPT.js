import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("PGPT Token", function () {
  let pgptT;

  before(async function () {
    pgptT = await ethers.deployContract("PGPT");
  });

  it("Should return name", async function () {
    expect(await pgptT.name()).to.equal("PrivateAI.com");
    expect(await pgptT.symbol()).to.equal("PGPT");
  });

  it("Should have own decimals", async function () {
    expect(await pgptT.decimals()).to.equal(6);
  });

  it("Should have 33 bln of tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      33_333_333n * 10n ** BigInt(decimals)
    );
  });
  it("Should have ability to burn  tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await pgptT.burn(1_000_000n * 10n ** BigInt(decimals));

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      32_333_333n * 10n ** BigInt(decimals)
    );
  });

  it("Should have ability to mint tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await pgptT.mint(owner.address, 1_000_000n * 10n ** BigInt(decimals));

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      33_333_333n * 10n ** BigInt(decimals)
    );
  });

  it("Should have NO ability to mint tokens for non owner", async function () {
    const [owner, secondUser] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await expect(
      pgptT
        .connect(secondUser)
        .mint(owner.address, 1_000_000n * 10n ** BigInt(decimals))
    ).to.be.reverted;
  });

  it("Should have NO ability to mint tokens for more then 100M", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await expect(
      pgptT.mint(owner.address, 70_000_000n * 10n ** BigInt(decimals))
    ).to.be.reverted;
  });
});
