import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

/** Login of user */
router.post('/', async (req, res) => {
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
        const { password: loginPassword, id, email, username } = loginDetails;
        const comparison = await bcrypt.compare(password, loginPassword);

        if (!comparison) {
          res.status(401).json({ statusDesc: `Error: Incorrect password` });

          return;
        }

        res.status(200).json({
          statusDesc: 'Login was successful',
          user: {
            id,
            email,
            username,
          },
          token: jwt.sign({ userId: id }, process.env.JWT_SECRET!, {
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
