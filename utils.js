function timerStart() {
  return process.hrtime();
}

function timerEnd(startTime) {
  const diff = process.hrtime(startTime);
  return (diff[0] * 1e9 + diff[1]) / 1e6; // milliseconds
}

module.exports = { timerStart, timerEnd };
