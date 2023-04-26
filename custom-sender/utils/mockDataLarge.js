import { EventSender } from './EventSender.js';
import fs from 'fs';

const eventSender = new EventSender("http://16.170.107.18:9000");

function readJsonFileAndCreateObjects(callback) {
  fs.readFile('../eiffelevents.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return callback(err);
    }
    try {
      const jsonData = JSON.parse(data);
      const objects = jsonData.map((item) => {
        return {
          links: item.links,
          meta: item.meta,
          data: item.data,
        };
      });
      callback(null, objects);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      callback(err);
    }
  });
}

readJsonFileAndCreateObjects(async (err, objects) => {
  for (let i = 0; i < objects.length; i++) {
    console.log('Sending event:', objects[i].meta.type);
    eventSender.submitEvent(objects[i]);
    await delay(200);
  };
});


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
