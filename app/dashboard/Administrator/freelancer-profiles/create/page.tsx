"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const freelancerFormSchema = z.object({
  whoYouAre: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    timeZone: z.string().min(1, "Time zone is required"),
    country: z.string().min(2, "Country is required"),
    professionalLinks: z.object({
      github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
      personalSite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    }),
  }),
  coreRole: z.object({
    primaryDomain: z.string().min(2, "Primary domain is required"),
  }),
  eliteSkillCards: z.object({
    selectedSkills: z.array(z.string()).min(1, "Select at least one skill"),
  }),
  toolstackProficiency: z.object({
    selectedTools: z.array(
      z.object({
        category: z.string(),
        tools: z.array(z.string()),
      }),
    ),
  }),
  domainExperience: z.object({
    roles: z.array(
      z.object({
        title: z.string(),
        years: z.number().min(0),
      }),
    ),
  }),
  industryExperience: z.object({
    selectedIndustries: z.array(z.string()).min(1, "Select at least one industry"),
  }),
  availabilityWorkflow: z.object({
    weeklyCommitment: z.number().min(1).max(168),
    workingHours: z.array(z.string()),
    collaborationTools: z.array(z.string()),
    teamStyle: z.string(),
    screenSharing: z.enum(["yes", "no"]),
    availabilityExceptions: z.string().optional(),
  }),
  softSkills: z.object({
    collaborationStyle: z.string(),
    communicationFrequency: z.string(),
    conflictResolution: z.string(),
    languages: z.array(z.string()),
    teamVsSolo: z.string(),
  }),
  certifications: z.object({
    certificates: z.array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    ),
  }),
  projectQuoting: z.object({
    compensationPreference: z.enum(["hourly", "fixed", "both"]),
    smallProjectPrice: z.number().min(0),
    midProjectPrice: z.number().min(0),
    longTermPrice: z.number().min(0),
    milestoneTerms: z.string(),
    willSubmitProposals: z.enum(["yes", "no"]),
  }),
  legalAgreements: z.object({
    agreements: z.array(
      z.object({
        id: z.string(),
        accepted: z.boolean(),
      }),
    ),
    identityVerification: z.object({
      idType: z.string(),
      taxDocType: z.string(),
      addressVerified: z.boolean(),
    }),
    workAuthorization: z.object({
      interested: z.boolean(),
    }),
  }),
})

const skillOptions = [
  "Python / Java / C# / Go",
  "Node.js / Express",
  "React / Vue.js",
  "Angular / Svelte",
  "Django / Flask",
  "Spring Boot",
  "Docker / Kubernetes",
]

const industryOptions = ["Fintech", "HealthTech", "SaaS (B2B/B2C)", "EdTech", "E-commerce", "Social Media", "Travel"]

const workingHoursOptions = ["9am–5pm", "2pm–10pm", "6pm–2am", "Flexible"]

const collaborationToolsOptions = ["Slack", "Zoom", "Notion", "Jira", "Trello", "Microsoft Teams"]

const legalAgreementsList = [
  { id: "nda", label: "Non-Disclosure Agreement (NDA)" },
  { id: "workForHire", label: "Work for Hire Agreement" },
  { id: "scope", label: "Scope of Work Agreement" },
  { id: "payment", label: "Payment Terms Agreement" },
  { id: "security", label: "Security & Data Protection" },
  { id: "nonSolicitation", label: "Non-Solicitation Agreement" },
  { id: "codeOfConduct", label: "Code of Conduct" },
  { id: "ipBoundaries", label: "IP Boundaries Agreement" },
]

