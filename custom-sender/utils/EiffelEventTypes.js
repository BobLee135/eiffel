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

  EiffelArtifactCreatedEvent(links) {
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
      links: this.extractLinks(links, 'CAUSE')
    };
  }

  EiffelSourceChangeCreatedEvent(links) {
    return {
      meta: {
        type: "EiffelSourceChangeCreatedEvent",
        version: "4.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links, 'CAUSE')
    };
  }

  EiffelSourceChangeSubmittedEvent(links) {
    return {
      meta: {
        type: "EiffelSourceChangeSubmittedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links, 'CAUSE')
    };
  }

  EiffelTestCaseTriggeredEvent(links) {
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
      links: this.extractLinks(links, 'IUT')
    };
  }

  EiffelTestCaseStartedEvent(links) {
    return {
      meta: {
        type: "EiffelTestCaseStartedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links)
    };
  }

  EiffelTestCaseFinishedEvent(links) {
    return {
      meta: {
        type: "EiffelTestCaseFinishedEvent",
        version: "3.0.0",
        time: new Date().getTime(), // Current time in milliseconds
        id: this.idGen.generateV4UUID(),
        tags: ["Eiffel", "event"]
      },
      data: {},
      links: this.extractLinks(links)
    };
  }
}