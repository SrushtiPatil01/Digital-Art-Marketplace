import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Card, CardContent,
  Chip, Stack, Divider, Fade, Grow, Skeleton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        setEvent(await res.json());
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event?.location || '')}`;

  if (loading) return (
    <Container sx={{ py: 10 }}>
      <Skeleton variant="rectangular" height={280} />
      <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" height={500} sx={{ mt: 3 }} />
    </Container>
  );

  if (error || !event)
    return (
      <Container sx={{ py: 8 }}>
        <Typography color="error">{error || 'Event not found'}</Typography>
      </Container>
    );

  return (
    <Container maxWidth="xl" disableGutters sx={{
      py: 8, px: { xs: 4, sm: 8, md: 16 },
      background: 'linear-gradient(to bottom, #ffffff, #f2f2f2)',
      minHeight: '100vh',
    }}>
      {/* Back Navigation */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 2 }}>
          <Chip
            component={Link}
            to="/events"
            icon={<ArrowBackIcon />}
            label="Back to Events"
            clickable
            sx={{
              bgcolor: '#fff',
              boxShadow: 2,
              '&:hover': { boxShadow: 4, backgroundColor: '#f7f7f7' },
            }}
          />
        </Box>
      </Fade>

      {/* Hero Banner */}
      <Grow in timeout={600}>
        <Box sx={{
          position: 'relative',
          height: { xs: 220, sm: 300, md: 420 },
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          boxShadow: 6,
        }}>
          <Box
            component="img"
            src={`http://localhost:3002${event.image}`}
            alt={event.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85))',
            zIndex: 1,
          }} />
          <Typography
            variant="h2"
            sx={{
              position: 'absolute',
              bottom: 30,
              left: 40,
              zIndex: 2,
              color: '#fff',
              fontWeight: 700,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {event.title}
          </Typography>
        </Box>
      </Grow>

      {/* Event Info Card */}
      <Grow in timeout={900}>
        <Card sx={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 3,
          boxShadow: 5,
        }}>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              sx={{ flexWrap: 'wrap' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="primary" />
                <Typography variant="subtitle1">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon color="secondary" />
                <Typography variant="subtitle1">{event.location}</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 4 }}
            >
              {event.description}
            </Typography>

            {/* Map & Venue Section */}
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Venue Location
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2,
                  boxShadow: 2,
                }}
              >
                <iframe
                  title="Google Map - Event Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
                <Button
                  variant="outlined"
                  size="medium"
                  component="a"
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 500 }}
                >
                  View on Google Maps
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Container>
  );
};

export default EventDetails;
