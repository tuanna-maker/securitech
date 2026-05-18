import { corsHeaders } from "./cors.ts";

const JSON_HEADERS = { ...corsHeaders, "Content-Type": "application/json" };

export function badRequest(message: string, details?: Record<string, string[]>) {
  return new Response(
    JSON.stringify({ error: message, ...(details ? { details } : {}) }),
    { status: 400, headers: JSON_HEADERS }
  );
}

export function notFound(entity = "Resource") {
  return new Response(
    JSON.stringify({ error: `${entity} not found` }),
    { status: 404, headers: JSON_HEADERS }
  );
}

export function methodNotAllowed() {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: JSON_HEADERS }
  );
}

export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal server error";
  return new Response(
    JSON.stringify({ error: message }),
    { status: 500, headers: JSON_HEADERS }
  );
}

export function success(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}
