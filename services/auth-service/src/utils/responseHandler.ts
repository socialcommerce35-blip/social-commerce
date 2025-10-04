import { Response } from 'express';

export const sendSuccess = (res: Response, data: any = {}, code: number = 200): Response => {
    return res.status(code).json({ success: true, data, error: null });
};

export const sendError = (res: Response, error: string | Error = 'Something went wrong', code: number = 500): Response => {
    const message = error instanceof Error ? error.message : error;
    return res.status(code).json({ success: false, data: null, error: message });
};
