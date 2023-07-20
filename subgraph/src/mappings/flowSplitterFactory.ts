import { FlowSplitterCreated } from "../../generated/FlowSplitterFactory/FlowSplitterFactory";
import { FlowSplitter } from "../../generated/templates";
import { FlowSplitterCreatedEvent } from "../../generated/schema";

import {
  createEventID,
  getOrInitFlowSplitter,
  setEventEntityValues,
} from "../utils";

export function handleFlowSplitterCreated(event: FlowSplitterCreated): void {
  // Create a new FlowSplitterCreatedEvent entity, and set its fields
  let flowSplitterCreatedEvent = new FlowSplitterCreatedEvent(
    createEventID("FlowSplitterCreated", event)
  );
  setEventEntityValues(flowSplitterCreatedEvent, event);
  flowSplitterCreatedEvent.superToken = event.params.superToken;
  flowSplitterCreatedEvent.mainReceiver = event.params.mainReceiver;
  flowSplitterCreatedEvent.sideReceiver = event.params.sideReceiver;
  flowSplitterCreatedEvent.sideReceiverPortion =
    event.params.sideReceiverPortion;

  flowSplitterCreatedEvent.flowSplitter = event.params.flowSplitter.toHex();
  flowSplitterCreatedEvent.save();

  // Create a new FlowSplitter template data source
  FlowSplitter.create(event.params.flowSplitter);

  // Create a new FlowSplitter entity and save it to the store
  const flowSplitter = getOrInitFlowSplitter(event, event.params.flowSplitter);
  flowSplitter.superToken = event.params.superToken;
  flowSplitter.mainReceiver = event.params.mainReceiver;
  flowSplitter.sideReceiver = event.params.sideReceiver;
  flowSplitter.sideReceiverPortion = event.params.sideReceiverPortion;
  flowSplitter.mainReceiverPortion = event.params.mainReceiverPortion;
  flowSplitter.flowSplitterCreatedEvent = flowSplitterCreatedEvent.id;

  flowSplitter.save();
}
