const Course = require('../models/courses.js');
const querystring = require('querystring'); //for url parsing

exports.create = (req, res) => {
    const courseObject = req.body;
    Course.create(courseObject)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json(err))
}

exports.decodeUri = function(req,res,next){
	req.params.name = decodeURI(req.params.name);
	next(); 
}
exports.deleteOne = function(req, res) {
    Course.deleteOne({ name: name })
        .exec()
        .then(result => {
        	if (result.deletedCount==0){
        		res.status(404).json(result)
        	}
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
}
