"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FreelancerRequests from "@/components/freelancers/FreelancerRequests";
import AllFreelancers from "@/components/freelancers/AllFreelancers";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FreelancersPage() {
  const { isAuthorized } = useAuth(["ADMIN", "MODERATOR"]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "requests";

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  if(!isAuthorized) return null;
  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="flex justify-start space-x-4">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="freelancers">All Freelancers</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <FreelancerRequests />
        </TabsContent>

        {/* All Freelancers Tab */}
        <TabsContent value="freelancers">
          <AllFreelancers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
