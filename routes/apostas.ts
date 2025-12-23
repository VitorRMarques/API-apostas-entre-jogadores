import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"
import { sendMail } from "../services/mail"

const prisma = new PrismaClient()
const router = Router()

const apostaSchema = z.object({
    jogadorId: z.number(),
    jogoId: z.number(),
    valor: z.number().positive(),
})

router.get("/", async (_, res) => {
    try {
        const apostas = await prisma.apostas.findMany({
            include: {
                jogadores: true,
                jogos: true,
            },
        })
        res.status(200).json(apostas)
    } catch (error) {
        res.status(500).json({ erro: (error as Error).message })
    }
})

router.post("/", async (req, res) => {
    const valida = apostaSchema.safeParse(req.body)
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error.flatten().fieldErrors })
    }

    const { jogadorId, jogoId, valor } = valida.data

    try {
        const jogador = await prisma.jogadores.findUnique({ where: { id: jogadorId} })
        if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" })
        
        if (Number(jogador.saldo) < valor) {
            return res.status(400).json({
                erro: "Saldo insuficiente",
                saldoAtual: jogador.saldo,
                valorAposta: valor,
            })
        }

        const jogo = await prisma.jogos.findUnique({ where: { id: jogoId } })
        if (!jogo) return res.status(404).json({ erro: "Jogo não encontrado" })

        const resultado = await prisma.$transaction( async (tx) => {
            const aposta = await tx.apostas.create({
                data: { jogadorId, jogoId, valor},
                include: { jogadores: true, jogos:true},
            })

            const jogadorAtualizado = await tx.jogadores.update({
                where: { id: jogadorId },
                data: { saldo: { decrement: valor } },
            })

            const apostasdoJogo = await tx.apostas.findMany({ where: { jogoId } })
            const somaTotal = apostasdoJogo.reduce((acc, a) => acc + Number(a.valor), 0)

            await tx.disputas.updateMany({
                where: { jogoId },
                data: { somaApostas : somaTotal}
            })

            return { aposta, jogadorAtualizado, somaTotal }
        })

        try {
            await sendMail({
                to: jogador.email,
                subject: "Confirmação de aposta - Casino Playa Lounge",
                html: `
                   <h2>Olá ${jogador.nome}!</h2>
                   <p>Sua aposta foi registrada com sucesso.</p>
                   <ul>
                      <li><b>Jogo:</b> #${jogoId}</li>
                      <li><b>Valor apostado:</b> R$ ${Number(valor).toFixed(2)}</li>
                      <li><b>Saldo restante:</b> R$ ${Number(resultado.jogadorAtualizado.saldo).toFixed(2)}</li>
                    </ul>
                    <p>Boa sorte e obrigado por jogar no Casino Playa Lounge!</p>
                `,
            })
            console.log("✅ Email enviado com sucesso para:", jogador.email)
        } catch (emailError) {
            console.error("❌ Erro ao enviar email:", emailError)
        }

        res.status(201).json({
            mensagem: "Aposta criada com sucesso",
            aposta: resultado.aposta,
            saldoAtual: resultado.jogadorAtualizado.saldo,
            somaTotalApostas: resultado.somaTotal,
        })

    } catch (error) {
        console.error("Erro geral ao criar aposta:", error)
        if (error instanceof Error) {
            res.status(400).json({ erro: error.message })
        } else {
            res.status(400).json({ erro: String(error) })
        }
    }
})

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const aposta = await prisma.apostas.findUnique({
            where: { id }
        })

        if (!aposta) {
            res.status(404).json({ erro: "Aposta não encontrada" })
            return
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const apostaDeletada = await tx.apostas.delete({
                where: { id }
            })

            const jogadorAtualizado = await tx.jogadores.update({
                where: { id: aposta.jogadorId},
                data: {
                    saldo: {
                        increment: aposta.valor
                    }
                }
            })

            const apostasDoJogo = await tx.apostas.findMany({
                where: { jogoId: aposta.jogoId},
            })

            const somaTotal = apostasDoJogo.reduce(
                (acc, a) => acc + Number(a.valor), 0
            )

            await tx.disputas.updateMany({
                where: { jogoId: aposta.jogoId},
                data: { somaApostas: somaTotal},
            })

            return {
                aposta: apostaDeletada,
                jogador: jogadorAtualizado,
                somaTotal
            }
        })

        res.status(200).json({
            mensagem: "Aposta cancelada e saldo devolvido",
            aposta: resultado.aposta,
            saldoAtual: resultado.jogador.saldo,
            somaTotalApostas: resultado.somaTotal
        })
    } catch (error) {
        res.status(400).json({ erro: (error as Error).message })
    }
})

export default router

