import { DataConnection, MediaConnection } from "peerjs";

export function closeConnection(conn: DataConnection | MediaConnection) {
  conn.removeAllListeners();
  conn.close();
}
