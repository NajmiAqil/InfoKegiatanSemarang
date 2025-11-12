import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-4xl aspect-[11/6]">
        <CardContent className="p-8 h-full">
          {/* You can add content here */}
        </CardContent>
      </Card>
    </main>
  );
}
