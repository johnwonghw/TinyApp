var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "1": {
    id: "1", 
    email: "boblee@example.com", 
    password: "1234"
  },
 "2": {
    id: "2", 
    email: "gilbtwo@example.com", 
    password: "3456"
  }
}

function generateRandomString () {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible .charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


function userFinder (object) {
  for (var uid in users) {
    if (users[uid].email === object) {
      return users[uid];
    }
  }
  return undefined;
};

function passwordFinder (object) {
  for (var uid in users) {
    if (users[uid].password === object) {
      return users[uid];
    }
  }
  return undefined;
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_ID: req.cookies.user_ID}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user_ID: req.cookies.user_ID}
  res.render("urls_new", templateVars);
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
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user_ID: req.cookies.user_ID
  };
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
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {user_ID: req.cookies.user_ID}
  res.render("urls_login", templateVars)
})
app.post("/login", (req, res) => {
 const {loginemail, loginpassword} = req.body;
  const user = userFinder(loginemail);
  const userpass = passwordFinder(loginpassword);
  if (!user) {
    return res.sendStatus(403)
  }
  else {
    if (user.password !== loginpassword) {
      return res.sendStatus(403)
    }}
  // compare saved PW and given password
  res.cookie('user_ID', user.id);
  res.redirect('/')
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls')
});

app.get("/register", (req, res) => {
  let templateVars = { 
    user_ID: req.cookies.user_ID
  };
  res.render("urls_register", templateVars);
});


function findEmail (emailstr) {
    return users.email
}

app.post("/register", (req, res) => {
  const newID = generateRandomString()
  const {email, password} = req.body;
  
  if (!email || !password) {
    return res.sendStatus(400)
  }
  
  if (!!userFinder(email)) {
    return res.sendStatus(400)
  }

  users[newID] = {
    id: newID,
    email,
    password
  }
  res.cookie("user_ID", newID);
  console.log (users);
  return res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});