import { io, Socket } from 'socket.io-client';
import type { components } from '../../types/api';

export type Message = components['schemas']['Message'];
export type MessagePost = components['schemas']['MessagePost'];
export type Room = components['schemas']['Room'];
export type RoomMember = components['schemas']['RoomMember'];
export type Problem = components['schemas']['Problem'];

export interface Ack<T = void> {
  ok: boolean;
  data?: T;
  error?: Problem;
}

export interface ClientToServerEvents {
  'room:join': (data: { roomId: string }, ack: (res: Ack) => void) => void;
  'room:left': (data: { roomId: string }, ack: (res: Ack) => void) => void;
  'message:send': (
    data: MessagePost & { clientMsgId?: string },
    ack: (res: Ack<Message>) => void,
  ) => void;
  'message:edit': (
    data: { messageId: string; body: string },
    ack: (res: Ack<Message>) => void,
  ) => void;
  'message:delete': (
    data: { messageId: string },
    ack: (res: Ack) => void,
  ) => void;
}

export interface ServerToClientEvents {
  'message:delivered': (data: { message: Message }) => void;
  'message:edited': (data: { message: Message }) => void;
  'message:deleted': (data: { messageId: string }) => void;
  'room:updated': (data: { room: Room }) => void;
  'room:archived': (data: { roomId: string }) => void;
  'room:members:updated': (data: { roomId: string; members: RoomMember[] }) => void;
}

export class WsService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor(baseUrl: string, token: string) {
    this.socket = io(baseUrl, {
      path: '/ws',
      auth: { token },
    });
  }

  on<K extends keyof ServerToClientEvents>(event: K, listener: ServerToClientEvents[K]): void {
    // The socket.io type definitions include several reserved events; casting
    // here keeps our event map strongly typed while satisfying the library's
    // broader signature.
    this.socket.on(event, listener as any);
  }

  emit<K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>): void {
    this.socket.emit(event, ...args);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
