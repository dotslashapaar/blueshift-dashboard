import classNames from "classnames";
export default function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "incomplete" | "passed" | "failed";
}) {
  return (
    <div
      className={classNames(
        "px-3 py-2 rounded-full font-medium capitalize",
        variant === "incomplete" &&
          "bg-background-card-foreground text-primary",
        variant === "passed" && "bg-success/8 text-success",
        variant === "failed" && "bg-error/8 text-error"
      )}
    >
      {label}
    </div>
  );
}
