const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express();
app.use(cors())
app.use(express.json())

// Add timeout and more detailed error logging
mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('Database connected'))
    .catch((err) => {
        console.log('Detailed connection error:', {
            name: err.name,
            message: err.message,
            reason: err.reason,
            code: err.code
        });
    });

app.use('/', require('./routes/authRoute'))

const port = 8000;
app.listen(port, () => console.log(`Server is running on ${port}`))