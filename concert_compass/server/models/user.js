const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true, unique: true},
    gender: {type: String, required: true},
    month: {type: String, required: true},
    date: {type: String, required: true},
    year: {type: String, required: true},
    likedSongs: {type: [String], default: []},
    playlist: {type: [String], default: []},
    isAdmin: {type: Boolean, default: false}
})

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {_id: this._id, name: this.name, isAdmin: this.isAdmin },
        process.env.JWTPRIVATEKEY,
        {expiresIn: "7d"}
        )
        return token;
}

const User = mongoose.model("user", userSchema);