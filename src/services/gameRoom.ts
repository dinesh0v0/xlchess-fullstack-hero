import { ref, set, get, onValue, update, remove, push, child, onDisconnect } from "firebase/database";
import { db } from "../config/firebase";

export interface ChatMessage {
  text: string;
  sender: "white" | "black";
  timestamp: number;
}

export interface MoveData {
  from: string;
  to: string;
  san: string;
  color: "w" | "b";
  timestamp: number;
}

export interface RoomData {
  hostColor: "white" | "black";
  timeControl: number;
  players: number;
  status: "waiting" | "active" | "finished";
  fen: string;
  moves?: Record<string, MoveData>;
  chat?: Record<string, ChatMessage>;
  createdAt: number;
  timers?: { w: number; b: number };
  lastMoveTimestamp?: number;
  winner?: "white" | "black" | "draw" | null;
  reason?: string;
  drawOffer?: "white" | "black";
  presence?: { white: boolean; black: boolean };
}

const ROOMS_REF = "rooms";

export const gameRoomService = {
  async createRoom(pin: string, timeControl: number, hostColor: "white" | "black") {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    const initialData: RoomData = {
      hostColor,
      timeControl,
      players: 1,
      status: "waiting",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      createdAt: Date.now(),
      timers: { w: timeControl * 60000, b: timeControl * 60000 }
    };
    await set(roomRef, initialData);
  },

  async checkRoomExists(pin: string): Promise<boolean> {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    const snapshot = await get(roomRef);
    return snapshot.exists();
  },

  async joinRoom(pin: string): Promise<{ success: boolean; error?: string; hostColor?: "white"|"black"; fen?: string }> {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      return { success: false, error: "Room not found. Invalid PIN." };
    }

    const roomData = snapshot.val() as RoomData;
    
    if (roomData.players >= 2) {
      return { success: false, error: "Room is full." };
    }

    await update(roomRef, {
      players: 2,
      status: "active",
      lastMoveTimestamp: Date.now()
    });

    return { success: true, hostColor: roomData.hostColor, fen: roomData.fen };
  },

  listenToRoom(pin: string, callback: (data: RoomData | null) => void) {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    return onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as RoomData);
      } else {
        callback(null);
      }
    });
  },

  async sendMove(pin: string, move: MoveData, newFen: string, timers: { w: number, b: number }) {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    const movesRef = child(roomRef, "moves");
    
    const newMoveRef = push(movesRef);
    await set(newMoveRef, move);
    await update(roomRef, { 
      fen: newFen,
      timers,
      lastMoveTimestamp: Date.now()
    });
  },

  async sendChat(pin: string, message: Omit<ChatMessage, "timestamp">) {
    const chatRef = ref(db, `${ROOMS_REF}/${pin}/chat`);
    const newChatRef = push(chatRef);
    await set(newChatRef, {
      ...message,
      timestamp: Date.now()
    });
  },

  async resignGame(pin: string, loserColor: "white" | "black") {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    await update(roomRef, {
      status: "finished",
      winner: loserColor === "white" ? "black" : "white",
      reason: "Resignation"
    });
  },

  async offerDraw(pin: string, color: "white" | "black") {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;
    const roomData = snapshot.val() as RoomData;
    
    if (roomData.drawOffer && roomData.drawOffer !== color) {
       // Opponent offered, we accept.
       await update(roomRef, {
         status: "finished",
         winner: "draw",
         reason: "Mutual Agreement"
       });
    } else {
       // We offer
       await update(roomRef, { drawOffer: color });
    }
  },

  async endGame(pin: string, winner: "white" | "black" | "draw" | null, reason: string) {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    await update(roomRef, {
      status: "finished",
      winner,
      reason
    });
  },

  async setupPresence(pin: string, color: "white" | "black") {
    const presenceRef = ref(db, `${ROOMS_REF}/${pin}/presence/${color}`);
    await set(presenceRef, true);
    onDisconnect(presenceRef).set(false);
  },

  async deleteRoom(pin: string) {
    const roomRef = ref(db, `${ROOMS_REF}/${pin}`);
    await remove(roomRef);
  }
};
