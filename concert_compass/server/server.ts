import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/api/events', async (req, res) => {
  try {
    const calendar = await getGoogleCalendarApi();
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;

    const spotifyToken = await getSpotifyAuthToken();
    const ticketMasterEvents = await getTicketMasterEvents(query as string);
    const spotifySongs = await searchSpotifySongs(spotifyToken, query as string);

    res.json({ ticketMasterEvents, spotifySongs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { summary, description, location, start, end } = req.body;
    const calendar = await getGoogleCalendarApi();
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary,
        description,
        location,
        start,
        end,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { summary, description, location, start, end } = req.body;
    const calendar = await getGoogleCalendarApi();
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: id,
      resource: {
        summary,
        description,
        location,
        start,
        end,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await getGoogleCalendarApi();
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: id,
    });

    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})

