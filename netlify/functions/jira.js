export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const path = event.queryStringParameters?.path;
  if (!path) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing path" }) };

  const method = event.queryStringParameters?.method || "GET";
  const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
  const JIRA_EMAIL  = process.env.JIRA_EMAIL;
  const JIRA_TOKEN  = process.env.JIRA_TOKEN;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");
  const url = `https://${JIRA_DOMAIN}${decodeURIComponent(path)}`;

  try {
    const opts = {
      method,
      headers: { "Authorization": `Basic ${auth}`, "Accept": "application/json", "Content-Type": "application/json" },
    };
    if (method === "POST" && event.body) opts.body = event.body;

    const res = await fetch(url, opts);
    if (res.status === 204) return { statusCode: 204, headers, body: "" };
    const data = await res.json();
    return { statusCode: res.status, headers, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}
