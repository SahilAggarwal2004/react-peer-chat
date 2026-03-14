import type { Connection } from "../types";

export function closeConnection(conn: Connection) {
  conn.removeAllListeners();
  conn.close();
}
