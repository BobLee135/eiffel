export class AddTimeToTimestamp {
  addTime(baseTimestamp, hours) {
    // Convert days, hours, and minutes to milliseconds
    const hourInMs = 60 * 60 * 1000;
    const hoursInMs = hours * hourInMs;
  
    // Calculate the total time to add in milliseconds
    const totalTimeInMs = hoursInMs;
  
    // Calculate the final timestamp by adding the total time to the base timestamp
    const resultTimestamp = new Date(baseTimestamp + totalTimeInMs);
  
    return resultTimestamp;
  }
}