import { db } from "../../lib/db";

export async function fetchCourses() {
  const { data, error } = await db
    .from("training_courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchEnrollments() {
  const { data, error } = await db
    .from("training_enrollments")
    .select("*, training_courses!training_enrollments_course_id_fkey(title, tenant_id, is_mandatory, category), employees!training_enrollments_employee_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTrainingStats() {
  const [coursesRes, enrollmentsRes] = await Promise.all([
    db.from("training_courses").select("id, is_mandatory"),
    db.from("training_enrollments").select("id, status, score"),
  ]);

  const courses = coursesRes.data || [];
  const enrollments = enrollmentsRes.data || [];
  const mandatory = courses.filter((c) => c.is_mandatory).length;
  const completed = enrollments.filter((e) => e.status === "completed").length;
  const total = enrollments.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    totalCourses: courses.length,
    mandatoryCourses: mandatory,
    completionRate,
    totalEnrollments: total,
    completedEnrollments: completed,
  };
}

export type CreateCourseInput = {
  title: string;
  description?: string;
  category?: string;
  duration_hours?: number;
  is_mandatory?: boolean;
  pass_score?: number;
};

export async function createCourse(input: CreateCourseInput) {
  const { data, error } = await db
    .from("training_courses")
    .insert({
      ...input,
      tenant_id: (await db.rpc("get_user_tenant_id")).data as string,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string) {
  const { error } = await db.from("training_courses").delete().eq("id", id);
  if (error) throw error;
}
