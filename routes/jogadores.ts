import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"
import { sendMail } from "../services/mail.js"
import { VerificaToken } from "../src/middlewares/auth.js"
import { verificaToken } from "./verificaToken.js"

const prisma = new PrismaClient()

const router = Router()

const jogadoresSchema = z.object({
    nome: z.string().min(3,{message: "Nome deve possuir no mínimo, 10 caractéres"}),
    email: z.string(),
    saldo: z.number(),
    mensagem: z.string().optional(),

})

router.get("/", async (req, res) => {
    try {
        const jogadores = await prisma.jogadores.findMany()
        res.status(200).json(jogadores)
    } catch (error) {
        res.status(500).json({ erro: (error as Error).message})
    }
})

router.post("/", async (req, res) => {
    const valida = jogadoresSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error.flatten().fieldErrors})
        return
    }

    const {nome, email, saldo} = valida.data

    try {
        const jogador = await prisma.jogadores.create({
            data: {nome, email, saldo},
        })

        await sendMail({
            to: jogador.email,
            subject: "Bem vindo ao Casino Playa Lounge",
            html:`
            <h2>🚀Olá ${jogador.nome}!🚀</h2>
            <p>Bem-vindo ao Casino Playa Lounge!😈</p>
            <p>Seu saldo inicial é de R$ ${jogador.saldo.toFixed(2)}🤑💸</p>
            <p>Faça sua aposta para os jogos disponíveis (seja quantos jogos voce quises jogar🤩</p>
            `,
        })
        res.status(201).json(jogador)
    } catch (error) {
        res.status(400).json({ erro: (error as Error).message })
    }
})

router.delete("/:id", verificaToken, async (req, res) => {
    const {id} = req.params

    try {
        const jogadores = await prisma.jogadores.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(jogadores)
    } catch (error) {
        res.status(400).json({ erro: (error as Error).message })
    }
})

router.put("/:id", verificaToken, async (req, res) => {
    const {id} = req.params

    const valida = jogadoresSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error.flatten().fieldErrors})
        return
    }

    const { nome, email, saldo} = valida.data

    try {
        const jogadores = await prisma.jogadores.update({
            where: {id: Number(id)},
            data: {nome, email, saldo}
        })
        res.status(200).json(jogadores)
    } catch (error) {
        res.status(400).json({ erro: (error as Error).message })
    }
})

router.post("/:id/acoesemail", async (req, res) => {
    const id = Number(req.params.id)
    try {
        const jogador = await prisma.jogadores.findUnique({where: {id}})
        if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" })

        const apostas = await prisma.apostas.findMany({ where: { jogadorId: id }, include: { jogos: true } })
        const disputas1 = await prisma.disputas.findMany({ where: { jogador1id: id }, include: { jogos: true } })
        const disputas2 = await prisma.disputas.findMany({ where: { jogador2id: id }, include: { jogos: true } })

        const html = `
        <h2>Resumo de Atividades -- ${jogador.nome}</h2>
        <h3>Apostas</h3>
        <ul>
           ${apostas.map(a => `<li>${ new Date(a.data).toLocaleString() } - Jogo: ${a.jogos?.id ?? a.jogoId} - Valor: R$ ${Number(a.valor).toFixed(2)}</li>`).join("")}
        </ul>
        <h3>Disputas</h3>
        <ul>
           ${[...disputas1, ...disputas2].map(d => `<li>Disputa #${d.id} - Jogo: ${d.jogos?.id ?? d.jogoId} - Soma: R$ ${Number(d.somaApostas).toFixed(2)}</li>`).join("")}
        </ul>
        <p>Saldo atual: R$ ${Number(jogador.saldo).toFixed(2)}</p>
        `;

        await sendMail({to: jogador.email, subject: "Resumo de atividades", html})
        res.json({ enviado: true })
    } catch (err) {
        res.status(500).json({ erro: (err as Error).message})
    }
})


export default router;