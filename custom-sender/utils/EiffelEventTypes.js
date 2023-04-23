import { GenerateV4UUID } from "./generateV4UUID.js";

export class EiffelEventTypes {
  
  idGen = new GenerateV4UUID();

  extractLinks(links, linkType) {
    let linkList = [];
    for (let i = 0; i < links.length; i++) {
      linkList.push({type: linkType, target: links[i]});
    }
    return linkList;
  }

  CustomTrelloEvent(trelloId, name, type, message, links, linkTypes, linkStrengths) {
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


    return {
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
              id: trelloId,
              name: name,
              activity: message,
              type: type,
              linkType: linkStrengths,
            }
          }
        ]
      },
      links: this.extractLinks(links, linkTypes)
    };
  }









  EiffelArtifactCreatedEvent(links, linkType, message) {
    return {
      meta: {
        type: "EiffelArtifactCreatedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        identity: "pkg:eiffel/test@1.0.0",
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseTriggeredEvent(links, linkType, message) {
    return {
      meta: {
        type: "EiffelTestCaseTriggeredEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        testCase: {
          id: "1",
        },
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeCreatedEvent(links, linkType, message) {
    return {
      meta: {
        type: "EiffelSourceChangeCreatedEvent",
        version: "4.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeSubmittedEvent(links, linkType, message) {
    return {
      meta: {
        type: "EiffelSourceChangeSubmittedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseStartedEvent(links, linkType, message) {
    return {
      meta: {
        type: "EiffelTestCaseStartedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseFinishedEvent(links, linkType, testOutcome, message) {
    return {
      meta: {
        type: "EiffelTestCaseFinishedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        outcome: {
          verdict: testOutcome,
          conclusion: testOutcome === "PASSED" ? "SUCCESSFUL" : "FAILED"
        },
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              activity: message,
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }
}