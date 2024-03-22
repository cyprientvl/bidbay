import { NextFunction } from "express";
import { Request, Response } from 'express';

export function validateRequestBody(expectedFields: string[]): 
    (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const missingFields: string[] = [];
            expectedFields.forEach(field => {
                if (!req.body[field]) {
                    missingFields.push(field);
                }
            });
            if (missingFields.length !== 0) {
                throw new Error(`missing values : ${missingFields.join(', ')}`);
            }
            next();
        } catch (error) {
            if(error instanceof Error) return res.status(400).json({ message: error.message });
            res.status(500).json({ message: "Internal server error" });
        }
    };
}
