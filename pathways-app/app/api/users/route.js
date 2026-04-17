import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, isAllowedDistrictEmail } from "@/lib/auth";

// helper functions
function parseField(field) {
  if (!field) return [];
  return field.split(";").filter(Boolean);
}

function stringifyField(arr) {
  if (!arr) return null;
  if (Array.isArray(arr)) return arr.join(";");
  return arr; // fallback if already string
}

async function authorizeRequest() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!isAllowedDistrictEmail(email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

// GET all users (PARSED)
export async function GET() {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const [rows] = await db.query("SELECT * FROM User_Data");

    const parsed = rows.map((row) => ({
      ...row,
      Stored_Pathways: parseField(row.Stored_Pathways),
      Pathway_Progress: parseField(row.Pathway_Progress),
    }));

    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// CREATE user
export async function POST(req) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const body = await req.json();

    const { Username, Stored_Pathways, Pathway_Progress } = body;

    if (!Username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO User_Data 
       (Username, Stored_Pathways, Pathway_Progress, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [
        Username,
        stringifyField(Stored_Pathways),
        stringifyField(Pathway_Progress),
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE user
export async function PUT(req) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const body = await req.json();

    const { Username, Stored_Pathways, Pathway_Progress } = body;

    if (!Username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    await db.query(
      `UPDATE User_Data 
       SET Stored_Pathways = ?, 
           Pathway_Progress = ?, 
           UpdatedAt = NOW()
       WHERE Username = ?`,
      [
        stringifyField(Stored_Pathways),
        stringifyField(Pathway_Progress),
        Username,
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const body = await req.json();
    const { Username } = body;

    if (!Username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    await db.query(
      `DELETE FROM User_Data WHERE Username = ?`,
      [Username]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}