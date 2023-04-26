import { GenerateV4UUID } from "./generateV4UUID.js";

export class EiffelEventTypes {
  
  idGen = new GenerateV4UUID();

  extractLinks(links, linkType) {
    let linkList = [];
    if (links === undefined || links.length === 0) return linkList;
    for (let i = 0; i < links.length; i++) {
      linkList.push({type: linkType, target: links[i]});
    }
    return linkList;
  }

  CustomTrelloEvent(trelloId, name, type, message, links, linkTypes, linkStrengths, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              id: trelloId,
              name: name,
              activity: message,
              type: type,
              linkStrengths: linkStrengths,
            }
          }
        ]
      },
      links: this.extractLinks(links, linkTypes)
    };
  }

  CustomBugEvent(bugId, name, message, links, linkTypes, linkStrengths, time) {
    return {
      meta: {
        type: "EiffelArtifactCreatedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ['bug']
      },
      data: {
        identity: "pkg:bug/issue@1.0.0",
        name: message,
        customData: [
          {
            key: "trelloActivity",
            value: {
              time: time !== undefined ? time : new Date().getTime(),
              id: bugId,
              name: name,
              activity: message,
              type: 'bugFound',
              linkStrengths: linkStrengths,
            }
          }
        ]
      },
      links: this.extractLinks(links, linkTypes)
    };
  }







  EiffelArtifactCreatedEvent(links, linkType, linkStrengths, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }


  EiffelActivityTriggeredEvent (links, linkType, linkStrengths, message, time) {
    return {
      meta: {
        type: "EiffelActivityTriggeredEvent",
        version: "4.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        name: "ActivityTriggered",
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelActivityStartedEvent (links, linkType, linkStrengths, message, time) {
    return {
      meta: {
        type: "EiffelActivityStartedEvent",
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelActivityFinishedEvent (links, linkType, linkStrengths, testOutcome, message, time) {
    return {
      meta: {
        type: "EiffelActivityFinishedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {
        outcome: {
          conclusion: testOutcome
        },
        customData: message !== undefined && message !== '' ? [
          {
            key: "activity",
            value: {
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }


  EiffelTestCaseTriggeredEvent(links, linkType, linkStrengths, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }
  
  EiffelTestCaseStartedEvent(links, linkType, linkStrengths, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseFinishedEvent(links, linkType, linkStrengths, testOutcome, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeCreatedEvent(links, linkType, linkStrengths, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeSubmittedEvent(links, linkType, linkStrengths, message, time) {
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
              time: time !== undefined ? time : new Date().getTime(),
              activity: message,
              linkStrengths: linkStrengths
            }
          }
        ] : undefined
      },
      links: this.extractLinks(links, linkType)
    };
  }
}