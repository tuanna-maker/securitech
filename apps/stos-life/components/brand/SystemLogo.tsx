import { SecurityTechLogo } from "@stos/mobile-shared/brand/SecurityTechLogo";

type Props = {
  width?: number;
  variant?: "full" | "emblem" | "wordmark";
};

/** Logo hệ thống Security Tech — SVG vector, không badge số 1. */
export function SystemLogo({ width = 240, variant = "full" }: Props) {
  return <SecurityTechLogo width={width} variant={variant} />;
}
