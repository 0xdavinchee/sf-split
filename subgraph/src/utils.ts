import {
  BigInt,
  Bytes,
  Entity,
  Value,
  ethereum,
} from "@graphprotocol/graph-ts";
import { FlowSplitter } from "../generated/schema";

/**************************************************************************
 * Constants
 *************************************************************************/
export const ORDER_MULTIPLIER = BigInt.fromI32(10000);

/**************************************************************************
 * Event entities util functions
 *************************************************************************/
export function createEventID(
  eventName: string,
  event: ethereum.Event
): string {
  return (
    eventName +
    "-" +
    event.transaction.hash.toHexString() +
    "-" +
    event.logIndex.toString()
  );
}

/**
 * getOrder calculate order based on {blockNumber.times(10000).plus(logIndex)}.
 * @param blockNumber
 * @param logIndex
 */
export function getOrder(blockNumber: BigInt, logIndex: BigInt): BigInt {
  return blockNumber.times(ORDER_MULTIPLIER).plus(logIndex);
}

/**
 * Sets the Event interface values on the event entity.
 * @param entity the Entity
 * @param event the ethereum.Event object
 * @returns Entity to be casted as original Event type
 */
export function setEventEntityValues(
  entity: Entity,
  event: ethereum.Event,
  addresses: Bytes[]
): Entity {
  const idValue = entity.get("id");
  if (!idValue) return entity;

  const stringId = idValue.toString();
  const name = stringId.split("-")[0];

  entity.set("blockNumber", Value.fromBigInt(event.block.number));
  entity.set("logIndex", Value.fromBigInt(event.logIndex));
  entity.set(
    "order",
    Value.fromBigInt(getOrder(event.block.number, event.logIndex))
  );
  entity.set("name", Value.fromString(name));
  entity.set("addresses", Value.fromBytesArray(addresses));
  entity.set("timestamp", Value.fromBigInt(event.block.timestamp));
  entity.set("transactionHash", Value.fromBytes(event.transaction.hash));
  entity.set("gasPrice", Value.fromBigInt(event.transaction.gasPrice));
  const receipt = event.receipt;
  if (receipt) {
    entity.set("gasUsed", Value.fromBigInt(receipt.gasUsed));
  }

  return entity;
}

/**************************************************************************
 * Abstract entities util functions
 *************************************************************************/
export function getOrInitFlowSplitter(
  event: ethereum.Event,
  flowSplitterAddress: Bytes
): FlowSplitter {
  let flowSplitter = FlowSplitter.load(flowSplitterAddress.toHex());

  if (flowSplitter == null) {
    flowSplitter = new FlowSplitter(flowSplitterAddress.toHex());
    flowSplitter.createdAtTimestamp = event.block.timestamp;
    flowSplitter.createdAtBlockNumber = event.block.number;
    flowSplitter.updatedAtTimestamp = event.block.timestamp;
    flowSplitter.updatedAtBlockNumber = event.block.number;
  }

  return flowSplitter as FlowSplitter;
}
