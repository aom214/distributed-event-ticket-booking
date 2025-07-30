/**
 * Utility function to pause execution for a given duration.
 * @param {number} ms - Duration in milliseconds
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = delay;
