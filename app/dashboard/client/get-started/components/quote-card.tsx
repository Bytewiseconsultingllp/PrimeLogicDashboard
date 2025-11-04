"use client";

import { useState } from "react";
import { FileText, Check, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

// Example: You can replace this with your actual form data fetched from your lib or global state
// TODO: Replace this mock with the actual import when the module is available
export async function getUserFormData() {
  // Mock data structure matching expected fields
  return {
    name: "John Doe",
    company: "Acme Corp",
    email: "john.doe@example.com",
    selectedServices: ["Web Development", "UI/UX Design"],
    industries: ["Finance", "Healthcare"],
    technologies: ["React", "Node.js"],
    features: ["Authentication", "Payments"],
    specialOffers: "10% discount for first-time clients",
    timeline: "6 weeks",
    estimatedBudget: "$10,000 - $15,000",
    agreement: "Agreed to terms and conditions"
  };
}
// Helper to map form data to the PDF structure
function mapFormData(formData: any) {
    return {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        selectedServices: formData.selectedServices,
        industries: formData.industries,
        technologies: formData.technologies,
        features: formData.features,
        specialOffers: formData.specialOffers,
        timeline: formData.timeline,
        estimatedBudget: formData.estimatedBudget,
        agreement: formData.agreement,
    };
}
export default function RequestQuoteCard() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Handle selection and trigger quote generation
  const handleOptionSelect = async (option: string) => {
    setSelectedOption(option);
    if (option === "quote") {
      const userData = await getUserFormData(); // Fetch data from lib
      console.log("User Data for PDF:", userData);
      generatePDF(userData);
    }
  };

  // PDF Generator Function
  const generatePDF = (data: any) => {
    const doc = new jsPDF();

    // === HEADER SECTION ===
    const logoUrl = "/logo.png"; // Path to your logo in public folder
    doc.addImage(logoUrl, "PNG", 15, 10, 25, 25); // Left-aligned logo
    doc.setFontSize(18);
    doc.text("Prime Logic Solutions", 105, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Formal Quotation Document", 105, 35, { align: "center" });

    doc.line(15, 40, 195, 40); // Divider line

    // === BODY: QUOTE INFORMATION ===
    const rows = [
      ["Name", data.name || "—"],
      ["Company", data.company || "—"],
      ["Email", data.email || "—"],
      ["Selected Services", data.selectedServices?.join(", ") || "—"],
      ["Industries", data.industries?.join(", ") || "—"],
      ["Technologies", data.technologies?.join(", ") || "—"],
      ["Features", data.features?.join(", ") || "—"],
      ["Special Offers", data.specialOffers || "—"],
      ["Timeline", data.timeline || "—"],
      ["Estimated Budget", data.estimatedBudget || "—"],
      ["Agreement", data.agreement || "—"],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: rows,
      theme: "striped",
      styles: { fontSize: 11 },
      headStyles: { fillColor: [0, 48, 135] },
    });

    // === FOOTER ===
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text(
      "Thank you for choosing Prime Logic Solutions.\nThis quote is valid for 30 days from the date of issue.",
      15,
      finalY
    );

    doc.text("Authorized Signature:", 15, finalY + 20);
    doc.line(60, finalY + 20, 150, finalY + 20);

    doc.save(`Formal_Quote_${data.name || "Client"}.pdf`);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3 text-[#003087]">I Want to Compare Options</h3>
      <Card
        className={`border-2 transition-all cursor-pointer hover:shadow-md h-full ${
          selectedOption === "quote" ? "border-[#003087] bg-blue-50" : "border-gray-200"
        }`}
        onClick={() => handleOptionSelect("quote")}
      >
        <CardHeader className="pb-4">
          <div className="mb-2 flex justify-between items-start">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === "quote" ? "bg-[#003087] text-white" : "bg-gray-100"
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            {selectedOption === "quote" && <Check className="h-5 w-5 text-[#003087]" />}
          </div>
          <CardTitle className="text-xl">Request Formal Quote</CardTitle>
          <CardDescription>Get Instant PDF</CardDescription>
        </CardHeader>
        <CardContent className="pb-4 flex-grow flex flex-col">
          <p className="text-sm text-gray-600 mb-4 flex-grow">
            Receive a detailed quote document with project specifications, timeline, and payment terms.
          </p>
          <div className="flex items-center justify-center mt-auto">
            <div className="w-16 h-16 bg-[#003087] rounded flex items-center justify-center">
              <Download className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <p className="text-xs text-gray-500">PDF format • Share with stakeholders • Valid for 30 days</p>
        </CardFooter>
      </Card>
    </div>
  );
}
