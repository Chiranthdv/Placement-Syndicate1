import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from './models/User.js';

dotenv.config({ path: '../../.env' });

const app = express();
const port = 8081;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/userdb')
  .then(() => console.log('Connected to MongoDB (userdb)'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'user-service' }));

const signupSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  year: Joi.number().required()
});

const registerSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  year: Joi.number().required(),
  role: Joi.string().valid('Junior', 'Senior', 'Admin').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const generateToken = (user) => {
  return jwt.sign(
    { sub: user._id, email: user.email, name: user.firstname, role: user.role },
    process.env.JWT_SECRET || 'mini-project-local-dev-secret-change-this-32',
    { expiresIn: (process.env.JWT_EXPIRY_HOURS || '8') + 'h', issuer: 'mini-project' }
  );
};

const userResponse = (user) => ({
  id: user._id.toString(),
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  role: user.role,
  createdDate: user.createdDate
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const role = value.year >= 4 ? 'Senior' : 'Junior';
    
    const user = new User({ ...value, password: hashedPassword, role });
    await user.save();
    
    const token = generateToken(user);
    res.status(201).json({ token, user: userResponse(user) });
  } catch (err) { next(err); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(value.password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = generateToken(user);
    res.json({ token, user: userResponse(user) });
  } catch (err) { next(err); }
});

app.post('/api/users/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const role = value.role ? value.role : (value.year >= 4 ? 'Senior' : 'Junior');
    
    const user = new User({ ...value, password: hashedPassword, role });
    await user.save();
    
    res.status(201).json(userResponse(user));
  } catch (err) { next(err); }
});

app.get('/api/users/me', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(userResponse(user));
  } catch (err) { next(err); }
});

app.get('/api/users/all', async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users.map(userResponse));
  } catch (err) { next(err); }
});

app.get('/api/users/:userid', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(userResponse(user));
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  console.error('[' + new Date().toISOString() + '] User Service Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, () => {
  console.log('[' + new Date().toISOString() + '] User Service running on port ' + port);
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});
process.on('SIGINT', () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});
