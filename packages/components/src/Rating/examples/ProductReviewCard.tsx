import { useState } from 'react';
import { Button, Card, Div, Rating, Textarea } from '@apx-ui/ds';

export default function ProductReviewCard() {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');

  return (
    <Card style={{ maxWidth: 420 }}>
      <Card.Header
        title="Leave a review"
        subtitle="Help other shoppers by sharing your honest opinion."
      />
      <Card.Body>
        <Div display="flex" flexDirection="column" gap="4">
          <Rating
            label="Overall rating"
            value={rating}
            onChange={(next) => setRating(next)}
            required
            size="lg"
            error={rating === 0 ? 'Pick at least one star' : undefined}
          />
          <Textarea
            label="Your review"
            placeholder="What did you think?"
            value={body}
            onChange={(event) => setBody(event.currentTarget.value)}
            rows={4}
          />
        </Div>
      </Card.Body>
      <Card.Footer>
        <Button variant="solid" disabled={rating === 0}>
          Submit review
        </Button>
      </Card.Footer>
    </Card>
  );
}