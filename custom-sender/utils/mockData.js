import { EventCreator } from './EventCreator.js';
import { EventSender } from './EventSender.js';

const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");

var events = [];

events.push(eventCreator.eiffelEvent("EiffelArtifactCreatedEvent"));

// dev pushes code

// tests run

// tests fail

// dev creates related card in trello

// thread created in slack

// dev fixes code

// tests pass

// trello card moved to finished list

for (let i = 0; i < events.length; i++) {
  eventSender.submitEvent(events[i]);
}

