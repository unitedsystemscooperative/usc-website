import { Ranks } from 'components/information/ranks/ranks';
import { PrimaryLayout } from 'components/layouts';
import Head from 'next/head';

const RanksPage = () => {
  return (
    <>
      <Head>
        <title>USC | Elite Ranks</title>
        <meta
          name="description"
          content="Pilot's Federation Ranks in Elite Dangerous"
        />
      </Head>
      <PrimaryLayout>
        <Ranks />
      </PrimaryLayout>
    </>
  );
};

export default RanksPage;
