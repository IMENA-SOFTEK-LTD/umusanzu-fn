import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Button from '../Button';
import { MdOutlineCancel } from 'react-icons/md';

const JSX_MODAL = ({ isOpen, children, onClose }) => {
  return (
    <main
      className={`${
        isOpen ? 'modal-open' : 'modal-closed'
      } h-screen overflow-hidden flex items-center justify-center flex-col gap-6 absolute top-0 bottom-0 left-0 right-0 z-[1000] bg-black bg-opacity-30 transition-opacity ease-in-out duration-300`}
    >
      <section className="flex min-w-[40%] w-fit flex-col z-[100000] bg-white h-fit gap-4 p-6 relative shadow-md rounded-md">
        <Button
          value={<MdOutlineCancel size={25} />}
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          background={false}
          className="absolute flex items-center justify-center !border-none top-6 right-6 !py-0 !px-2 !rounded-full hover:!bg-transparent"
        />
        {children}
      </section>
    </main>
  );
};

JSX_MODAL.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

function Modal(props) {
  return ReactDOM.createPortal(
    <JSX_MODAL {...props} />,
    document.querySelector('#modal')
  );
}

export default Modal;