#!/usr/bin/env node

const Teacher = require('../models/teacher.js');

exports.create = async(req, res) => {

    try{

        //Create a teacher from body
        if(Object.keys(req.query).length === 0){

            res.status(201).json(await Teacher.create(req.body));

        //update teacher courses based on parameters
        } else if (req.query.username !== undefined && req.query.id !== undefined){

            //add unique course to the teacher
            const result = await Teacher.findOneAndUpdate(

                { username: req.query.username },
                { $addToSet: { course: req.query.id }}

            );

            res.status(200).json(result);
               
        } else {
            
            res.status(404).json({'error' : 'No data found!'});

        }

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.getAll = async(req, res) =>{

    try{

        res.status(200).json(await Teacher.find({}))

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.partialSearchByUsername = async(req, res) => {

    try{

        res.status(200).json(await Teacher.find({

            username: new RegExp(req.params.username)

        }));

    } catch (err) {

        res.status(500).json(err);

    }

}

//TODO: Tweak the query
exports.directSearchByUrl = async(req, res) => {

    try{

       if (req.query.username !== undefined && req.query.id !== undefined){

            const result = await Teacher.findOne(

                { username: req.query.username },
                { course : req.query.id  }
      
            );
   
            res.status(200).json(result);
               
        } else {
            
            res.status(404).json({'error' : 'No data found!'});

        }

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.deleteByUsername = async(req, res) => {

    try{

        const result = await Teacher.deleteOne({

            username: req.params.username

        });

        if(result.deletedCount != 0){
            
            res.status(200).json(result);
            
        } else {

            res.status(404).json({"error" : "Teacher not found!"});

        }

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.deleteCourse = async(req, res) => {

    try{

       if (req.query.username !== undefined && req.query.id !== undefined){


            const result = await Teacher.findOneAndUpdate(

                { username: req.query.username },
                { $pull: { course : req.query.id } },
                { new: true}

            );
   
            res.status(200).json(result);
               
        } else {
            
            res.status(404).json({'error' : 'No data found!'});

        }

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.updateCourse = async(req, res) => {

    try{

       if (req.query.username !== undefined && req.query.id !== undefined){

            const result = await Teacher.findOneAndUpdate(

                { username: req.query.username },
                { $set: { course : req.query.id } },
                { new: true}

            );
   
            res.status(200).json(result);
               
        } else {
            
            res.status(404).json({'error' : 'No data found!'});

        }

    } catch (err) {

        res.status(500).json(err);

    }

}

exports.updateUsername = async(req, res) => {

    try{

        const result = await Teacher.findOneAndUpdate(

            { username: req.params.username },
            { $set: { username: req.body.username} },
            { new: true }

        );
        
        if(result === null){

            res.status(500).json({"error" : "Illegal parameters passed!"})

        } else{

            res.status(200).json({"success" : "Successfully updated the username!"});

        }

    } catch (err) {

       res.status(500).json(err)

    }

}