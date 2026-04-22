import { NextResponse, NextRequest } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");

  try {
    if (name) {
      const [rows] = await db.execute(
        "SELECT course_json FROM courses WHERE course_name = ?",
        [name]
      ) as any[];

      if (rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(rows[0].course_json);
    }

    const [rows] = await db.execute(
      "SELECT course_name, course_json FROM courses"
    ) as any[];

    const result = Object.fromEntries(
      rows.map((r: any) => [r.course_name, r.course_json]));

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}