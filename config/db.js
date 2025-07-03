import mongoose from "mongoose";

let cactch = GlobalError.mongoose

if (!cactch) {
  cached = global.mongoose = { conn: null, Promise: null }
}

async function connectDb() {

  if (cactch.conn) {
    return cactch.conn;
  }

  if (!cached.Promise) {
    const opts = {
      bufferCommands: false

    }
    cached.Promise = mongoose.connect(`${process.env.MONGODB_URI}/quickcart`, opts).then(mongoose => {
      return mongoose
    })


  }
  cactch.conn = await cached.Promise;
  return cactch.conn;

}
export default connectDb