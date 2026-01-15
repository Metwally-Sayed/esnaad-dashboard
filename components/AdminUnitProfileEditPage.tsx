'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save, X, ChevronLeft, Search, UserPlus, AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { SnaggingItemsBuilder, type SnaggingItem } from './snagging/SnaggingItemsBuilder';
import { UnitSnaggingWidget } from './snagging/UnitSnaggingWidget';

interface AdminUnitProfileEditPageProps {
  unitId?: string;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// Mock owners data - in real app this would come from API
const mockOwners = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', nationalityId: '2345678901' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', nationalityId: '2345678902' },
  { id: '3', name: 'Ahmed Al-Rashid', email: 'ahmed.rashid@email.com', nationalityId: '2345678903' },
  { id: '4', name: 'Maria Garcia', email: 'maria.g@email.com', nationalityId: '2345678904' },
  { id: '5', name: 'David Chen', email: 'david.chen@email.com', nationalityId: '2345678905' },
];

export function AdminUnitProfileEditPage({ unitId, onBack, onSave, onCancel }: AdminUnitProfileEditPageProps) {
  // Form state
  const [formData, setFormData] = useState({
    unitCode: 'A-101',
    status: 'Owned' as 'Owned' | 'Not Owned',
    type: 'Studio',
    building: 'Riverside Apartments',
    floor: '1st Floor',
    size: '450',
    sizeUnit: 'sq ft',
    bedrooms: '0',
    bathrooms: '1',
    price: '450000',
    ownerId: '1',
    ownerAssignmentMode: 'existing' as 'existing' | 'new',
    // For new owner
    newOwnerName: '',
    newOwnerEmail: '',
    newOwnerNationalityId: '',
    newOwnerPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ownerSearch, setOwnerSearch] = useState('');

  // Snagging creation dialog state
  const [isCreateSnaggingOpen, setIsCreateSnaggingOpen] = useState(false);
  const [snaggingTitle, setSnaggingTitle] = useState('');
  const [snaggingDescription, setSnaggingDescription] = useState('');
  const [snaggingItems, setSnaggingItems] = useState<SnaggingItem[]>([]);
  const [isSubmittingSnagging, setIsSubmittingSnagging] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.unitCode.trim()) {
      newErrors.unitCode = 'Unit code is required';
    }
    if (!formData.type) {
      newErrors.type = 'Unit type is required';
    }
    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = 'Valid size is required';
    }

    // Validate owner information if unit is owned
    if (formData.status === 'Owned') {
      if (formData.ownerAssignmentMode === 'existing') {
        if (!formData.ownerId) {
          newErrors.ownerId = 'Please select an owner';
        }
      } else {
        if (!formData.newOwnerName.trim()) {
          newErrors.newOwnerName = 'Owner name is required';
        }
        if (!formData.newOwnerEmail.trim()) {
          newErrors.newOwnerEmail = 'Owner email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newOwnerEmail)) {
          newErrors.newOwnerEmail = 'Valid email is required';
        }
        if (!formData.newOwnerNationalityId.trim()) {
          newErrors.newOwnerNationalityId = 'Nationality ID is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      if (onSave) {
        onSave(formData);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handle creating a new snagging report
   */
  const handleCreateSnagging = async () => {
    if (!snaggingTitle.trim() || !snaggingDescription.trim()) {
      alert('Title and description are required');
      return;
    }

    if (snaggingItems.length === 0) {
      alert('At least one item is required');
      return;
    }

    if (!selectedOwner) {
      alert('Please select an owner');
      return;
    }

    setIsSubmittingSnagging(true);
    try {
      // Validate we have the required IDs
      if (!unitId) {
        throw new Error('Unit ID is required to create a snagging');
      }

      // Call API endpoint POST /api/snaggings with proper schema
      const response = await fetch('http://localhost:8080/api/snaggings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({
          unitId: unitId,
          ownerId: formData.ownerId,
          title: snaggingTitle,
          description: snaggingDescription,
          items: snaggingItems.map(item => ({
            category: item.category,
            label: item.label,
            location: item.location,
            severity: item.severity,
            notes: item.notes,
            images: item.images.map(img => ({
              imageUrl: img.imageUrl,
              publicId: img.publicId || '',
              caption: img.caption || ''
            }))
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create snagging');
      }

      alert('Snagging report created successfully!');

      // Reset form
      setSnaggingTitle('');
      setSnaggingDescription('');
      setSnaggingItems([]);
      setIsCreateSnaggingOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create snagging report';
      alert(message);
      console.error('Error creating snagging:', error);
    } finally {
      setIsSubmittingSnagging(false);
    }
  };

  const isOwned = formData.status === 'Owned';
  const selectedOwner = mockOwners.find(o => o.id === formData.ownerId);

  // Filter owners based on search
  const filteredOwners = mockOwners.filter(owner =>
    owner.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.email.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.nationalityId.includes(ownerSearch)
  );

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
              Admin Edit Mode
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage unit details and ownership assignment
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

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <Card className="mb-6 bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive mb-2">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive/90">
                  {Object.values(errors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <Label htmlFor="unitCode">Unit Code *</Label>
                  <Input
                    id="unitCode"
                    value={formData.unitCode}
                    onChange={(e) => handleInputChange('unitCode', e.target.value)}
                    className={`mt-1.5 ${errors.unitCode ? 'border-destructive' : ''}`}
                    placeholder="e.g., A-101"
                  />
                  {errors.unitCode && (
                    <p className="text-sm text-destructive mt-1">{errors.unitCode}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className={`mt-1.5 ${errors.type ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                      <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                      <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                      <SelectItem value="4 Bedroom">4 Bedroom</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive mt-1">{errors.type}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    className="mt-1.5"
                    placeholder="e.g., Riverside Apartments"
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    className="mt-1.5"
                    placeholder="e.g., 1st Floor"
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="size"
                      type="number"
                      min="0"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className={`flex-1 ${errors.size ? 'border-destructive' : ''}`}
                      placeholder="450"
                    />
                    <Select
                      value={formData.sizeUnit}
                      onValueChange={(value) => handleInputChange('sizeUnit', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq ft">sq ft</SelectItem>
                        <SelectItem value="sq m">sq m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.size && (
                    <p className="text-sm text-destructive mt-1">{errors.size}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <Label htmlFor="price">Price (SAR)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="mt-1.5"
                    placeholder="450000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or comments about this unit..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Ownership Status */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Ownership Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status">Status *</Label>
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
                  {isOwned ? 'This unit is currently owned and requires owner information' : 'This unit is available for purchase'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owner Assignment - Only shown if owned */}
          {isOwned && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Owner Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Assignment Mode Toggle */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.ownerAssignmentMode === 'existing' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => handleInputChange('ownerAssignmentMode', 'existing')}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Select Existing
                    </Button>
                    <Button
                      type="button"
                      variant={formData.ownerAssignmentMode === 'new' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => handleInputChange('ownerAssignmentMode', 'new')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </div>

                  <Separator />

                  {/* Existing Owner Selection */}
                  {formData.ownerAssignmentMode === 'existing' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ownerSearch">Search Owner</Label>
                        <Input
                          id="ownerSearch"
                          type="text"
                          placeholder="Search by name, email, or Nationality ID..."
                          value={ownerSearch}
                          onChange={(e) => setOwnerSearch(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="ownerId">Select Owner *</Label>
                        <Select
                          value={formData.ownerId}
                          onValueChange={(value) => handleInputChange('ownerId', value)}
                        >
                          <SelectTrigger className={`mt-1.5 ${errors.ownerId ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Select an owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredOwners.map((owner) => (
                              <SelectItem key={owner.id} value={owner.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{owner.name}</span>
                                  <span className="text-xs text-muted-foreground">{owner.email}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.ownerId && (
                          <p className="text-sm text-destructive mt-1">{errors.ownerId}</p>
                        )}
                      </div>

                      {/* Selected Owner Info */}
                      {selectedOwner && (
                        <div className="p-3 bg-muted/50 rounded-md space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-medium">{selectedOwner.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2">{selectedOwner.email}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Nationality ID:</span>
                            <span className="ml-2">{selectedOwner.nationalityId}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* New Owner Form */}
                  {formData.ownerAssignmentMode === 'new' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newOwnerName">Owner Name *</Label>
                        <Input
                          id="newOwnerName"
                          value={formData.newOwnerName}
                          onChange={(e) => handleInputChange('newOwnerName', e.target.value)}
                          className={`mt-1.5 ${errors.newOwnerName ? 'border-destructive' : ''}`}
                          placeholder="Enter owner name"
                        />
                        {errors.newOwnerName && (
                          <p className="text-sm text-destructive mt-1">{errors.newOwnerName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newOwnerEmail">Email *</Label>
                        <Input
                          id="newOwnerEmail"
                          type="email"
                          value={formData.newOwnerEmail}
                          onChange={(e) => handleInputChange('newOwnerEmail', e.target.value)}
                          className={`mt-1.5 ${errors.newOwnerEmail ? 'border-destructive' : ''}`}
                          placeholder="owner@email.com"
                        />
                        {errors.newOwnerEmail && (
                          <p className="text-sm text-destructive mt-1">{errors.newOwnerEmail}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newOwnerNationalityId">Nationality ID *</Label>
                        <Input
                          id="newOwnerNationalityId"
                          value={formData.newOwnerNationalityId}
                          onChange={(e) => handleInputChange('newOwnerNationalityId', e.target.value)}
                          className={`mt-1.5 ${errors.newOwnerNationalityId ? 'border-destructive' : ''}`}
                          placeholder="Enter Nationality ID"
                        />
                        {errors.newOwnerNationalityId && (
                          <p className="text-sm text-destructive mt-1">{errors.newOwnerNationalityId}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newOwnerPhone">Phone Number</Label>
                        <Input
                          id="newOwnerPhone"
                          type="tel"
                          value={formData.newOwnerPhone}
                          onChange={(e) => handleInputChange('newOwnerPhone', e.target.value)}
                          className="mt-1.5"
                          placeholder="+966 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Admin Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Fields marked with * are required</li>
                <li>• All changes are saved when you click "Save Changes"</li>
                <li>• Click "Cancel" to discard all changes</li>
                <li>• You can assign existing owners or create new ones</li>
                <li>• Use the search to quickly find owners</li>
                <li>• Unit code should be unique across all properties</li>
              </ul>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
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
                  <p className="mt-1">Dec 20, 2024, 3:45 PM</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Updated By</Label>
                  <p className="mt-1">Admin User</p>
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

      {/* Snagging Widget - Shows snagging reports for this unit */}
      <div className="mt-8">
        <UnitSnaggingWidget
          unitId={formData.unitCode}
          userRole="ADMIN"
          onCreateSnagging={() => setIsCreateSnaggingOpen(true)}
        />
      </div>

      {/* Create Snagging Dialog */}
      <Dialog open={isCreateSnaggingOpen} onOpenChange={setIsCreateSnaggingOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Snagging Report</DialogTitle>
            <DialogDescription>
              Create a new snagging report for Unit {formData.unitCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="snagging-title">Report Title *</Label>
              <Input
                id="snagging-title"
                placeholder="e.g., Electrical & Plumbing Issues"
                value={snaggingTitle}
                onChange={(e) => setSnaggingTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="snagging-description">Description *</Label>
              <Textarea
                id="snagging-description"
                placeholder="Describe the overall inspection findings..."
                value={snaggingDescription}
                onChange={(e) => setSnaggingDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Items Builder */}
            <div className="space-y-2">
              <Label>Snagging Items *</Label>
              <SnaggingItemsBuilder
                value={snaggingItems}
                onChange={setSnaggingItems}
                disabled={isSubmittingSnagging}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsCreateSnaggingOpen(false)}
                disabled={isSubmittingSnagging}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSnagging}
                disabled={
                  isSubmittingSnagging ||
                  !snaggingTitle.trim() ||
                  !snaggingDescription.trim() ||
                  snaggingItems.length === 0
                }
              >
                {isSubmittingSnagging ? 'Creating...' : 'Create Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
