const Axios = require("axios");
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const PORT = 3000
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

var counter = 0;

app.post("/webhook", (req,res) => {
  var body = req.body
  var actionType = body.action.type
  var data = body.action.data
  var card = data.card
  sendEventToSimpleEventSender();
  counter++;
  switch (actionType) {
      // CARD ACTIONS
      case "createCard":
          console.log("Created " + card.name + " that has id " + card.idShort);
          artifactCreatedEvent();
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

app.head("/webhook", (req,res) => {
  res.status(200).end()
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/src/html/index.html'))
})

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})

function artifactCreatedEvent() {
  var UUID = generateUuidV4();
  let eiffelDataObj = {
    meta: {
      type: "EiffelArtifactCreatedEvent",
      version: "3.0.0",
      time: new Date().getTime(), // Current time in milliseconds
      id: UUID,
      tags: ["Trello", "card-created"]
    },
    data: {
      identity: "pkg:trello/card@1.0.0",
      name: "Trello card created"
    },
    links: []
  };
}

function generateUuidV4() {
  // Generate 16 bytes of random data
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);

  // Set the version (4) and variant bits according to the UUID format
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

  // Format the UUID string with hyphens
  const hexOctets = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0'));
  const uuidStr = `${hexOctets[0]}${hexOctets[1]}${hexOctets[2]}${hexOctets[3]}-${hexOctets[4]}${hexOctets[5]}-${hexOctets[6]}${hexOctets[7]}-${hexOctets[8]}${hexOctets[9]}-${hexOctets[10]}${hexOctets[11]}${hexOctets[12]}${hexOctets[13]}${hexOctets[14]}${hexOctets[15]}`;

  return uuidStr;
}


async function sendEventToSimpleEventSender() {
  const parameterObj = {
    sendToMessageBus: true,
    edition: "agen-1"
  };
  
  let auth_token = "";
  
  await Axios.post("http://13.50.194.101:9000/login", {
    name: "Albin",
    password: "password123"
  }).then(response => {
    auth_token = response.headers["auth-token"];
  }).catch(error => {
    console.log("could authenticate: " + error);
  });
  
  let config = {
    headers: { "auth-token": auth_token }
  };
  
  let eiffelDataObj = {
    meta: {
      type: "EiffelArtifactCreatedEvent",
      version: "3.0.0",
      time: new Date().getTime(), // Current time in milliseconds
      id: "1d967e40-5e71-4c0b-9523-8bf6eb60fa6" + counter,
      source: {
        serializer: "pkg:maven/com.mycompany.tools/eiffel-serializer@1.0.3"
      },
      tags: ["fast-track", "customer-a"]
    },
    data: {
      identity: "pkg:maven/com.mycompany.myproduct/artifact-name@2.1.7",
      fileInformation: [
        {
          name: "debug/launch",
          tags: ["debug", "launcher"]
        },
        {
          name: "test/log.txt"
        },
        {
          name: "bin/launch",
          tags: ["launcher"]
        }
      ],
      buildCommand: "/my/build/command with arguments",
      name: "Full verbose artifact name"
    },
    links: []
  };
  
  // Posting the test event
  await Axios.post(
    "http://13.50.194.101:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("something went wrong : " + error);
  });

  await Axios.post(
    "http://13.50.194.101:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("something went wrong : " + error);
  });
}

