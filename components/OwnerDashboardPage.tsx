'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, Home, DollarSign, TrendingUp, ArrowRight, MapPin, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data - in real app this would come from API
const mockOwnerData = {
  name: 'John Smith',
  totalUnits: 3,
  totalValue: '1,350,000',
  averageValue: '450,000',
  portfolioGrowth: '+12.5%',
};

const mockUnits = [
  {
    id: '1',
    unitCode: 'A-101',
    building: 'Riverside Apartments',
    type: 'Studio',
    size: '450 sq ft',
    location: 'Riyadh, King Fahd Road',
    status: 'Owned',
    value: '450,000',
    purchaseDate: 'Jan 20, 2024',
    image: '/placeholder-unit.jpg',
  },
  {
    id: '2',
    unitCode: 'B-205',
    building: 'Riverside Apartments',
    type: '2 Bedroom',
    size: '850 sq ft',
    location: 'Riyadh, King Fahd Road',
    status: 'Owned',
    value: '650,000',
    purchaseDate: 'Mar 15, 2024',
    image: '/placeholder-unit.jpg',
  },
  {
    id: '3',
    unitCode: 'C-302',
    building: 'Tower Heights',
    type: '1 Bedroom',
    size: '600 sq ft',
    location: 'Riyadh, Olaya District',
    status: 'Owned',
    value: '250,000',
    purchaseDate: 'May 10, 2024',
    image: '/placeholder-unit.jpg',
  },
];

export function OwnerDashboardPage() {
  const router = useRouter();

  const handleViewUnit = (unitId: string) => {
    router.push(`/owner/units/${unitId}`);
  };

  const handleViewAllUnits = () => {
    router.push('/owner/units');
  };

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1>Welcome back, {mockOwnerData.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your property portfolio
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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
            <div className="text-2xl font-bold">{mockOwnerData.totalUnits}</div>
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
            <div className="text-2xl font-bold">{mockOwnerData.totalValue} SAR</div>
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
            <div className="text-2xl font-bold">{mockOwnerData.averageValue} SAR</div>
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
            <div className="text-2xl font-bold text-green-600">{mockOwnerData.portfolioGrowth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Units Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Units</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your owned properties
              </p>
            </div>
            <Button variant="outline" onClick={handleViewAllUnits}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {mockUnits.map((unit) => (
              <Card
                key={unit.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewUnit(unit.id)}
              >
                {/* Unit Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-blue-400" />
                </div>

                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{unit.unitCode}</h3>
                      <p className="text-sm text-muted-foreground">{unit.building}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {unit.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{unit.type}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{unit.size}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{unit.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value</span>
                      <span className="font-semibold">{unit.value} SAR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockUnits.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">You don't own any units yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Access contracts, certificates, and other important documents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Portfolio Report</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed analytics and performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Unit Details</h3>
                <p className="text-sm text-muted-foreground">
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
