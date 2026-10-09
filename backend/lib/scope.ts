import { prisma } from "../prisma/client.js";

export async function getUserScope(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      role: { select: { slug: true } },
      teacherAssignments: { select: { classId: true, classSubjectId: true } },
      enrollments: { select: { classId: true } },
    },
  });
  if (!user) return null;
  const isAdmin = user.role?.slug === "super-admin";
  return {
    status: user.status,
    isAdmin,
    isTeacher: user.teacherAssignments.length > 0,
    classIds: isAdmin ? null : [...new Set([...user.teacherAssignments.map((item) => item.classId), ...user.enrollments.map((item) => item.classId)])],
    classSubjectIds: isAdmin ? null : user.teacherAssignments.map((item) => item.classSubjectId),
  };
}
