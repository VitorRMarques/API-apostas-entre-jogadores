import { PrismaClient, TipoJogos } from "@prisma/client";
import { Router } from "express";
import { email, z } from "zod";
import { sendMail } from "../services/mail";

const prisma = new PrismaClient()
const router =  Router()

const disputaSchema = z.object({
    aposta1Id: z.number(),
    aposta2id: z.number(),
    tipoJogo: z.nativeEnum(TipoJogos)
})

router.get("/", async (_, res) => {
    try {
        const disputas = await prisma.disputas.findMany({
            include: {
                jogador1: true,
                jogador2: true, 
                jogos: true,
                aposta1: true,
                aposta2: true
            },
        })
        res.status(200).json(disputas)
    } catch(error) {
        res.status(500).json({ erro: (error as Error).message})
    }
})

router.post("/", async (req, res) => {
    const valida = disputaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error.flatten().fieldErrors })
        return
    }

    const { aposta1Id, aposta2id, tipoJogo} = valida.data

    try {
        const apostaBase1 = await prisma.apostas.findUnique({
            where: { id: aposta1Id },
            include: { jogos: true, jogadores: true},
        })

        const apostaBase2 = await prisma.apostas.findUnique({
            where: { id: aposta2id },
            include: { jogos: true, jogadores: true },
        })

        if (!apostaBase1 || !apostaBase2) {
            return res.status(404).json({ erro: "Uma ou ambas apostas não foram encontradas." })
        }

        const jogoId = apostaBase1.jogoId

        const apostas = await prisma.apostas.findMany({
            where: { jogoId: jogoId},
            include: { jogadores: true }
        })

        const jogadoresUnicos = [...new Set(apostas.map((a) => a.jogadorId))]

        if (jogadoresUnicos.length < 2) {
            return res.status(400).json({
                erro: "É necessário ter pelo menos dois jogadores apostando nesse jogo."
            })
        }

        const [jogador1id, jogador2id] = jogadoresUnicos

        const jogador1 = await prisma.jogadores.findUnique({ where: { id: jogador1id }} )
        const jogador2 = await prisma.jogadores.findUnique({ where: { id: jogador2id }} )

        if (!jogador1 || !jogador2) {
            return res.status(404).json({ erro: "Jogadores não encontrados" })
        }

        const somaApostas = apostas
        .filter((a) => jogadoresUnicos.includes(a.jogadorId))
        .reduce((total, a) => total + Number(a.valor), 0)

        const apostasJogador1 = apostas.filter((a) => a.jogadorId === jogador1id).reduce((total, a) => total + Number(a.valor), 0)
        const apostasJogador2 = apostas.filter((a) => a.jogadorId === jogador2id).reduce((total, a) => total + Number(a.valor), 0)

        const disputa = await prisma.disputas.create({
            data: {
                jogoId,
                jogador1id,
                jogador2id,
                aposta1Id,
                aposta2id,
                tipoJogo,
                somaApostas,
            },
            include: {
                jogador1: true,
                jogador2: true,
                jogos: true
            },
        })

        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37; text-align: center;">🎰 Nova Disputa Criada!</h2>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="text-align: center; color: #333;">⚔️ DISPUTA</h3>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
                        <div style="text-align: center; flex: 1;">
                            <h4 style="color: #d4af37; margin: 5px 0;">${jogador1.nome}</h4>
                            <p style="margin: 5px 0; color: #666;">Saldo: <strong>R$ ${Number(jogador1.saldo).toFixed(2)}</strong></p>
                            <p style="margin: 5px 0; color: #666;">Apostou: <strong>R$ ${apostasJogador1.toFixed(2)}</strong></p>
                        </div>
                        
                        <div style="font-size: 24px; font-weight: bold; color: #d4af37;">VS</div>
                        
                        <div style="text-align: center; flex: 1;">
                            <h4 style="color: #d4af37; margin: 5px 0;">${jogador2.nome}</h4>
                            <p style="margin: 5px 0; color: #666;">Saldo: <strong>R$ ${Number(jogador2.saldo).toFixed(2)}</strong></p>
                            <p style="margin: 5px 0; color: #666;">Apostou: <strong>R$ ${apostasJogador2.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
                    <p style="margin: 5px 0;"><strong>🎮 Jogo:</strong> #${jogoId}</p>
                    <p style="margin: 5px 0;"><strong>🎯 Tipo:</strong> ${tipoJogo}</p>
                    <p style="margin: 5px 0;"><strong>💰 Prêmio Total:</strong> R$ ${somaApostas.toFixed(2)}</p>
                    <p style="margin: 5px 0;"><strong>🆔 Disputa:</strong> #${disputa.id}</p>
                </div>
                
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    Que vença o melhor! 🍀
                </p>
                
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                    Casino Playa Lounge - Onde a sorte encontra o luxo
                </p>
            </div>`

        try {
            await sendMail({
                to: jogador1.email,
                subject: `Nova Disputa: ${jogador1.nome} vs ${jogador2.nome}`,
                html: emailHTML
            })

            console.log("Email de disputa enviado para:", jogador1.email)
        } catch (emailError) {
            console.error("Erro ao enviar email para jogador 1:", emailError)
        }

        try {
            await sendMail({
                to: jogador2.email,
                subject: `Nova Disputa: ${jogador1.nome} vs ${jogador2.nome}`,
                html: emailHTML
            })
            console.log("Email de disputa enviado para:", jogador2.email)
        } catch (emailError) {
            console.error("Erro ao enviar email para jogador 2:", emailError)
        }

        res.status(201).json(disputa)

    } catch (error) {
        console.log(error)
        res.status(400).json({erro: (error as Error).message})
    }
})

export default router