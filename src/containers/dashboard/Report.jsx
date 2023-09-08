import 'core-js/stable';
import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import 'regenerator-runtime/runtime';
import { useLazyGetSectorStaffTotalCollectionsByMonthQuery } from '../../states/api/apiSlice';

import {
    useGlobalFilter,
    useTable,
    useAsyncDebounce,
    useFilters,
    useSortBy,
    usePagination,
} from 'react-table';
import Button from '../../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

const Report = ({ user }) => {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(
        moment(new Date()).format('YYYY-MM')
    );
    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('YYYY-MM')
    );
    const [noDataMessage, setNoDataMessage] = useState('');

    const [
        getSectorStaffTotalCollectionsByMonth,
        {
            data: sectorStaffTotalCollectionsByMonthData,
            isLoading: sectorStaffTotalCollectionsByMonthLoading,
            isSuccess: sectorStaffTotalCollectionsByMonthSuccess,
            isError: sectorStaffTotalCollectionsByMonthError,
            error: sectorStaffTotalCollectionsByMonthErrors,
        },
    ] = useLazyGetSectorStaffTotalCollectionsByMonthQuery();

    useEffect(() => {
        getSectorStaffTotalCollectionsByMonth({
            departmentId: user?.departments?.id,
            month: selectedDate,
        })
            .unwrap()
            .then((response) => {
                if (!response || response?.data.length === 0) {
                    setNoDataMessage(`No transactions found for ${selectedDate}`);
                } else {
                    setNoDataMessage('');
                }
            })
            .catch((error) => {
                console.error('API Error:', error);
            });
    }, [selectedDate, user?.departments?.id]);

    useEffect(() => {
        const newData =
            sectorStaffTotalCollectionsByMonthData?.data?.map((item, index) => ({
                id: item?.id || index + 1,
                name: item?.names,
                cell: item?.departments?.parent?.name,
                village: item?.departments?.name,
                total: item?.totalAmount,
                bank_transfer: item?.totalAmount - item?.totalAmount / 10,
                commission: item?.totalAmount / 10,
                bank_slip: 0,
            })) || [];
        setData(newData);
    }, [sectorStaffTotalCollectionsByMonthSuccess]);

    const handleExportToPdf = async () => {
        const doc = new jsPDF('landscape');
        const columnHeader = [
            'NO',
            'AGENT NAME',
            'CELL',
            'VILLAGE',
            'TOTAL',
            'BANK TRANSFER',
            '10% COMMISSION',
            'BANK SLIPS / CHEQUES',
        ];
        const headerRow = columnHeader.map((header) => ({
            content: header,
            styles: { halign: 'center', fontSize: 8 },
        }));

        doc.autoTable({
            startY: 10,
            head: [headerRow],
            theme: 'grid',
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 20 },
                2: { cellWidth: 30 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 20 },
                8: { cellWidth: 20 },
                9: { cellWidth: 20 },
                10: { cellWidth: 20 },
                11: { cellWidth: 20 },
                12: { cellWidth: 20 },
                13: { cellWidth: 20 },
            },
        });

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 5,
            head: false,
            body: data,
            theme: 'grid',
            styles: {},
            columnStyles: {},
        });
        doc.save('KACYIRU SECTOR  TRANSACTIONS AUGUST 2023.pdf');
    };

    const handleExportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);

        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '000000' } },
        };

        Object.keys(ws).forEach((key) => {
            if (key.startsWith('A1') && ws[key].t === 's') {
                ws[key].s = headerStyle;
            }
        });

        const colWidths = [];
        for (const col in ws) {
            if (
                col !== '!ref' &&
                col !== '!rows' &&
                col !== '!cols' &&
                ws[col] &&
                ws[col].v
            ) {
                const cellValue = ws[col].v.toString();
                const cellWidth = cellValue.length + 2;
                colWidths.push({ wch: cellWidth });
            }
        }
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'KACYIRU SECTOR  TRANSACTIONS AUGUST 2023');
        const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        const buf = new ArrayBuffer(wbBinary.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbBinary.length; i++) {
            view[i] = wbBinary.charCodeAt(i) & 0xff;
        }

        const blob = new Blob([buf], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'KACYIRU SECTOR  TRANSACTIONS AUGUST 2023.xlsx';
        link.click();
    };

    const columns = useMemo(
        () => [
            {
                Header: 'AGENT NAME',
                accessor: 'name',
                sortable: true,
            },
            {
                Header: 'CELL',
                accessor: 'cell',
                sortable: true,
                Filter: SelectColumnFilter,
            },
            {
                Header: 'VILLAGE',
                accessor: 'village',
                sortable: true,
                Filter: SelectColumnFilter,
            },
            {
                Header: 'TOTAL',
                accessor: 'total',
            },
            {
                Header: 'BANK TRANSFER',
                accessor: 'bank_transfer',
                sortable: true,
                Filter: SelectColumnFilter,
            },
            {
                Header: '10% COMMISSION',
                accessor: 'commission',
            },
            {
                Header: 'BANK SLIPS / CHEQUES',
                accessor: 'bank_slip',
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
                            setStartDate(newDate);
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
                                <div className="flex gap-2">
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
                                        onClick={handleExportToExcel}
                                    />
                                </div>

                                {noDataMessage && (
                                    <p className="text-center text-red-600">{noDataMessage}</p>
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
        </main>
    );
};

Report.propTypes = {
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

export default Report;
