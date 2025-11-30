'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CreditCard, Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, ExternalLink, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getUserDetails } from '@/lib/api/storage';
import { getMyProjects } from '@/lib/api/client-projects';

interface Payment {
  id: string;
  projectId: string;
  projectName?: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  createdAt: string;
  paymentMethod?: string;
  paymentMethodDetails?: {
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
    type: string;
  };
  receiptUrl?: string;
  invoiceNumber?: string;
  description?: string;
  clientEmail?: string;
}

interface Project {
  id: string;
  details: {
    companyName: string;
    businessEmail: string;
  };
  estimate?: {
    estimateFinalPriceMin: number;
    estimateFinalPriceMax: number;
  };
  paymentStatus: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  totalAmountPaid?: number;
  paymentCompletionPercentage?: number;
  calculatedTotal?: number;
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    stripeCustomerId: ''
  });
  const itemsPerPage = 10;
  const router = useRouter();

  const fetchClientDetails = useCallback(async () => {
    try {
      const userDetails = getUserDetails();
      if (userDetails) {
        setClientDetails({
          name: userDetails.fullName || '',
          email: userDetails.email || '',
          stripeCustomerId: userDetails.stripeCustomerId || 'Not connected'
        });
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Failed to load client details');
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const result = await getMyProjects(1, 100); // Get all projects
      if (result && result.data && result.data.projects) {
        setProjects(result.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const userDetails = getUserDetails();
      const accessToken = userDetails?.accessToken;

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/payment/history?${params.toString()}`, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      
      if (data.data) {
        const paymentsData = data.data.payments || [];
        
        // Enrich payments with project names
        const enrichedPayments = paymentsData.map((payment: Payment) => {
          const project = projects.find(p => p.id === payment.projectId);
          return {
            ...payment,
            projectName: project?.details?.companyName || 'Unknown Project',
          };
        });
        
        setPayments(enrichedPayments);
        
        // Handle pagination
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.pages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, projects, itemsPerPage]);

  // Fetch client details and projects once on mount
  useEffect(() => {
    fetchClientDetails();
    fetchProjects();
  }, [fetchClientDetails, fetchProjects]);

  // Fetch payments when dependencies change
  useEffect(() => {
    if (projects.length > 0) {
      fetchPayments();
    }
  }, [fetchPayments, projects.length]);

  // Handle payment redirect results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const projectId = urlParams.get('projectId');
    
    if (paymentStatus) {
      if (paymentStatus === 'success') {
        toast.success('Payment completed successfully!');
        
        // Refresh data to show updated payment status
        fetchProjects();
        fetchPayments();
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard/client/payments');
      } else if (paymentStatus === 'cancelled') {
        toast.error('Payment was cancelled');
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard/client/payments');
      }
    }
  }, []); // Run once on mount

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchPayments();
  };

  const handleMakePayment = async (project: Project, percentage?: number, customAmountValue?: number) => {
    setProcessingPayment(true);
    try {
      const userDetails = getUserDetails();
      const accessToken = userDetails?.accessToken;

      if (!accessToken) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const currentUrl = window.location.origin;

      // Build payload based on whether custom amount or percentage is provided
      const checkoutPayload: any = {
        projectId: project.id,
        // Include {CHECKOUT_SESSION_ID} placeholder that Stripe will replace
        successUrl: `${currentUrl}/dashboard/client/payments?payment=success&session_id={CHECKOUT_SESSION_ID}&projectId=${project.id}`,
        cancelUrl: `${currentUrl}/dashboard/client/payments?payment=cancelled&projectId=${project.id}`,
        currency: 'usd'
      };

      // If custom amount is provided, use it; otherwise use percentage
      if (customAmountValue && customAmountValue > 0) {
        checkoutPayload.customAmount = customAmountValue;
      } else if (percentage) {
        checkoutPayload.depositPercentage = percentage;
      } else {
        throw new Error('Please specify either a percentage or custom amount');
      }

      console.log('📤 Creating checkout session:', checkoutPayload);

      const response = await fetch(`${API_BASE_URL}/api/v1/payment/project/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(checkoutPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create checkout session: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Checkout session created:', result);

      // Backend returns 'checkoutUrl' not 'url'
      const checkoutUrl = result.data?.checkoutUrl || result.data?.url;
      
      if (!checkoutUrl) {
        throw new Error('Stripe checkout URL not returned.');
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast.error(errorMessage);
      console.error('❌ Error creating checkout session:', error);
    } finally {
      setProcessingPayment(false);
      setIsPaymentModalOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, className: string }> = {
      'SUCCEEDED': { variant: 'default', label: 'Paid', className: 'bg-green-100 text-green-800' },
      'PENDING': { variant: 'outline', label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'FAILED': { variant: 'destructive', label: 'Failed', className: 'bg-red-100 text-red-800' },
      'REFUNDED': { variant: 'secondary', label: 'Refunded', className: 'bg-gray-100 text-gray-800' },
      'CANCELED': { variant: 'outline', label: 'Canceled', className: 'bg-gray-100 text-gray-800' }
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status, className: '' };
    return (
      <Badge variant={statusInfo.variant} className={`capitalize ${statusInfo.className}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDownloadReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003087]">Payment History</h1>
          <p className="text-muted-foreground">View and manage all your payment transactions</p>
        </div>
      </div>

      {/* Client & Payment Account Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#003087] to-[#003087]/90 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/10 rounded-full -mr-16 -mt-16"></div>
        <CardHeader>
          <CardTitle className="text-white">Payment Account</CardTitle>
          <CardDescription className="text-white/80">Your payment details and history</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Account Holder</p>
              <p className="text-lg font-semibold">{clientDetails.name || 'Loading...'}</p>
              <p className="text-sm text-white/70">{clientDetails.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Stripe Customer ID</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-white/70" />
                <p className="text-lg font-mono font-medium">
                  {clientDetails.stripeCustomerId || 'Not connected'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">Total Projects</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Requiring Payment Section */}
      {projects.some(p => p.paymentStatus === 'PENDING' || (p.paymentCompletionPercentage && p.paymentCompletionPercentage < 100)) && (
        <Card className="border-0 shadow-sm bg-orange-50 border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Projects Requiring Payment</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              These projects need payment to proceed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .filter(p => p.paymentStatus === 'PENDING' || (p.paymentCompletionPercentage && p.paymentCompletionPercentage < 100))
                .map((project) => {
                  const estimatedValue = project.estimate && 
                                         project.estimate.estimateFinalPriceMin != null && 
                                         project.estimate.estimateFinalPriceMax != null
                    ? (Number(project.estimate.estimateFinalPriceMin) + Number(project.estimate.estimateFinalPriceMax)) / 2
                    : project.calculatedTotal || 0;
                  
                  const totalPaid = Number(project.totalAmountPaid) || 0;
                  const paymentPercentage = Number(project.paymentCompletionPercentage) || 0;
                  const remainingAmount = estimatedValue - totalPaid;

                  return (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.details.companyName}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Total Value:</span> ${estimatedValue.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Paid:</span> ${totalPaid.toLocaleString()} ({paymentPercentage.toFixed(0)}%)
                          </div>
                          <div>
                            <span className="font-medium">Remaining:</span> ${remainingAmount.toLocaleString()}
                          </div>
                        </div>
                        {project.paymentStatus === 'PENDING' && (
                          <div className="mt-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              First payment required (minimum 25%)
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsPaymentModalOpen(true);
                          }}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Make Payment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="succeeded">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[180px]">Payment ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loaders while loading
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <span className="font-mono text-sm">{payment.id.substring(0, 8)}...</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {payment.projectName || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.projectId.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewPayment(payment)}
                        className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payments found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'Your payment history will appear here'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(payments.length > 0 || page > 1) && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * itemsPerPage, payments.length + (page - 1) * itemsPerPage)}
              </span>{' '}
              results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate page numbers to show (current page in the middle when possible)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum > totalPages || pageNum < 1) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`w-10 h-10 p-0 ${page === pageNum ? 'bg-[#003087]' : ''}`}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading || totalPages === 0}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Payment Modal for Making Payments */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        setIsPaymentModalOpen(open);
        if (!open) {
          setCustomAmount(''); // Reset custom amount when closing
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          {selectedProject ? (
            <>
              <DialogHeader>
                <DialogTitle>Make Payment</DialogTitle>
                <DialogDescription>
                  Choose payment amount for {selectedProject.details.companyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Project Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project Value:</span>
                      <span className="font-medium">
                        ${((selectedProject.estimate && 
                            selectedProject.estimate.estimateFinalPriceMin != null && 
                            selectedProject.estimate.estimateFinalPriceMax != null
                          ? (Number(selectedProject.estimate.estimateFinalPriceMin) + Number(selectedProject.estimate.estimateFinalPriceMax)) / 2
                          : selectedProject.calculatedTotal || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">
                        ${(selectedProject.totalAmountPaid || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-orange-600">
                        ${(((selectedProject.estimate && 
                            selectedProject.estimate.estimateFinalPriceMin != null && 
                            selectedProject.estimate.estimateFinalPriceMax != null
                          ? (Number(selectedProject.estimate.estimateFinalPriceMin) + Number(selectedProject.estimate.estimateFinalPriceMax)) / 2
                          : selectedProject.calculatedTotal || 0)) - (selectedProject.totalAmountPaid || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  <h4 className="font-medium">Select Payment Amount</h4>
                  
                  {selectedProject.paymentStatus === 'PENDING' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ First payment must be at least 25% of the project value
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleMakePayment(selectedProject, 25)}
                      disabled={processingPayment}
                    >
                      <span className="text-lg font-bold">25%</span>
                      <span className="text-xs text-gray-600">Deposit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleMakePayment(selectedProject, 50)}
                      disabled={processingPayment}
                    >
                      <span className="text-lg font-bold">50%</span>
                      <span className="text-xs text-gray-600">Half Payment</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleMakePayment(selectedProject, 75)}
                      disabled={processingPayment}
                    >
                      <span className="text-lg font-bold">75%</span>
                      <span className="text-xs text-gray-600">Majority</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleMakePayment(selectedProject, 100)}
                      disabled={processingPayment}
                    >
                      <span className="text-lg font-bold">100%</span>
                      <span className="text-xs text-gray-600">Full Payment</span>
                    </Button>
                  </div>

                  {/* Custom Amount Section */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Or Enter Custom Amount</h4>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Enter amount in USD"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          disabled={processingPayment}
                          className="w-full"
                        />
                        {customAmount && Number(customAmount) > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Amount: ${Number(customAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          const amount = Number(customAmount);
                          if (amount > 0) {
                            handleMakePayment(selectedProject, undefined, amount);
                          } else {
                            toast.error('Please enter a valid amount');
                          }
                        }}
                        disabled={!customAmount || Number(customAmount) <= 0 || processingPayment}
                        className="bg-[#003087] hover:bg-[#003087]/90"
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Amount'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedPayment ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogDescription className="mt-1">
                      Payment ID: <span className="font-mono">{selectedPayment.id}</span>
                    </DialogDescription>
                  </div>
                  {selectedPayment.receiptUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadReceipt(selectedPayment.receiptUrl!)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Receipt
                    </Button>
                  )}
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Payment Amount</h4>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Project</h4>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">{selectedPayment.projectName || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedPayment.projectId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {selectedPayment.paymentMethodDetails?.card ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-md border">
                            <CreditCard className="h-5 w-5 text-[#003087]" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {selectedPayment.paymentMethodDetails.card.brand} •••• {selectedPayment.paymentMethodDetails.card.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {selectedPayment.paymentMethodDetails.card.expMonth}/{selectedPayment.paymentMethodDetails.card.expYear}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">
                          {selectedPayment.paymentMethod || 'Card payment'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                      <p className="mt-1">
                        {format(new Date(selectedPayment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                      <p className="mt-1">
                        {format(new Date(selectedPayment.createdAt), 'h:mm a')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <div className="mt-1">
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>
                    {selectedPayment.invoiceNumber && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Invoice</h4>
                        <p className="mt-1 font-mono text-sm">
                          {selectedPayment.invoiceNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedPayment.description && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                      <p className="mt-1 text-sm">
                        {selectedPayment.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Subtotal</span>
                        <span className="font-medium">
                          {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fees</span>
                        <span className="text-sm">
                          {formatCurrency(0, selectedPayment.currency)} {/* Assuming no fees for now */}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {selectedPayment.receiptUrl && (
                  <Button 
                    onClick={() => handleDownloadReceipt(selectedPayment.receiptUrl!)}
                    className="bg-[#003087] hover:bg-[#003087]/90"
                  >
                    Download Receipt
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
