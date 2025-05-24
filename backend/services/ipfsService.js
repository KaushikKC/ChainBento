const { create } = require("ipfs-http-client");
const { Buffer } = require("buffer");
require("dotenv").config();

// Configure IPFS client
// Using Infura IPFS service as an example
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_PROJECT_SECRET}`
    ).toString("base64")}`,
  },
});

/**
 * Store message content on IPFS
 * @param {Object} messageData - Message data to store
 * @returns {Promise<string>} IPFS content hash (CID)
 */
async function storeMessage(messageData) {
  try {
    // Ensure the message has a timestamp
    const messageWithTimestamp = {
      ...messageData,
      timestamp: messageData.timestamp || new Date().toISOString(),
    };

    // Convert the message data to a Buffer
    const messageBuffer = Buffer.from(JSON.stringify(messageWithTimestamp));

    // Add the content to IPFS
    const result = await ipfs.add(messageBuffer);

    // Return the content identifier (CID)
    return result.path;
  } catch (error) {
    console.error("Error storing message on IPFS:", error);
    throw error;
  }
}

/**
 * Retrieve message content from IPFS
 * @param {string} cid - IPFS content identifier
 * @returns {Promise<Object>} Message data
 */
async function retrieveMessage(cid) {
  try {
    const chunks = [];

    // Get the content from IPFS
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }

    // Combine chunks and parse the JSON
    const content = Buffer.concat(chunks).toString();
    return JSON.parse(content);
  } catch (error) {
    console.error("Error retrieving message from IPFS:", error);
    throw error;
  }
}

module.exports = {
  storeMessage,
  retrieveMessage,
};
