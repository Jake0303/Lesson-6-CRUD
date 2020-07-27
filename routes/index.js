'use strict';
var express = require('express');
var router = express.Router();
var articlesModel = require('../models/articles');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
/* GET home page. */
router.get('/', function (req, res) {
    try {
        //Retrieve all articles if there is any 
        articlesModel.find({}, function (err, foundArticles) {
            console.log(err);
            console.log(foundArticles);
            //Pass found articles from server to pug file
            res.render('index', { articles: foundArticles });
        });
    } catch (err) {
        console.log(err);
        res.render('index', { title: 'Express' });
    }
});

/* GET insert page. */
router.get('/insert', function (req, res) {
    res.render('insert');
});

/* POST insert page */
router.post('/insert', function (req, res) {
    var form = new formidable.IncomingForm();
    //Specify our image file directory
    form.uploadDir = path.join(__dirname, '../public/images');
    form.parse(req, function (err, fields, files) {
        console.log('Parsed form.');
        //Update filename
        files.image.name = fields.name + '.' + files.image.name.split('.')[1];
        //Create a new article using the Articles Model Schema
        const article = new articlesModel({ name: fields.name, description: fields.description, image: files.image.name });
        //Insert article into DB
        article.save(function (err) {
            console.log(err);
        });
        //Upload file on our server
        fs.rename(files.image.path, path.join(form.uploadDir, files.image.name), function (err) {
            if (err) console.log(err);
        });
        console.log('Received upload');
    });
    form.on('error', function (err) {
        console.log(err);
    });
    form.on('end', function (err, fields, files) {
        console.log('File successfuly uploaded');
        //res.end('File successfuly uploaded');
        res.send({ "success": "We have received your message, please wait a day for a response." });
    });
});

/* GET update page */
router.get('/update/:id', function (req, res) {
    articlesModel.findById(req.params.id, function (err, foundArticle) {
        if (err) console.log(err);
        //Render update page with specific article
        res.render('update', { article: foundArticle })
    })
});

/* POST update page */
router.post('/update', function (req, res) {
    console.log(req.body);
    //Find and update by id
    articlesModel.findByIdAndUpdate(req.body.id, { name: req.body.name, description: req.body.description }, function (err, model) {
        console.log(err);
        res.redirect('/');
    });
});

/* POST delete page */
router.post('/delete/:id', function (req, res) {
    //Find and delete article
    articlesModel.findByIdAndDelete(req.params.id, function (err, model) {
        res.send({"success":"Article Successfully Deleted!"})
    });
});
module.exports = router;
