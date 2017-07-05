var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString () {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible .charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  const newcode = generateRandomString();
  if (req.body.longURL.includes('http://')) {
    urlDatabase[newcode] = req.body.longURL
  } else {
    let longURL = 'http://' + req.body.longURL
    urlDatabase[newcode] = longURL
  }
  // urlDatabase[newcode] = req.body.longURL;

  res.redirect(`/urls/${newcode}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  if (req.body.longURL.includes('http://')) {
    urlDatabase[shortURL] = req.body.longURL;
  } else {
    let longURL = 'http://' + req.body.longURL
    urlDatabase[shortURL] = longURL
  }
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) { 
    // evaluateURL (longURL) 
    // if (longURL.includes('http://')) {
    // res.redirect(longURL)
    // }
    // else {
    // res.redirect('http://' + longURL)
    res.redirect(longURL)
  }
  else {
    res.sendStatus(404)
  }
});

app.post ("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});