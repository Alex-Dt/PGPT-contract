const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PGPT Token", function () {
  let pgptT;

  before(async function () {
    const PgptT = await ethers.getContractFactory("PGPT");
    pgptT = await PgptT.deploy();
    await pgptT.deployed();
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
});
