const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    name: {
        type: String
    },
    population: {
        type: Number
    },
    Qara: {
        type: String
    },
    area: {
        type: Number
    },
    money: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum:['Point', 'LineString', 'Polygon']
        },
        coordinates: {
            type: [Number]
        }
    }
});

// Create a geospatial index on the location field
countrySchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Country", countrySchema);
