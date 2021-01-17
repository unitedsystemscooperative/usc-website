import {
  Button,
  Container,
  Divider,
  Link,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { PrimaryLayout } from 'components/layouts';
import {
  getAllReleaseIDs,
  getReleaseData,
} from 'functions/releases/getReleases';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import NextLink from 'next/link';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  paper: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

const Release = ({
  releaseData,
}: {
  releaseData: { id: string; content: string; title: string; date: string };
}) => {
  const classes = useStyles();
  return (
    <PrimaryLayout>
      <Container maxWidth='lg' className={classes.root}>
        <NextLink href='/releases' passHref>
          <Button color='secondary' variant='contained'>
            Return to Releases
          </Button>
        </NextLink>
        <Paper className={classes.paper}>
          <Typography variant='h4'>{releaseData.title}</Typography>
          <Typography variant='subtitle1'>{releaseData.date}</Typography>
          <Divider />
          <ReactMarkdown
            plugins={[gfm]}
            renderers={{ paragraph: Typography, link: Link }}
            children={releaseData.content}
          />
        </Paper>
      </Container>
    </PrimaryLayout>
  );
};

export async function getStaticPaths() {
  const paths = getAllReleaseIDs();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const releaseData = getReleaseData(params.id);
  return {
    props: {
      releaseData,
    },
  };
}

export default Release;
