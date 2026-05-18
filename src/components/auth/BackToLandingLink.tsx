import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackToLandingLinkProps {
  to?: string;
  label?: string;
  className?: string;
}

/**
 * Nút "Quay về Landing" dùng chung cho các trang auth (Login/Signup/ForgotPassword/ResetPassword).
 * Mặc định đặt ở góc trái trên của Card (parent cần `relative`).
 */
export function BackToLandingLink({
  to = "/",
  label = "Quay về Landing",
  className,
}: BackToLandingLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "absolute left-4 top-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export default BackToLandingLink;