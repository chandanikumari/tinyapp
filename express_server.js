const express = require("express");
const morgan = require('morgan');

const app = express();
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));


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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
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

// Delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Edit

app.get("/urls/:id/edit",  (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`urls/${req.params.id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});