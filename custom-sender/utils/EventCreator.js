import { GenerateV4UUID } from "./generateV4UUID.js";

export class EventCreator {

  idGen = new GenerateV4UUID();

  constructor() {
    this.idGen = new GenerateV4UUID();
  }


  artifactCreatedEvent(uuid) {
    let eiffelDataObj = {
      meta: {
        type: "EiffelArtifactCreatedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Trello", "card-created"]
      },
      data: {
        identity: "pkg:trello/card@1.0.0",
        name: "Trello card created"
      },
      links: []
    };
    return eiffelDataObj;
  }

  customTrelloEvent(uuid) {
    let eiffelDataObj = {
      meta: {
        type: "EiffelArtifactCreatedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Trello", "card-created"]
      },
      data: {
        identity: "pkg:trello/card@1.0.0",
        name: "Trello card created",
        customData: [
          {
            key: "trelloActivity",
            value: {
              message: "Trello card created",
              id: 24
            }
          }
        ]
      },
      links: [
        {
          type: "CAUSE",
          target: "e607afc5-4c60-446f-a740-fb1cd238370a"
        }
      ]
    };
    return eiffelDataObj;
  }
} 
