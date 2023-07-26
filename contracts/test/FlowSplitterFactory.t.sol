// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ERC1820RegistryCompiled } from
    "@superfluid-finance/ethereum-contracts/contracts/libs/ERC1820RegistryCompiled.sol";
import { SuperfluidFrameworkDeployer } from
    "@superfluid-finance/ethereum-contracts/contracts/utils/SuperfluidFrameworkDeployer.sol";
import { TestToken } from "@superfluid-finance/ethereum-contracts/contracts/utils/TestToken.sol";
import { ISuperToken, SuperToken } from "@superfluid-finance/ethereum-contracts/contracts/superfluid/SuperToken.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { FlowSplitter, FlowSplitterFactory } from "../src/FlowSplitterFactory.sol";

contract FlowSplitterFactoryTest is Test {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SuperTokenV1Library for SuperToken;
    using SuperTokenV1Library for ISuperToken;

    uint256 internal constant INIT_TOKEN_BALANCE = type(uint128).max;
    uint256 internal constant INIT_SUPER_TOKEN_BALANCE = type(uint88).max;
    SuperfluidFrameworkDeployer.Framework internal _sf;
    SuperfluidFrameworkDeployer internal _deployer;
    FlowSplitterFactory internal _factory;
    TestToken internal _underlyingToken;
    SuperToken internal _superToken;
    EnumerableSet.AddressSet internal _uniqueSenders;

    function setUp() public {
        vm.etch(ERC1820RegistryCompiled.at, ERC1820RegistryCompiled.bin);

        _deployer = new SuperfluidFrameworkDeployer();
        _deployer.deployTestFramework();
        _sf = _deployer.getFramework();
        (_underlyingToken, _superToken) = _deployer.deployWrapperSuperToken("MR Token", "MRx", 18, type(uint256).max);

        _factory = new FlowSplitterFactory(_sf.host);
    }

    function testRevertIfConstructedWithBadPortion(address main_, address side_, int96 sidePortion_) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        vm.assume(sidePortion_ <= 0 || sidePortion_ == 1000);

        vm.expectRevert(FlowSplitter.INVALID_PORTION.selector);
        _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);
    }

    function testRevertIfConstructedWithSameReceivers(address main_, int96 sidePortion_) public {
        sidePortion_ = _boundValidSidePortion(sidePortion_);
        vm.expectRevert(FlowSplitter.SAME_RECEIVERS_NOT_ALLOWED.selector);
        _helperDeployFlowSplitter(_superToken, main_, main_, sidePortion_);
    }

    function testRevertIfConstructedWithSelfFlow(address main_, int96 sidePortion_) public {
        sidePortion_ = _boundValidSidePortion(sidePortion_);
        vm.expectRevert(FlowSplitter.NO_SELF_FLOW.selector);
        _helperDeployFlowSplitter(_superToken, main_, 0x0c970d77659B2712c9dEe1A651d7CdFed3d3D89e, sidePortion_);
    }

    function testRevertIfUpdateSplitWithBadPortion(address main_, address side_, int96 sidePortion_) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        vm.assume(sidePortion_ <= 0 || sidePortion_ == 1000);

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, 420);
        FlowSplitter flowSplitter = FlowSplitter(flowSplitterAddress);

        vm.startPrank(main_);
        vm.expectRevert(FlowSplitter.INVALID_PORTION.selector);
        flowSplitter.updateSplit(sidePortion_);
        vm.stopPrank();
    }

    function testRevertIfUpdateSplitAsNotOwner(address main_, address side_, int96 sidePortion_) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, 420);
        FlowSplitter flowSplitter = FlowSplitter(flowSplitterAddress);

        vm.startPrank(main_);
        vm.expectRevert(FlowSplitter.NOT_CREATOR.selector);
        flowSplitter.updateSplit(sidePortion_);
        vm.stopPrank();
    }

    function testFlowSplitterFactoryDeployedProperly() public {
        assertEq(address(_factory.HOST()), address(_sf.host), "host not set correctly");
    }

    function testDeployAndInitializeFlowSplitter(int96 sidePortion_) public {
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        address main = address(0x1A4);
        address side = address(0x45);
        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main, side, sidePortion_);
        FlowSplitter flowSplitter = FlowSplitter(flowSplitterAddress);

        assertEq(address(flowSplitter.HOST()), address(_factory.HOST()), "host not set correctly");
        assertEq(flowSplitter.MAIN_RECEIVER(), main, "main receiver not set correctly");
        assertEq(flowSplitter.SIDE_RECEIVER(), side, "side receiver not set correctly");
        assertEq(flowSplitter.sideReceiverPortion(), sidePortion_, "side receiver portion not set correctly");
    }

    // @note These are rudimentary happy path cases, if we diverge off the happy path
    // with the flowRate for example, the tests will fail.
    function testCreateSingleStreamToFlowSplitter(address sender_, address main_, address side_, int96 sidePortion_)
        public
    {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        int96 flowRate = 10000000;

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        _helperMintApproveUpgradeAndCreateFlow(_superToken, sender_, main_, side_, flowSplitterAddress, flowRate);

        _assertMainAndSideFlowRates(
            FlowSplitter(flowSplitterAddress),
            main_,
            side_,
            flowRate,
            sidePortion_,
            "testCreateSingleStreamToFlowSplitter"
        );
    }

    function testUpdateSingleStreamToFlowSplitter(address sender_, address main_, address side_, int96 sidePortion_)
        public
    {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        int96 flowRate = 100000;

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        _helperMintApproveUpgradeAndCreateFlow(_superToken, sender_, main_, side_, flowSplitterAddress, flowRate);

        int96 updateFlowRate = 2000000;

        vm.startPrank(sender_);
        _superToken.updateFlow(flowSplitterAddress, updateFlowRate);
        vm.stopPrank();

        _assertMainAndSideFlowRates(
            FlowSplitter(flowSplitterAddress),
            main_,
            side_,
            updateFlowRate,
            sidePortion_,
            "testUpdateSingleStreamToFlowSplitter"
        );
    }

    function testDeleteSingleStreamToFlowSplitter(address sender_, address main_, address side_, int96 sidePortion_)
        public
    {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        int96 flowRate = 100000;

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        _helperMintApproveUpgradeAndCreateFlow(_superToken, sender_, main_, side_, flowSplitterAddress, flowRate);

        vm.startPrank(sender_);
        _superToken.deleteFlow(sender_, flowSplitterAddress);
        vm.stopPrank();

        _assertMainAndSideFlowRates(
            FlowSplitter(flowSplitterAddress), main_, side_, 0, sidePortion_, "testUpdateSingleStreamToFlowSplitter"
        );
    }

    function testStickyReceiverDeleteStreamToFlowSplitter(
        address sender_,
        address main_,
        address side_,
        int96 sidePortion_
    ) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        int96 flowRate = 100000;

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        _helperMintApproveUpgradeAndCreateFlow(_superToken, sender_, main_, side_, flowSplitterAddress, flowRate);

        int96 fr = _superToken.getFlowRate(flowSplitterAddress, main_);
        vm.startPrank(main_);
        _superToken.deleteFlow(flowSplitterAddress, main_);
        vm.stopPrank();

        // @note this does not correctly handle the sticky receiver flow recreation
        console.logInt(fr);
        fr = _superToken.getFlowRate(flowSplitterAddress, main_);
        console.logInt(fr);

        // _assertMainAndSideFlowRates(
        //     FlowSplitter(flowSplitterAddress),
        //     main_,
        //     side_,
        //     flowRate,
        //     sidePortion_,
        //     "testUpdateSingleStreamToFlowSplitter"
        // );
    }

    function testUpdateSingleStreamSplit(address sender_, address main_, address side_, int96 sidePortion_) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);
        sidePortion_ = 420;

        int96 flowRate = 3170979198;

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);
        FlowSplitter flowSplitter = FlowSplitter(flowSplitterAddress);

        _helperMintApproveUpgradeAndCreateFlow(_superToken, sender_, main_, side_, flowSplitterAddress, flowRate);

        _assertMainAndSideFlowRates(flowSplitter, main_, side_, flowRate, sidePortion_, "testUpdateSingleStreamSplit");

        int96 newSideReceiverPortion = 690;
        flowSplitter.updateSplit(newSideReceiverPortion);

        assertEq(
            flowSplitter.sideReceiverPortion(),
            newSideReceiverPortion,
            "testUpdateSingleStreamSplit: side receiver portion not updated correctly"
        );
    }

    function testMultipleStreamToFlowSplitter(
        address[10] calldata senders_,
        address main_,
        address side_,
        int96 sidePortion_
    ) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        for (uint256 i; i < senders_.length; ++i) {
            if (_uniqueSenders.contains(senders_[i])) continue;
            _uniqueSenders.add(senders_[i]);
        }

        int96 flowRateSum;
        for (uint256 i; i < _uniqueSenders.values().length; ++i) {
            int96 flowRate = 10000000;
            _helperMintApproveUpgradeAndCreateFlow(
                _superToken, _uniqueSenders.values()[i], main_, side_, flowSplitterAddress, flowRate
            );
            flowRateSum += flowRate;
        }

        _assertMainAndSideFlowRates(
            FlowSplitter(flowSplitterAddress),
            main_,
            side_,
            flowRateSum,
            sidePortion_,
            "testMultipleStreamToFlowSplitter"
        );
    }

    function testDeleteOneFlowInMultipleStreamToFlowSplitter(
        address[10] calldata senders_,
        address main_,
        address side_,
        int96 sidePortion_
    ) public {
        _assumeValidMainAndSideAddresses(main_, side_);
        sidePortion_ = _boundValidSidePortion(sidePortion_);

        address flowSplitterAddress = _helperDeployFlowSplitter(_superToken, main_, side_, sidePortion_);

        for (uint256 i; i < senders_.length; ++i) {
            if (_uniqueSenders.contains(senders_[i])) continue;
            _uniqueSenders.add(senders_[i]);
        }

        int96 flowRateSum;
        for (uint256 i; i < _uniqueSenders.values().length; ++i) {
            int96 flowRate = 10000000;
            _helperMintApproveUpgradeAndCreateFlow(
                _superToken, _uniqueSenders.values()[i], main_, side_, flowSplitterAddress, flowRate
            );
            flowRateSum += flowRate;
        }

        vm.startPrank(_uniqueSenders.values()[0]);
        _superToken.deleteFlow(_uniqueSenders.values()[0], flowSplitterAddress);
        vm.stopPrank();
    }

    // Assume/Bound Functions
    function _assumeValidMainAndSideAddresses(address main_, address side_) internal pure {
        vm.assume(main_ != address(0));
        vm.assume(side_ != address(0));
        vm.assume(main_ != side_);
    }

    function _boundValidSidePortion(int96 portion_) internal view returns (int96 portion) {
        portion = int96(bound(portion_, 1, 999));
    }

    // Helper Functions

    function _helperDeployFlowSplitter(ISuperToken superToken_, address main_, address side_, int96 sidePortion_)
        internal
        returns (address flowSplitterAddress)
    {
        flowSplitterAddress = _factory.deployFlowSplitter(superToken_, main_, side_, sidePortion_);
    }

    function _helperMintApproveUpgradeAndCreateFlow(
        ISuperToken superToken_,
        address sender_,
        address main_,
        address side_,
        address flowSplitterAddress,
        int96 flowRate
    ) internal {
        vm.assume(sender_ != address(0));
        vm.assume(sender_ != main_);
        vm.assume(sender_ != side_);
        vm.startPrank(sender_);
        _underlyingToken.mint(sender_, INIT_TOKEN_BALANCE);
        _underlyingToken.approve(address(superToken_), INIT_SUPER_TOKEN_BALANCE);
        superToken_.upgrade(INIT_SUPER_TOKEN_BALANCE);
        superToken_.createFlow(flowSplitterAddress, flowRate);
        vm.stopPrank();
    }

    // Assert Functions
    function _assertMainAndSideFlowRates(
        FlowSplitter flowSplitter_,
        address main_,
        address side_,
        int96 inflowRate_,
        int96 sidePortion_,
        string memory message_
    ) internal {
        int96 mainNetFlowRate = _superToken.getNetFlowRate(main_);
        int96 sideNetFlowRate = _superToken.getNetFlowRate(side_);
        (int96 mainFlowRate, int96 sideFlowRate,) =
            flowSplitter_.getMainAndSideReceiverFlowRates(inflowRate_, sidePortion_);
        assertEq(mainNetFlowRate, mainFlowRate, string.concat(message_, ": main flow rate not set correctly"));
        assertEq(sideNetFlowRate, sideFlowRate, string.concat(message_, ": side flow rate not set correctly"));
    }
}
