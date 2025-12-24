'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, X, ChevronLeft, AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface UnitProfileEditPageProps {
  onBack?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function UnitProfileEditPage({ onBack, onSave, onCancel }: UnitProfileEditPageProps) {
  const { userRole } = useAuth();
  // Mock data - in a real app this would come from props or API
  const [formData, setFormData] = useState({
    unitCode: 'A-101',
    status: 'Owned' as 'Owned' | 'Not Owned',
    type: 'Studio',
    building: 'Riverside Apartments',
    floor: '1st Floor',
    size: '450 sq ft',
    ownerName: 'John Smith',
    ownerEmail: 'john.smith@email.com',
    ownerIqama: '2345678901',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isOwned = formData.status === 'Owned';
  const isAdmin = userRole === 'admin';

  // Restrict access to admin only
  if (!isAdmin) {
    return (
      <div className="max-w-[1440px] mx-auto p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Unit Profile
        </Button>

        {/* Access Denied Message */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Access Restricted</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to edit unit details. This page is only accessible to administrators.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={onBack}
            >
              Return to Unit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Units
      </Button>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1>Edit Unit {formData.unitCode}</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Editing
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Make changes to unit details
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Unit Information Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="unitCode">Unit Code</Label>
                  <Input
                    id="unitCode"
                    value={formData.unitCode}
                    onChange={(e) => handleInputChange('unitCode', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                      <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                      <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="mt-1.5"
                    placeholder="e.g., 450 sq ft"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Owned' | 'Not Owned') => handleInputChange('status', value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owned">Owned</SelectItem>
                    <SelectItem value="Not Owned">Not Owned</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {isOwned ? 'This unit is currently owned' : 'This unit is available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Information Card - Only shown if owned */}
          {isOwned && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerName">Name</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter owner name"
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="ownerEmail">Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter email address"
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="ownerIqama">Iqama Number</Label>
                    <Input
                      id="ownerIqama"
                      value={formData.ownerIqama}
                      onChange={(e) => handleInputChange('ownerIqama', e.target.value)}
                      className="mt-1.5"
                      placeholder="Enter Iqama number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Editing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• All changes are saved when you click "Save Changes"</li>
                <li>• Click "Cancel" to discard all changes</li>
                <li>• Owner information is required when status is "Owned"</li>
                <li>• Unit code should be unique across all properties</li>
              </ul>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Registration Date</Label>
                  <p className="mt-1">Dec 15, 2024</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Last Updated</Label>
                  <p className="mt-1">Dec 20, 2024</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Status History</Label>
                  <p className="mt-1 text-muted-foreground text-sm">
                    2 ownership changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
