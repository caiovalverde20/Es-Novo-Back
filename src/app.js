const express = require('express');
const UserRoutes = require('@routes/UserRoutes');
const ReportRoutes = require('@routes/ReportRoutes');
const app  = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/', UserRoutes, ReportRoutes);

module.exports = app;