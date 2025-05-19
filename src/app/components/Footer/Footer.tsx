import { Link } from "@/i18n/navigation";
import Icon from "../Icon/Icon";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="mt-24 border-t border-t-border bg-background-card py-8">
      <div className="wrapper">
        <div className="flex flex-col sm:gap-y-0 gap-y-6 justify-center sm:flex-row items-center sm:justify-between">
          <div className="flex flex-col gap-y-4">
            <span className="text-tertiary/75 font-mono text-sm">
              Blueshift &copy; {year}
            </span>
          </div>
          <div className="flex items-center gap-x-8">
            <Link
              href="/"
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="X"></Icon>
            </Link>
            <Link
              href="/"
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="Github"></Icon>
            </Link>
            <Link
              href="/"
              className="text-tertiary hover:text-primary transition"
            >
              <Icon name="Discord"></Icon>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
