import authSeller from "@/lib/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import connectDb from "@/config/db"
import Product from "@/models/product"
import { NextResponse } from "next/server"

export async function GET(request) {

  try {
    const { userId } = getAuth(request)
    const isSeller = await authSeller(userId)
    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'not authorized' });
    }
    await connectDb()
    const products = await Product.find({ userId })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })

  }
}