import { NextFunction } from "express";
import { Request, Response } from 'express';
import { BodyError } from "~/error/error";

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
                throw new BodyError(missingFields);
            }
            next();
        } catch (error) {
            if(error instanceof BodyError) return res.status(400).json({error: "Invalid or missing fields", details: error.missingValue });
            res.status(500).json({ message: "Internal server error" });
        }
    };
}
