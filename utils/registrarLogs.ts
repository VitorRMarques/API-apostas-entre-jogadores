import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export async function registrarLog(usuarioId: number | null, acao: string, detalhes: string){
    try {
        await prisma.logs.create({
            data:{
                usuarioId,
                acao,
                detalhes
            }
        })
    } catch (error) {
        console.error("Erro ao registrar logs", error)
    }
}