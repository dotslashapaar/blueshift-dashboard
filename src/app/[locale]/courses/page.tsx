import { redirect } from "@/i18n/navigation";

interface CourseRedirectPageProps {
  params: Promise<{
    locale: string;
  }>
}

export default async function CourseRedirectPage({params}: CourseRedirectPageProps) {
  const { locale } = await params;
  redirect({ href: "/", locale })
}
