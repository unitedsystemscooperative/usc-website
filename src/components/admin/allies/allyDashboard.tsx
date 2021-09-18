import { EDSpinner } from '@admiralfeb/react-components';
import {
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useAllies } from 'hooks/about/useAllies';
import { IAlly } from 'models/about/ally';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { AllyDialog } from './allyDialog';

const useTitleBarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    '& button': {
      margin: theme.spacing(1),
    },
  },
  title: {
    flex: '2 1 100%',
    textAlign: 'left',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
}));

const DashboardTitleBar = ({ addAlly }: { addAlly: () => void }) => {
  const classes = useTitleBarStyles();
  return (
    <Toolbar className={classes.root}>
      <Typography variant="h4" component="div" className={classes.title}>
        Ally Management
      </Typography>
      <Tooltip title="Add an ally" arrow>
        <Button variant="contained" color="primary" onClick={addAlly}>
          <Add />
        </Button>
      </Tooltip>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    textAlign: 'center',
  },
  paper: {
    textAlign: 'center',
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  iconButton: {
    marginLeft: theme.spacing(1),
  },
}));

export const AllyDashboard = () => {
  const classes = useStyles();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValues, setDialogValues] = useState<IAlly | undefined>(
    undefined
  );
  const {
    loading,
    allies,
    error,
    addAlly,
    updateAlly,
    deleteAlly,
  } = useAllies();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (error) {
      enqueueSnackbar('Failed to retrieve Allies. ' + error.message, {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const handleOpenDialog = (ally?: IAlly) => {
    setDialogValues(ally);
    setOpenDialog(true);
  };

  const handleDialogClose = async (ally?: IAlly) => {
    setOpenDialog(false);
    if (ally) {
      try {
        // If _id exists, then it is an update to the existing system.
        if (ally._id) {
          await updateAlly(ally);
        } else {
          await addAlly(ally);
        }
      } catch (e) {
        enqueueSnackbar(`Failed to add or update ally. Reason: ${e.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const handleDelete = async (ally: IAlly) => {
    try {
      await deleteAlly(ally);
    } catch (e) {
      enqueueSnackbar(`Failed to delete system. Reason: ${e.message}`, {
        variant: 'error',
      });
    }
  };

  if (loading) {
    return <EDSpinner />;
  }

  return (
    <Container maxWidth="sm">
      <Paper className={classes.paper}>
        <DashboardTitleBar addAlly={handleOpenDialog} />
        <List>
          {allies.map((ally: { name: string }, i: number) => (
            <ListItem key={i}>
              <ListItemText primary={`${ally.name}`} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  className={classes.iconButton}
                  onClick={() => handleOpenDialog(ally)}
                  size="large">
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  className={classes.iconButton}
                  onClick={() => handleDelete(ally)}
                  size="large">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <AllyDialog
        values={dialogValues}
        open={openDialog}
        onClose={handleDialogClose}
      />
    </Container>
  );
};
