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
//mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.connect('mongodb://localhost/exercise_tracker', { useUnifiedTopology: true, useNewUrlParser: true }) 

//Create a new user.
  //Receive data from post.
  //Only allow numbers and letters for a username.
  //Make sure username is not taken.
  //Save to database.

app.post('/api/exercise/new-user', (req, res) => {
  var { username } = req.body
  var numbersAndLetters = /^[a-zA-Z0-9]+$/

  if (numbersAndLetters.test(username)) {
    console.log(username)
    modelUser.findOne({username: username}, (err, result) => {
      if (err) {
        return res.send("Error reading database")
      } else if (result) {
        return res.send("Username taken")
      } else {
        var newUser = new modelUser(
          {
            username: username
          }
        )
        newUser.save(err => {
          if (err) {
            return res.send("Error saving to database")
          }
          return res.json(newUser)
        })
      } 
    })
  } else {
    return res.send("Username can only use numbers and/or letters")
  }    
})

//Add exercises
  //Make sure all required fields are submitted.
  //Match username/id.
  //Receive data from description.
  //Receive data from duration.
  //Receive data from date.  (Current date if blank.) Make sure date is formatted yyyy-mm-dd
  //Save data.

  app.post('/api/exercise/add', (req, res) => {
    var { userId } = req.body
    var { description } = req.body
    var { duration } = req.body
    var { date } = req.body

    if (userId === "" || description === "" || duration === "") {
      res.send("Please enter the required fields")
    } else {
      modelUser.findOne({username: userId}, (err, result) => {
        if (err) {
          res.send("Error contacting database")
        } else if (!result){
          res.send("userId not found")
        } else {
          var dateFormat = /^\d{4}-\d{2}-\d{2}$/
          if (dateFormat.test(date) || date == "") {
            var currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substr(0,19).replace('T', ' ')
            var newExercise = {
              description : description,
              duration : duration,
              date: date || currentDate.split(' ')[0]
            }
            result.exerciseData.push(newExercise)
            result.save((err) => {
              if (err) {
                return res.send('Error saving to database')
              }
            })
          return res.json(result)
          } else {
            res.send("Please enter a valid date in the format yyyy-mm-dd.")
          }
        }
      })
    }
  })


  //Get array of users.

//Retrieve excercise logs of a user, including total exercise count.

//Retrieve partial log of any users based on date input from and to.


app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is working!")
})