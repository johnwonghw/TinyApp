var express = require("express");
var cookieSession = require('cookie-session')
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');

app.use(cookieSession({
  secret: 'banana',
  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  // "b2xVn2": {
  //   long: "http://www.google.ca",
  //   ID: 1,
  // },
  // "s4h5e7": {
  //   long: "http://www.reddit.com",
  //   ID: 1,
  // },
  //  "gesga": {
  //   long: "http://www.hotmail.com",
  //   ID: 2,
  // },
  //  "s4h5gesage7": {
  //   long: "http://www.youtube.com",
  //   ID: 3,
  // }
}

const users = { 
//   "1": {
//     id: "1", 
//     email: "boblee@example.com", 
//     password: "1234"
//   },
//  "2": {
//     id: "2", 
//     email: "gilbtwo@example.com", 
//     password: "3456"
//   }
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

function urlsForUser (id) {
  var userURLS = {};
  for (var item in urlDatabase) {
    if (urlDatabase[item].ID == id) {
      userURLS[item] = urlDatabase[item].long
    }
  }
return userURLS
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  var newUserURLS = urlsForUser(req.session.user_ID)
  let templateVars = {
    URLS: newUserURLS,
    user_ID_urls: urlDatabase[req.session.user_ID], 
    user_ID: req.session.user_ID}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user_ID: req.session.user_ID}
  if (req.session.user_ID === undefined) {
    res.redirect("/login")
  }
  else {
  res.render("urls_new", templateVars)};
});


app.post("/urls/new", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  const newcode = generateRandomString();
  var longUrl = req.body.longURL;
  if (!longUrl.startsWith('http://')) {
    longUrl = 'http://' + longUrl;
  }
    // urlDatabase[newcode] = longUrl
 urlDatabase[newcode] = {long: longUrl, ID: req.session.user_ID}

  // {longUrl: longUrl, user_id: req.cookies.user_ID}
  // urlDatabase[newcode] = req.body.longURL;
console.log(urlDatabase)
  res.redirect(`/urls/${newcode}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id].long, 
    user_ID: req.session.user_ID
  };
  if (urlDatabase[req.params.id].ID == req.session.user_ID) {
  res.render("urls_show", templateVars);
  } else {
    res.sendStatus(403)
  }
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id

//   var longUrl = req.body.longURL;
//   if (!longUrl.startsWith('http://')) {
//     longUrl = 'http://' + longUrl;
//   }
//     // urlDatabase[newcode] = longUrl
//  urlDatabase[newcode] = {long: longUrl, ID: req.cookies.user_ID}

//   // {longUrl: longUrl, user_id: req.cookies.user_ID}
//   // urlDatabase[newcode] = req.body.longURL;


var longUrl = req.body.longURL;
  if (!longUrl.startsWith('http://')) {
    longUrl = 'http://' + longUrl;
  }
    // urlDatabase[newcode] = longUrl
 urlDatabase[shortURL] = {long: longUrl, ID: req.session.user_ID}
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].long;
  if (longURL) {

    res.redirect(longURL)
  }
  else {
    res.sendStatus(404)
  }
});

app.post ("/urls/:id/delete", (req,res) => {
    let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id].long, 
    user_ID: req.session.user_ID
  };
  if (urlDatabase[req.params.id].ID == req.session.user_ID) {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
  } else {
    res.sendStatus(403)
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {user_ID: req.session.user_ID}
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
    if (!bcrypt.compareSync(loginpassword, user.hashed_password)) {
      return res.sendStatus(403)
    }}
  // compare saved PW and given password
  req.session.user_ID = user.id;
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

app.get("/register", (req, res) => {
  let templateVars = { 
    user_ID: req.session.user_ID
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString()
  const {email, password} = req.body;
  const hashed_password = bcrypt.hashSync(password, 10)
  if (!email || !password) {
    return res.sendStatus(400)
  }
  
  if (!!userFinder(email)) {
    return res.sendStatus(400)
  }

  users[newID] = {
    id: newID,
    email,
    hashed_password
  }
  req.session.user_ID = newID;
  console.log (users);
  return res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});