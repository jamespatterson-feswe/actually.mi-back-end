import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body ?? { username: '', email: '', password: '' };

  let user = null;

  if (username && email && password) {
    const hashedPW = await bcrypt.hash(password, 10);

    if (!validator.isEmail(email)) {
      res.status(400).json({ statusDesc: `Error: not a valid email address`});
      
      return;
    }

    try {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPW
        }
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      res.status(201).json({
        user: { id: user.id, username: user.username, email: user.email },
        token
      })
    } catch (error) {
      console.error(error);
      if ((error as unknown as { code: string }).code === 'P2002') {
        res.status(409).json({ statusDesc: 'Error: User already exists in system.' });
      } else {
        res.status(500).json({ statusDesc: 'Error: Failed to register user.' });
      }
    }
  } else {
    const missing: string[] = [];

    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    res.status(400).json({ statusDesc: `Error: Failed to register user. The missing fields are ${missing.join(', ')}.`});
  }
})

export default router;
