
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const dns = require('dns');


const Schema = mongoose.Schema;
const exerciseSchema = new Schema({
    username: {type: String, required: true},
    exercises: []
});
exerciseSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    const self = this;
    self.findOne(condition, function(err, result) {
        return result ? callback(err, result) : self.create(condition, function(err, result) { return callback(err, result) })
    })
};
const exerciseTracker = mongoose.model('exerciseTracker', exerciseSchema);

exports.exerciseModel = exerciseTracker;

exports.findByUsername = function (username,done) {
    exerciseTracker.findOne({username: username}).exec(function (err, data) {
        if (err) {
            throw err;
        }
        done(null, data);
    });
};

exports.create = function (username, done) {
    const newUser = new exerciseTracker({
        username: username
    });
    newUser.save(function (err, data) {
        if (err) {
            throw err;
        }
        done(null, data);
    });
};


