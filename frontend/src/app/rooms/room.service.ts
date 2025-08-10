import { Injectable } from '@angular/core';

export interface Room {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private rooms: Room[] = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' }
  ];

  getRooms(): Room[] {
    return this.rooms;
  }

  getRoom(id: number): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }
}
