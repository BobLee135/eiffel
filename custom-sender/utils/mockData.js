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
//const trelloCardCreated = eventCreator.customTrelloEvent(11, "Integration error at index.js", "createCard", "Trello card created");
//events.push(trelloCardCreated);

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

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

for (let i = 0; i < events.length; i++) {
    eventSender.submitEvent(events[i]);
    
    await delay(1000);
    console.log("Sent event: " + events[i].meta.id + "");
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
