import { IMember } from 'models/auth/member';
import { IJoinInfo } from 'models/join/joinInfo';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { connectToDatabase } from 'utils/mongo';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'POST') {
      const response = await db
        .collection<IJoinInfo>('joiners')
        .insertOne(req.body);

      res.json(response.ops);
    } else {
      const session = await getSession({ req });
      if (session) {
        const user = await db
          .collection('members')
          .findOne<IMember>({ email: session.user.email });
        const isHC = user && user.role === 'high command' ? true : false;

        if (isHC) {
          const cursor = db
            .collection('joiners')
            .find({})
            .sort({ timeStamp: -1 });
          const factionSystems = await cursor.toArray();
          cursor.close();

          res.status(200).json(factionSystems);
        } else {
          res.statusMessage = 'You are not authorized for this information.';
          res.status(401).end();
        }
      } else {
        res.statusMessage = 'You are not signed in.';
        res.status(401).end();
      }
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
};
