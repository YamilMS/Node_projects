// index.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//Create endpoint that display date
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



// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
