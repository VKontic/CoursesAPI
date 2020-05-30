require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
const { json } = require('body-parser');
const Teacher = require("./controllers/teacherController");
const courseController = require("./controllers/courseController");
const querystring = require('querystring'); //for url parsing

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const app = express();
app.use(json());

app.get('/', (req, res) => {
    res.send("It works!")
})

app.post('/courses', courseController.create)
app.delete('/course/:name', courseController.deleteOne)

mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(process.env.PORT, (err) => {
            err ? console.log("Server didnt start", err) : console.log("Server started on port:", process.env.PORT);
        })
    })