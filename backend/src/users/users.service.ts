import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'user';
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(email: string, displayName: string): User {
    const user: User = { userId: uuid(), email, displayName, role: 'user' };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }
}
