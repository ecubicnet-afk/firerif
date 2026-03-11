import { NextResponse } from "next/server";

// Setup API is disabled after initial setup.
// To re-enable, set ALLOW_SETUP=true in environment variables.

export async function GET() {
  if (process.env.ALLOW_SETUP !== "true") {
    return NextResponse.json(
      { error: "Setup is disabled. Set ALLOW_SETUP=true to enable." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Setup endpoint is available. Use POST to run setup.",
  });
}

export async function POST() {
  if (process.env.ALLOW_SETUP !== "true") {
    return NextResponse.json(
      { error: "Setup is disabled. Set ALLOW_SETUP=true to enable." },
      { status: 403 }
    );
  }

  // Dynamic import to avoid bundling pg in production when not needed
  const pg = await import("pg");
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  const client = new pg.default.Client({ connectionString });

  try {
    await client.connect();

    // Check if admin already exists
    const adminCheck = await client.query(
      `SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1`
    );
    if (adminCheck.rows.length > 0) {
      return NextResponse.json({
        message: "Admin already exists. Setup skipped.",
      });
    }

    return NextResponse.json({
      message: "Setup available. Tables and admin can be created.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Setup check failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
