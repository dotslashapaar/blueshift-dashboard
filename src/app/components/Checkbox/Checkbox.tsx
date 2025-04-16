import classNames from "classnames";

export interface CheckboxProps {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  handleChange?: (checked: boolean) => void;
}

export default function Checkbox({
  checked,
  className,
  disabled,
  handleChange,
}: CheckboxProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (handleChange) {
      handleChange(event.target.checked);
    }
  };

  return (
    <div className="flex h-4 w-4 flex-shrink-0 items-center">
      <div className="group grid size-4 grid-cols-1">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleInputChange}
          className={classNames(
            className,
            "rounded border-mute checked:border-brand-primary indeterminate:border-brand-primary focus-visible:outline-brand-primary disabled:border-border col-start-1 row-start-1 appearance-none border-2 bg-transparent transition duration-100 ease-in-out checked:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border disabled:bg-card disabled:opacity-40 forced-colors:appearance-auto"
          )}
        />
        <div className="rounded-[1px] pointer-events-none col-start-1 row-start-1 size-1.5 self-center justify-self-center opacity-0 group-has-[:checked]:opacity-100 bg-brand-primary"></div>
      </div>
    </div>
  );
}
