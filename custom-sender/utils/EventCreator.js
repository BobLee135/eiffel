import { GenerateV4UUID } from "./generateV4UUID.js";

export class EventCreator {

  idGen = new GenerateV4UUID();

  constructor() {
    this.idGen = new GenerateV4UUID();
  }


  eiffelEvent(type, links) {
    let linkList = [];
    for (let i = 0; i < links.length; i++) {
      linkList.push({type: 'CAUSE', target: links[i]});
    }
    let eiffelDataObj = {
      meta: {
        type: type,
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        identity: "someEventSource",
        name: "Event"
      },
      links: linkList
    };
    return eiffelDataObj;
  }

  customTrelloEvent(id, name, type, linkType, linkEventId, message) {
    let eiffelType = "EiffelArtifactCreatedEvent";
    let tag;
    switch (type) {
      case 'createCard':
        tag = "card-created";
        break;
      case 'updateCard':
        tag = "card-modified";
        break;
      case 'deleteCard':
        tag = "card-deleted";
        break;
      default:
        message = "Other Trello event";
        tag = "card-event";
    }


    let eiffelDataObj = {
      meta: {
        type: eiffelType,
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Trello", tag]
      },
      data: {
        identity: "pkg:trello/card@1.0.0",
        name: message,
        customData: [
          {
            key: "trelloActivity",
            value: {
              id: id,
              name: name,
              message: message,
              type: type,
              linkType: linkType,
            }
          }
        ]
      },
      links: linkEventId !== undefined ? [
        {
          type: "CAUSE",
          target: linkEventId
        }
      ] : []
    };
    return eiffelDataObj;
    
  }
} 
