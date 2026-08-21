import bcrypt from 'bcryptjs';
import User from '../models/User.js';

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
    const user = await User.create({ name, email, passwordHash });
    return response.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

export async function signin(request, response, next) {
  try {
    const email = String(request.body?.email || '').trim().toLowerCase();
    const password = String(request.body?.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ error: 'Email or password is incorrect.' });
    return response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
}