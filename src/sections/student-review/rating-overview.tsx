import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

function getStars(avg: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (avg >= i) {
      stars.push(<StarIcon key={i} style={{ color: '#CF5A0D' }} />);
    } else if (avg >= i - 0.5) {
      stars.push(<StarHalfIcon key={i} style={{ color: '#CF5A0D' }} />);
    } else {
      stars.push(<StarBorderIcon key={i} style={{ color: '#CF5A0D' }} />);
    }
  }
  return stars;
}

export default function RatingOverview({ avgRating, starCounts, totalRatings }) {
  return (
    <Box p={2} sx={{ backgroundColor: 'primary ', borderRadius: 2, boxShadow: 1 }}>
      <Box display="flex" alignItems="center" mt={1}>
        {getStars(avgRating)}
      </Box>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {totalRatings.toLocaleString()} ratings
      </Typography>

      <Box mt={2}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = starCounts.find((s) => s.star === star)?.count || 0;
          const widthPercent = totalRatings ? (count / totalRatings) * 100 : 0;

          return (
            <Box key={star} display="flex" alignItems="center" mt={0.2}>
              <Typography variant="body2" width={24}>
                {star}
              </Typography>
              <StarIcon fontSize="small" color="primary" style={{ marginRight: 4 }} />
              <Box
                sx={{
                  flexGrow: 1,
                  height: 10,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 5,
                  overflow: 'hidden',
                  mx: 1,
                }}
              >
                <Box
                  sx={{
                    width: `${widthPercent}%`,
                    height: '100%',
                    backgroundColor: '#CF5A0D',
                  }}
                />
              </Box>
              <Typography variant="body2" width={40} textAlign="right">
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
