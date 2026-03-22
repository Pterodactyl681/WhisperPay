import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InboxPageClient from "./inbox-page-client";

function InboxPageFallback() {
  return (
    <Card className="mx-auto mt-8 max-w-2xl">
      <CardHeader>
        <CardTitle>Loading inbox</CardTitle>
        <CardDescription>Preparing wallet and demo context...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait
        </div>
      </CardContent>
    </Card>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxPageFallback />}>
      <InboxPageClient />
    </Suspense>
  );
}
