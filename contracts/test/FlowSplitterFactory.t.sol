// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import { ERC1820RegistryCompiled } from
    "@superfluid-finance/ethereum-contracts/contracts/libs/ERC1820RegistryCompiled.sol";
import { SuperfluidFrameworkDeployer } from
    "@superfluid-finance/ethereum-contracts/contracts/utils/SuperfluidFrameworkDeployer.sol";
import { TestToken } from "@superfluid-finance/ethereum-contracts/contracts/utils/TestToken.sol";
import { SuperToken } from "@superfluid-finance/ethereum-contracts/contracts/superfluid/SuperToken.sol";

import { FlowSplitter, FlowSplitterFactory } from "../src/FlowSplitterFactory.sol";

contract FlowSplitterFactoryTest is Test {
    SuperfluidFrameworkDeployer.Framework internal sf;
    SuperfluidFrameworkDeployer internal deployer;
    FlowSplitterFactory internal factory;
    TestToken internal underlyingToken;
    SuperToken internal superToken;

    function setUp() public {
        vm.etch(ERC1820RegistryCompiled.at, ERC1820RegistryCompiled.bin);

        deployer = new SuperfluidFrameworkDeployer();
        deployer.deployTestFramework();
        sf = deployer.getFramework();
        (underlyingToken, superToken) = deployer.deployWrapperSuperToken("MR Token", "MRx", 18, 10000000);

        factory = new FlowSplitterFactory(sf.host);
    }

    function testFlowSplitterFactoryDeployedProperly() public {
        assertEq(address(factory.HOST()), address(sf.host), "host not set correctly");
    }

    function testDeployAndInitializeFlowSplitter(address main, address side, int96 sidePortion) public {
        vm.assume(main != address(0));
        vm.assume(side != address(0));
        vm.assume(sidePortion >= 0);

        address flowSplitterAddress = factory.deployFlowSplitter(main, side, sidePortion, superToken);
        FlowSplitter flowSplitter = FlowSplitter(flowSplitterAddress);

        assertEq(address(factory.HOST()), flowSplitter.host());
        assertEq(flowSplitter.mainReceiver(), main, "main receiver not set correctly");
        assertEq(flowSplitter.sideReceiver(), side, "side receiver not set correctly");
        assertEq(flowSplitter.sideReceiverPortion(), sidePortion, "side receiver portion not set correctly");
    }

    function testRevertIfInitializeWithBadPortion(address main, address side, int96 sidePortion) public {
        vm.assume(main != address(0));
        vm.assume(side != address(0));
        vm.assume(sidePortion < 0);

        vm.expectRevert(FlowSplitter.NO_NEGATIVE_PORTION.selector);
        address flowSplitterAddress = factory.deployFlowSplitter(main, side, sidePortion, superToken);
    }
}
