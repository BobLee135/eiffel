import { MongoClient } from 'mongodb';

const uri = "mongodb://16.170.107.18:27017/";

export class LinkFinder {

  client;

  constructor () {
    this.client = new MongoClient(uri);
  }

  findLink () {
    // for trello events
    //   use description to find the event

    //   for move card event
    //     use the custom data
    //       find the create card event with same id
    //         return id of create card event together with a strong link

    // get latest event and return id

    this.run().catch(console.error);


    return '';
  }

  async run() {
    try {
      // Connect the client to the server.
      await this.client.connect();

      // Get the collection you want to query.
      const collection = this.client.db("eventDB").collection("EiffelArtifactCreatedEvent");

      // Find all documents in the collection.
      const cursor = collection.find({});

      // Iterate through the documents and print them.
      console.log("Documents in EiffelArtifactCreatedEvent:");
      for await (const doc of cursor) {
        console.log(doc);
      }
    } finally {
      // Close the connection to the MongoDB server.
      await this.client.close();
    }
  }

}
