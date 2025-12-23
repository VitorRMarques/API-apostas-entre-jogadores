import type { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

export interface TokenPayload{
    id: number,
    email: string,
    jogadorId: number
}

export function VerificaToken(
    req: Request,
    res: Response,
    next: NextFunction
){
    const authHeader = req.headers.authorization

    if (!authHeader){
        return res.status(401).json({ erro: "Token não informado" })
    }

    const [, token] = authHeader.split(" ")

    if (!token){
        return res.status(401).json({ erro: "Token não informado" })
    }

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "segredo123"
        ) as unknown as TokenPayload

        req.user = decoded
        next()
    } catch (err){
        return res.status(401).json({erro: "Token inválido"})
    }
}

