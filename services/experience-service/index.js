import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Joi from 'joi';
import Experience from './models/Experience.js';

dotenv.config({ path: '../../.env' });

const app = express();
const port = 8082;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/experiencedb')
  .then(() => console.log('Connected to MongoDB (experiencedb)'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'experience-service' }));

const experienceSchema = Joi.object({
  companyName: Joi.string().required(),
  role: Joi.string().allow('', null),
  year: Joi.number().allow(null),
  rounds: Joi.array().items(Joi.object({
    roundName: Joi.string().allow('', null),
    description: Joi.string().allow('', null)
  })).allow(null),
  quetions: Joi.string().allow('', null),
  tips: Joi.string().allow('', null),
  difficultyLevel: Joi.string().valid('EASY', 'MEDIUM', 'HARD').allow(null)
});

app.post('/api/experience/register', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { error, value } = experienceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const experience = new Experience({ ...value, createdBy: userId });
    await experience.save();
    
    res.status(201).json(experience);
  } catch (err) { next(err); }
});

app.get('/api/experience/me', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const exps = await Experience.find({ createdBy: userId });
    res.json(exps);
  } catch (err) { next(err); }
});

app.get('/api/experience/companies', async (req, res, next) => {
  try {
    const companies = await Experience.distinct('companyName');
    res.json(companies);
  } catch (err) { next(err); }
});

app.get('/api/experience/company/:companyName', async (req, res, next) => {
  try {
    const exps = await Experience.find({ companyName: req.params.companyName });
    res.json(exps);
  } catch (err) { next(err); }
});

app.get('/api/experience/:id', async (req, res, next) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    res.json(exp);
  } catch (err) { next(err); }
});

app.delete('/api/experience/admin/:experienceId', async (req, res, next) => {
  try {
    if (req.headers['x-user-role'] !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const exp = await Experience.findByIdAndDelete(req.params.experienceId);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

app.delete('/api/experience/delete/:experienceId', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const exp = await Experience.findById(req.params.experienceId);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    
    if (exp.createdBy !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Experience.findByIdAndDelete(req.params.experienceId);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  console.error('[' + new Date().toISOString() + '] Experience Service Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(port, () => {
  console.log('[' + new Date().toISOString() + '] Experience Service running on port ' + port);
});

process.on('SIGTERM', async () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});
process.on('SIGINT', async () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});
