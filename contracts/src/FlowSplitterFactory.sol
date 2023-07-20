// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { FlowSplitter } from "./FlowSplitter.sol";
import { SuperfluidLoaderLibrary } from
    "@superfluid-finance/ethereum-contracts/contracts/apps/SuperfluidLoaderLibrary.sol";
import { ISuperfluid } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

contract FlowSplitterFactory {
    /// @dev The Superfluid host contract address
    ISuperfluid public immutable HOST;

    // @dev The FlowSplitter implementation contract address
    address public immutable FLOW_SPLITTER_IMPLEMENTATION;

    /// @dev Emitted when a new FlowSplitter contract is deployed
    event FlowSplitterCreated(
        ISuperToken indexed superToken,
        address indexed mainReceiver,
        address indexed sideReceiver,
        address flowSplitter,
        int96 mainReceiverPortion,
        int96 sideReceiverPortion
    );

    /// @dev Pass address(0) when deploying to testnet/production
    constructor(ISuperfluid host_) {
        address host;
        // this reverts when running locally
        try SuperfluidLoaderLibrary.getHost() returns (address _host) {
            host = _host;
        } catch {
            host = address(host_);
        }
        HOST = ISuperfluid(host);
        FLOW_SPLITTER_IMPLEMENTATION = address(new FlowSplitter(HOST));
    }

    /// @dev Deploys a new FlowSplitter contract
    /// @param mainReceiver_ The address that will receive the main portion of the flow
    /// @param sideReceiver_ The address that will receive the side portion of the flow
    /// @param sideReceiverPortion_ The portion of the flow that will be sent to the side receiver
    /// @param superToken_ The super token that will be used to send the flow
    /// @return flowSplitter The address of the deployed FlowSplitter contract
    function deployFlowSplitter(
        address mainReceiver_,
        address sideReceiver_,
        int96 sideReceiverPortion_,
        ISuperToken superToken_
    ) external returns (address flowSplitter) {
        FlowSplitter flowSplitterContract = FlowSplitter(Clones.clone(FLOW_SPLITTER_IMPLEMENTATION));

        flowSplitter = address(flowSplitterContract);

        flowSplitterContract.initialize(mainReceiver_, sideReceiver_, sideReceiverPortion_, superToken_);

        emit FlowSplitterCreated(
            superToken_, mainReceiver_, sideReceiver_, flowSplitter, 1000 - sideReceiverPortion_, sideReceiverPortion_
        );
    }
}
