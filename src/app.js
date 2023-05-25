const express = require('express');
const UserRoutes = require('./routes/UserRoutes');
const ReportRoutes = require('./routes/ReportRoutes');
const TagRoutes = require('./routes/TagRoutes');
const app  = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/', UserRoutes, ReportRoutes, TagRoutes);

module.exports = app;