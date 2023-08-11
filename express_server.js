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

const addUser = function(email, password) {
  const id = generateRandomString();
  userDatabase[id] = {
    id,
    email,
    password
  };
  return id;
};

const getUserByEmail = function(email, userDatabase) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[userID],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id],
    tinyUrl: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const tinyUrl = generateRandomString();
  urlDatabase[tinyUrl] = req.body.longURL;
  res.redirect(`urls/${tinyUrl}`);
});

app.get("/u/:id", (req, res) => {
  //console.log(req);
  const longURL = urlDatabase[req.params.id];
  res.redirect(`urls/${longURL}`);
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {
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
  urlDatabase[req.params.id].longURL = req.body.newURL;
  console.log("New URL is : ", urlDatabase);
  res.redirect("/urls");
});

// LOGIN
app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[userID],
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  const userID = getUserByEmail(submittedEmail, userDatabase);
  if (getUserByEmail(submittedEmail, userDatabase)) {
    if (submittedPassword === userDatabase[userID].password) {
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
  const templateVars = {user: userDatabase[userID]};
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
  }  else if (getUserByEmail(submittedEmail, userDatabase)) {
    //send back response with the 400 status code
    return res.status(400).send('<h1>400 - This email is already in use </h1>');
  } else {
    userDatabase[userID] = {
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