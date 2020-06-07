#!/usr/bin/env node

const mongoose = require('mongoose');
const express = require('express');
const { json } = require('body-parser');

//controllers
const teacherController = require("./controllers/teacherController");
const courseController = require("./controllers/courseController");

//middleware
const authMiddleware = require('./authentication/authMiddleware')

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

require('dotenv').config()

const app = express();
app.use(express.urlencoded( {extended:false} )); //body parser 
app.use(express.json()); //express.json = bodyParser.json;

//add course, delete, update or get course by name
app.post('/courses', courseController.create);
app.delete('/course/:name', courseController.deleteOne);
app.get('/course/:name', courseController.findByName);
app.put('/course/:name', courseController.updateByName);

app.get ('/products', courseController.findAll); //all courses

//delete, get and update course by course ID
app.delete('/course_id/:id', courseController.deleteById);
app.get('/course_id/:id', courseController.findById);
app.put('/course_id/:id', courseController.updateById);
//decrement, increment or get number of course subscribers
app.put('/subs_dec/:id', courseController.decSubs); //decrement course subs by 1 
app.put('/subs_inc/:id', courseController.incSubs); //decrement course subs by 1
app.get('/subs_num/:id', courseController.getQuantity);


//teacher
app.post('/teacher',teacherController.create);
app.get('/teacher', teacherController.directSearchByUrl)
app.delete('/teacher', teacherController.deleteCourse)
app.put('/teacher', teacherController.updateCourse);

//auth middleware on this one for testing purposes
app.get('/teachers', authMiddleware.verifyToken, teacherController.getAll);

app.get('/teacher/:username', teacherController.partialSearchByUsername);
app.delete('/teacher/:username', teacherController.deleteByUsername);
app.put('/teacher/:username', teacherController.updateUsername);

//login
app.get('/login', authMiddleware.generateToken);

mongoose.connect(process.env.DB_URL, { useFindAndModify: false })
    .then(() => {
        app.listen(process.env.PORT, (err) => {
            err ? console.log("Server didnt start", err) : console.log("Server started on port:", process.env.PORT);
        })
    })