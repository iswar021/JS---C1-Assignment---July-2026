import { User } from '@prisma/client';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function serializeUser(user: User): UserDTO {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
