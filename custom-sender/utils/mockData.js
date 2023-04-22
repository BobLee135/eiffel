import { EventCreator } from './EventCreator.js';
import { EventSender } from './EventSender.js';
import { EiffelEventTypes } from './EiffelEventTypes.js';
import { MongoClient } from 'mongodb';

const uri = "mongodb://16.170.107.18:27017/";
const client = new MongoClient(uri);

const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");
const eiffelEventTypes = new EiffelEventTypes();

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




const scc = eiffelEventTypes.EiffelSourceChangeCreatedEvent([]);
const art = eiffelEventTypes.EiffelArtifactCreatedEvent([scc.meta.id], 'CAUSE');
const tct = eiffelEventTypes.EiffelTestCaseTriggeredEvent([scc.meta.id], 'IUT');
const tct3 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([scc.meta.id], 'IUT');
const tcs = eiffelEventTypes.EiffelTestCaseStartedEvent([tct.meta.id], 'TEST_CASE_EXECUTION');
const tcf = eiffelEventTypes.EiffelTestCaseFinishedEvent([tct.meta.id], 'TEST_CASE_EXECUTION', 'FAILED');
const tcf3 = eiffelEventTypes.EiffelTestCaseFinishedEvent([tct.meta.id], 'TEST_CASE_EXECUTION', 'FAILED');
const trelloCardCreated = eventCreator.customTrelloEvent(11, "Integration error at index.js", "createCard", "WEAK", art.meta.id, "Trello card created");
const scc2 = eiffelEventTypes.EiffelSourceChangeCreatedEvent([art.meta.id], 'BASE');
const art2 = eiffelEventTypes.EiffelArtifactCreatedEvent([scc2.meta.id], 'CAUSE');
const tct2 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([art2.meta.id], 'IUT');
const tcs2 = eiffelEventTypes.EiffelTestCaseStartedEvent([tct2.meta.id], 'TEST_CASE_EXECUTION');
const tcf2 = eiffelEventTypes.EiffelTestCaseFinishedEvent([tct2.meta.id], 'TEST_CASE_EXECUTION', 'PASSED');
const scc3 = eiffelEventTypes.EiffelSourceChangeCreatedEvent([scc2.meta.id], 'BASE');

events.push(scc);
events.push(art);
events.push(tct);
events.push(tct3);
events.push(tcs);
events.push(tcf);
events.push(tcf3);
events.push(trelloCardCreated);
events.push(scc2);
events.push(art2);
events.push(tct2);
events.push(tcs2);
events.push(tcf2);
events.push(scc3);




function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

for (let i = 0; i < events.length; i++) {
    eventSender.submitEvent(events[i]);
    await delay(500);
}

/*
async function run() {
  try {
    // Connect the client to the server.
    await client.connect();

    // Get the collection you want to query.
    const collection = client.db("eventDB").collection("EiffelArtifactCreatedEvent");

    // Find all documents in the collection.
    const cursor = collection.find({});

    // Iterate through the documents and print them.
    console.log("Documents in EiffelArtifactCreatedEvent:");
    for await (const doc of cursor) {
      console.log(doc);
    }
  } finally {
    // Close the connection to the MongoDB server.
    await client.close();
  }
}
run().catch(console.error);
*/
