const express = require('express');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config();
connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://frontend-tau-virid-40.vercel.app',
  'https://frontend-tau-virid-40.vercel.app/'
];

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // make io accessible in controllers

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  
  socket.on('join_booking', (bookingId) => {
    socket.join(bookingId);
    console.log(`User joined booking room: ${bookingId}`);
  });

  socket.on('update_location', (data) => {
    // data: { bookingId, lat, lng, type: 'user' | 'provider' }
    socket.to(data.bookingId).emit('location_update', data);
  });

  socket.on('send_chat_message', (data) => {
    // broadcast to everyone in the room except sender
    socket.to(data.bookingId).emit('new_chat_message', data);
    console.log(`💬 New chat message in room ${data.bookingId}: ${data.text}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000, // Increased for dev/testing
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: '🚀 Fixit API running!', timestamp: new Date().toISOString() })
);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () =>
  console.log(`🚀 Fixit Server [${process.env.NODE_ENV}] on port ${PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
