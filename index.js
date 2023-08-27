// index.js
// where your node app starts


// init project
const express = require('express');

require('dotenv').config()

//Validator allow you to check valis url's
const validator = require('validator');

//Middleware to parse incoming request bodies. 
const bodyParser = require('body-parser');
//nedb: A lightweight embedded database. We use this to store our original URLs and their associated short codes.
const Datastore = require('nedb');


const app = express();

//db: This initializes a new NeDB database that's saved to the file urls.db. The autoload: true option makes sure the database loads automatically when we start our server.
const db = new Datastore({ filename: 'urls.db', autoload: true });

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//tells Express to use body-parser for parsing the body of incoming JSON requests
app.use(bodyParser.urlencoded({ extended: false }));


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//CREATE AND ENDPOINT THAT PROVIDE THE UNIX TIMESTAMP AND UTC STRING FOR A GIVEN DATE STRING
app.get("/api/:date_string?", function(req, res) {
    let dateString = req.params.date_string;

    if (!dateString) {
        // If no date_string is provided, return the current time
        const now = new Date();
        return res.json({unix: now.getTime(), utc: now.toUTCString()});
    }

    // Initialize date either from string or unix timestamp
    let date;
    if (isNaN(dateString)) {
        date = new Date(dateString);
    } else {
        date = new Date(parseInt(dateString));
    }

    if (date.toString() === "Invalid Date") {
        return res.json({ error: "Invalid Date" });
    } else {
        return res.json({ unix: date.getTime(), utc: date.toUTCString() });
    }
});

//CREAT AN ENDPOINT THAT PROVIDE THE IP ADDRESS, LANGUAGE, AND USER AGENT FOR THE REQUEST
app.get("/whoami", (req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"]
  });
})

//This endpoint will return the original URL associated with the short code.
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Check if URL is valid through validator
  if (!validator.isURL(url, { require_protocol: true, require_host: true })) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL exists
  db.findOne({ original: url }, (err, doc) => {
      if (err) {
          return res.json({ error: 'An error has occurred' });
      }
      
      // If URL exists, return the short code
      if (doc) {
          return res.json({ original_url: doc.original, short_url: doc._id });
      }

      // If URL does not exist, insert it into the database and return the short code
      db.insert({ original: url }, (err, newDoc) => {
          if (err) {
              return res.json({ error: 'An error has occurred' });
          }
          return res.json({original_url: newDoc.original, short_url: newDoc._id });
      });
  })
})

//This endpoint will return the original URL associated with the short code.
app.get('/api/shorturl/:id', (req, res) => {
    const { id } = req.params;

    db.findOne({ _id: id }, (err, doc) => {
        if (doc) {
            res.redirect(doc.original);
        } else {
            res.status(404).send('URL not found');
        }
    });
});


//Endpoint to create a user
app.post('/api/users', (req, res) => {
    const { username } = req.body;

    // Check if username exists if not add the user to the database
    db.findOne({ username }, (err, doc) => {
        if (err) {
        return res.status(400).json({ error: 'An error has occurred' });
        }

        if (doc) {
        return res.status(400).json({ error: 'username already exists' });
        }

        if (!username) {
        return res.status(400).json({ error: 'username is required' });
        }

        // If username does not exist, insert it into the database and return the short code    
        db.insert({ username }, (err, newDoc) => {
            if (err) {
                return res.status(500).json({ error: 'An error occurred while inserting the user' });
            }
            return res.json({ username: newDoc.username, _id: newDoc._id });
        });
    })
  
})


// listen for requests :)
const listener = app.listen(process.env.PORT  || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
