import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

type Review = {
  session_id: number;
  driver_rating: number | null;
  driver_comments: string | null;
  booking_id: number;
  trainer_id: number;
  trainer_name: string;
  trainer_email: string;
  trainer_phone: string;
};

type Student = {
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  reviews: Review[];
};

type Props = {
  students: Student[];
};

const StudentReviewsTable: React.FC<Props> = ({ students }) => {
  const router = useRouter();
  const handleBookingClick = (booking_id) => {
    router.push(paths.dashboard.booking.details(booking_id));
  };
  const handleUserDetails = (user_id) => {
    router.push(paths.dashboard.user.details(user_id));
  };
  return (
    <div>
      {students.map((student) => (
        <div key={student.student_id}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderTopLeftRadius: '12px' }}>Session ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Booking ID</TableCell>
                <TableCell>Trainer Name</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell sx={{ borderTopRightRadius: '12px' }}>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {student.reviews.map((review) => (
                <TableRow key={review.session_id}>
                  <TableCell>{review.session_id}</TableCell>
                  <TableCell>{student.student_name}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                      onClick={() => handleBookingClick(review.booking_id)}
                    >
                      {review.booking_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                      onClick={() => handleUserDetails(review?.trainer_id)}
                    >
                      {review.trainer_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {review.driver_rating ? (
                      <Box display="flex" alignItems="center">
                        {Array.from({ length: 5 }).map((_, index) =>
                          index < review.driver_rating ? (
                            <StarIcon
                              key={index}
                              style={{ color: '#CF5A0D', marginRight: '4px' }}
                            />
                          ) : (
                            <StarBorderIcon
                              key={index}
                              style={{ color: '#CF5A0D', marginRight: '4px' }}
                            />
                          )
                        )}
                      </Box>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{review.driver_comments || 'No Comments'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default StudentReviewsTable;
