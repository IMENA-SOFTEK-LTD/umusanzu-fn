import 'core-js/stable';
import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import FaQrcode from '../../assets/qrcode.jpeg';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import 'regenerator-runtime/runtime';
import { useLazyGetSectorsCommissionsQuery, useLazyGetSingleSectorCommisionQuery } from '../../states/api/apiSlice';
import { useSelector } from 'react-redux'

import {
    useGlobalFilter,
    useTable,
    useAsyncDebounce,
    useFilters,
    useSortBy,
    usePagination,
} from 'react-table';
import Button, { PageButton } from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight, faClose, faFile, faFileExcel, faFilePdf, } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import printPDF from '../../utils/Export';

const Sector_commission = ({ user }) => {
    const [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format('YYYY-MM'));
    const [noDataMessage, setNoDataMessage] = useState('');
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [reportName, setReportName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {
        page: offset,
    } = useSelector((state) => state.pagination)

    const [sectorData, setSectorData] = useState([]);

    const openExportPopup = () => {
        setShowExportPopup(true);
    };


    const closeExportPopup = () => {
        setShowExportPopup(false);
    };
    const [
        getSectorsCommission,
        {
            data: SectorCommisionData,
            isLoading: SectorCommisionLoading,
            isSuccess: SectorCommisionSuccess,
            isError: SectorCommisionError,
            error: SectorCommisionErrors,
        },
    ] = useLazyGetSectorsCommissionsQuery();

    const [
        getSingleSectorCommission,
        {
            data: singleSectorCommisionData,
            isLoading: singleSectorCommisionLoading,
            isSuccess: singleSectorCommisionSuccess,
            isError: singleSectorCommisionError,

        },
    ] = useLazyGetSingleSectorCommisionQuery();

    useEffect(() => {
        getSectorsCommission({
            month: selectedDate,
        })
    }, [selectedDate]);
    useEffect(() => {
        if (SectorCommisionData) {
            const newData = SectorCommisionData?.data?.map((data) => ({
                id: data.id,
                name: data.name,
                totalAmount: data.totalAmount,
                commission: data.commission,
                merchant_code: data.merchant_code,
            }));
            setData(newData);
            if (newData.length === 0) {
                setNoDataMessage('No data found');
            } else {
                setNoDataMessage('');
            }
        }
    }, [SectorCommisionData]);

    useEffect(() => {
        if (singleSectorCommisionSuccess) {
            setSectorData(singleSectorCommisionData?.data);
            printPDF({totalCommission: singleSectorCommisionData?.data[0]?.commission, reportName: singleSectorCommisionData?.data[0]?.name, monthPaid: selectedDate})
        }
    }, [singleSectorCommisionData]);


    const columns = useMemo(
        () => [
            {
                Header: 'Sector Name',
                accessor: 'name',
                sortable: true,
                Filter: SelectColumnFilter,
            },
            {
                Header: 'Total Amount',
                accessor: 'totalAmount',
                sortable: true,
            },
            {
                Header: 'Commission',
                accessor: 'commission',
                sortable: true,
            },
            {
                Header: 'Merchant_code',
                accessor: 'merchant_code',
                sortable: true,
            },
            {
                Header: 'Action',
                accessor: 'id',
                Cell: ({ row }) => (
                    <Button
                        value={
                            isLoading ? (
                                // Render a loading indicator while isLoading is true
                                <span>Loading...</span>
                            ) : (
                                // Render the button with your content when isLoading is false
                                <span className="flex items-center gap-2">
                                    Generate Report
                                    <FontAwesomeIcon icon={faFile} />
                                </span>
                            )
                        }
                        onClick={async (e) => {
                            e.preventDefault();
                            await getSingleSectorCommission({
                                departmentId: row.original.id,
                                month: selectedDate,
                            })
                        }}
                        className="btn-action"
                    />

                ),
            },
        ],
        []
    );

    const tableHooks = (hooks) => {
        hooks.visibleColumns.push((columns) => [
            {
                id: 'no',
                Header: 'No',
                accessor: 'id',
                Cell: ({ row }) => <p>{row.index + 1}</p>,
                sortable: true,
            },

            ...columns,
        ]);
    };

    const TableInstance = useTable(
        {
            columns,
            data,
        },
        useFilters,
        tableHooks,
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        setGlobalFilter,
        prepareRow,
        canPreviousPage,
        canNextPage,
        state,
        preGlobalFilteredRows,
        page,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
    } = TableInstance;

    return (
        <main className="my-12 w-full">
            <div className="flex flex-col items-center gap-6">
                <div className="search-filter flex flex-col items-center gap-6">
                    <span className="w-fit min-w-[30rem] flex flex-col items-end justify-center">
                        <GlobalFilter
                            preGlobalFilteredRows={preGlobalFilteredRows}
                            globalFilter={state.globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </span>
                    <input
                        type="month"
                        className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
                        onChange={(e) => {
                            const newDate = e.target.value;
                            setSelectedDate(newDate);
                        }}
                        value={selectedDate}
                    />

                    <span className="w-full h-fit flex items-center gap-4">
                        {headerGroups.map((headerGroup) =>
                            headerGroup.headers.map((column) =>
                                column.Filter ? (
                                    <div
                                        key={column.id}
                                        className="p-[5px] px-2 border-[1px] shadow-md rounded-md"
                                    >
                                        <label htmlFor={column.id}></label>
                                        {column.render('Filter')}
                                    </div>
                                ) : null
                            )
                        )}
                    </span>
                </div>
                <div className="mt-2 flex flex-col w-[95%] mx-auto">
                    <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <Button
                                    value={
                                        <span className="flex items-center gap-2">
                                            Export Report
                                            <FontAwesomeIcon icon={faFile} />
                                        </span>
                                    }
                                    onClick={openExportPopup}
                                />
                                {noDataMessage && (
                                    <p className="text-center text-red-600">{noDataMessage}</p>
                                )}

                                {/* Export Popup/Modal */}
                                {showExportPopup && (
                                    <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-60">
                                        <div className="bg-white p-4 rounded-lg shadow-lg">
                                            <h2 className="text-xl font-semibold mb-4">Export Report</h2>
                                            <input
                                                type="text"
                                                placeholder="Enter report name"
                                                value={reportName}
                                                onChange={(e) => setReportName(e.target.value)}
                                                className="border p-2 rounded-md w-full mb-4"
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    value={
                                                        <span className="flex items-center gap-2">
                                                            Export PDF
                                                            <FontAwesomeIcon icon={faFilePdf} />
                                                        </span>
                                                    }
                                                    onClick={handleExportToPdf}

                                                />
                                                <Button
                                                    value={
                                                        <span className="flex items-center gap-2">
                                                            Export Excel
                                                            <FontAwesomeIcon icon={faFileExcel} />
                                                        </span>
                                                    }
                                                    className={user?.departments?.level_id === 5 ? 'flex' : 'hidden'}
                                                    onClick={handleExportToExcel}

                                                />
                                                <Button
                                                    value={
                                                        <span className="flex items-center gap-2">
                                                            Close
                                                            <FontAwesomeIcon icon={faClose} />
                                                        </span>
                                                    }
                                                    onClick={closeExportPopup} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!noDataMessage && (
                                    <table
                                        {...getTableProps()}
                                        border="1"
                                        className="min-w-full divide-y divide-gray-200"
                                    >
                                        <thead className="bg-gray-50">
                                            {headerGroups.map((headerGroup) => (
                                                <tr {...headerGroup.getHeaderGroupProps()}>
                                                    {headerGroup.headers.map((column) => (
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            {...column.getHeaderProps(
                                                                column.getSortByToggleProps()
                                                            )}
                                                        >
                                                            {column.render('Header')}
                                                            <span>
                                                                {column.isSorted
                                                                    ? column.isSortedDesc
                                                                        ? ' ▼'
                                                                        : ' ▲'
                                                                    : ''}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody
                                            className="bg-white divide-y divide-gray-200"
                                            {...getTableBodyProps()}
                                        >
                                            {page.map((row) => {
                                                prepareRow(row);
                                                return (
                                                    <tr {...row.getRowProps()}>
                                                        {row.cells.map((cell) => {
                                                            return (
                                                                <td
                                                                    {...cell.getCellProps()}
                                                                    className="px-6 py-4 whitespace-nowrap"
                                                                >
                                                                    {cell.render('Cell')}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pagination w-[95%] mx-auto">
                <div className="py-3 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            value="Previous"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            value="Next"
                        >
                            Next
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex gap-x-2">
                            <span className="text-sm text-gray-700 p-2">
                                {' '}
                                <span className="font-medium">{offset + 1}</span> of{' '}
                                <span className="font-medium">{pageCount}</span>
                            </span>
                            <label>
                                <span className="sr-only">Items Per Page</span>
                                <select
                                    className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={state.pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value))
                                        dispatch(setSize(Number(e.target.value)))
                                    }}
                                >
                                    {[20, 50, 100].map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 gap-1 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <PageButton
                                    className="px-4 cursor-pointer hover:scale-[1.02] rounded-l-md shadow-md"
                                    onClick={() => gotoPage(0)}
                                // disabled={!canPreviousPage}
                                >
                                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                                        First
                                    </span>
                                    <FontAwesomeIcon icon={faAnglesLeft} />
                                </PageButton>
                                <PageButton
                                    onClick={() => {
                                        previousPage()
                                    }}
                                    // disabled={!canPreviousPage}
                                    className="px-4 cursor-pointer hover:scale-[1.02] p-2 shadow-md"
                                >
                                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                                        Previous
                                    </span>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </PageButton>
                                <PageButton
                                    onClick={() => {
                                        nextPage()
                                    }}
                                    // disabled={!canNextPage}
                                    className="px-4 cursor-pointer hover:scale-[1.02] shadow-md"
                                >
                                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                                        Next
                                    </span>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </PageButton>
                                <PageButton
                                    className="px-4 cursor-pointer hover:scale-[1.02] rounded-r-md shadow-md"
                                    onClick={() => {
                                        gotoPage(page - 1)
                                    }}
                                // disabled={!canNextPage}
                                >
                                    <span className="px-4 cursor-pointer hover:scale-[1.02] sr-only">
                                        Last
                                    </span>
                                    <FontAwesomeIcon icon={faAnglesRight} />
                                </PageButton>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

Sector_commission.propTypes = {
    user: PropTypes.shape({}),
};

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
                className="rounded-sm bg-transparent outline-none border-none focus:border-none focus:outline-primary"
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
        <label className="flex gap-2 items-center w-full mx-auto">
            <input
                type="text"
                className="p-2 outline-[2px] w-full max-w-[20rem] border-[1px] border-primary rounded-md outline-primary focus:outline-primary"
                value={value || ''}
                onChange={(e) => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} transaction...`}
            />
        </label>
    );
}

export default Sector_commission;
