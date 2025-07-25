import connectDb from "@/config/db"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import User from "@/models/User"

export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    await connectDb()
    const user = await User.findById(userId)

    const { cartItems } = user
    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}