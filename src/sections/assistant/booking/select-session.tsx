import React from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useGetAvailableSlots } from 'src/api/assistant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

interface Session {
  start_time: string;
  end_time: string;
  session_no: number[];
}

interface SessionStepProps {
  sessions: Session[];
  handleSessionChange: (index: number, key: string, value: string | number[]) => void;
  addSession: () => void;
  removeSession: (index: number) => void;
  driverId: number;
  handleNext: () => void;
  setIsPickupEnabled: any;
}

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (day: number) => {
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return day === selected.getDate() &&
           month === selected.getMonth() &&
           year === selected.getFullYear();
  };

  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (day: number) => {
    if (isPast(day)) return;

    // FIX: Create date string in YYYY-MM-DD format without timezone conversion
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<Box key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayIsPast = isPast(day);
    const dayIsToday = isToday(day);
    const dayIsSelected = isSelected(day);

    days.push(
      <Box
        key={day}
        onClick={() => handleDateClick(day)}
        sx={{
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          cursor: dayIsPast ? 'not-allowed' : 'pointer',
          fontWeight: dayIsSelected ? 700 : dayIsToday ? 600 : 400,
          bgcolor: dayIsSelected ? '#ff7b00' : dayIsToday ? '#fff4e6' : 'transparent',
          color: dayIsSelected ? 'white' : dayIsPast ? '#ccc' : dayIsToday ? '#ff7b00' : '#3b1f0d',
          border: dayIsToday && !dayIsSelected ? '2px solid #ff7b00' : '2px solid transparent',
          transition: 'all 0.2s',
          '&:hover': !dayIsPast && {
            bgcolor: dayIsSelected ? '#e66d00' : '#fff4e6',
            transform: 'scale(1.05)',
          },
          opacity: dayIsPast ? 0.4 : 1,
        }}
      >
        {day}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '2px solid #e0e0e0',
        bgcolor: 'white',
      }}
    >
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <IconButton onClick={previousMonth} sx={{ color: '#ff7b00' }}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#3b1f0d' }}>
          {monthNames[month]} {year}
        </Typography>
        <IconButton onClick={nextMonth} sx={{ color: '#ff7b00' }}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Day Names */}
      <Grid container spacing={1} mb={1}>
        {dayNames.map((day) => (
          <Grid item xs={12 / 7} key={day}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#999',
                fontSize: 12,
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
        }}
      >
        {days}
      </Box>

      {/* Legend */}
      <Box mt={3} display="flex" gap={3} justifyContent="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              border: '2px solid #ff7b00',
              bgcolor: '#fff4e6',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Today
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              bgcolor: '#ff7b00',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Selected
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const SessionStep: React.FC<SessionStepProps> = ({
  sessions,
  handleSessionChange,
  addSession,
  removeSession,
  driverId,
  handleNext,
  setIsPickupEnabled,
}) => {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [showPickupOnly, setShowPickupOnly] = React.useState(false);

  const getLastBookedEndTime = (index: number): string | undefined => {
    if (index === 0) return undefined;
    const prevSession = sessions[index - 1];
    if (prevSession?.start_time && prevSession?.end_time) {
      return `${prevSession.start_time.split(' ')[0]} ${prevSession.end_time}`;
    }
    return undefined;
  };

  const currentRequestedDate =
    expandedIndex !== null && sessions[expandedIndex]?.start_time
      ? sessions[expandedIndex].start_time.split(' ')[0]
      : new Date().toISOString().split('T')[0];

  const lastBookedEndTime =
    expandedIndex !== null ? getLastBookedEndTime(expandedIndex) : undefined;

  const { availableSlots, availableSlotLoading } = useGetAvailableSlots({
    driver_id: driverId,
    requested_date: currentRequestedDate,
    last_booked_endtime: lastBookedEndTime,
  });

  const handleToggleSlots = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDateSelect = (index: number, date: string) => {
    // Date is now in YYYY-MM-DD format from Calendar component
    // Append 12:00:00 to avoid timezone shifting
    const dateTimeString = `${date} 12:00:00`;
    handleSessionChange(index, 'start_time', dateTimeString);
    handleSessionChange(index, 'end_time', '');
  };

  // Helper function to categorize slots by time of day
  const categorizeSlots = (slots: any[]) => {
    const morning: any[] = [];
    const noon: any[] = [];
    const evening: any[] = [];

    slots.forEach((slot) => {
      const hour = moment.utc(slot.start_time).hour();

      if (hour >= 5 && hour < 12) {
        morning.push(slot);
      } else if (hour >= 12 && hour < 17) {
        noon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, noon, evening };
  };

  // Filter slots based on pickup preference and availability
  const getFilteredSlots = () => {
    if (!availableSlots) return [];

    return availableSlots.filter((slot: any) => {
      const slotStartTime = moment.utc(slot.start_time).format('YYYY-MM-DD HH:mm:ss');

      const isAlreadySelectedInOtherSession = sessions.some((s, i) => {
        if (i === expandedIndex) return false;
        if (!s.start_time) return false;
        return moment.utc(s.start_time).format('YYYY-MM-DD HH:mm:ss') === slotStartTime;
      });

      return (!showPickupOnly || slot.is_pickup_enabled) && !isAlreadySelectedInOtherSession;
    });
  };

  // Render slot card
  const renderSlotCard = (slot: any, idx: number) => (
    <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: slot.is_pickup_enabled ? '#fff4e6' : 'white',
          border: '2px solid',
          borderColor: slot.is_pickup_enabled ? '#ff7b00' : '#e0e0e0',
          cursor: 'pointer',
          textAlign: 'center',
          position: 'relative',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#ff7b00',
            bgcolor: '#fff4e6',
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(255, 123, 0, 0.2)',
          },
        }}
        onClick={() => {
          const startUtc = moment.utc(slot.start_time).format('YYYY-MM-DD HH:mm:ss');
          const endUtc = moment.utc(slot.end_time).format('HH:mm:ss');

          if (expandedIndex !== null) {
            handleSessionChange(expandedIndex, 'start_time', startUtc);
            handleSessionChange(expandedIndex, 'end_time', endUtc);
            handleSessionChange(expandedIndex, 'is_pickup_enabled', slot.is_pickup_enabled);
            setIsPickupEnabled(slot.is_pickup_enabled);
            setExpandedIndex(null);
          }
        }}
      >
        <Typography variant="body1" fontWeight={700} sx={{ color: '#3b1f0d' }}>
          {moment.utc(slot.start_time).format('hh:mm A')}
        </Typography>

        {slot.is_pickup_enabled && (
          <DirectionsCarIcon
            sx={{
              fontSize: 16,
              color: '#ff7b00',
              position: 'absolute',
              top: 6,
              right: 6,
            }}
          />
        )}
      </Paper>
    </Grid>
  );

  // Render time period section
  const renderTimePeriodSection = (
    title: string,
    icon: React.ReactNode,
    slots: any[],
    bgcolor: string,
    iconColor: string
  ) => {
    if (slots.length === 0) return null;

    return (
      <Box mb={3}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
            p: 2,
            bgcolor: bgcolor,
            borderRadius: 2,
            border: '2px solid',
            borderColor: iconColor,
          }}
        >
          {icon}
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#3b1f0d' }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {slots.length} {slots.length === 1 ? 'slot' : 'slots'} available
            </Typography>
          </Box>
          <Chip
            label={slots.length}
            sx={{
              bgcolor: iconColor,
              color: 'white',
              fontWeight: 700,
              minWidth: 40,
            }}
          />
        </Box>
        <Grid container spacing={2}>
          {slots.map((slot, idx) => renderSlotCard(slot, idx))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Sessions List */}
      <Stack spacing={3}>
        {sessions.map((session, index) => (
          <Box key={index}>
            <Paper
              elevation={0}
              sx={{
                border: '2px solid',
                borderColor: expandedIndex === index ? '#ff7b00' : '#e0e0e0',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Session Header Bar */}
              <Box
                sx={{
                  bgcolor: '#3b1f0d',
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      bgcolor: '#ff7b00',
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Session {index + 1}
                  </Typography>
                </Box>

                {index > 0 && (
                  <IconButton
                    onClick={() => removeSession(index)}
                    aria-label={`Remove Session ${index + 1}`}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 123, 0, 0.8)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              {/* Session Content */}
              <Box sx={{ p: 3, bgcolor: 'white' }}>
                <Grid container spacing={3}>
                  {/* Calendar Selection - Always Visible */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#ff7b00' }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Select Date
                        </Typography>
                      </Box>
                      <Calendar
                        selectedDate={session.start_time ? session.start_time.split(' ')[0] : null}
                        onDateSelect={(date) => handleDateSelect(index, date)}
                      />
                    </Box>
                  </Grid>

                  {/* Selected Date & Time Display */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: '#ff7b00' }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Selected Date & Time
                        </Typography>
                      </Box>

                      {/* Selected Date Display - Shows after date is selected */}
                      {session.start_time ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#fff4e6',
                            border: '2px solid #ff7b00',
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={1}
                            sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                          >
                            Selected Date
                          </Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#3b1f0d', mb: session.end_time ? 2 : 0 }}>
                            {moment(session.start_time.split(' ')[0]).format('dddd, MMMM D, YYYY')}
                          </Typography>

                          {session.end_time && (
                            <>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mb={1}
                                sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                              >
                                Selected Time Slot
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: 'white',
                                  border: '2px solid #ff7b00',
                                  borderRadius: 2,
                                  p: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography variant="h5" fontWeight={700} sx={{ color: '#ff7b00' }}>
                                  {moment.utc(session.start_time).format('hh:mm A')} -{' '}
                                  {moment
                                    .utc(`${session.start_time.split(' ')[0]} ${session.end_time}`)
                                    .format('hh:mm A')}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    handleSessionChange(index, 'start_time', '');
                                    handleSessionChange(index, 'end_time', '');
                                  }}
                                  sx={{ color: '#ff7b00' }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </>
                          )}
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            bgcolor: '#f5f5f5',
                            border: '2px dashed #ccc',
                            borderRadius: 3,
                            p: 3,
                            textAlign: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No date selected
                          </Typography>
                        </Box>
                      )}

                      {/* Select Slot Button - Only shows when date is selected */}
                      {session.start_time && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleToggleSlots(index)}
                          endIcon={
                            <ExpandMoreIcon
                              sx={{
                                transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                              }}
                            />
                          }
                          sx={{
                            py: 1.5,
                            bgcolor: '#ff7b00',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: 16,
                            '&:hover': {
                              bgcolor: '#e66d00',
                            },
                          }}
                        >
                          {expandedIndex === index ? 'Hide Available Slots' : 'Select Slot'}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Expandable Slots Section */}
              <Collapse in={expandedIndex === index}>
                <Box
                  sx={{
                    bgcolor: '#fafafa',
                    borderTop: '2px solid #e0e0e0',
                    p: 3,
                  }}
                >
                  {/* Pickup Filter */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#3b1f0d' }}>
                      Available Time Slots
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showPickupOnly}
                          onChange={(e) => setShowPickupOnly(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#ff7b00',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#ff7b00',
                            },
                          }}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: '#ff7b00' }} />
                          <Typography variant="body2" fontWeight={600}>
                            Show Pickup Only
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  {/* Loading State */}
                  {availableSlotLoading ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      py={4}
                    >
                      <CircularProgress size={40} sx={{ color: '#ff7b00', mb: 2 }} />
                      <Typography color="text.secondary">Loading slots...</Typography>
                    </Box>
                  ) : (
                    <>
                      {(() => {
                        const filteredSlots = getFilteredSlots();
                        const { morning, noon, evening } = categorizeSlots(filteredSlots);

                        if (filteredSlots.length === 0) {
                          return (
                            <Box py={4} textAlign="center">
                              <Typography variant="body1" color="text.secondary">
                                No available slots
                              </Typography>
                            </Box>
                          );
                        }

                        return (
                          <>
                            {/* Morning Slots (5 AM - 12 PM) */}
                            {renderTimePeriodSection(
                              'Morning',
                              <WbSunnyIcon sx={{ fontSize: 28, color: '#FDB813' }} />,
                              morning,
                              '#FFF9E6',
                              '#FDB813'
                            )}

                            {/* Noon Slots (12 PM - 5 PM) */}
                            {renderTimePeriodSection(
                              'Afternoon',
                              <LightModeIcon sx={{ fontSize: 28, color: '#FF7B00' }} />,
                              noon,
                              '#FFF4E6',
                              '#FF7B00'
                            )}

                            {/* Evening Slots (5 PM onwards) */}
                            {renderTimePeriodSection(
                              'Evening',
                              <NightsStayIcon sx={{ fontSize: 28, color: '#5B4E77' }} />,
                              evening,
                              '#F3F0F7',
                              '#5B4E77'
                            )}
                          </>
                        );
                      })()}

                      {/* Legend */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <DirectionsCarIcon sx={{ color: '#ff7b00', fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                          Pickup option available
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        ))}
      </Stack>

      {/* Add Session Button */}
      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          onClick={addSession}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: 16,
            borderWidth: 2,
            borderColor: '#ff7b00',
            color: '#ff7b00',
            '&:hover': {
              borderWidth: 2,
              borderColor: '#e66d00',
              bgcolor: '#fff4e6',
            },
          }}
        >
          Add Session
        </Button>
      </Box>
    </Box>
  );
};

export default SessionStep;
