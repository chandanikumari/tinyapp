const generateRandomString = function() {
  const alphanum = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < 6; i++) {
    let StrIndex = Math.floor(Math.random() * 61);
    str += alphanum[StrIndex];
  }
  return str;
};

const getUserByEmail = function(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

const urlsForUser = function(userID, urlDb) {
  let userURLs = {};
  for (const url in urlDb) {
    if (urlDb[url].userID === userID) {
      userURLs[url] = urlDb[url];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};