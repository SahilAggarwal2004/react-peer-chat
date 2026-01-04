import type { Connection } from "../types.js";

export function closeConnection(conn: Connection) {
  conn.removeAllListeners();
  conn.close();
}
