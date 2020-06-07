#!/usr/bin/env node

const emailValidator = require("email-validator");
const crypto = require('crypto')
const Teacher = require('../models/teacher.js');

//function to validate teacher payload. username and email
function validateCreateTeacherPayload(obj) {
    return emailValidator.validate(obj['email']) && !/\s/.test(obj['username']) && !/\s/.test(obj['password']) &&
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(obj['password']) ?
        true : false;
}

//function to validate username
function validateUsername(username) {
    return !/\s/.test(username) ? true : false;
}

//hash password and encode to hex
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

exports.create = async (req, res) => {
    try {
        //Create a teacher from body
        if (Object.keys(req.query).length === 0) {
            if (validateCreateTeacherPayload(req.body)) {
                req.body['password'] = hashPassword(req.body['password']);
                const result = await Teacher.create(req.body);
                res.status(200).json(result);
            } else {
                res.status(500).json({ 'error': 'Teacher payload validation failed!' });
            }
        } else if (req.query.username !== undefined && req.query.id !== undefined) {
            //add unique course to the teacher
            const result = await Teacher.findOneAndUpdate({ username: req.query.username }, { $addToSet: { course: req.query.id } });
            res.status(200).json(result);
        } else {
            res.status(404).json({ 'error': 'No data found!' });
        }
    } catch (err) {
        res.status(500).json({ 'error': 'Unable to create teacher with those parameters.Try different username or email address.' });
    }
}

exports.getAll = async (req, res) => {
    try {
        res.status(200).json(await Teacher.find({}))
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.partialSearchByUsername = async (req, res) => {
    try {
        res.status(200).json(await Teacher.find({
            username: new RegExp(req.params.username)
        }));
    } catch (err) {
        res.status(500).json(err);
    }
}

//get user who has the username and course id specified in url
//tweak this to get course data only maybe?
exports.directSearchByUrl = async (req, res) => {
    try {
        if (req.query.username !== undefined && req.query.id !== undefined) {

            const result = await Teacher.findOne({
                username: req.query.username,
                course: req.query.id
            });
            res.status(200).json(result);
        } else {
            res.status(404).json({ 'error': 'No data found!' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.deleteByUsername = async (req, res) => {
    try {
        const result = await Teacher.deleteOne({ username: req.params.username });

        if (result.deletedCount != 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ "error": "Teacher not found!" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.deleteCourse = async (req, res) => {
    try {

        if (req.query.username !== undefined && req.query.id !== undefined) {
            const result = await Teacher.findOneAndUpdate({ username: req.query.username }, { $pull: { course: req.query.id } }, { new: true });
            res.status(200).json(result);
        } else {
            res.status(404).json({ 'error': 'No data found!' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

//get user with requested course and update the course with body payload
exports.updateCourse = async (req, res) => {
    if (req.query.username !== undefined && req.query.id !== undefined) {
        Promise.all([Teacher.findOneAndUpdate({ username: req.query.username }, { $set: { course: req.body.id } }, { new: true }), Teacher.findOneAndUpdate({ username: { $ne: req.query.username }, course: req.body.id }, { $set: { course: req.query.id } }, { new: true })]).then(results => {
            res.status(200).json({ "success": "Successfully updated teacher's course!" });
        }).catch(err => {
            res.status(500).json({ "error": "Bad parameters!" });
        })
    } else {
        res.status(404).json({ 'error': 'No data found!' });
    }
}

exports.updateByUsername = async (req, res) => {

    try {

        let payload = {}
        if (req.body.username !== undefined && req.body.email !== undefined && emailValidator.validate(req.body.email) && validateUsername(req.body.username)) {
            payload = { username: req.body.username, email: req.body.email }
        } else if (req.body.username !== undefined && validateUsername(req.body.username)) {
            payload = { username: req.body.username }
        } else if (req.body.email !== undefined && emailValidator.validate(req.body.email)) {
            payload = { email: req.body.email }
        }

        const result = await Teacher.findOneAndUpdate({ username: req.params.username }, { $set: payload }, { new: true });

        if (Object.keys(payload).length === 0) {
            res.status(500).json({ "error": "Illegal parameters passed!" })
        } else {
            res.status(200).json({ "success": "Update was successful!" });
        }

    } catch (err) {
        res.status(500).json(err)
    }
}

exports.maxSalary = async function(req, res) {
    let arr = [];

    try {
        let results = await Teacher.aggregate([{
            $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "course"
            }
        }])
        for (let i = 0; i < results.length; i++) {
            let teacherMaxSalary = {};
            let maxSalary = 0;
            teacherMaxSalary.teacherUsername = results[i].username;
            for (let j = 0; j < results[i].course.length; j++) {
                maxSalary += results[i].course[j].price;
            }
            teacherMaxSalary.maxSalary = maxSalary;
            arr.push(teacherMaxSalary);
        }
        res.status(200).json(arr);

    } catch (err) {
        console.log(err);
        res.status(400).json({ "error": err.message });
    }

}