export default function CreateFreelancerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRole, setNewRole] = useState({ title: "", years: 0 })
  const [newCert, setNewCert] = useState({ name: "", url: "" })

  const form = useForm<z.infer<typeof freelancerFormSchema>>({
    resolver: zodResolver(freelancerFormSchema),
    defaultValues: {
      whoYouAre: {
        fullName: "",
        email: "",
        timeZone: "",
        country: "",
        professionalLinks: {
          github: "",
          linkedin: "",
          personalSite: "",
        },
      },
      coreRole: {
        primaryDomain: "",
      },
      eliteSkillCards: {
        selectedSkills: [],
      },
      toolstackProficiency: {
        selectedTools: [],
      },
      domainExperience: {
        roles: [],
      },
      industryExperience: {
        selectedIndustries: [],
      },
      availabilityWorkflow: {
        weeklyCommitment: 40,
        workingHours: [],
        collaborationTools: [],
        teamStyle: "",
        screenSharing: "yes",
        availabilityExceptions: "",
      },
      softSkills: {
        collaborationStyle: "",
        communicationFrequency: "",
        conflictResolution: "",
        languages: [],
        teamVsSolo: "",
      },
      certifications: {
        certificates: [],
      },
      projectQuoting: {
        compensationPreference: "hourly",
        smallProjectPrice: 0,
        midProjectPrice: 0,
        longTermPrice: 0,
        milestoneTerms: "",
        willSubmitProposals: "yes",
      },
      legalAgreements: {
        agreements: legalAgreementsList.map((agreement) => ({
          id: agreement.id,
          accepted: false,
        })),
        identityVerification: {
          idType: "",
          taxDocType: "",
          addressVerified: false,
        },
        workAuthorization: {
          interested: false,
        },
      },
    },
  })

  async function onSubmit(values: z.infer<typeof freelancerFormSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/freelancer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })
        // Redirect after successful registration
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to register freelancer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create freelancer:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRole = () => {
    if (newRole.title && newRole.years > 0) {
      const currentRoles = form.getValues("domainExperience.roles")
      form.setValue("domainExperience.roles", [...currentRoles, newRole])
      setNewRole({ title: "", years: 0 })
    }
  }

  const addCertificate = () => {
    if (newCert.name && newCert.url) {
      const currentCerts = form.getValues("certifications.certificates")
      form.setValue("certifications.certificates", [...currentCerts, newCert])
      setNewCert({ name: "", url: "" })
    }
  }

  const toggleSkill = (skill: string) => {
    const currentSkills = form.getValues("eliteSkillCards.selectedSkills")
    if (currentSkills.includes(skill)) {
      form.setValue(
        "eliteSkillCards.selectedSkills",
        currentSkills.filter((s) => s !== skill),
      )
    } else {
      form.setValue("eliteSkillCards.selectedSkills", [...currentSkills, skill])
    }
  }

  const toggleIndustry = (industry: string) => {
    const currentIndustries = form.getValues("industryExperience.selectedIndustries")
    if (currentIndustries.includes(industry)) {
      form.setValue(
        "industryExperience.selectedIndustries",
        currentIndustries.filter((i) => i !== industry),
      )
    } else {
      form.setValue("industryExperience.selectedIndustries", [...currentIndustries, industry])
    }
  }

  const toggleWorkingHour = (hour: string) => {
    const currentHours = form.getValues("availabilityWorkflow.workingHours")
    if (currentHours.includes(hour)) {
      form.setValue(
        "availabilityWorkflow.workingHours",
        currentHours.filter((h) => h !== hour),
      )
    } else {
      form.setValue("availabilityWorkflow.workingHours", [...currentHours, hour])
    }
  }

  const toggleCollaborationTool = (tool: string) => {
    const currentTools = form.getValues("availabilityWorkflow.collaborationTools")
    if (currentTools.includes(tool)) {
      form.setValue(
        "availabilityWorkflow.collaborationTools",
        currentTools.filter((t) => t !== tool),
      )
    } else {
      form.setValue("availabilityWorkflow.collaborationTools", [...currentTools, tool])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <h1 className="mb-8 text-3xl font-bold">Freelancer Registration</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          {/* Who You Are Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Who You Are</h2>
            <FormField
              control={form.control}
              name="whoYouAre.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whoYouAre.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whoYouAre.timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <FormControl>
                      <Input placeholder="America/New_York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whoYouAre.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Links</h3>
              <FormField
                control={form.control}
                name="whoYouAre.professionalLinks.github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whoYouAre.professionalLinks.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whoYouAre.professionalLinks.personalSite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Site</FormLabel>
                    <FormControl>
                      <Input placeholder="https://johndoe.dev" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Core Role Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Core Role</h2>
            <FormField
              control={form.control}
              name="coreRole.primaryDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Elite Skill Cards Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Elite Skills</h2>
            <FormField
              control={form.control}
              name="eliteSkillCards.selectedSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Your Skills</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox checked={field.value.includes(skill)} onCheckedChange={() => toggleSkill(skill)} />
                        <label className="text-sm cursor-pointer" onClick={() => toggleSkill(skill)}>
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>Selected: {field.value.join(", ") || "None"}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Domain Experience Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Domain Experience</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Role Title"
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Years"
                  value={newRole.years || ""}
                  onChange={(e) => setNewRole({ ...newRole, years: Number.parseInt(e.target.value) || 0 })}
                />
                <Button type="button" onClick={addRole}>
                  Add Role
                </Button>
              </div>
              <div className="space-y-2">
                {form.watch("domainExperience.roles").map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span>
                      {role.title} - {role.years} years
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const roles = form.getValues("domainExperience.roles")
                        form.setValue(
                          "domainExperience.roles",
                          roles.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Industry Experience Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Industry Experience</h2>
            <FormField
              control={form.control}
              name="industryExperience.selectedIndustries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Industries</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {industryOptions.map((industry) => (
                      <div key={industry} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.includes(industry)}
                          onCheckedChange={() => toggleIndustry(industry)}
                        />
                        <label className="text-sm cursor-pointer" onClick={() => toggleIndustry(industry)}>
                          {industry}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>Selected: {field.value.join(", ") || "None"}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Availability Workflow Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Availability & Workflow</h2>
            <FormField
              control={form.control}
              name="availabilityWorkflow.weeklyCommitment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Commitment (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availabilityWorkflow.workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Hours</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {workingHoursOptions.map((hour) => (
                      <div key={hour} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.includes(hour)}
                          onCheckedChange={() => toggleWorkingHour(hour)}
                        />
                        <label className="text-sm cursor-pointer" onClick={() => toggleWorkingHour(hour)}>
                          {hour}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availabilityWorkflow.collaborationTools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaboration Tools</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {collaborationToolsOptions.map((tool) => (
                      <div key={tool} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.includes(tool)}
                          onCheckedChange={() => toggleCollaborationTool(tool)}
                        />
                        <label className="text-sm cursor-pointer" onClick={() => toggleCollaborationTool(tool)}>
                          {tool}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availabilityWorkflow.teamStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agile">Agile</SelectItem>
                      <SelectItem value="waterfall">Waterfall</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availabilityWorkflow.screenSharing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Screen Sharing Available?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availabilityWorkflow.availabilityExceptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Exceptions</FormLabel>
                  <FormControl>
                    <Input placeholder="Available for urgent projects on weekends" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Soft Skills Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Soft Skills</h2>
            <FormField
              control={form.control}
              name="softSkills.collaborationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaboration Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="collaborative">Collaborative</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="softSkills.communicationFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as-needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="softSkills.conflictResolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conflict Resolution</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select approach" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="diplomatic">Diplomatic</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="mediator">Mediator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="softSkills.teamVsSolo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team vs Solo Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Certifications Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Certificate Name"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                />
                <Input
                  placeholder="Certificate URL"
                  value={newCert.url}
                  onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
                />
                <Button type="button" onClick={addCertificate}>
                  Add Certificate
                </Button>
              </div>
              <div className="space-y-2">
                {form.watch("certifications.certificates").map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span>
                      {cert.name} - {cert.url}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const certs = form.getValues("certifications.certificates")
                        form.setValue(
                          "certifications.certificates",
                          certs.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Project Quoting Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Project Quoting</h2>
            <FormField
              control={form.control}
              name="projectQuoting.compensationPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compensation Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="projectQuoting.smallProjectPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Small Project Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectQuoting.midProjectPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mid Project Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectQuoting.longTermPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Term Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="projectQuoting.milestoneTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Terms</FormLabel>
                  <FormControl>
                    <Input placeholder="25/25/25/25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectQuoting.willSubmitProposals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Will Submit Proposals?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Legal Agreements Section */}
          <section className="space-y-6 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold">Legal Agreements</h2>
            <FormField
              control={form.control}
              name="legalAgreements.agreements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Agreements</FormLabel>
                  <div className="space-y-3">
                    {legalAgreementsList.map((agreement, index) => (
                      <div key={agreement.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value[index]?.accepted || false}
                          onCheckedChange={(checked) => {
                            const newAgreements = [...field.value]
                            newAgreements[index] = { id: agreement.id, accepted: checked as boolean }
                            field.onChange(newAgreements)
                          }}
                        />
                        <label className="text-sm">{agreement.label}</label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identity Verification</h3>
              <FormField
                control={form.control}
                name="legalAgreements.identityVerification.idType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers-license">Driver's License</SelectItem>
                        <SelectItem value="national-id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalAgreements.identityVerification.taxDocType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax doc type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="w9">W-9</SelectItem>
                        <SelectItem value="w8">W-8</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalAgreements.identityVerification.addressVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Address Verified</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="legalAgreements.workAuthorization.interested"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Interested in Work Authorization</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
          </Button>
        </form>
      </Form>
      <Toaster />
    </motion.div>
  )
}
