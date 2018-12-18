const express = require('express')
    , router = express.Router();
const exerciseTracker = require(process.cwd() + '/model/exerciseTrackerMod');


router.get('/api/exercise/log/:id/:from?/:to?/:limit?',function(req,res,next){
    const from = new Date(req.params.from);
    const to = new Date(req.params.to);
    const limit = req.params.limit;
    // inside middleware handle
    if( typeof req.params.from !== "undefined" && isNaN(from.getTime())) {
        throw new Error("Invalid Date for field From");
    }
    if( typeof req.params.to !== "undefined" && isNaN(to.getTime())) {
        throw new Error("Invalid Date for field To");
    }
    if(typeof req.params.limit !== "undefined" && isNaN(limit)) {
        throw new Error("Invalid Input for field Limit");
    }
    next();

},function (req, res) {
    console.log(req.params);
    const from = new Date(req.params.from);
    const to = new Date(req.params.to);
   const limit = req.params.limit;

    //typeof limit = "number"
    let results = [];
    exerciseTracker.exerciseModel.findById(req.params.id, function (err, done) {

          done.exercises.forEach(function(obj){
            if(!isNaN(from.getTime()) && +obj.date < +from) {
                return;
            }
            if(!isNaN(to.getTime()) && +obj.date > +to) {
                return;
            }
            if(!isNaN(limit) && results.length >= limit) {
                return;
            }
            return results.push(obj);
        });
        if (err) {
            res.json({"error": "username Not Found"}, 422);
        }else {
            res.json({username: done.username, exercises: results, count: results.length});
        }

    });
} );

router.get('/api/exercise/users',function (req, res) {
    exerciseTracker.exerciseModel.find({}, function (err, done) {
        console.log(done);
        let usersArray= [];
        if (err) {
            res.json({"error": "username Not Found"}, 422);
        } else {
            done.forEach(function(user){
                usersArray.push(
                    {
                        username: user.username,
                        id: user._id
                    }
                )
            });
            res.json(usersArray);

        }
    });
} );

router.get('/api/exercise/:id', function (req, res) {
    exerciseTracker.exerciseModel.findById(req.params.id, function (err, done) {
        if (err) {
            res.json({"error": "username Not Found"}, 422);
        } else {
            res.json({username: done.username, id: done._id});

        }
    });
});

router.post('/api/exercise/new-user', function(req, res){
    const username = req.body.username;
    exerciseTracker.findByUsername(username, function(error, data){
        if (error) {
            throw error;
        }
        if (data) {
            res.send("That username is already taken.");
        } else {
            exerciseTracker.create(username, function(error, user){
                if (error) {
                    throw error;
                }
                res.json({username: user.username, id: user._id});
            });
        }
        // res.json({username: user.username, id: user._id});
    });
});

router.post('/api/exercise/add', function(req, res){
    // TO DO: verify input data

    const userId = req.body.userId;
    const description = req.body.description;
    const duration = req.body.duration;
    const requiredFieldsCompleted = userId && description && duration;

    if (requiredFieldsCompleted) {

        exerciseTracker.exerciseModel.findById(userId, function(error, data){

            if (error) {
                res.send("Cannot find user.");
            }
            if (data) {
                const date = (req.body.date) ? new Date(req.body.date) : new Date();
                const newExercise = {
                    description: description,
                    duration: duration,
                    date: date};
                data.exercises.push(newExercise);
                data.save((error, user) => {
                    if (error) {
                        throw error;
                    }
                    const dataToShow = {
                        username: user.username,
                        _id: user._id,
                        description: description,
                        duration: duration,
                        date: date.toDateString(),
                        exercises: data.exercises
                    };
                    res.json(dataToShow);
                });
            }
            else {
                res.send("User with id: " + userId + " is not found." );
            }
        });
    }
});

router.get('/exercise', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

module.exports = router;