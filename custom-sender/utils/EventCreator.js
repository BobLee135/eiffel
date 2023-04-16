import { GenerateV4UUID } from "./generateV4UUID.js";

export class EventCreator {

  idGen = new GenerateV4UUID();

  constructor() {
    this.idGen = new GenerateV4UUID();
  }


  artifactCreatedEvent() {
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

  customTrelloEvent(id, name, type) {
    let eiffelType;
    let message;
    switch (type) {
      case 'createCard':
        eiffelType = "EiffelArtifactCreatedEvent";
        message = "Trello card created";
        break;
      case 'updateCard':
      case 'deleteCard':
      default:
        eiffelType = "EiffelArtifactCreatedEvent";
        message = "Other Trello event";
    }


    let eiffelDataObj = {
      meta: {
        type: eiffelType,
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
              id: id,
              name: name,
              message: message,
              type: type
            }
          }
        ]
      },
      links: [
        {
          type: "CAUSE",
          target: "ee7f16ab-702c-49c0-bfd6-3c5e55f1697c"
        }
      ]
    };
    return eiffelDataObj;
    
  }
} 
