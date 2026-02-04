import { LinkedInLead } from "@/types";

interface ParseCSVResult {
  leads: LinkedInLead[];
  errors: string[];
}

export function parseCSV(text: string): ParseCSVResult {
  const errors: string[] = [];
  const leads: LinkedInLead[] = [];

  const lines = text.trim().split("\n");
  if (lines.length === 0) {
    errors.push("CSV file is empty");
    return { leads, errors };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredHeaders = ["firstname", "lastname", "company", "position", "linkedinurl"];

  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
    return { leads, errors };
  }

  const firstNameIdx = headers.indexOf("firstname");
  const lastNameIdx = headers.indexOf("lastname");
  const companyIdx = headers.indexOf("company");
  const positionIdx = headers.indexOf("position");
  const linkedinUrlIdx = headers.indexOf("linkedinurl");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());

    if (values.length < requiredHeaders.length) {
      errors.push(`Row ${i + 1}: Insufficient columns`);
      continue;
    }

    const firstName = values[firstNameIdx];
    const lastName = values[lastNameIdx];
    const company = values[companyIdx];
    const position = values[positionIdx];
    const linkedinUrl = values[linkedinUrlIdx];

    if (!firstName) {
      errors.push(`Row ${i + 1}: firstName is required`);
      continue;
    }

    if (!linkedinUrl) {
      errors.push(`Row ${i + 1}: linkedinUrl is required`);
      continue;
    }

    leads.push({
      firstName,
      lastName,
      company,
      position,
      linkedinUrl,
    });
  }

  return { leads, errors };
}
