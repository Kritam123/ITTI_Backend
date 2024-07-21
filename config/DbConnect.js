import mongoose from "mongoose"

export const DbConnect = async()=>{
        try {
            await mongoose.connect(process.env.DB_URL);
            console.log("DbConnect Successfully..")
        } catch (error) {
            console.log(error);
        }
}