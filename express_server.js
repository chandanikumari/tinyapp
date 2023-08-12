const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const {generateRandomString, getUserByEmail, urlsForUser} = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['TQUTF8GzUhPbfMFA5h9iwDzZkzpgNfwn3yFB6'],
}));
app.set("view engine", "ejs");


//url Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "asdfz"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// GET /

app.get("/", (req, res) => {
  const userID = req.session.userId;
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

// GET /urls

app.get("/urls", (req, res) => {
  const userID = req.session.userId;
  if (!userID) {
    return res.status(401).send('<h1> You are not authorized to visit this page </h1>');
  }
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

// POST /urls

app.post("/urls", (req, res) => {
  const userID = req.session.userId;
  if (!userID) {
    return res.status(401).send('<h1> you must be logged in to creat short URLs </h1>');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID };
  res.redirect(`urls/${shortURL}`);
});

// POST /urls/new

app.get("/urls/new", (req, res) => {
  const userID = req.session.userId;
  if (!userID) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: users[userID],
    };
    res.render("urls_new", templateVars);
  }
});

// GET /urls/:id

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.userId;
  if (!userID) {
    return res.status(401).send('<h1> you must be logged in to view the shorten URL </h1>');
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(401).send('<h1> you are not authoried to view this shorten URL </h1>');
  }
  if (urlDatabase[shortURL]) {
    let templateVars = {
      id: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      urlUserID: urlDatabase[shortURL].userID,
      user: users[userID],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('<h1>The short URL doesn\'t exist at this moment</h1>');
  }
});

// GET /u/:id

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('<h1>404 - This short URL does not match with a long URL </h1>');
  }
});

// DELETE

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userId;
  const shortURL = req.params.id;
  if (!userID) {
    res.status(401).send('<h1> you must be logged in to delete this shorten URL </h1>');
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(401).send('<h1> you are not authoried to delete this shorten URL </h1>');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// EDIT

app.get("/urls/:id/edit",  (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`urls/${req.params.id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const userID = req.session.userId;
  const shortURL = req.params.id;
  if (!userID) {
    res.status(401).send('<h1> you must be logged in to edit this shorten URL </h1>');
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(401).send('<h1> you are not authoried to edit this shorten URL </h1>');
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});

// LOGIN
app.get('/login', (req, res) => {
  const userID = req.session.userId;
  const templateVars = {
    user: users[userID],
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  const userID = getUserByEmail(submittedEmail, users);
  if (!getUserByEmail(submittedEmail, users)) {
    return res.status(403).send('<h1>There is no account associated with this email adress</h1>');
  } else if (bcrypt.compareSync(submittedPassword, users[userID].password)) {
    req.session.userId = userID;
    res.redirect('/urls');
  } else {
    return res.status(403).send('<h1>The password does not match with the associated email address</h1>');
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  req.session = null;
  res.redirect("/login");
});

// REGISTER
app.get("/register", (req, res) => {
  const userID = req.session.userId;
  if (!userID) {
    const templateVars = {user: users[userID]};
    return res.render("urls_register", templateVars);
  }
  return res.redirect("/urls");
});


app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  if (!submittedEmail || !submittedPassword) {
    return res.status(400).send('<h1>400 - Please enter valid email and password! </h1>');
  }  else if (getUserByEmail(submittedEmail, users)) {
    return res.status(400).send('<h1>400 - This email is already in use </h1>');
  } else {
    users[userID] = {
      id: userID,
      email: submittedEmail,
      password: bcrypt.hashSync(submittedPassword, 10)
    };
    req.session.userId = userID;
    res.redirect('/urls');
  }
});

// POST /urls/:id

app.post("/urls/:id", (req, res) => {
  const userID = req.session.userId;
  const shortURL = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});

// LISTEN

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});