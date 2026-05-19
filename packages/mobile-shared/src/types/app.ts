export type AppStatus =
  | "submitted"
  | "accepted"
  | "en_route"
  | "on_site"
  | "completed"
  | "cancelled"
  | "expired"
  | "escalated";

export type LifeRequestSource = "quick" | "support";
