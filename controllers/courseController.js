#!/usr/bin/env node

const fs = require('fs');
const nodemailer = require('nodemailer');
const csvWriter = require('csv-write-stream');
const writer = csvWriter();
const Course = require('../models/courses.js');
const Teacher = require('../models/teacher.js');
const querystring = require('querystring'); //for url parsing

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eduplatform2020@gmail.com',
        pass: process.env.PASSWORD
    }
});

exports.create = async function(req, res) {
    const courseObject = req.body;
    try {
        let result = await Course.create(courseObject);
        res.status(201).json(result);

        try {
            teacherUsername = await Teacher.find({ _id: courseObject.teacher }, { "username": 1, "_id": 0 });
            courseObject.teacherUsername = teacherUsername[0].username;
            writer.pipe(fs.createWriteStream('newCourse.csv'))
            writer.write(courseObject);
            writer.end() //csv file created, now just sent it to all admins!

            let emails = await adminEmails();
            if (emails.length > 0) {
                emails.forEach(email => sendMail(email))
            }

        } catch (err) {
            console.log(err);
        }

    } catch (err) {
        res.status(400).json({ "error": err.message })
    }
}

async function adminEmails() {
    try {
        let result = await Teacher.find({ "role": true }, { "email": 1, "_id": 0 });
        let emails = result.map(resultObject => resultObject.email);
        return emails;
    } catch (err) {
        console.log(result);
    }
}

function sendMail(mail) {
    var mailOptions = {
        from: 'vkontic11@gmail.com',
        to: mail,
        subject: 'New Course on site!',
        attachments: [{
            filename: "newCourse.csv",
            path: "newCourse.csv"
        }],
        text: 'CSV file is in attachment. \n\nRegards,\n CoursesAPI Team',
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}

exports.deleteOne = function(req, res) {
    const name = req.params.name;
    Course.deleteOne({ name: name })
        .exec()
        .then(result => {
            if (result.deletedCount == 0) {
                res.status(404).json(result)
            }
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
}

exports.findByName = function(req, res) {
    const name = req.params.name;
    Course.find({ name: { $regex: '.*' + name + '.*', $options: 'i' } }).exec() // as LIKE %var% in sql
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
}

exports.updateByName = function(req, res) {
    const name = req.params.name;
    let updateObj = req.body;
    //updateObj will be like req.body object : {name: x, description: y, price: z}...
    Course.findOneAndUpdate({ name: { $regex: '.*' + name + '.*', $options: 'i' } }, { $set: req.body }, { "new": true })
        .exec()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
}

exports.findAll = async function(req, res) {
    try {
        let result = await Course.find({}).exec();
        res.status(200).json(result)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}

exports.findById = function(req, res) {
    const ID = req.params.id;
    Course.findById(ID).exec()
        .then(result => {
            res.status(200).json(result)
        }).catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
}

exports.deleteById = function(req, res) {
    const ID = req.params.id;
    Course.deleteOne({ _id: ID })
        .exec()
        .then(result => {
            if (result.deletedCount == 0) {
                res.status(404).json(result)
            }
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
}

exports.updateById = function(req, res) {
    const ID = req.params.id;
    let updateObj = req.body;
    //updateObj will be like req.body object : {name: x, description: y, price: z}...
    Course.findOneAndUpdate({ _id: ID }, { $set: req.body }, { "new": true })
        .exec()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
}

exports.decSubs = async function(req, res) {
    const ID = req.params.id;
    try {
        let result = await Course.findOneAndUpdate({ _id: ID }, { $inc: { 'quantity': -1 } }, { "new": true }).exec();
        res.status(200).json(result)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
    //TODO:
    //validate if quantity is 0. In that case dont decrement
}

exports.incSubs = async function(req, res) {
    const ID = req.params.id;
    try {
        let result = await Course.findOneAndUpdate({ _id: ID }, { $inc: { 'quantity': 1 } }, { "new": true }).exec();
        res.status(200).json(result)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}

exports.getQuantity = async function(req, res) {
    const ID = req.params.id;
    try {
        let result = await Course.find({ _id: ID }).select({ 'quantity': 1, _id: 0 });
        res.status(200).json(result)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}

exports.LimitOffsetCourses = async function(req, res) {
    let limit = req.query.limit;
    let offset = req.query.offset;

    if (limit !== undefined && offset !== undefined) {
        try {
            let result = await Course.find({}).skip(parseInt(offset)).limit(parseInt(limit));
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ "error": err.message });
        }
    } else {
        res.status(406).json({ "error": 'Limit and offset params are not passed!' })
    }
}