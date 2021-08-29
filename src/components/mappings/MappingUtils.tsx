import { Box } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { FC, useCallback, useMemo } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { useBlockLayout, useTable } from 'react-table';
import { FixedSizeList } from 'react-window';
import { addOuMapping } from '../../utils';
import { $destinationOrganisationUnits, $organisationUnitMapping } from "../models/Store";
import scrollbarWidth from '../scrollbarWidth';
import { OUMapping } from './OUMapping';

interface OUProps {
  unit: string;
}

export const OUSelect: FC<OUProps> = ({ unit }) => {
  const organisationUnitMapping = useStore($organisationUnitMapping)
  const destinationOrganisationUnits = useStore($destinationOrganisationUnits)

  async function loadOptions(search: string, loadOptions: any, { page }: any) {
    const options = destinationOrganisationUnits.filter((i: any) =>
      i.name.toLowerCase().includes(search.toLowerCase()) || Object.values(i.parent).join('').includes(search.toLowerCase())
    );

    let per_page = 10;
    let offset = (page - 1) * per_page;

    let paginatedItems = options.slice(offset).slice(0, 10);
    let total_pages = Math.ceil(options.length / per_page);
    return {
      options: paginatedItems.map(({ id, name, parent }: any) => {
        return { value: id, label: name }
      }),
      hasMore: page < total_pages,
    };
  }

  return <AsyncPaginate
    value={organisationUnitMapping[unit]?.equivalent}
    onChange={addOuMapping(unit)}
    loadOptions={loadOptions}
    isClearable
    additional={{
      page: 1,
    }}
  />
}

export const DefaultOrganisationUnits = () => {
  return <OUMapping />
}


export function Table({ columns, data }) {

  const defaultColumn = useMemo(
    () => ({
      width: 300,
    }),
    []
  )

  const scrollBarSize = useMemo(() => scrollbarWidth(), [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useBlockLayout
  )

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <Box
          {...row.getRowProps({
            style,
          })}
          bg="yellow.200"
          className="tr"
        >
          {row.cells.map(cell => {
            return (
              <Box {...cell.getCellProps()} className="td">
                {cell.render('Cell')}
              </Box>
            )
          })}
        </Box>
      )
    },
    [prepareRow, rows]
  )

  return (
    <Box {...getTableProps()} className="table">
      <Box>
        {headerGroups.map(headerGroup => (
          <Box {...headerGroup.getHeaderGroupProps()} className="tr">
            {headerGroup.headers.map(column => (
              <Box {...column.getHeaderProps()} className="th">
                {column.render('Header')}
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <Box {...getTableBodyProps()}>
        <FixedSizeList
          height={750}
          itemCount={rows.length}
          itemSize={35}
          width={window.innerWidth - 70}
        >
          {RenderRow}
        </FixedSizeList>
      </Box>
    </Box>
  )
}