"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin, Globe, Clock, Briefcase } from "lucide-react"

interface FreelancerProfileCardProps {
  profile: any
}

export function FreelancerProfileCard({ profile }: FreelancerProfileCardProps) {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No profile data available</p>
        </CardContent>
      </Card>
    )
  }

  const { details, status, domainExperiences, availabilityWorkflow } = profile

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Details</CardTitle>
          <Badge
            variant={status === "ACCEPTED" ? "default" : status === "PENDING_REVIEW" ? "secondary" : "destructive"}
          >
            {status?.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{details?.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Country:</span>
            <span className="font-medium">{details?.country}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Timezone:</span>
            <span className="font-medium">{details?.timeZone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Primary Domain:</span>
            <span className="font-medium">{details?.primaryDomain}</span>
          </div>
        </div>

        {/* Elite Skills */}
        {details?.eliteSkillCards && details.eliteSkillCards.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Elite Skills</h4>
            <div className="flex flex-wrap gap-2">
              {details.eliteSkillCards.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tools */}
        {details?.tools && details.tools.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {details.tools.map((tool: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Domain Experience */}
        {domainExperiences && domainExperiences.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Experience</h4>
            <div className="space-y-2">
              {domainExperiences.map((exp: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{exp.roleTitle}</span>
                  <Badge variant="outline">{exp.years} years</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {availabilityWorkflow && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Availability</h4>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                Weekly Commitment:{" "}
                <span className="font-medium text-foreground">
                  {availabilityWorkflow.weeklyCommitmentMinHours}
                  {availabilityWorkflow.weeklyCommitmentMaxHours
                    ? `-${availabilityWorkflow.weeklyCommitmentMaxHours}`
                    : "+"}{" "}
                  hours
                </span>
              </p>
              {availabilityWorkflow.preferredTeamStyle && (
                <p className="text-muted-foreground">
                  Team Style:{" "}
                  <span className="font-medium text-foreground">
                    {availabilityWorkflow.preferredTeamStyle.replace(/_/g, " ")}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Professional Links */}
        {details?.professionalLinks && details.professionalLinks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Professional Links</h4>
            <div className="space-y-1">
              {details.professionalLinks.map((link: string, index: number) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="h-3 w-3" />
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
