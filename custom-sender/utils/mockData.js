//import { EventCreator } from './EventCreator.js';
import { EventSender } from './EventSender.js';
import { EiffelEventTypes } from './EiffelEventTypes.js';
import { LinkFinder } from './LinkFinder.js';

//const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");
const eiffelEventTypes = new EiffelEventTypes();
const linkFinder = new LinkFinder();

var events = [];

// dev pushes code
//const codeChange = eiffelEventTypes.EiffelArtifactCreatedEvent([]);
//const pushCodeEvent = eiffelEventTypes.EiffelSourceChangeSubmittedEvent([codeChange.meta.id]);
//events.push(codeChange);
//events.push(pushCodeEvent);

// tests run
//const testTriggeredEvent = eiffelEventTypes.EiffelTestCaseTriggeredEvent([codeChange.meta.id]);
//testTriggeredEvent.data.testCase.id = 1;
//const testStartedEvent = eiffelEventTypes.EiffelTestCaseStartedEvent([testTriggeredEvent.meta.id]);
//events.push(testTriggeredEvent);
//events.push(testStartedEvent);

// tests fail
//const testFinishedEvent = eventCreator.eiffelEvent("EiffelTestCaseFinishedEvent", [testTriggeredEvent.meta.id]);
//events.push(testFinishedEvent);

// dev creates related card in trello
//const trelloCardCreated = eventCreator.customTrelloEvent(11, "Integration error at index.js", "createCard", "Trello card created");
//events.push(trelloCardCreated);

// thread created in slack TODO

// dev fixes code
//const codeChange2 = eventCreator.eiffelEvent("EiffelSourceChangeCreatedEvent", [trelloCardCreated.meta.id]);
//const pushCodeEvent2 = eventCreator.eiffelEvent("EiffelSourceChangeSubmittedEvent", [codeChange2.meta.id]);
//events.push(codeChange2);
//events.push(pushCodeEvent2);

// tests pass
//const testFinishedEvent2 = eventCreator.eiffelEvent("EiffelTestCaseFinishedEvent", [pushCodeEvent2.meta.id]);
//events.push(testFinishedEvent2);

// merge
////events.push(eventCreator.eiffelEvent("EiffelSourceChangeSubmittedEvent", [testFinishedEvent2.meta.id]));

// trello card moved to finished list




const dev_makes_branch = eiffelEventTypes.EiffelSourceChangeCreatedEvent([]); // main?
//const art = eiffelEventTypes.EiffelArtifactCreatedEvent([dev_makes_branch.meta.id], 'CAUSE');
const test_case_1 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([dev_makes_branch.meta.id], 'IUT');
const test_case_2 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([dev_makes_branch.meta.id], 'IUT');
const test_run_1 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_1.meta.id], 'TEST_CASE_EXECUTION');
const test_run_2 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_2.meta.id], 'TEST_CASE_EXECUTION');
const test_done_1 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_1.meta.id], 'TEST_CASE_EXECUTION', 'FAILED');
const test_done_2 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_2.meta.id], 'TEST_CASE_EXECUTION', 'FAILED');

const issue_opened = eiffelEventTypes.CustomTrelloEvent(
  11,
  "Integration error at index.js",
  "createCard",
  "Trello card created",
  [dev_makes_branch.meta.id],
  'CAUSE',
  ['weak']
);

const dev_makes_branch_2 = eiffelEventTypes.EiffelSourceChangeCreatedEvent([dev_makes_branch.meta.id], 'BASE'); // maybe this should be connected to the first scc
//const art2 = eiffelEventTypes.EiffelArtifactCreatedEvent([dev_makes_branch_2.meta.id], 'CAUSE');
const test_case_3 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([dev_makes_branch_2.meta.id], 'IUT');
const test_case_4 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([dev_makes_branch_2.meta.id], 'IUT');
const test_run_3 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_3.meta.id], 'TEST_CASE_EXECUTION');
const test_run_4 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_4.meta.id], 'TEST_CASE_EXECUTION');

const test_done_3 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_3.meta.id], 'TEST_CASE_EXECUTION', 'PASSED');
const test_done_4 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_4.meta.id], 'TEST_CASE_EXECUTION', 'PASSED');
const dev_merge_branch = eiffelEventTypes.EiffelSourceChangeSubmittedEvent([dev_makes_branch.meta.id, dev_makes_branch_2.meta.id], 'CAUSE');

const issue_closed = eiffelEventTypes.CustomTrelloEvent(
  12,
  "Integration solved",
  "updateCard",
  "Trello card moved to finished list",
  [dev_merge_branch.meta.id, issue_opened.meta.id],
  'CAUSE',
  ['weak', 'strong']
);


events.push(dev_makes_branch);
//events.push(art);
events.push(test_case_1);
events.push(test_case_2);
events.push(test_run_1);
events.push(test_run_2);
events.push(test_done_1);
events.push(test_done_2);

events.push(issue_opened);

events.push(dev_makes_branch_2);
//events.push(art2);
events.push(test_case_3);
events.push(test_case_4);
events.push(test_run_3);
events.push(test_run_4);
events.push(test_done_3);
events.push(test_done_4);
events.push(dev_merge_branch);

events.push(issue_closed);


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

for (let i = 0; i < events.length; i++) {
    eventSender.submitEvent(events[i]);
    await delay(250);
}
