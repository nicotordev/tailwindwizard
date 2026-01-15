import { PDFParse } from "pdf-parse";

export interface ParsedResume {
  text: string;
  email?: string;
  website?: string;
  github?: string;
  twitter?: string;
  suggestedBio?: string;
}

export const resumeService = {
  async parse(buffer: Buffer): Promise<ParsedResume> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text || "";

    // Basic heuristics
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const githubRegex = /github\.com\/([a-zA-Z0-9_-]+)/;
    const twitterRegex = /(?:twitter\.com|x\.com)\/([a-zA-Z0-9._-]+)/;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const emailMatch = text.match(emailRegex);
    const githubMatch = text.match(githubRegex);
    const twitterMatch = text.match(twitterRegex);
    
    // Find all URLs
    const urls = text.match(urlRegex) || [];
    // Filter out github/twitter to find potential portfolio
    const website = urls.find((url: string) => 
        !url.includes("github.com") && 
        !url.includes("twitter.com") && 
        !url.includes("x.com") &&
        !url.includes("linkedin.com")
    );

    // Simple bio extraction: Take the first 200 chars that aren't contact info?
    // Very naive, but better than nothing.
    // Clean up newlines
    const cleanText = text.replace(/\n+/g, " ").trim();
    const suggestedBio = cleanText.substring(0, 300) + "...";

    return {
      text,
      email: emailMatch ? emailMatch[0] : undefined,
      github: githubMatch ? githubMatch[1] : undefined,
      twitter: twitterMatch ? twitterMatch[1] : undefined,
      website,
      suggestedBio,
    };
  }
};
