
export class GenerateV4UUID {
  generateV4UUID() {
    const hexDigits = '0123456789abcdef';
    let uuid = '';

    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        // Set the version to 4 (time-based UUID)
        uuid += '4';
      } else if (i === 19) {
        // Set the variant to the 8, 9, A, or B (clock-seq-and-reserved)
        const randomHexDigit = hexDigits[Math.floor(Math.random() * 4) + 8];
        uuid += randomHexDigit;
      } else {
        // Generate a random hex digit
        const randomHexDigit = hexDigits[Math.floor(Math.random() * 16)];
        uuid += randomHexDigit;
      }
    }

    return uuid;
  }
}
