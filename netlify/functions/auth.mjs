import { getStore } from "@netlify/blobs";

function cors(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  });
}

async function verifyAdmin(req) {
  const header = req.headers.get("Authorization") || "";
  const token = header.replace("Bearer ", "");
  if (!token) return false;
  const store = getStore("sessions");
  const session = await store.get(token, { type: "json" }).catch(() => null);
  if (!session) return false;
  if (Date.now() - session.created > 24 * 60 * 60 * 1000) {
    await store.delete(token);
    return false;
  }
  return true;
}

export default async (req) => {
  if (req.method === "OPTIONS") return cors({});

  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "").replace(/^\//, "");

  if (req.method === "POST" && (path === "login" || path === "")) {
    const body = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "casefiles2026";

    if (body.password !== adminPassword) {
      return cors({ error: "Invalid credentials" }, 401);
    }

    const token = crypto.randomUUID();
    const store = getStore("sessions");
    await store.setJSON(token, { created: Date.now(), role: "admin" });

    return cors({ token, message: "Login successful" });
  }

  if (req.method === "POST" && path === "verify") {
    const isValid = await verifyAdmin(req);
    return cors({ valid: isValid });
  }

  if (req.method === "POST" && path === "logout") {
    const header = req.headers.get("Authorization") || "";
    const token = header.replace("Bearer ", "");
    if (token) {
      const store = getStore("sessions");
      await store.delete(token);
    }
    return cors({ message: "Logged out" });
  }

  return cors({ error: "Not found" }, 404);
};

export { verifyAdmin };

export const config = {
  path: ["/api/auth", "/api/auth/*"],
};
