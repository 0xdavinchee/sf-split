import { SplitUpdated } from "../../generated/templates/FlowSplitter/FlowSplitter";
import { SplitUpdatedEvent } from "../../generated/schema";
import {
  createEventID,
  getOrInitFlowSplitter,
  setEventEntityValues,
} from "../utils";

export function handleSplitUpdated(event: SplitUpdated): void {
  const splitUpdatedEvent = new SplitUpdatedEvent(
    createEventID("SplitUpdated", event)
  );
  setEventEntityValues(splitUpdatedEvent, event);
  splitUpdatedEvent.mainReceiverPortion = event.params.mainReceiverPortion;
  splitUpdatedEvent.newSideReceiverPortion =
    event.params.newSideReceiverPortion;

  splitUpdatedEvent.save();

  const flowSplitter = getOrInitFlowSplitter(event, event.address);
  flowSplitter.mainReceiverPortion = event.params.mainReceiverPortion;
  flowSplitter.sideReceiverPortion = event.params.newSideReceiverPortion;

  flowSplitter.save();
}
