const express = require('express');
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//midleware 
app.use(cors())
app.use(express.json())






app.get('/', async(req, res) =>{
     res.send('bike resell running')
})


app.listen(port, () => `bike resell running on ${port}`)
