import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, fetchEnrollments, fetchTrainingStats, createCourse, deleteCourse } from "./api";

export function useCourses() {
  return useQuery({ queryKey: ["training-courses"], queryFn: fetchCourses });
}

export function useEnrollments() {
  return useQuery({ queryKey: ["training-enrollments"], queryFn: fetchEnrollments });
}

export function useTrainingStats() {
  return useQuery({ queryKey: ["training-stats"], queryFn: fetchTrainingStats });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-courses"] });
      qc.invalidateQueries({ queryKey: ["training-stats"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-courses"] });
      qc.invalidateQueries({ queryKey: ["training-stats"] });
    },
  });
}
