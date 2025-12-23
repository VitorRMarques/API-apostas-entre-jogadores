import { PrismaClient } from "@prisma/client";
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

const jogosSchema = z.object({
    apostaMinima: z.number().nonnegative(),
    apostaMaxima: z.number().positive(),
});

router.get("/", async (_, res) => {
    try {
        const jogos = await prisma.jogos.findMany()
        res.status(200).json(jogos)
    } catch (error) {
        res.status(500).json({ erro: (error as Error).message })
    }
})

router.post("/", async (req, res) => {
    const valida = jogosSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error.flatten().fieldErrors})
        return 
    }

    try {
        const jogo = await prisma.jogos.create({data: valida.data})
        res.status(201).json(jogo)
    } catch (error) {
        res.status(400).json({ erro: (error as Error).message})
    }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    const valida = jogosSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error.flatten().fieldErrors })
        return 
    }

    try {
        const jogo = await prisma.jogos.update({
            where: { id: Number(id)},
            data: valida.data,
        })
        res.status(200).json(jogo)
    } catch (error) {
        res.status(400).json({ erro: (error as Error ).message})
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params
    try {
        const jogo = await prisma.jogos.delete({ where: { id: Number(id)}})
        res.status(200).json(jogo)
    }catch (error) {
        res.status(400).json({ erro: (error as Error ).message })
    }
})

export default router