import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  useGlobalFilter,
  useTable,
  useAsyncDebounce,
  usePagination,
  useFilters,
  useSortBy,
} from "react-table";
import { BsFiletypePdf } from "react-icons/bs";
import "regenerator-runtime/runtime";
import Button from "../Button";
import Input from "../Input";
import printPDF from "./Export";
import { AiOutlineSearch } from "react-icons/ai";
import Modal from "../models/Modal";
import formatFunds from "../../utils/Funds";

const Table = ({
  columns,
  data,
  pagination = true,
  search = true,
  report = true,
}) => {
  const tableColumns = useMemo(
    () =>
      columns.map((column) => {
        return {
          ...column,
          Filter: column.filter ? SelectColumnFilter : undefined,
        }
      }),
    [columns]
  )

  const [showExportPopup, setShowExportPopup] = useState(false)
  const [reportName, setReportName] = useState('')

  const openExportPopup = () => {
    setShowExportPopup(true)
  }

  const closeExportPopup = () => {
    setShowExportPopup(false)
  }

  const TableInstance = useTable(
    {
      columns: tableColumns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    setGlobalFilter,
    prepareRow,
    state,
    preGlobalFilteredRows,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = TableInstance

  const calculateTotals = () => {
    if (data.length > 0 && data[1].monthlyTarget) {
      const monthlyTargetTotal = data.reduce((acc, row) =>
        acc + parseFloat(row.monthlyTarget.replace(/,/g, '')),
        0);
      const monthlyCollectionsTotal = data.reduce(
        (acc, row) => acc + parseFloat(row.monthlyCollections.replace(/,/g, '')), 0
      );
      const differenceTotal = data.reduce(
        (acc, row) => acc + parseFloat(row.difference.replace(/,/g, '')),
        0
      );
      return {
        monthlyTargetTotal: formatFunds(monthlyTargetTotal),
        monthlyCollectionsTotal: formatFunds(monthlyCollectionsTotal),
        differenceTotal: formatFunds(differenceTotal),
      };
    } else {
      return null
    }
      
    };
    let totalsCalculated = calculateTotals()
    
    
  return (
    <main className="w-full">
      <main className="flex flex-col item-start">
        <section className="flex flex-col items-center gap-4">
          <section className="w-full flex flex-col items-start justify-start gap-[10px]">
            <span
              className={`${
                !search && 'hidden'
              } w-full items-start flex justify-start`}
            >
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </span>
            <span className="flex flex-wrap items-center gap-4">
              {headerGroups.map((headerGroup) =>
                headerGroup.headers.map((column) =>
                  column.Filter ? (
                    <button
                      key={column.id}
                      className="p-[5px] px-2 border-accent ring-[1.5px] ring-gray-300 rounded-md focus:border-primaryColor hover:ring-primaryColor max-md:justify-start"
                    >
                      <label htmlFor={column.id}></label>
                      {column.render('Filter')}
                    </button>
                  ) : null
                )
              )}
            </span>
          </section>
          <section
            className={`${
              !report && 'hidden'
            } w-full mx-auto h-fit flex flex-col items-start flex-wrap gap-4 max-md:justify-center`}
          >
            <span>
              <Button
                className="!border-[1px]"
                value={
                  <span className="flex items-center gap-2">
                    Export Report <BsFiletypePdf />
                  </span>
                }
                onClick={openExportPopup}
              />
            </span>
          </section>
          {/* Export Popup/Modal */}
          {showExportPopup && (
            <Modal isOpen onClose={closeExportPopup}>
              <form className="flex flex-col gap-4 items-center">
                <h2 className="text-lg text-primaryColor font-semibold uppercase">
                  Print PDF
                </h2>
                <Input
                  type="text"
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                  value={reportName}
                />
                <span className="flex gap-3">
                  <Button
                    value={
                      <span className="flex items-center gap-2">
                        Export PDF
                      </span>
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      printPDF({ TableInstance, reportName, columns, totals : {monthlyTargetTotal, monthlyCollectionsTotal, differenceTotal} })
                    }}
                  />
                  <Button
                    value={
                      <span className="flex items-center gap-2">Close</span>
                    }
                    onClick={closeExportPopup}
                  />
                </span>
              </form>
            </Modal>
          )}
        </section>
        <div className="mt-2 flex flex-col w-full mx-auto">
          <div className="-my-1 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-1">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-1">
              <div className="shadow overflow-hidden flex flex-col gap-4 border-b border-gray-200">
                <table
                  {...getTableProps()}
                  className="w-full text-sm text-left text-gray-800 rounded-md"
                >
                  <thead className="bg-gray-50">
                    {headerGroups.map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        {...headerGroup.getHeaderGroupProps()}
                      >
                        {headerGroup.headers.map((column) => (
                          <th
                            key={column.id}
                            {...column.getHeaderProps()}
                            scope="col"
                            className="px-6 py-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                          >
                            {column.render('Header')}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row)
                      return (
                        <tr
                          key={row.id}
                          {...row.getRowProps()}
                          className="bg-white text-[15px] divide-y divide-gray-200 w-full"
                        >
                          {row.cells.map((cell) => {
                            return (
                              <td
                                key={cell.id}
                                {...cell.getCellProps()}
                                className="px-3 py-4 text-center text-ellipsis w-fit"
                              >
                                {cell.render('Cell')}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    <tr>
                      <td></td>
                    </tr>
                    {totalsCalculated !== null ? (
                      <tr className="bg-white text-[15px] divide-y divide-gray-200 w-full font-bold">
                        <td colSpan={6} className="px-3 py-4 text-center text-ellipsis w-fit">
                          TOTALS
                        </td>
                        <td className="px-3 py-4 text-center text-ellipsis w-fit">{totalsCalculated.monthlyTargetTotal}</td>
                        <td className="px-3 py-4 text-center text-ellipsis w-fit">{totalsCalculated.monthlyCollectionsTotal}</td>
                        <td className="px-3 py-4 text-center text-ellipsis w-fit">{totalsCalculated.differenceTotal}</td>
                      </tr>
                    ): ""}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${
            pagination ? 'flex' : 'hidden'
          }  justify-between mt-4 mb-8 max-md:flex-col`}
        >
          <div className="text-slate-500">
            <span>
              Page{' '}
              <strong>
                {state.pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 max-sm:flex-col max-sm:items-start">
            <span className="flex items-center gap-2 max-sm:">
              Go to page:{' '}
              <input
                type="number"
                defaultValue={state.pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value
                    ? Number(e.target.value) - 1
                    : 0
                  gotoPage(pageNumber)
                }}
                className="w-10 text-center border-none py-[6px] ring-[1.5px] ring-gray-300 ring-opacity-50 rounded-md focus:ring-primaryColor"
              />
            </span>
            <span className="flex items-center gap-2">
              <select
                value={state.pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ring-[1.5px] py-2 ring-gray-300 ring-opacity-50 rounded-md focus:ring-primaryColor"
              >
                {[5, 10, 25, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className={`pagination-button ${
                  !canPreviousPage ? 'pagination-button-disabled' : ''
                }`}
              >
                {'<<'}
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`pagination-button ${
                  !canPreviousPage ? 'pagination-button-disabled' : ''
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`pagination-button ${
                  !canNextPage ? 'pagination-button-disabled' : ''
                }`}
              >
                Next
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className={`pagination-button ${
                  !canNextPage ? 'pagination-button-disabled' : ''
                }`}
              >
                {'>>'}
              </button>
            </span>
          </div>
        </div>
      </main>
    </main>
  )
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-1000 text-[14px]">{render('Header')}: </span>
      <select
        className="rounded-sm w-full bg-transparent outline-none border-none focus:border-none focus:outline-primary"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option className="text-[13px]" value="">
          All
        </option>
        {options.map((option, i) => (
          <option className="text-[13px]" key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <label className="relative max-w-[50%] min-w-[30%]">
      <Input
        type="text"
        className="w-full max-w-[20rem] !py-2 !text-[14px] pr-10"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
      <Button
        className="absolute right-12 top-1/2 transform -translate-y-1/2 !bg-transparent !border-none !ring-none !shadow-none hover:!text-primaryColor !p-0"
        value={<AiOutlineSearch className="text-[20px] font-bold" />}
        onClick={() => {
          setGlobalFilter(value || undefined);
        }}
      />
    </label>
  );
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  pagination: PropTypes.bool,
  search: PropTypes.bool,
  report: PropTypes.bool,
};

export default Table;
