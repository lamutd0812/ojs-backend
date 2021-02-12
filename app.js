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
const decisionRoutes = require('./routes/decision');
const submissionRoutes = require('./routes/submission');
const reviewProcessRoutes = require('./routes/reviewProcess');
const articleRoutes = require('./routes/article');
const userRoutes = require('./routes/users');
const submissionTypeRoutes = require('./routes/submisisonType');

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
app.use('/decisions', decisionRoutes);
app.use('/submissions', submissionRoutes);
app.use('/reviews/', reviewProcessRoutes);
app.use('/articles', articleRoutes);
app.use('/users', userRoutes);
app.use('/submission-types', submissionTypeRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(config.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(resutl => {
    const server = app.listen(PORT);
    console.log(`server running at port ${PORT}!`);
    const io = require('./services/socket').init(server);
    io.on('connection', socket => {
        console.log('Socket.io client connected!');
    });
}).catch(err => {
    console.log(err);
});