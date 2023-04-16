import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Axios from 'axios';
import { EventCreator } from './utils/EventCreator.js';


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


const PORT = 3005;
const EASY_EVENT_RABBIT_IP_ADDRESS = "http://16.170.107.18:9000";


const eventCreator = new EventCreator();

// Trello event handling
app.post("/webhook", async (req,res) => {
  var body = req.body
  var actionType = body.action.type
  var data = body.action.data
  var card = data.card

  var eventDataObj;
  switch (actionType) {
      // CARD ACTIONS
      case "createCard":
          console.log("Created " + card.name + " that has id " + card.idShort);
          eventDataObj = eventCreator.customTrelloEvent(card.idShort, card.name, card.actions[0].type);
          submitEvent(eventDataObj);
          break;
      case "updateCard":
          console.log("Updated " + card.name + " that has id " + card.idShort);
          break;
      case "deleteCard":
          console.log("Deleted " + card.name + " that has id " + card.idShort);
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
/*
{
  "id": 23,
  "name": "bug detected",
  "type": "createCard",
  "linkType": "STRONG",
  "linkEventId": "ee7f16ab-702c-49c0-bfd6-3c5e55f1697c"
}
*/
app.post('/testEvent', (req, res) => {
  console.log("body : " + req.body);
  const id = req.body.id;
  const name = req.body.name;                     
  const type = req.body.type;
  const linkType = req.body.linkType;
  const linkEventId = req.body.linkEventId;

  console.log(linkEventId);

  const eventDataObj = eventCreator.customTrelloEvent(id, name, type, linkType, linkEventId);
  submitEvent(eventDataObj);
  console.log("Created new test event");
  res.status(200).send("Test event created successfully");
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/src/html/index.html'))
})


/*
 *  Axios functions used to send post requests to the SimpleEventSender
 */

async function login() {
  let auth_token;

  await Axios.post(`${EASY_EVENT_RABBIT_IP_ADDRESS}/login`, {
    name: "Albin",
    password: "password123"
  }).then(response => {
    auth_token = response.headers["auth-token"];
    console.log("authenticated: " + auth_token);
  }).catch(error => {
    console.log("could not authenticate: " + error);
  });

  return auth_token;
}

async function submitEvent(eiffelDataObj) {
  const auth_token = await login();

  console.log(auth_token);

  const parameterObj = {
    sendToMessageBus: true,
    edition: "agen-1"
  };

  let config = {
    headers: { "auth-token": auth_token }
  };

  await Axios.post(
    `${EASY_EVENT_RABBIT_IP_ADDRESS}/submitevent`,
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error details:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  });
}


// Start server
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
