const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PGPT Token", function () {
  let pgptT;

  before(async function () {
    pgptT = await ethers.deployContract("PGPT");
  });

  it("Should return name", async function () {
    expect(await pgptT.name()).to.equal("PGPT");
    expect(await pgptT.symbol()).to.equal("PGPT");
  });

  it("Should have own decimals", async function () {
    expect(await pgptT.decimals()).to.equal(6);
  });

  it("Should have 100 bln of tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      100_000_000n * 10n ** BigInt(decimals)
    );
  });
  it("Should have ability to burn  tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await pgptT.burn(1_000_000n * 10n ** BigInt(decimals));

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      99_000_000n * 10n ** BigInt(decimals)
    );
  });

  it("Should have ability to mint tokens ", async function () {
    const [owner] = await ethers.getSigners();
    const decimals = await pgptT.decimals();
    await pgptT.mint(owner.address, 1_000_000n * 10n ** BigInt(decimals));

    expect(await pgptT.balanceOf(owner.address)).to.equal(
      100_000_000n * 10n ** BigInt(decimals)
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
});
