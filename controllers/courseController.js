const Course = require('../models/courses.js');
const querystring = require('querystring'); //for url parsing

exports.create = (req, res) => {
    const courseObject = req.body;
    Course.create(courseObject)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json(err))
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
    console.log (typeof updateObj);
    console.log(updateObj);
    //updateObj will be like req.body object : {name: x, description: y, price: z}...
    Course.findOneAndUpdate({ name: { $regex: '.*' + name + '.*', $options: 'i' } },{$set : req.body}, { "new": true})
        .exec()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })
}