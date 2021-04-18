import { Divider, TablePagination } from '@material-ui/core';
import { useCmdrSearch } from 'hooks/useCmdrSearch';
import { IAmbassador } from 'models/admin/cmdr';
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { DashboardToolbar } from './dashboardToolbar';
import { AmbassadorDefaultView } from './views/ambassadorDefaultView';

type Order = 'asc' | 'desc';
const memberViews = ['Default', 'Deleted'];

interface AmbassadorDashboardProps {
  cmdrs: IAmbassador[];
  deletedCmdrs: IAmbassador[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

export const AmbassadorDashboard = (props: AmbassadorDashboardProps) => {
  const { cmdrs, selected, setSelected, deletedCmdrs } = props;

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof IAmbassador>('cmdrName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [memberView, setMemberView] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const { filteredData: filteredCmdrs } = useCmdrSearch({ searchValue, cmdrs });
  const { filteredData: filteredDeletedCmdrs } = useCmdrSearch({
    searchValue,
    cmdrs: deletedCmdrs,
  });

  useEffect(() => {
    setPage(0);
  }, [filteredCmdrs]);

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof IAmbassador
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredCmdrs.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (memberView === 1) {
    return (
      <>
        <DashboardToolbar
          title="Ambassadors"
          viewOptions={memberViews}
          view={memberView}
          setView={setMemberView}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <Divider />
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, { value: -1, label: 'All' }]}
          component="div"
          count={filteredDeletedCmdrs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        {/* <MemberDeletedView
          cmdrs={filteredDeletedCmdrs}
          selected={selected}
          setSelected={setSelected}
          page={page}
          rowsPerPage={rowsPerPage}
          order={order}
          orderBy={orderBy}
          handleSelectAllClick={handleSelectAllClick}
          handleRequestSort={handleRequestSort}
          handleClick={handleClick}
        /> */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, { value: -1, label: 'All' }]}
          component="div"
          count={filteredDeletedCmdrs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </>
    );
  }

  return (
    <>
      <DashboardToolbar
        title="Ambassadors"
        viewOptions={memberViews}
        view={memberView}
        setView={setMemberView}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <Divider />
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, { value: -1, label: 'All' }]}
        component="div"
        count={filteredCmdrs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {memberView === 0 && (
        <AmbassadorDefaultView
          cmdrs={filteredCmdrs}
          selected={selected}
          setSelected={setSelected}
          page={page}
          rowsPerPage={rowsPerPage}
          order={order}
          orderBy={orderBy}
          handleSelectAllClick={handleSelectAllClick}
          handleRequestSort={handleRequestSort}
          handleClick={handleClick}
        />
      )}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, { value: -1, label: 'All' }]}
        component="div"
        count={filteredCmdrs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </>
  );
};
