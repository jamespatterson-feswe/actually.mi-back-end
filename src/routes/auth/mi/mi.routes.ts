import { Router } from 'express';
import { prisma } from '../../../lib/prisma';
import { validator } from '../../../middleware/index';

const router = Router();

router.get('/', validator, async (req, res) => {
  const { userId } = req as unknown as { userId: string };

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
        statusDesc: 'Success: user found.',
      });
    } else {
      res.status(404).json({
        statusDesc: 'Error: no user found.',
      });
    }
  } catch (error) {
    res.status(500).json({
      statusDesc: 'Error: There was an issue fetching the user data.',
    });
  }
});

export default router;
