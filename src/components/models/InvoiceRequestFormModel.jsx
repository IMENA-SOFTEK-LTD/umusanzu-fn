import { useState } from 'react';
import Button from '../Button';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { faAdd, faDeleteLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InvoiceRequestFormModel = () => {
    const [showModal, setShowModal] = useState(false);
    const [receiptRequests, setReceiptRequests] = useState([
        { year: new Date().getFullYear(), month: 'January' },
    ]);
    const [requestType, setRequestType] = useState('pendingInvoices');

    const months = [
       'All months', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = ['All years','2021', '2022', '2023', '2024', '2025'];

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addReceiptRequest = () => {
        setReceiptRequests([...receiptRequests, { year: new Date().getFullYear(), month: 'January' }]);
    };

    const removeReceiptRequest = (index) => {
        const updatedRequests = [...receiptRequests];
        updatedRequests.splice(index, 1);
        setReceiptRequests(updatedRequests);
    };

    const handleYearChange = (event, index) => {
        const { value } = event.target;
        const updatedRequests = [...receiptRequests];
        updatedRequests[index].year = parseInt(value);
        setReceiptRequests(updatedRequests);
    };

    const handleMonthChange = (event, index) => {
        const { value } = event.target;
        const updatedRequests = [...receiptRequests];
        updatedRequests[index].month = value;
        setReceiptRequests(updatedRequests);
    };

    const handleRequestTypeChange = (event) => {
        const { value } = event.target;
        setRequestType(value);
    };

    const handleRequest = () => {

        closeModal();
    };

    return (
        <div className='relative'>
            <Button
                value={
                    <span className="flex items-center gap-2">
                        <LiaFileInvoiceDollarSolid />
                        Request Invoice
                    </span>
                }
                onClick={openModal}
            />
            {showModal && (
                <div
                    tabIndex={-1}
                    aria-hidden="true"
                    className="fixed top-0 left-0 right-0 z-50 w-full h-screen p-4 flex items-center justify-center bg-gray-800 bg-opacity-60"
                >
                    <div className="relative bg-white rounded-lg shadow">
                        <div className="bg-primary rounded-t-lg p-3">
                            <button
                                onClick={closeModal}
                                type="button"
                                className="absolute top-3 right-2.5 text-white bg-transparent hover:bg-primary hover:text-primary rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                     <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                            <div className="flex items-center justify-center gap-5">
                                <h3 className="mb-4 mt-2 text-xl text-center font-medium text-white">
                                    Request Invoice
                                </h3>
                            </div>
                        </div>
                        <div className="p-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Request Type:
                            </label>
                            <div className="mt-2 flex gap-9">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        value="pending"
                                        checked={requestType === 'pending'}
                                        onChange={handleRequestTypeChange}
                                    />
                                    <span className="ml-2">Pending</span>
                                </label>
                                <label className="inline-flex items-center mt-2">
                                    <input
                                        type="radio"
                                        className="form-radio text-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        value="paid"
                                        checked={requestType === 'paid'}
                                        onChange={handleRequestTypeChange}
                                    />
                                    <span className="ml-2">Paid</span>
                                </label>
                            </div>
                            <div className="mt-4">
                                {receiptRequests.map((request, index) => (
                                    <div key={index} className="mb-4">
                                        <div className="flex mt-2 justify-between gap-3">
                                            <select
                                                className="form-select flex-1  rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                value={request.year}
                                                onChange={(e) => handleYearChange(e, index)}
                                            >
                                                {years.map((element, index) => <option key={index}>{element}</option>)}

                                            </select>
                                            <select
                                                className="form-select flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                value={request.month}
                                                onChange={(e) => handleMonthChange(e, index)}
                                            >
                                                {months.map((element, index) => <option key={index}>{element}</option>)}

                                            </select>
                                            <button

                                                className="ml-2 bg-red-500 w-10 h-10 rounded-full hover:bg-red-500 text-white"
                                                onClick={() => removeReceiptRequest(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>

                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addReceiptRequest}
                                    className="ml-2 bg-primary w-10 h-10 rounded-full hover:bg-red-500 text-white"
                                >
                                    <FontAwesomeIcon icon={faAdd} />
                                </button>

                            </div>
                            <div className="mt-4">
                                <Button
                                    value="Submit Request"
                                    onClick={handleRequest}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceRequestFormModel;
