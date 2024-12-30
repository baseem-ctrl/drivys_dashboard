// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
// components
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type TrainerFeedbackProps = {
  trainer_name: string;
  trainer_email: string;
  trainer_id: number;
  avg_rating: string | null;
  feedback_comments: string | null;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  feedbackList: TrainerFeedbackProps[];
}

export default function ReviewedTrainer({ title, subheader, feedbackList, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack
          spacing={3}
          sx={{
            p: 3,
            minWidth: 360,
            height: '400px',
            overflowY: 'auto',
          }}
        >
          {feedbackList.map((feedback) => (
            <FeedbackItem key={feedback.trainer_id} feedback={feedback} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type FeedbackItemProps = {
  feedback: TrainerFeedbackProps;
};

function FeedbackItem({ feedback }: FeedbackItemProps) {
  const { trainer_name, trainer_email, avg_rating, feedback_comments } = feedback;
  const firstLetter = trainer_name.charAt(0).toUpperCase();
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        variant="rounded"
        sx={
          {
            //   width: 48,
            //   height: 48,
            //   bgcolor: 'background.neutral',
          }
        }
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 68,
            height: 68,
            bgcolor: 'primary.main',
          }}
        >
          {firstLetter}
        </Avatar>
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {trainer_name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {trainer_email}
        </Typography>

        <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
          <Rating
            readOnly
            size="small"
            precision={0.5}
            name="reviews"
            value={avg_rating ? parseFloat(avg_rating) : 0}
          />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {avg_rating ? `${parseFloat(avg_rating).toFixed(0)} Rating` : 'No Rating'}
          </Typography>
        </Stack>

        {feedback_comments && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
            "{feedback_comments}"
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
