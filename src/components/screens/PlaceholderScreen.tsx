import CardPanel from "@/components/ui/CardPanel";

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export default function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <CardPanel title={title}>
      <div className="text-[12.5px] text-t2 py-5">{description}</div>
    </CardPanel>
  );
}
