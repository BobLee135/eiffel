const Axios = require("axios");

sendEventToSimpleEventSender();

async function sendEventToSimpleEventSender() {
  const parameterObj = {
    sendToMessageBus: true,
    edition: "agen-1"
  };
  
  let auth_token = "";
  
  await Axios.post("http://localhost:9000/login", {
    name: "Albin",
    password: "password123"
  }).then(response => {
    auth_token = response.headers["auth-token"];
  }).catch(error => {
    console.log("could not do stuff because of : " + error);
  });
  
  let config = {
    headers: { "auth-token": auth_token }
  };
  
  let eiffelDataObj = {
    meta: {
      type: "EiffelArtifactCreatedEvent",
      version: "3.0.0",
      time: 1234567890,
      id: "1d967e40-5e71-4c0b-9523-8bf6eb60fa66",
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
    "http://localhost:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("fuck something went wrong : " + error);
  });

  await Axios.post(
    "http://localhost:9000/submitevent",
    { eiffelDataObj, parameterObj },
    config
  ).then(function(response) {
    console.log(response + "-message sent");
  }).catch(function(error) {
    console.log("fuck something went wrong : " + error);
  });
}

