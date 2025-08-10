import type { components } from '../../types/api';

export type Message = components['schemas']['Message'];
export type MessagePost = components['schemas']['MessagePost'];
export type MessagePatch = components['schemas']['MessagePatch'];
export type InviteToken = components['schemas']['InviteToken'];
export type Problem = components['schemas']['Problem'];

/**
 * Minimal REST client using fetch and OpenAPI generated types.
 */
export class ApiService {
  constructor(private baseUrl: string, private token?: string) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      h['Authorization'] = `Bearer ${this.token}`;
    }
    return h;
  }

  async postMessage(body: MessagePost): Promise<Message> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw (await res.json()) as Problem;
    }
    return (await res.json()) as Message;
  }

  async patchMessage(messageId: string, body: MessagePatch): Promise<Message> {
    const res = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw (await res.json()) as Problem;
    }
    return (await res.json()) as Message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) {
      throw (await res.json()) as Problem;
    }
  }

  async createInvite(body: {
    roomId: string;
    expiresInHours?: number;
  }): Promise<InviteToken> {
    const res = await fetch(`${this.baseUrl}/invites`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw (await res.json()) as Problem;
    }
    return (await res.json()) as InviteToken;
  }

  async acceptInvite(token: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/invites/accept`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw (await res.json()) as Problem;
    }
  }
}
