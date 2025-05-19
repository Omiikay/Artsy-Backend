const crypto = require('crypto');

/**
 * Generate Gravatar URL for an email
 * @param {string} email User email
 * @param {number} size Image size in pixels
 * @returns {string} Gravatar URL
 */
const getGravatarUrl = (email, size = 200) => {
  if (!email) {
    return null;
  }

  // Trim leading/trailing whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase();
  
  // Create an MD5 hash of the normalized email
  const emailHash = crypto.createHash('md5').update(normalizedEmail).digest('hex');
  
  // Construct the Gravatar URL
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon`;
};

module.exports = { getGravatarUrl };
