#!/usr/bin/env node
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
        let result = await Course.find({ _id: ID }).select({'quantity':1, _id:0});
        res.status(200).json(result)
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}