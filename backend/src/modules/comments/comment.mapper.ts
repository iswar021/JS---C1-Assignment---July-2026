import { CommentWithAuthor } from './comment.repository';

export interface CommentDTO {
  id: string;
  message: string;
  createdBy: { id: string; name: string };
  createdAt: Date;
}

/** Maps a Prisma comment (with author) to the public API shape. */
export function serializeComment(comment: CommentWithAuthor): CommentDTO {
  return {
    id: comment.id,
    message: comment.message,
    createdBy: comment.createdBy,
    createdAt: comment.createdAt,
  };
}
