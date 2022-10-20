// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    struct Addresses {
        address[] array;
        mapping (address => bool) map;
    }

    Addresses addresses;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        totalWaves += 1;
        if (!addresses.map[msg.sender]) {
            addresses.map[msg.sender] = true;
            addresses.array.push(msg.sender);
        }
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function getAddresses() public view returns (address[] memory) {
        return addresses.array;
    }
}