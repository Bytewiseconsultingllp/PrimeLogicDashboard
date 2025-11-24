'use client';

import { useState, useEffect } from 'react';
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
import { CreditCard, Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'requires_payment_method' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled';
  createdAt: string;
  paymentMethod: string;
  paymentMethodDetails: {
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
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    stripeCustomerId: ''
  });
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchClientDetails();
    fetchPayments();
  }, [page, statusFilter, searchTerm]);

  const fetchClientDetails = async () => {
    try {
      // Replace with actual API call to get client details
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLS}/api/v1/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      
      const data = await response.json();
      setClientDetails({
        name: data.data.fullName,
        email: data.data.email,
        stripeCustomerId: data.data.stripeCustomerId || 'Not connected'
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Failed to load client details');
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Replace with actual API endpoint for fetching payments
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PLS}/api/v1/payments?page=${page}&limit=${itemsPerPage}` +
        `&status=${statusFilter !== 'all' ? statusFilter : ''}` +
        `&search=${encodeURIComponent(searchTerm)}`, 
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.data.payments);
      setTotalPages(Math.ceil(data.data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchPayments();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success', label: string }> = {
      'succeeded': { variant: 'success', label: 'Paid' },
      'pending': { variant: 'outline', label: 'Pending' },
      'failed': { variant: 'destructive', label: 'Failed' },
      'refunded': { variant: 'secondary', label: 'Refunded' },
      'requires_payment_method': { variant: 'outline', label: 'Incomplete' },
      'requires_action': { variant: 'outline', label: 'Action Required' },
      'processing': { variant: 'outline', label: 'Processing' },
      'requires_capture': { variant: 'outline', label: 'Capture Required' },
      'canceled': { variant: 'outline', label: 'Canceled' }
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };
    return (
      <Badge variant={statusInfo.variant} className="capitalize">
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
              <p className="text-sm font-medium text-white/80">Payment Methods</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <p className="text-sm font-medium">Visa •••• 4242</p>
                </div>
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/10">
                  + Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              of <span className="font-medium">{totalPages * itemsPerPage}</span> results
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
                  
                  if (pageNum > totalPages) return null;
                  
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
                            <p className="font-medium">
                              {selectedPayment.paymentMethodDetails.card.brand} •••• {selectedPayment.paymentMethodDetails.card.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {selectedPayment.paymentMethodDetails.card.expMonth}/{selectedPayment.paymentMethodDetails.card.expYear}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">
                          {selectedPayment.paymentMethod || 'Payment method not available'}
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
