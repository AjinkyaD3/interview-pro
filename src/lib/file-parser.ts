import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
        fullText += pageText + "\n";
    }

    return fullText;
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
    const type = file.type;

    if (type === "application/pdf") {
        return extractTextFromPdf(file);
    } else if (
        type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        type === "application/msword"
    ) {
        return extractTextFromDocx(file);
    } else if (type === "text/plain") {
        return await file.text();
    } else {
        throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
    }
};
