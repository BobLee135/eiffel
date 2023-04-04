function artifactCreatedEvent(uuid) {
    let eiffelDataObj = {
        meta: {
            type: "EiffelArtifactCreatedEvent",
            version: "3.0.0",
            time: new Date().getTime(), // Current time in milliseconds
            id: uuid,
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

module.exports = artifactCreatedEvent;