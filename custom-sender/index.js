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





async function sendEventToSimpleEventSender() {
  const parameterObj = {
    sendToMessageBus: true,
    edition: "agen-1"
  };
  
  let auth_token = "";
  
  await Axios.post("http://13.49.183.142:9000/login", {
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
    "http://13.49.183.142:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("something went wrong : " + error);
  });

  await Axios.post(
    "http://13.49.183.142:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("something went wrong : " + error);
  });
}

