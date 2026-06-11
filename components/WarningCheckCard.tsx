import { WarningValidationResult } from "@/types/label";
import WarningValidationCard from "@/components/WarningValidationCard";

interface WarningCheckCardProps {
  warningResult: WarningValidationResult | undefined;
}

export default function WarningCheckCard({
  warningResult,
}: WarningCheckCardProps) {
  if (!warningResult) {
    return null;
  }

  return <WarningValidationCard validation={warningResult} />;
}
