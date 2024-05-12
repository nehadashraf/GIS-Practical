const NodeGeocoder = require("node-geocoder");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Country = require('./locationModel')
const axios = require("axios");
const bodyParser = require('body-parser');
const express = require('express');
let app = express();

const options = {
  provider: "google",
  apiKey: "AIzaSyAPnmaaaH17KSQ0s9yLxXY_LmqnejBwLEQ",
};
const geocoder = NodeGeocoder(options);

dotenv.config();
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const googleMapsClient = require("@google/maps").createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
});

googleMapsClient.geocode(
  { address: "Ismailia,Egypt" },
  function (err, response) {
    app.get("/ge-coding", (req, res) => {
      if (!err) {
        console.log(response.json.results);
        res.json(response.json.results);
      }
    });
  }
);

app.get("/", (req, res) => {
  res.render("index", { apiKey: process.env.GOOGLE_MAPS_API_KEY });
});
app.set("view engine", "ejs");
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/GIS");
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected successful with database"));



app.get("/resturants", async (req, res, next) => {
  try {
    const city = "ismailia";
    const category = "resturants";
    const near_to = "ismailia";
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${near_to}+${category}+${city}&type=restaurant&key=${apiKey}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Create a geospatial index on the location field
Country.createIndexes({ location: '2dsphere' })
    

app.get('/near', async(req, res)=>{
    let maxDistance = req.query.maxDistance || 5000000
    let allNearCountries = await Country.find(
        {
            "location": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [ req.query.long, req.query.lat ]
                    },
                    $maxDistance : maxDistance
                }
            }
        }
    )
    res.send(allNearCountries)
})
//add country
app.post('/countries', (req, res) => {
  const newCountry = new Country(req.body);

  newCountry.save()
    .then(country => res.json({
        message: "done",
        country
    }))
    .catch(err => res.status(400).json({ error: err.message }));
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });