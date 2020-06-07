const jwt = require('jsonwebtoken');

const Teacher = require('../models/teacher.js');
const crypto = require('crypto');

//function to generate token
async function generateToken(req, res){

    try{

        const user = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
        }

        //check if user and password matches
        const result = await Teacher.find( {username: user.username, password: user.password } ).countDocuments();

        if(result){

             jwt.sign({user}, process.env.SECRET, {expiresIn: '2h'}, (err, token) =>{
                res.json({'success': `Successfully logged in! Welcome back, ${user.username}!`, token});
             });
            
        } else { res.status(401).json({"error": 'Authentication failed!'});}

    }catch(err){
        res.status(401).json({"error": 'Authentication failed!'});
    }
   
}

function verifyToken(req, res,next){

    const getToken = req.headers['authorization'];

    if(getToken !== undefined){

        //token format {"token" {actual token}}
        const rawToken = getToken.split(' ')[1];
        
        jwt.verify(rawToken, process.env.SECRET, (err, auth) => {
            
            if(err){
                res.status(401).json({"error": 'Authentication failed!'});
                return;
            }

            next();

        });

    } else {
        res.status(401).json({"error": 'Authentication failed!'});
        return;
    }

}

module.exports = {
    verifyToken,
    generateToken
}