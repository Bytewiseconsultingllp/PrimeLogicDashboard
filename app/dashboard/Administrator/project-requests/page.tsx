"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Eye, Trash2, Check } from "lucide-react";
import { getAllProjectBuilders, deleteProjectBuilder } from "@/lib/api/project-builder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Freelancer {
  uid: string;
  username: string;
  fullName: string;
  email: string;
}

interface ProjectBuilderRequest {
  id: string;
  projectName: string;
  projectDescription: string;
  projectType: string;
  technologies: string[];
  features: string[];
  budget: number;
  timeline: string;
  priority: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  interestedFreelancers: Freelancer[];
  selectedFreelancers: Freelancer[];
  isDeleting?: boolean; 
}

export default function ProjectRequestsPage() {
  const [requests, setRequests] = useState<ProjectBuilderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<ProjectBuilderRequest[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectBuilderRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllProjectBuilders();
        if (response.status === 200) {
          const data = Array.isArray(response.data.data?.projectBuilders) 
            ? response.data.data.projectBuilders 
            : Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
          setRequests(data);
          setFilteredRequests(data);
        } else {
          setError(response.data?.message || "Failed to fetch data");
          setRequests([]);
          setFilteredRequests([]);
        }
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(requests)) {
      setFilteredRequests([]);
      return;
    }
    
    const filtered = requests.filter((request) =>
      [
        request.projectName,
        request.clientName,
        request.clientEmail,
        request.clientPhone,
        request.clientCompany,
        request.projectType,
        request.status,
      ].some((field) => field?.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [search, requests]);

const handleDelete = async (id: string) => {
  setDeletingId(id);
  try {
    const response = await deleteProjectBuilder(id);
    if(response.status === 200) {
        toast.success("Project Request Deleted Successfully");
        setRequests((prevRequests) => {
          if (!Array.isArray(prevRequests)) return [];
          return prevRequests.filter((request) => request.id !== id);
        });
    }
  } catch (error) {
    toast.error("Failed to delete project request");
  } finally {
    setDeletingId(null); 
  }
};

const handleApprove = async (request: ProjectBuilderRequest) => {
  try {
    // Optimistically update UI
    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id ? { ...r, status: "APPROVED" } : r
      )
    );

    const response = await fetch(`https://api.primelogicsol.com/api/v1/projectBuilder/${request.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_JWT_TOKEN`,
      },
      body: JSON.stringify({ status: "APPROVED" }),
    });

    if (!response.ok) {
      throw new Error("Failed to approve project");
    }

    const data = await response.json();
    if (data.success) {
      toast.success("Project approved successfully");
    } else {
      toast.error(data.message || "Approval failed");
      // Revert optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? request : r))
      );
    }
  } catch (error) {
    toast.error((error as Error).message);
    // Revert optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? request : r))
    );
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const totalPages = Math.ceil((filteredRequests?.length || 0) / itemsPerPage);
const displayedRequests = (filteredRequests || []).slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

if(!isAuthorized) return null;

return (
  <div className="container mx-auto py-8 px-4">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold">Project Requests</h1>
      <div className="flex w-full max-w-2xl items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />{" "}
        </div>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          {[5, 10, 25, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num} entries
            </option>
          ))}
        </select>
      </div>
    </div>
    {/* Error state */}
    {error && (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
        <p>{error}</p>
      </div>
    )}


    {/* Loading state */}
    {isLoading ? (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : (
      <>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Freelancers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRequests.length > 0 ? (
                displayedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{request.projectName}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.projectDescription.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.clientName}</div>
                        <div className="text-xs text-muted-foreground">{request.clientCompany}</div>
                        <div className="text-xs text-muted-foreground">{request.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.projectType}</Badge>
                    </TableCell>
                    <TableCell>${request.budget.toLocaleString()}</TableCell>
                    <TableCell>{request.timeline}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "APPROVED"
                            ? "default"
                            : request.status === "SUBMITTED"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.priority === "URGENT"
                            ? "destructive"
                            : request.priority === "HIGH"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{request.interestedFreelancers.length} interested</div>
                        <div>{request.selectedFreelancers.length} selected</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(request)}
                          disabled={request.status === "APPROVED"}
                          title={request.status === "APPROVED" ? "Already Approved" : "Approve Project"}
                        >
                          <Check className={`h-4 w-4 ${request.status === "APPROVED" ? "text-green-500" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProject(request);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(request.id)}
                          disabled={deletingId === request.id}
                        >
                          {deletingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <p className="text-muted-foreground">No requests found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredRequests?.length || 0)} of{" "}
            {filteredRequests?.length || 0} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    )}

    {/* Project Details Dialog */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedProject?.projectName}</DialogTitle>
          <DialogDescription>Project Request Details</DialogDescription>
        </DialogHeader>

        {selectedProject && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{selectedProject.projectDescription}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Client Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.clientCompany}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.clientEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.clientPhone}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Project Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge variant="outline">{selectedProject.projectType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">${selectedProject.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.timeline}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="secondary">{selectedProject.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge variant={selectedProject.priority === "URGENT" ? "destructive" : "default"}>
                    {selectedProject.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedProject.createdAt)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {(selectedProject.interestedFreelancers.length > 0 || selectedProject.selectedFreelancers.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Freelancers</h3>
                
                {selectedProject.interestedFreelancers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Interested ({selectedProject.interestedFreelancers.length})</p>
                    <div className="space-y-2">
                      {selectedProject.interestedFreelancers.map((freelancer) => (
                        <div key={freelancer.uid} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{freelancer.fullName}</p>
                            <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                          </div>
                          <Badge variant="secondary">{freelancer.username}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.selectedFreelancers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected ({selectedProject.selectedFreelancers.length})</p>
                    <div className="space-y-2">
                      {selectedProject.selectedFreelancers.map((freelancer) => (
                        <div key={freelancer.uid} className="flex items-center justify-between p-2 border rounded bg-green-50">
                          <div>
                            <p className="font-medium">{freelancer.fullName}</p>
                            <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                          </div>
                          <Badge variant="default">{freelancer.username}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedProject.additionalNotes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                <p className="text-sm text-muted-foreground">{selectedProject.additionalNotes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
);
}
