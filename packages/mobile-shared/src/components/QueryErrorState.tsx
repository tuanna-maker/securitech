import { Illustration, type IllustrationName } from "../illustrations/Illustration";
import { EmptyState } from "./EmptyState";

type Props = {
  onRetry?: () => void;
  timeout?: boolean;
};

export function QueryErrorState({ onRetry, timeout }: Props) {
  const illustration: IllustrationName = timeout ? "error-timeout" : "error-network";
  return (
    <EmptyState
      illustration={illustration}
      title={timeout ? "Phản hồi chậm" : "Không có kết nối"}
      subtitle={timeout ? "Máy chủ đang bận. Thử lại sau giây lát." : "Kiểm tra mạng và thử lại."}
      actionLabel={onRetry ? "Thử lại" : undefined}
      onAction={onRetry}
    />
  );
}
