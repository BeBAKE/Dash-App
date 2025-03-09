import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        We could not find the page you were looking for.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  );
}