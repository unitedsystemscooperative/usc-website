import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import MenuIcon from '@mui/icons-material/Menu';
import { useAdmin } from 'hooks/useAdmin';
import { INavItem } from 'models/navItem';
import { signout, useSession } from 'next-auth/client';
import { KeyboardEvent, MouseEvent, useState } from 'react';
import Link from './navLink';

const useStyles = makeStyles((theme) => ({
  root: {
    // flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
}));

export const NavbarMobile = (props: {
  title: string | undefined;
  navItems: INavItem[];
}) => {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { title, navItems } = props;
  const [session] = useSession();
  const isCommand = useAdmin();

  const toggleDrawer = (open: boolean) => (
    event: KeyboardEvent | MouseEvent
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as KeyboardEvent).key === 'Tab' ||
        (event as KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setOpenDrawer(open);
  };

  const navList = () => (
    <div onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <List>
        {navItems.map((x) => (
          <Link key={x.to} href={x.to}>
            <ListItem button component="a">
              <ListItemText primary={x.text} />
            </ListItem>
          </Link>
        ))}
        {isCommand && (
          <Link href="/admin">
            <ListItem button component="a">
              <ListItemText primary="Admin" />
            </ListItem>
          </Link>
        )}
        {session ? (
          <ListItem button component="button" onClick={() => signout()}>
            <ListItemText primary="Sign Out" />
          </ListItem>
        ) : (
          <Link href="/join">
            <ListItem button component="a">
              <ListItemText primary="Join" />
            </ListItem>
          </Link>
        )}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            onClick={toggleDrawer(true)}
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        </Toolbar>
        <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer(false)}>
          {navList()}
        </Drawer>
      </AppBar>
    </div>
  );
};
