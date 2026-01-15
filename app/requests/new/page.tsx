"use client";

import { RequestForm } from "@/components/requests/RequestForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateRequest } from "@/lib/hooks/use-requests";
import { CreateRequestDto } from "@/lib/types/request.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/api/axios-config";

export default function NewRequestPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { mutateAsync, isPending } = useCreateRequest();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        console.log("Fetching units for user:", user?.id);

        // Fetch user's owned units
        const response = await axios.get("/units", {
          params: { ownerId: user?.id, limit: 100 },
        });

        console.log("Units API response:", response.data);

        // Handle the nested response structure: response.data.data.data
        let data = response.data.data;

        // If data has a 'data' property (pagination wrapper), unwrap it
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
          data = data.data;
        }

        console.log("Extracted data:", data);

        // Ensure it's an array
        if (Array.isArray(data)) {
          console.log("Setting units:", data.length, "units found");
          setUnits(data);
        } else {
          console.error("Units response is not an array:", data);
          setUnits([]);
        }
      } catch (error: any) {
        console.error("Failed to load units:", error);
        console.error("Error response:", error.response?.data);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUnits();
    } else {
      console.log("No user found, skipping units fetch");
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (data: CreateRequestDto) => {
    try {
      await mutateAsync(data);
      router.push("/requests");
    } catch (error) {
      // Error already handled by the hook
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            You don't have any units assigned yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Contact the administrator to assign units to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">New Request</h1>
        <p className="text-muted-foreground mt-2">
          Submit a new guest visit invitation or work permission request
        </p>
      </div>

      <RequestForm units={units} onSubmit={handleSubmit} isPending={isPending} />
    </div>
  );
}
