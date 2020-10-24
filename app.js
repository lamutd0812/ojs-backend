const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/roles');
const stageRoutes = require('./routes/stage');
const categoryRoutes = require('./routes/category');
const submissionRoutes = require('./routes/submission');

const app = express();

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS cofig
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use('/roles', roleRoutes);
app.use('/stages', stageRoutes);
app.use('/categories', categoryRoutes);
app.use('/submissions', submissionRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(config.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(resutl => {
    app.listen(PORT);
    console.log(`server running at port ${PORT}!`);
}).catch(err => {
    console.log(err)
});