//Setup
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const modelUser = require('./models/modelUser')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

//Use index.html file
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//Connect to database.
mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })

//Create a new user.
  //Receive data from post.
  //Save to database.

app.post('/api/exercise/new-user', (req, res) => {
  var userName  = req.body.username
  console.log(userName)
})

//Add exercises
  //Match username/id.
  //Receive data from description.
  //Receive data from duration.
  //Receive data from date.  (Current date if blank.)

//Get array of users.

//Retrieve excercise logs of a user, including total exercise count.

//Retrieve partial log of any users based on date input from and to.


app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is working!")
})