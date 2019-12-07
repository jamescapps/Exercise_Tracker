const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        username: String,
        exerciseData:
        [
            {
                "description": String,
                "duration": String,
                "date": { type:String, default: Date.now }
            }
        ]
    }
)

const modelClass = mongoose.model('modelUser', userSchema)

module.exports = modelClass