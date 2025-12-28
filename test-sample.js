// Sample test file for GitHub Models AI review

/**
 * Add two numbers
 */
function add(a, b) {
  // Missing input validation
  return a + b;
}

/**
 * Fetch user data from API
 */
async function fetchUser(userId) {
  // Potential security issue: no input sanitization
  const response = await fetch(`https://api.example.com/users/${userId}`);

  // Missing error handling
  const data = await response.json();

  return data;
}

/**
 * Process array of items
 */
function processItems(items) {
  // Performance issue: using nested loops
  const result = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i !== j) {
        result.push(items[i] + items[j]);
      }
    }
  }

  return result;
}

module.exports = { add, fetchUser, processItems };
