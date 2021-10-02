export interface OCRResult {
    ParsedResults: ParsedResult[],
    OCRExitCode: number,
    IsErroredOnProcessing: boolean
    ProcessingTimeInMilliseconds: string
    SearchablePDFURL: string
}

interface ParsedResult {
    TextOverlay: TextOverlay[],
    TextOrientation: string,
    FileParseExitCode: number
    ParsedText: string,
    ErrorMessage: string
    ErrorDetails: string
}

interface TextOverlay {
    Lines: string[],
    HasOverlay: boolean,
    Message: string
}


