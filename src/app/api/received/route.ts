import { type NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    console.log(await request.text())
    return NextResponse.json({ message: "Data received successfully" });
}