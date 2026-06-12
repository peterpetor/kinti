import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { INDUSTRY_LESSONS } from "../data";
import { isPro } from "@/lib/subscriptions";

export const runtime = "edge";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lessonId: string };
}) {
  const lesson = INDUSTRY_LESSONS.find((l) => l.id === params.lessonId);
  if (!lesson) {
    return <>{children}</>;
  }

  if (lesson.isPro) {
    const { userId } = await auth();
    const userIsPro = userId ? await isPro(userId) : false;
    
    if (!userIsPro) {
      redirect("/allasok/pro");
    }
  }

  return <>{children}</>;
}
