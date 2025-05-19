import { redirect } from "@/i18n/navigation";

interface CourseRedirectPageProps {
  params: {
    locale: string;
  }
}

export default function CourseRedirectPage({params}: CourseRedirectPageProps) {
  const { locale } = params;
  redirect({ href: "/", locale })
}
