import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <div className="p-5">
      <div className="w-100 flex justify-end">
        <ThemeToggle />
      </div>
    </div>
  );
}
