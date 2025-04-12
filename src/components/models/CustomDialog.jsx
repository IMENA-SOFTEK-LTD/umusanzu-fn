import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'

const CustomDialog = ({
  open,
  title,
  subTitle,
  onClose,
  onConfirm,
  size,
  children,
}) => {
  return (
    <Dialog open={open} size={size || 'sm'}>
      <DialogHeader className='bg-primary text-white'>
        <div className="flex justify-between items-start w-full">
          <div>
            <h5 className="text-xl font-medium text-slate-800 text-white">{title}</h5>
            {subTitle && (
              <p className="text-slate-500 text-sm font-light">{subTitle}</p>
            )}
          </div>
          <button
            data-ripple-dark="true"
            data-dialog-close="true"
            className="h-8 w-8 rounded-lg text-blue-gray-500 hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30 transition-all"
            type="button"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </DialogHeader>

      <DialogBody className="text-base" divider>
        <p>{children}</p>
      </DialogBody>
      {onConfirm && <DialogFooter>{onConfirm}</DialogFooter>}
    </Dialog>
  )
}

export default CustomDialog
