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
import { faClose, faFile, faFileExcel, faFilePdf, faReceipt } from '@fortawesome/free-solid-svg-icons';
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
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [reportName, setReportName] = useState('');

    const openExportPopup = () => {
        setShowExportPopup(true);
    };

    const closeExportPopup = () => {
        setShowExportPopup(false);
    };
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
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 26 },
                    5: { cellWidth: 45 },
                    6: { cellWidth: 50 },

                },
            });
            // total of BANK TRANSFER  of data
            const totalBankTransfer = TableInstance.rows.map((row) => row.original.bank_transfer).reduce((a, b) => a + b, 0).toLocaleString();
            // total of total of data
            const totalTotal = TableInstance.rows.map((row) => row.original.total).reduce((a, b) => a + b, 0).toLocaleString();
            // total of 10% COMMISSION
            const totalCommission = TableInstance.rows.map((row) => row.original.commission).reduce((a, b) => a + b, 0).toLocaleString();
            // total of  BANK SLIPS / CHEQUES
            const totalBankSlip = TableInstance.rows.map((row) => row.original.bank_slip).reduce((a, b) => a + b, 0).toLocaleString();

            // Add the "SUB TOTAL" table here
            const subTotalData = [
                ['SUB TOTAL', `RWF ${totalTotal}`, `RWF ${totalBankTransfer}`, `RWF ${totalCommission}`, `RWF ${totalBankSlip}`],
            ];
            const subTotalStyles = {
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    fontStyle: 'bold',
                },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 26 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 50 },
                },
            };
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 1,
                head: false,
                body: subTotalData,
                ...subTotalStyles,
            });

            // Add your custom content here
            const customContent = [
                ['BITEGUWE NA:', 'BYEMEJWE NA:'],
                ['', ''],
                ['TETA TAMARA', 'NDAGIJIMANA Gedeon'],
                ['DATA MANAGEMENT', 'CEO IMENA SOFTEK LTD'],
                ['IMENA SOFTEK LTD', ''],
            ];

            // Define custom styles for the custom content (no lines and normal font weight)
            const customContentStyles = {
                theme: 'plain', // Use plain theme to remove table lines
                styles: {
                    fontSize: 8,
                    fontStyle: 'normal', // Use normal font weight
                },
                columnStyles: {
                    0: { cellWidth: 150 },
                    1: { cellWidth: 100 },
                },
            };
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: false,
                body: customContent,
                ...customContentStyles,
            });

            // Add the cachet image here
            const cachetResponse = await fetch(cachet);
            const cachetData = await cachetResponse.blob();
            const cachetBase64 = await convertBlobToBase64(cachetData);

            doc.addImage(cachetBase64, 'PNG', 200, doc.lastAutoTable.finalY - 50, 50, 50);

            // Add the signature image here
            const signatureResponse = await fetch(signature);
            const signatureData = await signatureResponse.blob();
            const signatureBase64 = await convertBlobToBase64(signatureData);
            const date = new Date();
            const dateNow = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();

            doc.addImage(signatureBase64, 'PNG', 20, doc.lastAutoTable.finalY - 50, 50, 50);
            doc.text(`Date: ${dateNow}`, 15, doc.lastAutoTable.finalY + 3);

            doc.save(`${reportName}.pdf`);
        };

        reader.readAsDataURL(logoData)
    };

    // Helper function to convert Blob to Base64
    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
        });
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
                { column: 'B', style: { fontSize: 8 } },
                { column: 'C', style: { fontSize: 8 } },
                { column: 'D', style: { fontSize: 8 } },
                { column: 'E', style: { fontSize: 8 } },
                { column: 'F', style: { fontSize: 8 } },
                { column: 'G', style: { fontSize: 8 } },
                { column: 'H', style: { fontSize: 8 } },
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
                { width: 25 },
                { width: 15 },
                { width: 15 },
                { width: 15 },
                { width: 15 },
                { width: 15 },
                { width: 15 },


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
    // Define a function to underline text
    function underlineText(doc, text, x, y) {
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize();
        const lineLength = textWidth / 2 * 0.75;
        doc.text(text, x, y);
        doc.setLineWidth(0.5); // Adjust the line width as needed
        doc.line(x, y + 1, x + lineLength, y + 1); // Draw a line under the text
    }
    const handleGenerateRecept = () => {
        const doc = new jsPDF();
        // Add the header section
        doc.addImage(logo, 'PNG', 80, 10, 30, 30);
        doc.setFontSize(24);
        // Usage
        underlineText(doc, "PAYMENT RECEIPT", 50, 50);
        doc.setFontSize(18);
        doc.text("FROM: IMENA SOFTEK LTD", 30, 70 );
        doc.text("TO: KIMIHURURA SECTOR ", 30, 80);
        // Add the table section with styles
        doc.autoTable({
            startY:90,
            head: [["MONTH", "10 %"]],
            body: [["12-2023", `30300 RWF`]],
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
                0: { // Style for the first column (MONTH)
                    fontStyle: 'bold', // Make the text bold
                },
                1: { // Style for the second column (10 %)
                    halign: 'right', // Align the text to the right
                },
            },
        });

        const qrCodeHeight = 30;
        doc.addImage(FaQrcode, 'JPEG', 20, doc.autoTable.previous.finalY + 20, 30, qrCodeHeight);
        doc.setFontSize(10);

        // Place the text at the end of the QR code image
        const textY = doc.autoTable.previous.finalY + 30 + qrCodeHeight;

        doc.text("IMENA SOFTEK LTD", 15, textY);
        doc.text("TIN : 1123965711 ", 15, textY + 10);
        doc.text("TEL : +250 784 368 695 ", 15, textY + 20);
        doc.text("Kacyiru , Kigali , Rwanda ", 15, textY + 30);
        const pdfDataUrl = doc.output('datauristring');
        const blob = dataURLtoBlob(pdfDataUrl);
        const blobUrl = window.URL.createObjectURL(blob);

        // Open the Blob URL in a new tab for download
        const newTab = window.open(blobUrl, '_blank');
        if (newTab) {
            newTab.focus();
        }
    }
    // Helper function to convert data URL to Blob
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }
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
                                                Export Report
                                                <FontAwesomeIcon icon={faFile} />
                                            </span>
                                        }
                                        onClick={openExportPopup}
                                    />
                                    <Button
                                        value={
                                            <span className="flex items-center gap-2">
                                                Generate month receipt
                                                <FontAwesomeIcon icon={faReceipt} />
                                            </span>
                                        }
                                        onClick={handleGenerateRecept}
                                    />
                                </div>

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
