import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
//import { EventCreator } from './utils/EventCreator.js';
import { EventSender } from './utils/EventSender.js';
import { EiffelEventTypes } from './utils/EiffelEventTypes.js';
import { LinkFinder } from './utils/LinkFinder.js';


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


const PORT = 3005;


//const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");
const eiffelEventTypes = new EiffelEventTypes();
const linkFinder = new LinkFinder();

// Trello event handling
app.post("/webhook", async (req,res) => {
  var body = req.body
  var data = body.actions[0].data
  var card = data.card
  var actionType = data.type

  var eventDataObj;
  var connection;
  switch (actionType) {
      // CARD ACTIONS
      case "createCard":
          console.log("Created " + card.name + " that has id " + card.idShort);
          eventDataObj = eiffelEventTypes.CustomTrelloEvent(
            card.idShort,
            "Integration error at index.js",
            actionType,
            "Trello card created",
            [],
            '',
            []
          );
          eventSender.submitEvent(eventDataObj);
          break;
      case "updateCard":
          console.log("Updated " + card.name + " that has id " + card.idShort);
          connection = await linkFinder.findLink(card.idShort)
          eventDataObj = eiffelEventTypes.CustomTrelloEvent(
            card.idShort,
            "Integration error at index.js",
            actionType,
            "Trello card moved",
            connection !== undefined ? [connection.id] : [],
            connection !== undefined ? 'CAUSE': '',
            connection !== undefined ? [connection.linkStrength] : []
          );
          eventSender.submitEvent(eventDataObj);
          break;
      case "deleteCard":
          console.log("Deleted " + card.name + " that has id " + card.idShort);
          connection = await linkFinder.findLink(card.idShort)
          eventDataObj = eiffelEventTypes.CustomTrelloEvent(
            card.idShort,
            "Integration error at index.js",
            actionType,
            "Trello card deleted",
            connection !== undefined ? [connection.id] : [],
            connection !== undefined ? 'CAUSE': '',
            connection !== undefined ? [connection.linkStrength] : []
          );
          eventSender.submitEvent(eventDataObj);
          break;
      case "addChecklistToCard":
          console.log("Added checklist to " + card.name + " that has id " + card.idShort);
          break;
      case "removeChecklistFromCard":
          console.log("Removed checklist from " + card.name + " that has id " + card.idShort);
          break;
      case "addMemberToCard":
          console.log("Added a member to " + card.name + " that has id " + card.idShort);
          break;
      case "removeMemberFromCard":
          console.log("Removed a member from " + card.name + " that has id " + card.idShort);
          break;
  }
  res.status(200).end()
})

// Required routes
app.head("/webhook", (req,res) => {
  res.status(200).end()
})

// Non-working function for some reason
app.post('/testEvent', async (req, res) => {
  console.log("body : " + JSON.stringify(req.body));
  const id = req.body.id;
  const name = req.body.name;                     
  const type = req.body.type;
  const linkType = req.body.linkType;
  const linkEventId = req.body.linkEventId;

  console.log(linkEventId);

  const eventDataObj = eiffelEventTypes.CustomTrelloEvent(id, name, type, linkType, linkEventId);
  eventSender.submitEvent(eventDataObj);
  console.log("Created new test event");
  res.status(200).send("Test event created successfully");
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/src/html/index.html'))
})


// Start server
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
