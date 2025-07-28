const mongoose = require("mongoose")

const db_connect = async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("db connected successfully")
    } catch (error) {
        console.log("error in connecting mongo db:-",error);
        throw error;
    }
}

module.exports = db_connect