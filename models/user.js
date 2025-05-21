const mongoose = require('mongoose');


mongoose.connect("mongodb://localhost:27017/mini_project")

const userSchema = mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    password: String,
    posts: [
        {type: mongoose.Types.ObjectId, ref:"post"}
    ],
});

module.exports = mongoose.model('user', userSchema);