import { ObjectID, ObjectId } from 'bson';
import { IFleetCarrier } from 'models/about/fleetCarrier';
import { NextApiRequest, NextApiResponse } from 'next';
import { getIsHC } from 'utils/get-isHC';
import { connectToDatabase } from 'utils/mongo';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { db } = await connectToDatabase();
    const isHC = await getIsHC(req, db);

    const carrier: IFleetCarrier = req.body;

    switch (req.method) {
      case 'POST':
        if (!isHC) {
          res.status(401).send('unauthorized');
          return;
        }
        const response = await db
          .collection('fleetCarriers')
          .insertOne(carrier);

        res.json(response.ops);
        break;
      case 'PUT':
        if (!isHC) {
          res.status(401).send('unauthorized');
          return;
        }
        const id = new ObjectID(carrier._id);
        const updateDoc = {
          $set: {
            name: carrier.name,
            inaraLink: carrier.inaraLink,
            id: carrier.id,
            owner: carrier.owner,
            purpose: carrier.purpose,
          },
        };
        const options = { upsert: false };

        const updateResponse = await db
          .collection('fleetCarriers')
          .updateOne({ _id: id }, updateDoc, options);

        if (updateResponse.result.nModified > 0) {
          res.status(200).json(updateResponse.result);
        } else {
          res.status(500).send(`Failed to update id: ${req.body._id}`);
        }
        break;
      case 'DELETE':
        if (!isHC) {
          res.status(401).send('unauthorized');
          return;
        }
        const idtoDelete = req.query['id'] as string;
        await db
          .collection('fleetCarriers')
          .deleteOne({ _id: new ObjectId(idtoDelete) });
        res.status(200).end();
        break;
      case 'GET':
      default:
        const cursor = db
          .collection('fleetCarriers')
          .find({})
          .sort({ name: 1 });
        const carriers = await cursor.toArray();
        await cursor.close();

        res.status(200).json(carriers);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
};
