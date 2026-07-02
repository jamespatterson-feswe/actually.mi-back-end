import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { ValidationRequest, validator } from '../../../middleware/index';
import { STATIC_CONTENT } from '../auth.constants';

import bcrypt from 'bcrypt';

const router = Router();

router.put('/', validator, async (req, res) => {
  const {
    userId,
    body: { username, email, bio, password, ...rest },
  } = req as ValidationRequest;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      const passwordCheck = password
        ? await bcrypt.compare(password, user.password)
        : false;

      if (passwordCheck) {
        res.status(400).json({
          statusDesc: STATIC_CONTENT.mi.update.same_pw,
        });

        return;
      } else {
        const updatedUserData: {
          username: string;
          email: string;
          bio: string;
          password?: string;
        } = {
          username: username ?? user.username,
          email: email ?? user.email,
          bio: bio ?? user.bio,
        };

        if (password) {
          updatedUserData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
          where: { id: userId },
          data: updatedUserData,
        });

        res.status(200).json({
          statusDesc: STATIC_CONTENT.mi.update.success,
        });

        return;
      }
    } else {
      res.status(404).json({
        statusDesc: STATIC_CONTENT.mi.update.not_found,
      });

      return;
    }
  } catch (error) {
    res.status(500).json({
      statusDesc: STATIC_CONTENT.mi.update.failure,
    });

    return;
  }
});

router.get('/', validator, async (req, res) => {
  const { userId } = req as ValidationRequest;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      const { password, ...rest } = user;

      res.status(200).json({
        data: {
          ...rest,
        },
        statusDesc: STATIC_CONTENT.mi.get.success,
      });

      return;
    } else {
      res.status(404).json({
        statusDesc: STATIC_CONTENT.mi.get.not_found,
      });

      return;
    }
  } catch (error) {
    res.status(500).json({
      statusDesc: STATIC_CONTENT.mi.get.failure,
    });

    return;
  }
});

export default router;
