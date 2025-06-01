import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  rowsPerPageOptions?: number[];
  count: number;
  page: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  renderCell?: (row: any, columnId: string) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  rowsPerPageOptions = [5, 10, 25],
  count,
  page,
  onPageChange,
  onRowsPerPageChange,
  renderCell
}) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    onRowsPerPageChange(newRowsPerPage);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#D3E3EC' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold', width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {renderCell ? renderCell(row, column.id) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Itens por página:"
      />
    </Paper>
  );
};

export default DataTable;