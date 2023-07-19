// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import { ISuperfluid } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { FlowSplitterFactory } from "../src/FlowSplitterFactory.sol";

contract FlowSplitterFactoryScript is Script {
    function setUp() public { }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        // @note Only to be run on a supported network, hence address(0)
        FlowSplitterFactory factory = new FlowSplitterFactory(ISuperfluid(address(0)));
        vm.stopBroadcast();
    }
}
