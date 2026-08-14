const mongoose=require("mongoose")

const ConnectDB= async ()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("database connected ")
    } catch (error) {
        console.error("connection failed",error.message)
        process.exit(1);
    }
}

module.exports=ConnectDB