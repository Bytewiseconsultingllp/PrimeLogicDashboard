"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMessage } from "@/lib/api/contact";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserDetails } from "@/lib/api/auth";
import { setUserDetails } from "@/lib/api/storage";
import { max } from "date-fns";

// Zod schema for validation
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).max(50, { message: "First name must be at most 50 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(50, { message: "Last name must be at most 50 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must be at most 500 characters." }),
});

export default function ContactForm() {
  // Authentication check (should be first)
  const { isAuthorized } = useAuth(["CLIENT"]);

  // State hooks (placed together)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Form hook (after state hooks)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    getUserDetails();
  }, [])

  const getUserDetails = async () => {
    try {
      const userDetails = await getCurrentUserDetails();
      if (userDetails) {
        const fullName = userDetails.data.fullName || "";
        const [firstName = "", lastName = ""] = fullName.split(" ");
        const email = userDetails.data.email || "";

        form.reset({
          firstName,
          lastName,
          email,
          message: "", // Leave message empty
        });
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
    }
  };
  
  async function onSubmit(values: any) {
    setIsSubmitting(true);
    try {
      const response = await createMessage(values);
      if (response.success) {
        toast.success("Message sent successfully!");
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      form.reset();
      setIsSubmitting(false);
    }
  }
  
  if (!isAuthorized) return null; // Prevent rendering if unauthorized

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {(["firstName", "lastName", "email", "message"] as const).map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                    </FormLabel>
                    <FormControl>
                      {fieldName === "message" ? (
                        <Textarea placeholder={`Enter your ${fieldName}`} className="resize-none" {...field} />
                      ) : (
                        <Input type={fieldName === "email" ? "email" : "text"} placeholder={`Enter your ${fieldName}`} {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
