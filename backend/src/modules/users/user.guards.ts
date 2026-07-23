import { ValidationError } from '../../errors/AppError';
import { userRepository } from './user.repository';

/**
 * Ensures the referenced user exists, otherwise throws a field-scoped 400.
 * Centralizes the referential check reused by ticket creation/update/assignment
 * and comment creation (removes duplicated logic across services).
 */
export async function assertUserExists(id: string, field: string): Promise<void> {
  const exists = await userRepository.existsById(id);
  if (!exists) {
    throw new ValidationError('Validation failed', { [field]: ['User does not exist'] });
  }
}
