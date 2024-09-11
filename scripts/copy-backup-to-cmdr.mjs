/* eslint-disable @typescript-eslint/no-var-requires */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// interface ICMDR {
//   _id: ObjectId;
//   cmdrName: string;
//   rank: Rank;
//   joinDate?: string | Date;
//   discordJoinDate?: string | Date;
// }

// enum Rank {
//   FleetAdmiral,
//   ViceAdmiral,
//   Commodore,
//   Captain,
//   LtCommander,
//   Lieutenant,
//   Ensign,
//   Cadet,
//   Reserve,
//   Ambassador,
//   Guest,
// }

/**
 * Goes through the CMDR database and adds their id to builds that name them as author.
 */
const batchFixDates = async () => {
  const connString = process.env.MONGODB_URI;
  const atlasClient = await MongoClient.connect(connString);
  const db = atlasClient.db('usc');

  const cmdrsCursor = db.collection('cmdrs2').find({}).sort({ cmdrName: 1 });
  const cmdrs = await cmdrsCursor.toArray();
  await cmdrsCursor.close();

  for (const cmdr of cmdrs) {
    const joinDate = cmdr.rank < 9 ? cmdr.joinDate : null;

    const response = await db.collection('cmdrs').updateOne(
      { _id: cmdr._id },
      {
        $set: {
          joinDate,
        },
      },
      { upsert: false }
    );

    if (response.modifiedCount === 1) console.log({ status: 'updated', cmdr: cmdr.cmdrName });
    else console.log({ status: 'not updated', cmdr: cmdr.cmdrName });
  }

  atlasClient.close();
};

batchFixDates();
