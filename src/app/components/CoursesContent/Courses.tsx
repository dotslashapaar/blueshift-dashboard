import CourseFilter from "../Filters/CourseFilter";
import SearchInput from "../SearchInput/Search";
import ViewToggle from "../ViewToggle/ViewToggle";
import CourseListWrapper from "./CourseListWrapper";

export default function Courses() {
  return (
    <div className="w-full flex flex-col gap-y-16 pb-24">
      <div className="content-wrapper">
        <div className="flex flex-wrap md:flex-row gap-y-4 md:gap-y-0 md:items-center gap-x-3 w-full">
          <SearchInput className="md:w-1/3" />
          <CourseFilter />
          <ViewToggle layoutName="lessons-view-toggle" className="md:ml-auto" />
        </div>
      </div>
      <div className="h-px w-full border-t-border border-t" />
      <div className="content-wrapper">
        <CourseListWrapper />
      </div>
    </div>
  );
}
