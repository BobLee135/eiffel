import { EventCreator } from './EventCreator.js';
import { EventSender } from './EventSender.js';
import { EiffelEventTypes } from './EiffelEventTypes.js';

const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");
const eiffelEventTypes = new EiffelEventTypes();

var events = [];

// dev pushes code
const codeChange = eiffelEventTypes.EiffelArtifactCreatedEvent([]);
//const pushCodeEvent = eiffelEventTypes.EiffelSourceChangeSubmittedEvent([codeChange.meta.id]);
events.push(codeChange);
//events.push(pushCodeEvent);

// tests run
const testTriggeredEvent = eiffelEventTypes.EiffelTestCaseTriggeredEvent([codeChange.meta.id]);
//testTriggeredEvent.data.testCase.id = 1;
//const testStartedEvent = eventCreator.eiffelEvent("EiffelTestCaseStartedEvent", [testTriggeredEvent.meta.id]);
events.push(testTriggeredEvent);
//events.push(testStartedEvent);
/*
// tests fail
const testFinishedEvent = eventCreator.eiffelEvent("EiffelTestCaseFinishedEvent", [testTriggeredEvent.meta.id]);
events.push(testFinishedEvent);

// dev creates related card in trello
const trelloCardCreated = eventCreator.customTrelloEvent(11, "Integration error at index.js", "createCard", "weak", testFinishedEvent.meta.id, "Trello card created");
events.push(trelloCardCreated);

// thread created in slack TODO

// dev fixes code
const codeChange2 = eventCreator.eiffelEvent("EiffelSourceChangeCreatedEvent", [trelloCardCreated.meta.id]);
const pushCodeEvent2 = eventCreator.eiffelEvent("EiffelSourceChangeSubmittedEvent", [codeChange2.meta.id]);
events.push(codeChange2);
events.push(pushCodeEvent2);

// tests pass
const testFinishedEvent2 = eventCreator.eiffelEvent("EiffelTestCaseFinishedEvent", [pushCodeEvent2.meta.id]);
events.push(testFinishedEvent2);

// merge
events.push(eventCreator.eiffelEvent("EiffelSourceChangeSubmittedEvent", [testFinishedEvent2.meta.id]));

// trello card moved to finished list
*/
for (let i = 0; i < events.length; i++) {
    eventSender.submitEvent(events[i]);
}

