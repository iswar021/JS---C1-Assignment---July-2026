import { userRepository } from './user.repository';
import { serializeUser, UserDTO } from './user.mapper';

/** Lists all seeded users (ordered by name) for selection in the UI. */
export async function listUsers(): Promise<UserDTO[]> {
  const users = await userRepository.findAll();
  return users.map(serializeUser);
}
