import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

function buildUsername(name, email) {
  const base = (name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'signer';
  return `${base}_${crypto.randomBytes(3).toString('hex')}`;
}

function publicUser(user) {
  return { id: user.id, publicId: user.publicId, username: user.username, name: user.name, email: user.email };
}

export async function signup(request, response, next) {
  try {
    const name = String(request.body?.name || '').trim();
    const email = String(request.body?.email || '').trim().toLowerCase();
    const password = String(request.body?.password || '');

    if (!name || !email || !password) return response.status(400).json({ error: 'Name, email, and password are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return response.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (await User.exists({ email })) return response.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, username: buildUsername(name, email), publicId: `asl_${crypto.randomBytes(8).toString('hex')}` });
    return response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function signin(request, response, next) {
  try {
    const method = String(request.body?.method || 'email');
    const email = String(request.body?.email || '').trim().toLowerCase();
    const username = String(request.body?.username || '').trim().toLowerCase();
    const publicId = String(request.body?.publicId || '').trim();
    const password = String(request.body?.password || '');
    const user = method === 'identity'
      ? await User.findOne({ username, publicId })
      : await User.findOne({ email });
    if (!user || (method !== 'identity' && !(await bcrypt.compare(password, user.passwordHash)))) {
      return response.status(401).json({ error: method === 'identity' ? 'Username or personal ID is incorrect.' : 'Email or password is incorrect.' });
    }
    if (!user.username || !user.publicId) {
      user.username = user.username || buildUsername(user.name, user.email);
      user.publicId = user.publicId || `asl_${crypto.randomBytes(8).toString('hex')}`;
      await user.save();
    }
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}