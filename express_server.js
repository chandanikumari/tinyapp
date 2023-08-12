const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("view engine", "ejs");

const generateRandomString = function() {
  const alphanum = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < 6; i++) {
    let StrIndex = Math.floor(Math.random() * 61);
    str += alphanum[StrIndex];
  }
  return str;
};

// TODO come back tooo
const urlsForUser = function (userID, database) {
  console.log('beginning of fundtion',userID, database);
  let userURLs = {};
  for (const url in database) {
    if (database[url].userID === userID) {
      userURLs[url] = database[url];
    }
  }
  console.log('urlsForUser', userURLs);
  return userURLs;
};




const getUserByEmail = function(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

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
  asdfz: {
    id: "asdfz",
    email: "xyz@abc.com",
    password: "asdf",
  },
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send('<h1> you must be logged in to shorten the URL </h1>');
  }
  const urls = urlsForUser(userID, urlDatabase);
  console.log('urls', urls);
  const templateVars = {
    urls: urls,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send('<h1> you must be logged in to view the shorten URL </h1>');
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(401).send('<h1> you are not authoried to view this shorten URL </h1>');
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

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send('<h1> you must be logged in to creat short URLs </h1>');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID };
  res.redirect(`urls/${shortURL}`);
});

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
  const userID = req.cookies.user_id;
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
  console.log("New URL at GET is : ", urlDatabase);
  res.redirect(`urls/${req.params.id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const userID = req.cookies.user_id;
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
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  const userID = getUserByEmail(submittedEmail, users);
  if (getUserByEmail(submittedEmail, users)) {
    if (submittedPassword === users[userID].password) {
      res.cookie("user_id", userID);
      res.redirect('/urls');
    }
  } else {
    return res.sendStatus(403);
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  console.log(req.cookies);
  res.redirect("/login");
});

// REGISTER
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  if (userID) {
    res.redirect("/urls");
  }
  const templateVars = {user: users[userID]};
  console.log("TemplateVars : ",templateVars);
  res.render("urls_register", templateVars);
});

//create a registration handler
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  //if email or password are empty
  if (!submittedEmail || !submittedPassword) {
  //send back response with 400 status code
    return res.status(400).send('<h1>400 - Please enter valid email and password! </h1>');
  //if someone tries to register with email that already in user object
  }  else if (getUserByEmail(submittedEmail, users)) {
    //send back response with the 400 status code
    return res.status(400).send('<h1>400 - This email is already in use </h1>');
  } else {
    users[userID] = {
      id: userID,
      email: submittedEmail,
      password: submittedPassword
    };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});