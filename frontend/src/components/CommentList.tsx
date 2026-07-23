import type { Comment } from '../types';
import { formatDateTime } from '../lib/format';

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-md border border-gray-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-800">{comment.createdBy.name}</span>
            <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.message}</p>
        </li>
      ))}
    </ul>
  );
}
