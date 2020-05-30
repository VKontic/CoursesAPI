require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
const { json } = require('body-parser');
const Teacher = require("./controllers/teacherController");
const courseController = require("./controllers/courseController");

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

const app = express();
app.use(json());


app.post('/courses', courseController.create);
app.delete('/course/:name', courseController.deleteOne);
app.get('/course/:name', courseController.findByName);
app.put('/course/:name', courseController.updateByName);
app.get ('/products', courseController.findAll);

app.delete('/course_id/:id', courseController.deleteById);
app.get('/course_id/:id', courseController.findById);
app.put('/course_id/:id', courseController.updateById);


mongoose.connect(process.env.DB_URL)
    .then(() => {
        app.listen(process.env.PORT, (err) => {
            err ? console.log("Server didnt start", err) : console.log("Server started on port:", process.env.PORT);
        })
    })