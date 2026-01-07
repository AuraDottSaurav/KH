declare module 'pdf-parse' {
    interface PDFData {
        text: string;
        numpages: number;
        info: Record<string, unknown>;
        metadata: Record<string, unknown>;
        version: string;
    }

    function pdfParse(buffer: Buffer | ArrayBuffer): Promise<PDFData>;

    export default pdfParse;
}
