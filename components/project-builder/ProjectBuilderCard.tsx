import { useState } from "react";
import {
  Loader2,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Info,
  Calendar,
  DollarSign,
  Users,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Visitor {
  fullName: string;
  businessEmail: string;
  phoneNumber?: string;
  companyName?: string;
  companyWebsite?: string;
  businessAddress?: string;
  businessType?: string;
}

interface Freelancer {
  id: string;
  fullName: string;
  email: string;
  niche?: string;
}

interface ProjectBuilderRequest {
  isDeleting?: boolean;
  id: string;
  visitor: Visitor;
  selectedServices?: string[];
  selectedIndustries?: string[];
  selectedFeatures?: string[];
  budget?: string;
  timeline?: string;
  projectDescription?: string;
  interestedFreelancers?: Freelancer[];
  selectedFreelancers?: Freelancer[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export default function ProjectBuilderCard({
  request,
  onDelete,
  onView,
  formatDate,
}: {
  request: ProjectBuilderRequest;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card key={request.id} className="overflow-hidden">
        <CardHeader className="bg-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{request.visitor.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(request.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <Eye size={18} />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(request.id)}
                disabled={request.isDeleting}
              >
                {request.isDeleting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Trash2 size={18} />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground" size={18} />
                <span>{request.visitor.businessEmail}</span>
              </div>
              {request.visitor.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground" size={18} />
                  <span>{request.visitor.phoneNumber}</span>
                </div>
              )}
              {request.visitor.companyName && (
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground" size={18} />
                  <span>{request.visitor.companyName}</span>
                </div>
              )}
              {request.visitor.businessAddress && (
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground" size={18} />
                  <span>{request.visitor.businessAddress}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {request.selectedServices && request.selectedServices.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.selectedServices.map((service, idx) => (
                      <Badge key={idx} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.selectedIndustries && request.selectedIndustries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.selectedIndustries.map((industry, idx) => (
                      <Badge key={idx} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {request.budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground" size={18} />
                  <span>{request.budget}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 flex justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground" size={18} />
            <span className="text-sm">
              {request.interestedFreelancers?.length || 0} interested |{" "}
              {request.selectedFreelancers?.length || 0} selected
            </span>
          </div>
          {request.visitor.businessType && (
            <Badge variant="secondary">{request.visitor.businessType}</Badge>
          )}
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the project request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Visitor Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Visitor Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{request.visitor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{request.visitor.businessEmail}</p>
                </div>
                {request.visitor.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{request.visitor.phoneNumber}</p>
                  </div>
                )}
                {request.visitor.companyName && (
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{request.visitor.companyName}</p>
                  </div>
                )}
                {request.visitor.companyWebsite && (
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a
                      href={request.visitor.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {request.visitor.companyWebsite}
                    </a>
                  </div>
                )}
                {request.visitor.businessType && (
                  <div>
                    <p className="text-sm font-medium">Business Type</p>
                    <p className="text-sm text-muted-foreground">{request.visitor.businessType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Project Details</h3>
              {request.projectDescription && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{request.projectDescription}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {request.budget && (
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">{request.budget}</p>
                  </div>
                )}
                {request.timeline && (
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="text-sm text-muted-foreground">{request.timeline}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            {request.selectedServices && request.selectedServices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Selected Services</h3>
                <div className="flex flex-wrap gap-2">
                  {request.selectedServices.map((service, idx) => (
                    <Badge key={idx} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Industries */}
            {request.selectedIndustries && request.selectedIndustries.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Selected Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {request.selectedIndustries.map((industry, idx) => (
                    <Badge key={idx} variant="outline">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {request.selectedFeatures && request.selectedFeatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Selected Features</h3>
                <div className="flex flex-wrap gap-2">
                  {request.selectedFeatures.map((feature, idx) => (
                    <Badge key={idx} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Freelancers */}
            {request.interestedFreelancers && request.interestedFreelancers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Interested Freelancers</h3>
                <div className="space-y-2">
                  {request.interestedFreelancers.map((freelancer) => (
                    <div key={freelancer.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{freelancer.fullName}</p>
                        <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                      </div>
                      {freelancer.niche && (
                        <Badge variant="secondary">{freelancer.niche}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

