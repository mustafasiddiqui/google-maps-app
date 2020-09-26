/**
 * Module dependencies.
 */

var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();

const port = process.env.PORT || 3000;

// log requests
app.use(logger('dev'));


app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname));

app.listen(port);
console.log(`listening on port ${port}`);
