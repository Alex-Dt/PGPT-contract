// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PGPT is ERC20, ERC20Burnable, Ownable {
    uint256 private constant MAX_SUPPLY = 100_000_000 * 10**6; // 100 million tokens, assuming 6 decimals

    constructor() ERC20("PrivateAI.com", "PGPT") Ownable(msg.sender) {
        _mint(msg.sender, 33_333_333 * 10**decimals()); // Minting 33,333,333 tokens per chain
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
}
