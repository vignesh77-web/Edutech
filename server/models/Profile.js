const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

    gender: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    about: {
        type: String,
        trim: true,
    },
    contactNumber: {
        type: Number,
        trim: true,
    },
    instituteName: {
        type: String,
    },
    designation: {
        type: String,
    }

});

module.exports = mongoose.model("Profile", profileSchema);