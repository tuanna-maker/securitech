import { SecurityTechLogo } from "@stos/mobile-shared/brand/SecurityTechLogo";

type Props = {
  width?: number;
  variant?: "full" | "emblem" | "wordmark";
};

export function SystemLogo({ width = 240, variant = "full" }: Props) {
  return <SecurityTechLogo width={width} variant={variant} />;
}
