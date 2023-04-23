import { MongoClient } from 'mongodb';

const uri = "mongodb://16.170.107.18:27017/";

export class LinkFinder {

  client;

  constructor () {
    this.client = new MongoClient(uri);
  }

  async findLink (trelloId) {
    let result = await this.run(trelloId);
    return result;
  }

  async run(trelloId) {
    try {
      // Connect the client to the server.
      await this.client.connect();

      // Get the collection you want to query.
      const collection = this.client.db("eventDB").collection("EiffelArtifactCreatedEvent");

      // Find the document with the specified trelloId and type.
      const query = {
        "data.customData": {
          $elemMatch: {
            key: "trelloActivity",
            "value.id": trelloId,
            "value.type": 'createCard'
          }
        }
      };

      const cursor = await collection.findOne(query);

      if (!cursor) {
        console.log("No connection found.");
        return {};
      }

      // Decide the strength of the link based on the type.
      const linkStrength = 'strong'

      const result = {
        id: cursor.meta.id,
        linkStrength: linkStrength
      };

      console.log("Result:", result);
      return result;
    } finally {
      // Close the connection to the MongoDB server.
      await this.client.close();
    }
  }
}
