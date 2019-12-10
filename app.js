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

//Variable used throughout.
const dateFormat = /^\d{4}-\d{2}-\d{2}$/


//Create a new user.
  //Receive data from post.
  //Only allow numbers and letters for a username.
  //Make sure username is not taken.
  //Save to database.

app.post('/api/exercise/new-user', (req, res) => {
  var { username } = req.body
  var numbersAndLetters = /^[a-zA-Z0-9]+$/

  if (numbersAndLetters.test(username)) {
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
        newUser.save((err) => {
          if (err) {
            return res.send("Error saving to database")
          }
          return res.json(newUser)
        })
      } 
    })
  } else {
    return res.send("Username can only use numbers and/or letters with no spaces.")
  }    
})

//Add exercises
  //Make sure all required fields are submitted.
  //Match userId.
  //Receive data from description, duration, and date.(Current date if blank.  Make sure date is formatted yyyy-mm-dd.)
  //Save data.

app.post('/api/exercise/add', (req, res) => {
  var { userId } = req.body
  var { description } = req.body
  var { duration } = req.body
  var { date } = req.body
  var utcDate = new Date(date)
  var currentDate = new Date().toDateString()
  var correctDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000).toDateString()
    
  if (date === "") {
    var finalDate = currentDate
  } else {
    var finalDate = correctDate
  }
  
  if (userId === "" || description === "" || duration === "") {
    res.send("Please enter the required fields")
  } else {
    modelUser.findOne({_id: userId}, (err, result) => {
      if (err) {
        res.send("Error contacting database")
      } else if (!result){
        res.send("userId not found")
      } else {
        if (dateFormat.test(date) || date === "") {
          var newExercise = (
            {
              description: description,
              duration: duration,
              date: finalDate 
            }
          )
          result.exerciseData.push(newExercise)
          result.save((err) => {
            if (err) {
              return res.send('Error saving to database')
            }
          })
          return res.send({username: result.username, _id: result.id, exerciseData: newExercise})
        } else {
          res.send("Please enter a valid date in the format yyyy-mm-dd.")
        }
      }
    })
  }
})

//Get array of users.
  //Access database.
  //Create empty array.
  //Loop through database and access usernames.
  //Push usernames to empty array.
  //Send array to view.

app.get('/api/exercise/users', (req, res) => {
   modelUser.find((err, result) => {
    if (err) {
      res.send("Error contacting database")
    } else {
      userList =[]
      for (var i = 0; i < result.length; i++) {
        var allUsers = (
          {
            username: result[i].username
          }
        )
        userList.push(allUsers)
      }
      res.send(userList)
    }
  })
})

//Retrieve excercise logs of a user, including total exercise count.
  //Match userId to the id in the database.
  //Display exercise data and count.
  //If date parameters are present, display exerciseData for that time period, otherwise display all.

///api/exercise/log/{userId}?from=[dateFrom]&to=[dateTo]&limit=[limit]
app.get('/api/exercise/log/:userId', (req, res) => {
  modelUser.findOne({_id: req.params.userId}, (err, result) => {
    if (err) {
      res.send("Error contacting database")
    } else if (!result){
      res.send("userId not found")
    } else {
      let data = result.exerciseData
      var fromDate = req.query.from
      var toDate = req.query.to
      var limit = req.query.limit
      //Need to convert dates to unix time in order to compare.
      var utcDate = new Date(fromDate)
      var correctDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000).toDateString()
      var utcToDate = new Date(toDate)
      var toCorrectDate = new Date(utcToDate.getTime() + utcToDate.getTimezoneOffset() * 60000).toDateString()

      //Check if optional parameters are defined.
      if (dateFormat.test(fromDate)) {
      //For some reason this gives me greater than or equal to...
       data = data.filter((item)=>(new Date(item.date).getTime() > utcDate.getTime()))
      }
      if (dateFormat.test(toDate)) {
        //I had to add a day onto the utcToDate to show equal to...
       data = data.filter((item)=>(new Date(item.date).getTime() < (utcToDate.getTime())  + 86400000))
      }
      if (!isNaN(limit) && data.length > limit) {
        data = data.slice(0, limit)
      } 
      res.send({username: result.username, _id: result.id, exerciseData: data, count:data.length})
    }
  })
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is working!")
})