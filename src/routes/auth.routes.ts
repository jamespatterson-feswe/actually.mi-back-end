import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const router = Router();

/** Registration of user */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body ?? {
    username: '',
    email: '',
    password: '',
  };

  let user = null;

  if (username && email && password) {
    const hashedPW = await bcrypt.hash(password, 10);

    if (!validator.isEmail(email)) {
      res.status(400).json({ statusDesc: `Error: not a valid email address` });

      return;
    }

    try {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPW,
        },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });

      res.status(201).json({
        user: { id: user.id, username: user.username, email: user.email },
        token,
      });
    } catch (error) {
      console.error(error);
      if ((error as unknown as { code: string }).code === 'P2002') {
        res
          .status(409)
          .json({ statusDesc: 'Error: User already exists in system.' });
      } else {
        res.status(500).json({ statusDesc: 'Error: Failed to register user.' });
      }
    }
  } else {
    const missing: string[] = [];

    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    res.status(400).json({
      statusDesc: `Error: Failed to register user. The missing fields are ${missing.join(', ')}.`,
    });
  }
});

/** Login of user */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const missing: string[] = [];
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    res.status(400).json({
      statusDesc: `Error: login was unsuccessful. Missing 1 or more required fields; ${missing.join(', ')}.`,
    });

    return;
  } else {
    try {
      const loginDetails = await prisma.user.findUnique({
        where: { email },
      });

      if (loginDetails) {
        const { password: loginPassword, ...rest } = loginDetails;
        const comparison = await bcrypt.compare(password, loginPassword);

        if (!comparison) {
          res.status(401).json({ statusDesc: `Error: Incorrect password` });

          return;
        }

        res.status(200).json({
          statusDesc: 'Login was successful',
          user: {
            ...rest,
          },
          token: jwt.sign({ userId: rest.id }, process.env.JWT_SECRET!, {
            expiresIn: '7d',
          }),
        });

        return;
      } else {
        res.status(404).json({
          statusDesc:
            'Error: there is no user information for the login credentials.',
        });

        return;
      }
    } catch (error) {
      console.log(error);

      res.status(500).json({ statusDesc: 'Error: Failed to query user data.' });

      return;
    }
  }
});

export default router;
