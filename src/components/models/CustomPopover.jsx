import {
  Popover,
  PopoverHandler,
  PopoverContent
} from "@material-tailwind/react";

const CustomPopover = ({ 
  trigger,     // Element to trigger the popover (e.g., a button or icon)
  children,    // Content inside the popover
  placement = "bottom", // Optional: top, bottom, left, right
  height='h-[auto]',
  offset
}) => {
  return (
    <Popover placement={placement}>
      <PopoverHandler>
        <div className="inline-block cursor-pointer">
          {trigger}
        </div>
      </PopoverHandler>
      <PopoverContent className={`w-[200px] ${height} p-4 bg-white shadow-lg rounded-lg`}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
