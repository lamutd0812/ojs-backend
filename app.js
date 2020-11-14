const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config/config');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/roles');
const stageRoutes = require('./routes/stage');
const categoryRoutes = require('./routes/category');
const submissionRoutes = require('./routes/submission');
const reviewProcessRoutes = require('./routes/reviewProcess');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/roles', roleRoutes);
app.use('/stages', stageRoutes);
app.use('/categories', categoryRoutes);
app.use('/submissions', submissionRoutes);
app.use('/reviews/', reviewProcessRoutes);

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