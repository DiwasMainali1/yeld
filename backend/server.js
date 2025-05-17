const express = require('express')
const app = express();

app.get('/', (req, res) =>{
    console.log('Here');
    res.render('')
})

app.listen(5555)