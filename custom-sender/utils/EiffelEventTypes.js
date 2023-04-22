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

  EiffelArtifactCreatedEvent(links, linkType) {
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
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseTriggeredEvent(links, linkType) {
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
        }
      },
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeCreatedEvent(links, linkType) {
    return {
      meta: {
        type: "EiffelSourceChangeCreatedEvent",
        version: "4.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelSourceChangeSubmittedEvent(links, linkType) {
    return {
      meta: {
        type: "EiffelSourceChangeSubmittedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseStartedEvent(links, linkType) {
    return {
      meta: {
        type: "EiffelTestCaseStartedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links, linkType)
    };
  }

  EiffelTestCaseFinishedEvent(links, linkType, testOutcome) {
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
        }
      },
      links: this.extractLinks(links, linkType)
    };
  }
}