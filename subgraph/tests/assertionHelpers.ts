import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, log } from "matchstick-as/assembly/index";
import { createEventID } from "../src/utils";

// General Assertion Helpers

/**
 * Asserts that the "base" properties on our Event entity are correct
 * @param event The event we are checking
 * @param eventName The name of the event
 * @returns The id of the event (based on our createEventID function)
 */
export function assertEventBaseProperties(
  event: ethereum.Event,
  eventName: string
): string {
  const entityType = eventName + "Event";
  const id = createEventID(eventName, event);

  assert.fieldEquals(entityType, id, "id", id);
  assert.fieldEquals(
    entityType,
    id,
    "blockNumber",
    event.block.number.toString()
  );
  assert.fieldEquals(entityType, id, "logIndex", event.logIndex.toString());
  assert.fieldEquals(
    entityType,
    id,
    "timestamp",
    event.block.timestamp.toString()
  );
  assert.fieldEquals(entityType, id, "name", eventName);
  assert.fieldEquals(
    entityType,
    id,
    "transactionHash",
    event.transaction.hash.toHex()
  );
  assert.fieldEquals(
    entityType,
    id,
    "gasPrice",
    event.transaction.gasPrice.toString()
  );
  const receipt = event.receipt;
  if (receipt) {
    assert.fieldEquals(entityType, id, "gasUsed", receipt.gasUsed.toString());
  }
  return id;
}

/**
 * Asserts that the "base" properties on our Higher Order entity are correct
 * @param entityName The name of the entity
 * @param id the id of the entity
 * @param createdAtTimestamp timestamp retrieved from the event
 * @param createdAtBlockNumber block number retrieved from the event
 * @param updatedAtTimestamp timestamp retrieved from the event
 * @param updatedAtBlockNumber block number retrieved from the event
 */
export function assertHigherOrderBaseProperties(
  entityName: string,
  id: string,
  createdAtTimestamp: BigInt,
  createdAtBlockNumber: BigInt,
  updatedAtTimestamp: BigInt,
  updatedAtBlockNumber: BigInt
): void {
  assertAggregateBaseProperties(
    entityName,
    id,
    updatedAtTimestamp,
    updatedAtBlockNumber
  );
  assert.fieldEquals(
    entityName,
    id,
    "createdAtTimestamp",
    createdAtTimestamp.toString()
  );
  assert.fieldEquals(
    entityName,
    id,
    "createdAtBlockNumber",
    createdAtBlockNumber.toString()
  );
}

/**
 * Asserts that the "base" properties on our Aggregate entity are correct.
 * Note that this is a subset of our Higher Order entity "base" properties.
 * @param entityName The name of the entity
 * @param id the id of the entity
 * @param updatedAtTimestamp timestamp retrieved from the event
 * @param updatedAtBlockNumber block number retrieved from the event
 */
export function assertAggregateBaseProperties(
  entityName: string,
  id: string,
  updatedAtTimestamp: BigInt,
  updatedAtBlockNumber: BigInt
): void {
  assert.fieldEquals(entityName, id, "id", id);
  assert.fieldEquals(
    entityName,
    id,
    "updatedAtTimestamp",
    updatedAtTimestamp.toString()
  );
  assert.fieldEquals(
    entityName,
    id,
    "updatedAtBlockNumber",
    updatedAtBlockNumber.toString()
  );
}
