const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        username: String,
        exerciseData:
        [
            {
                description: String,
                duration: Number,
                date: { type:String}
            }
        ]
    }
)

const modelClass = mongoose.model('modelUser', userSchema)

module.exports = modelClass