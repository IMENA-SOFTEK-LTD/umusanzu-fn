import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import { useEffect, useRef } from 'react'

const CustomDialog = ({
  open,
  title,
  subTitle,
  onClose,
  onConfirm,
  size,
  children,
  headerBgColor = 'bg-primary',
  headerTxtColor = 'text-white',
}) => {
  const bodyRef = useRef(null)

  // when the dialog opens, scroll the body to top
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = 0
    }
  }, [open])

  return (
    <Dialog
      open={open}
      size={size || 'sm'}
      // make the wrapper align to top
      className="!items-start"
    >
      <DialogHeader className={`${headerBgColor} ${headerTxtColor}`}>
        <div className="flex justify-between items-start w-full">
          <div>
            <h5
              className={`text-sm font-medium text-slate-800 ${headerTxtColor}`}
            >
              {title}
            </h5>
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

      <DialogBody
        ref={bodyRef}
        className="text-base overflow-y-auto flex-1 pb-6"
        divider
      >
        <div
          // override the actual panel: full width on mobile, limited on desktop
          className="
          w-full sm:w-auto 
      
          sm:h-[80vh] 
          h-[50vh] 
          bg-white 
          rounded-none sm:rounded-xl 
          flex flex-col
        "
        >
          {children}
        </div>
      </DialogBody>

      {onConfirm && <DialogFooter>{onConfirm}</DialogFooter>}
    </Dialog>
  )
}

export default CustomDialog
