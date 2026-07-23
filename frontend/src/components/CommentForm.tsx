import { useState, type FormEvent } from 'react';
import { Button } from './ui/Button';
import { TextAreaField } from './ui/fields';

interface CommentFormProps {
  submitting: boolean;
  disabled?: boolean;
  onSubmit: (message: string) => void;
}

export function CommentForm({ submitting, disabled, onSubmit }: CommentFormProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    onSubmit(message.trim());
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <TextAreaField
        id="new-comment"
        label="Add a comment"
        rows={3}
        value={message}
        error={error}
        disabled={disabled}
        onChange={(event) => {
          setMessage(event.target.value);
          setError(undefined);
        }}
      />
      <div>
        <Button type="submit" loading={submitting} disabled={disabled}>
          Post comment
        </Button>
      </div>
    </form>
  );
}
