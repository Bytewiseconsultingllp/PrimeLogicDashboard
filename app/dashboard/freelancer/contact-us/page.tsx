"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMessage } from "@/lib/api/contact";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserDetails } from "@/lib/api/auth";
import { 
  MessageCircle, 
  Send, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  CheckCircle
} from "lucide-react";

// Zod schema for validation
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).max(50, { message: "First name must be at most 50 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(50, { message: "Last name must be at most 50 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message must be at most 500 characters." }),
});

export default function ContactForm() {
  // Authentication check (should be first)
  const { isAuthorized } = useAuth(["FREELANCER"]);

  // State hooks (placed together)
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        form.reset({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          message: "",
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthorized) return null; // Prevent rendering if unauthorized

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-r from-[#003087] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto"
        >
          <MessageCircle className="w-10 h-10 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-bold text-[#003087] mb-2">Get in Touch</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about your projects or need support? We're here to help! 
            Send us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information Cards */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-[#003087] mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-[#003087] hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003087]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#003087]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">support@primelogicsolutions.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#FF6B35] hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Response Time</h3>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office</h3>
                    <p className="text-gray-600">Available worldwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-[#003087]/5 to-[#FF6B35]/5 border-b">
              <CardTitle className="text-2xl text-[#003087] flex items-center gap-2">
                <Send className="w-6 h-6" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your first name"
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your last name"
                              className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="Enter your email address"
                            className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Your Message
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us about your project questions, feedback, or how we can help you..."
                            className="border-gray-300 focus:border-[#003087] focus:ring-[#003087] min-h-[120px] resize-none"
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#003087] to-[#FF6B35] hover:from-[#003087]/90 hover:to-[#FF6B35]/90 text-white font-semibold text-lg shadow-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Message...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">
                We typically respond within 24 hours. Thank you for choosing Prime Logic Solutions!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}