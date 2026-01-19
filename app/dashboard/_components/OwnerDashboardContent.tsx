'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUnits } from '@/lib/hooks/use-units';
import { ArrowRight, Building2, DollarSign, FileText, Home, Loader2, MapPin, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OwnerDashboardContent() {
  const router = useRouter();
  const { user, userId } = useAuth();

  // Fetch owner's units
  const { units, isLoading } = useUnits({ ownerId: userId! });

  // Get user display name (prefer name, fallback to email username)
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      // Extract username from email (part before @)
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (!units) {
      return {
        totalUnits: 0,
        totalValue: '0',
        averageValue: '0',
        portfolioGrowth: '+0%',
      };
    }

    const totalUnits = units.length;
    // Since we don't have value field in units, we'll use area as a placeholder
    // In a real app, you'd have a value/price field
    const totalValue = 0; // Would calculate from unit.value if available
    const averageValue = totalUnits > 0 ? Math.round(totalValue / totalUnits) : 0;

    return {
      totalUnits,
      totalValue: totalValue.toLocaleString(),
      averageValue: averageValue.toLocaleString(),
      portfolioGrowth: '+0%', // Would come from backend analytics
    };
  }, [units]);

  // Transform units for display
  const displayUnits = useMemo(() => {
    if (!units) return [];

    return units.slice(0, 3).map(unit => ({
      id: unit.id,
      unitCode: unit.unitNumber,
      building: unit.buildingName || 'N/A',
      type: unit.unitType || `${unit.bedrooms || 0} Bedroom`,
      size: unit.area ? `${unit.area} sq m` : 'N/A',
      location: unit.address || 'N/A',
      status: 'Owned',
      value: '0', // Would use unit.value if available
      purchaseDate: new Date(unit.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      image: unit.imageUrls && unit.imageUrls.length > 0 ? unit.imageUrls[0] : null,
    }));
  }, [units]);

  const handleViewUnit = (unitId: string) => {
    router.push(`/units/${unitId}`);
  };

  const handleViewAllUnits = () => {
    router.push('/units');
  };

  const handleViewDocuments = () => {
    router.push('/documents');
  };

  const handleViewPortfolio = () => {
    router.push('/units');
  };

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Welcome back, {getDisplayName()}!</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Here's an overview of your property portfolio
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Total Units */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Units
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Units owned
            </p>
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue} SAR</div>
            <p className="text-xs text-muted-foreground mt-1">
              Portfolio value
            </p>
          </CardContent>
        </Card>

        {/* Average Value */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageValue} SAR</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per unit
            </p>
          </CardContent>
        </Card>

        {/* Portfolio Growth */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.portfolioGrowth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Units Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">My Units</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Your owned properties
              </p>
            </div>
            <Button variant="outline" onClick={handleViewAllUnits} className="text-xs md:text-sm">
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1.5 md:ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayUnits.map((unit) => (
              <Card
                key={unit.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewUnit(unit.id)}
              >
                {/* Unit Image */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                  {unit.image ? (
                    <Image
                      src={unit.image}
                      alt={unit.unitCode}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-blue-400" />
                  )}
                </div>

                <CardContent className="pt-3 md:pt-4">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg">{unit.unitCode}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{unit.building}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {unit.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Home className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{unit.type}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{unit.size}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{unit.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 md:pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Added</span>
                      <span className="font-semibold text-xs md:text-sm">{unit.purchaseDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displayUnits.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Building2 className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 md:mb-3" />
              <p className="text-sm md:text-base text-muted-foreground">You don't own any units yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <Card
          className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleViewDocuments}
        >
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 md:mb-1 text-sm md:text-base">View Documents</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Access contracts, certificates, and other important documents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleViewPortfolio}
        >
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 md:mb-1 text-sm md:text-base">Portfolio Report</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  View detailed analytics and performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleViewAllUnits}
        >
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 md:mb-1 text-sm md:text-base">Unit Details</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  View detailed information about each of your units
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
