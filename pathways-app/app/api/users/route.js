import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, isAllowedDistrictEmail } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Splits a semicolon-delimited DB string into an array.
 * Returns an empty array for falsy values.
 *
 * @param {string|null|undefined} field - Raw value from the database column.
 * @returns {string[]}
 *
 * @example
 * parseField("pathway-1;pathway-2") // => ["pathway-1", "pathway-2"]
 * parseField(null)                   // => []
 */
function parseField(field) {
  if (!field) return [];
  return field.split(";").filter(Boolean);
}

/**
 * Joins an array into a semicolon-delimited string for DB storage.
 * Passes strings through unchanged (fallback for pre-stringified values).
 *
 * @param {string[]|string|null|undefined} arr
 * @returns {string|null}
 *
 * @example
 * stringifyField(["pathway-1", "pathway-2"]) // => "pathway-1;pathway-2"
 * stringifyField(null)                        // => null
 */
function stringifyField(arr) {
  if (!arr) return null;
  if (Array.isArray(arr)) return arr.join(";");
  return arr;
}

// ---------------------------------------------------------------------------
// GET /api/users
// GET /api/users?username=alice
// GET /api/users?email=alice@example.com
// ---------------------------------------------------------------------------

/**
 * @route   GET /api/users
 * @summary Fetch users — all, by username, or by email
 * @description
 *   Returns rows from `User_Data`. Supports three modes via query parameters:
 *
 *   - **No params** — returns all users.
 *   - **?username=** — returns the single user matching that username.
 *   - **?email=** — returns the single user matching that email.
 *
 *   `Stored_Pathways` and `Pathway_Progress` are parsed from
 *   semicolon-delimited strings into arrays before the response is sent.
 *
 * @queryparam {string} [username] - Filter by exact username.
 * @queryparam {string} [email]    - Filter by exact User_Email.
 *
 * @returns {200} Array of user objects (may be empty if no match found).
 * @returns {500} `{ error: string }` — database error.
 *
 * @example GET /api/users
 * [
 *   {
 *     "Username": "alice",
 *     "User_Email": "alice@example.com",
 *     "Stored_Pathways": ["pathway-1", "pathway-2"],
 *     "Pathway_Progress": ["50", "100"],
 *     "CreatedAt": "2024-01-01T00:00:00.000Z",
 *     "UpdatedAt": "2024-06-01T00:00:00.000Z"
 *   }
 * ]
 *
 * @example GET /api/users?username=alice
 * [
 *   {
 *     "Username": "alice",
 *     "User_Email": "alice@example.com",
 *     "Stored_Pathways": ["pathway-1"],
 *     "Pathway_Progress": ["50"],
 *     "CreatedAt": "2024-01-01T00:00:00.000Z",
 *     "UpdatedAt": "2024-06-01T00:00:00.000Z"
 *   }
 * ]
 *
 * @example GET /api/users?email=alice@example.com
 * [
 *   {
 *     "Username": "alice",
 *     "User_Email": "alice@example.com",
 *     "Stored_Pathways": ["pathway-1"],
 *     "Pathway_Progress": ["50"],
 *     "CreatedAt": "2024-01-01T00:00:00.000Z",
 *     "UpdatedAt": "2024-06-01T00:00:00.000Z"
 *   }
 * ]
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    let query = "SELECT * FROM User_Data";
    const params = [];

    if (username) {
      query += " WHERE Username = ?";
      params.push(username);
    } else if (email) {
      query += " WHERE User_Email = ?";
      params.push(email);
    }

    const [rows] = await db.query(query, params);

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

// ---------------------------------------------------------------------------
// POST /api/users
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/users
 * @summary Create a user
 * @description
 *   Inserts a new row into `User_Data`. `Stored_Pathways` and
 *   `Pathway_Progress` are serialized from arrays to semicolon-delimited
 *   strings. `CreatedAt` and `UpdatedAt` are set to the current timestamp.
 *
 * @body {string}   Username           - Required. Unique identifier for the user.
 * @body {string}   [User_Email]       - Optional. User's email address.
 * @body {string[]} [Stored_Pathways]  - Optional. Array of pathway IDs.
 * @body {string[]} [Pathway_Progress] - Optional. Array of progress values.
 *
 * @returns {200} `{ success: true }`
 * @returns {400} `{ error: "Username required" }`
 * @returns {500} `{ error: string }` — database error.
 *
 * @example Request body
 * {
 *   "Username": "alice",
 *   "User_Email": "alice@example.com",
 *   "Stored_Pathways": ["pathway-1", "pathway-2"],
 *   "Pathway_Progress": ["50", "0"]
 * }
 */
export async function POST(req) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const body = await req.json();

    const { Username, User_Email, Stored_Pathways, Pathway_Progress } = body;

    if (!Username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO User_Data 
       (Username, User_Email, Stored_Pathways, Pathway_Progress, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        Username,
        User_Email ?? null,
        stringifyField(Stored_Pathways),
        stringifyField(Pathway_Progress),
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/users
// ---------------------------------------------------------------------------

/**
 * @route   PUT /api/users
 * @summary Update a user
 * @description
 *   Overwrites `User_Email`, `Stored_Pathways`, and `Pathway_Progress` for
 *   the given username and bumps `UpdatedAt` to now. All fields are fully
 *   replaced — partial/patch updates are not supported; always send the
 *   complete values.
 *
 *   **No-op behaviour:** if the username does not exist the query succeeds
 *   but affects 0 rows. The response is still `{ success: true }`.
 *
 * @body {string}   Username           - Required. Must match an existing row.
 * @body {string}   [User_Email]       - Optional. Replaces the stored email.
 * @body {string[]} [Stored_Pathways]  - Optional. New full list of pathway IDs.
 * @body {string[]} [Pathway_Progress] - Optional. New full list of progress values.
 *
 * @returns {200} `{ success: true }`
 * @returns {400} `{ error: "Username required" }`
 * @returns {500} `{ error: string }` — database error.
 *
 * @example Request body
 * {
 *   "Username": "alice",
 *   "User_Email": "alice@example.com",
 *   "Stored_Pathways": ["pathway-1", "pathway-3"],
 *   "Pathway_Progress": ["100", "20"]
 * }
 */
export async function PUT(req) {
  try {
    const authError = await authorizeRequest();
    if (authError) return authError;

    const body = await req.json();

    const { User_Email, Stored_Pathways, Pathway_Progress } = body;

    if (!User_Email) {
      return Response.json({ error: "User_Email required" }, { status: 400 });
    }

    await db.query(
      `UPDATE User_Data 
       SET Stored_Pathways = ?, 
           Pathway_Progress = ?, 
           UpdatedAt = NOW()
       WHERE User_Email = ?`,
      [
        stringifyField(Stored_Pathways),
        stringifyField(Pathway_Progress),
        User_Email,
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/users
// ---------------------------------------------------------------------------

/**
 * @route   DELETE /api/users
 * @summary Delete a user
 * @description
 *   Permanently removes the row matching the given username.
 *
 *   **No-op behaviour:** if the username does not exist the query succeeds
 *   but affects 0 rows. The response is still `{ success: true }`.
 *
 * @body {string} Username - Required. Username of the record to delete.
 *
 * @returns {200} `{ success: true }`
 * @returns {400} `{ error: "Username required" }`
 * @returns {500} `{ error: string }` — database error.
 *
 * @example Request body
 * { "Username": "alice" }
 */
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