export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  const path = event.queryStringParameters?.path;
  if (!path) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing path" }) };
  const url = `https://${process.env.JIRA_DOMAIN}${decodeURIComponent(path)}`;
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_TOKEN}`).toString("base64");
  try {
    const r = await fetch(url, { headers: { "Authorization": `Basic ${auth}`, "Accept": "application/json" } });
    const data = await r.json();
    return { statusCode: r.status, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}
