// src/models/User.ts
export class User {
  id: number;
  email?: string;
  role?: string;

  constructor(payload: any) {
    this.id = payload.userId ?? payload.id;
    this.email = payload.email;
    this.role = payload.role;
  }

  // isAdmin() {
  //   return this.role === 'admin';
  // }
}
