const Axios = require("axios");
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const PORT = 3000
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

var EiffelArtifactCreatedEvent = require('./eventTypes/EiffelArtifactCreatedEvent');


//LOGIN
let auth_token = "";
login();



async function login() {
  await Axios.post("http://16.170.107.18:9000/login", {
    name: "Albin",
    password: "password123"
  }).then(response => {
    auth_token = response.headers["auth-token"];
  }).catch(error => {
    console.log("could authenticate: " + error);
  });
}

// Trello event handling
app.post("/webhook", async (req,res) => {
  var body = req.body
  var actionType = body.action.type
  var data = body.action.data
  var card = data.card

  var eventDataObj;
  var uuid = generateV4UUID();
  switch (actionType) {
      // CARD ACTIONS
      case "createCard":
          console.log("Created " + card.name + " that has id " + card.idShort);
          eventDataObj = EiffelArtifactCreatedEvent(uuid);
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

  // Post event
  const parameterObj = {
    sendToMessageBus: true,
    edition: "agen-1"
  };

  let config = {
    headers: { "auth-token": auth_token }
  };
  
  
  await Axios.post(
    "http://16.170.107.18:9000/submitevent",
    { eventDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("something went wrong : " + error);
  });

  res.status(200).end()
})

// Required routes
app.head("/webhook", (req,res) => {
  res.status(200).end()
})
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/src/html/index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})

// Generate V4UUID
function generateV4UUID() {
  const hexDigits = '0123456789abcdef';
  let uuid = '';

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      // Set the version to 4 (time-based UUID)
      uuid += '4';
    } else if (i === 19) {
      // Set the variant to the 8, 9, A, or B (clock-seq-and-reserved)
      const randomHexDigit = hexDigits[Math.floor(Math.random() * 4) + 8];
      uuid += randomHexDigit;
    } else {
      // Generate a random hex digit
      const randomHexDigit = hexDigits[Math.floor(Math.random() * 16)];
      uuid += randomHexDigit;
    }
  }

  return uuid;
}

/*
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
*/
