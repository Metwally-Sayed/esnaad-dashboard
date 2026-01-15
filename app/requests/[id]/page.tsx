"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { useCancelRequest, useRequest } from "@/lib/hooks/use-requests";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: request, isLoading, error, mutate } = useRequest(id);
  const { mutateAsync: cancelRequest } = useCancelRequest(id);

  const handleCancel = async () => {
    try {
      await cancelRequest();
      mutate(); // Refresh data
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Request not found or you don't have permission to view it"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <RequestDetail request={request} onCancel={handleCancel} />
    </div>
  );
}
