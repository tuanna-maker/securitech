import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, fetchAnnouncements, fetchChatMessages, sendChatMessage, fetchCommsStats, createPost, createAnnouncement } from "./api";

export function usePosts() {
  return useQuery({ queryKey: ["posts"], queryFn: () => fetchPosts() });
}

export function useAnnouncements() {
  return useQuery({ queryKey: ["announcements"], queryFn: () => fetchAnnouncements() });
}

export function useChatMessages(channel = "general") {
  return useQuery({
    queryKey: ["chat-messages", channel],
    queryFn: () => fetchChatMessages(channel),
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, channel }: { message: string; channel: string }) =>
      sendChatMessage(message, channel),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", vars.channel] });
    },
  });
}

export function useCommsStats() {
  return useQuery({ queryKey: ["comms-stats"], queryFn: fetchCommsStats });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["comms-stats"] });
    },
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["comms-stats"] });
    },
  });
}
