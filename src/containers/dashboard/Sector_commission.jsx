import 'core-js/stable';
import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import logo from '../../assets/LOGO.png'
import jsPDF from 'jspdf'
import FaQrcode from '../../assets/qrcode.jpeg';
import cachet from "../../assets/cachet.png"
import signature from "../../assets/signature.png"
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

const Sector_commission = ({ user }) => {
    const [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format('YYYY-MM'));
    const [noDataMessage, setNoDataMessage] = useState('');
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [reportName, setReportName] = useState('');
    const {
        page: offset,
    } = useSelector((state) => state.pagination)

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

    // Helper function to convert data URL to Blob
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,')
        const contentType = parts[0].split(':')[1]
        const raw = window.atob(parts[1])
        const rawLength = raw.length
        const uInt8Array = new Uint8Array(rawLength)
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i)
        }
        return new Blob([uInt8Array], { type: contentType })
    }
    // Define a function to underline text
    function underlineText(doc, text, x, y) {
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize()
        const lineLength = (textWidth / 2) * 0.75
        doc.text(text, x, y)
        doc.setLineWidth(0.5) // Adjust the line width as needed
        doc.line(x, y + 1, x + lineLength, y + 1) // Draw a line under the text
    }
    const handleExportToPdf = async () => {
        const doc = new jsPDF('landscape')
        const logoResponse = await fetch(logo)
        const logoData = await logoResponse.blob()
        const reader = new FileReader()

        reader.onload = async () => {
            const logoBase64 = reader.result.split(',')[1]
            doc.setFontSize(12)
            doc.setFillColor(255, 166, 1)
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F')
            doc.addImage(logoBase64, 'PNG', 10, 5, 30, 30)
            doc.setTextColor(0)
            doc.text(`${reportName}`, 50, 25)

            const columnHeader = [
                'NO',
                'SECTOR NAME',
                'TOTAL AMOUNT',
                'COMMISSION',
                'MERCHANT CODE',
            ];
            const headerRow = columnHeader.map((header) => ({
                content: header,
                styles: {
                    fillColor: '#EDEDED',
                    textColor: '#000000',
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    fontSize: 8,
                },
            }));

            doc.autoTable({
                startY: 50,
                head: [headerRow],
                theme: 'grid',
            });
            // Create a separate array for "NO" values starting from 1
            const noValues = Array.from({ length: TableInstance.rows.length }, (_, index) => index + 1);

            // Combine the "NO" values with your existing data, excluding the ID
            const exportData = TableInstance.rows.map((row, index) => {
                const { id, ...rest } = row.original;
                return {
                    NO: noValues[index],
                    ...rest,
                };
            });
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 5,
                head: false,
                body: exportData,
                theme: 'grid',
                styles: {
                    fontSize: 8,

                },
            });
            doc.save(`${reportName}.pdf`);
        };

        reader.readAsDataURL(logoData)
    };
    const handleExportToExcel = () => {
        if (TableInstance) {
            const filteredAndSortedData = TableInstance.rows.map((row) => row.original);

            const ws = XLSX.utils.json_to_sheet(filteredAndSortedData);

            const headerStyle = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '000000' } },
            };
            const range = XLSX.utils.decode_range(ws['!ref']);

            for (let i = range.s.c; i <= range.e.c; i++) {
                const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: i });
                ws[cellAddress].s = headerStyle;
            }
            const columnStyles = [
                {
                    column: 'A', style: {
                        fontSize: 8,
                    }
                },
            ];
            columnStyles.forEach((colStyle) => {
                for (let i = range.s.r + 1; i <= range.e.r; i++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: i, c: XLSX.utils.decode_col(colStyle.column) });
                    ws[cellAddress].s = colStyle.style;
                }
            });
            ws['!autofilter'] = { ref: ws['!ref'] };
            ws['!cols'] = [
                { width: 5 },


            ];
            ws['!rows'] = [
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                wb,
                ws,
                `${reportName}`
            );
            const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

            const buf = new ArrayBuffer(wbBinary.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < wbBinary.length; i++) {
                view[i] = wbBinary.charCodeAt(i) & 0xff;
            }

            const blob = new Blob([buf], {
                type:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${reportName}.xlsx`;
            link.click();
        }
    };

    const handleAction = async (id) => {
        // Fetch data for the selected sector and month
        await getSingleSectorCommission({
            departmentId: id,
            month: selectedDate,
        });

        const sectorData = singleSectorCommisionData?.data;
        const doc = new jsPDF();
        // Add the header section
        doc.addImage(logo, 'PNG', 80, 10, 30, 30);
        doc.setFontSize(24);
        // Usage
        underlineText(doc, 'PAYMENT RECEIPT', 50, 50);
        doc.setFontSize(18);
        doc.text('FROM: IMENA SOFTEK LTD', 30, 70);

        if (sectorData && sectorData.length > 0) {
            const sectorName = sectorData[0]?.name || 'Unknown Sector';
            const commissionValue = sectorData[0]?.commission.toLocaleString() || 'N/A';

            doc.text(`TO: ${sectorName} SECTOR `, 30, 80);
            // Add the table section with styles
            doc.autoTable({
                startY: 90,
                head: [['MONTH', '10 %']],
                body: [[`${selectedDate}`, ` ${commissionValue} RWF`]],
                theme: 'grid', // Apply a grid theme
                headStyles: {
                    fillColor: [0, 128, 0], // Green background color for the header
                    textColor: 255, // White text color for the header
                    fontSize: 12, // Font size for the header
                },
                styles: {
                    fontSize: 10, // Font size for the body
                    textColor: 0, // Black text color for the body
                    cellPadding: 5, // Padding for each cell
                },
                columnStyles: {
                    0: {
                        // Style for the first column (MONTH)
                        fontStyle: 'bold', // Make the text bold
                        halign: 'center', // Align the text to the right
                    },
                    1: {
                        // Style for the second column (10 %)
                        halign: 'center', // Align the text to the right
                    },
                },
            });
        } else {
            // Handle the case where sector data is missing or empty
            doc.text('TO: Unknown SECTOR', 30, 80);
            doc.text('Data not available', 30, 100);
        }

    const qrCodeHeight = 30
        doc.addImage(
            FaQrcode,
            'JPEG',
            20,
            doc.autoTable.previous.finalY + 20,
            30,
            qrCodeHeight
        )
        doc.setFontSize(10)

        // Place the text at the end of the QR code image
        const textY = doc.autoTable.previous.finalY + 30 + qrCodeHeight;

        doc.text('IMENA SOFTEK LTD', 15, textY);
        doc.text('TIN : 1123965711 ', 15, textY + 10);
        doc.text('TEL : +250 784 368 695 ', 15, textY + 20);
        doc.text('Kacyiru , Kigali , Rwanda ', 15, textY + 30);
        const pdfDataUrl = doc.output('datauristring');
        const blob = dataURLtoBlob(pdfDataUrl);
        const blobUrl = window.URL.createObjectURL(blob);

        // Open the Blob URL in a new tab for download
        const newTab = window.open(blobUrl, '_blank');
        if (newTab) {
            newTab.focus();
        }
    };

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
                            <span className="flex items-center gap-2">
                                Generate Report
                                <FontAwesomeIcon icon={faFile} />
                            </span>
                        }
                        onClick={() => handleAction(row.original.id)} // Replace handleAction with your actual action handler
                        className="btn-action" // Add styling classes as needed
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
