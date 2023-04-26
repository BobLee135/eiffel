export class AddTimeToTimestamp {
  addTimeToTimestamp(baseTimestamp, days, hours, minutes) {
    // Convert days, hours, and minutes to milliseconds
    const dayInMs = 24 * 60 * 60 * 1000;
    const hourInMs = 60 * 60 * 1000;
    const minuteInMs = 60 * 1000;
    const daysInMs = days * dayInMs;
    const hoursInMs = hours * hourInMs;
    const minutesInMs = minutes * minuteInMs;
  
    // Calculate the total time to add in milliseconds
    const totalTimeInMs = daysInMs + hoursInMs + minutesInMs;
  
    // Calculate the final timestamp by adding the total time to the base timestamp
    const resultTimestamp = new Date(baseTimestamp + totalTimeInMs);
  
    return resultTimestamp;
  }
}