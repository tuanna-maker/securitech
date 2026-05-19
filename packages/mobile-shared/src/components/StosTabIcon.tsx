import { StosIcon } from "../icons/StosIcon";
import type { StosIconName } from "../icons/types";

/** Tab bar — active = màu tint, inactive = xám */
export function StosTabIcon({ name, color, size = 24 }: { name: StosIconName; color: string; size?: number }) {
  return <StosIcon name={name} size={size} color={color} />;
}
