require('dotenv').config();
const express = require('express');

const app = express();

const PORT= process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const connectDB = require('./config/db');

connectDB();

const path=require('path');

//Template Engine 
app.set('views', path.join(__dirname, '/views'));
app.set('view engine','ejs');
// ROutes 
app.use('/api/files',require('./routes/files'));

app.use('/files/download', require('./routes/download'));

//For downloading the Data
app.use('/files',require('./routes/show'));

app.listen(PORT, console.log(`Listening on port ${PORT}.`));