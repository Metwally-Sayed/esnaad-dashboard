"use client";

import { RequestsTable } from "@/components/requests/RequestsTable";
import { RequestFilters as RequestFiltersComponent } from "@/components/requests/RequestFilters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRequests } from "@/lib/hooks/use-requests";
import { RequestFilters } from "@/lib/types/request.types";
import { CheckCircle, Clock, Mail, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [filters, setFilters] = useState<RequestFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, meta, isLoading, mutate } = useRequests(filters);

  // Redirect admin to admin requests page
  if (isAdmin) {
    router.push("/admin/requests");
    return null;
  }

  // Only owners can access this page
  if (user?.role !== "OWNER") {
    return null;
  }

  const handleFilterChange = (newFilters: Partial<RequestFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Calculate stats
  const totalRequests = meta?.total || 0;
  const approvedCount = data?.filter((r) => r.status === "APPROVED").length || 0;
  const pendingCount = data?.filter((r) => r.status === "SUBMITTED").length || 0;

  const pagination = meta;

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            My Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your guest visit and work permission requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <RequestFiltersComponent
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <RequestsTable requests={data || []} basePath="/requests" isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} requests
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
