import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

// const 
const connectDatabase= async()=>{

try {
     
  await mongoose.connect(process.env.mongoDb_URL);
  console.log("database Connected Successfully")

} catch (error) {
    console.log(error)
}


}
export default connectDatabase