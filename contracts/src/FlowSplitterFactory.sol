// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { FlowSplitter } from "./FlowSplitter.sol";
import { SuperfluidLoaderLibrary } from
    "@superfluid-finance/ethereum-contracts/contracts/apps/SuperfluidLoaderLibrary.sol";
import { ISuperfluid } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

contract FlowSplitterFactory {
    /// @dev The Superfluid host contract address
    ISuperfluid public immutable HOST;

    /// @dev Emitted when a new FlowSplitter contract is deployed
    event FlowSplitterCreated(
        ISuperToken indexed superToken,
        address indexed flowSplitterCreator,
        address mainReceiver,
        address sideReceiver,
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
    }

    /// @dev Deploys a new FlowSplitter contract
    /// @param mainReceiver_ The address that will receive the main portion of the flow
    /// @param sideReceiver_ The address that will receive the side portion of the flow
    /// @param sideReceiverPortion_ The portion of the flow that will be sent to the side receiver
    /// @param superToken_ The super token that will be used to send the flow
    /// @return flowSplitter The address of the deployed FlowSplitter contract
    function deployFlowSplitter(
        ISuperToken superToken_,
        address mainReceiver_,
        address sideReceiver_,
        int96 sideReceiverPortion_
    ) external returns (address flowSplitter) {
        FlowSplitter flowSplitterContract =
            new FlowSplitter(HOST, superToken_, mainReceiver_, sideReceiver_, sideReceiverPortion_);

        flowSplitter = address(flowSplitterContract);

        emit FlowSplitterCreated(
            superToken_,
            msg.sender,
            mainReceiver_,
            sideReceiver_,
            flowSplitter,
            1000 - sideReceiverPortion_,
            sideReceiverPortion_
        );
    }
}
