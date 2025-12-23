import { PrismaClient } from "@prisma/client";
import { Router } from 'express'
import { z } from "zod";
import bcrypt from 'bcrypt'
import { verificaToken } from "./verificaToken";
import crypto from 'crypto'
import { sendMail} from '../services/mail.js'

const prisma = new PrismaClient()

const router = Router()

const usuarioSchema = z.object({
    jogadorId: z.number(),
    email: z.string().email().min(10,
        { message: "E-mail, no mínimo, 10 caracteres"}
    ),
    senha: z.string()
})

router.get("/", async (req, res) => {
    try {
        const usuarios = await prisma.usuarios.findMany()
        res.status(200).json(usuarios)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

function validaSenha(senha: string) {
    const mensa: string[] = []
    if(senha.length < 8){
        mensa.push("Erro... senha deve possuir, no mínimo, 8 caractéres")
    }
    let pequenas = 0
    let grandes = 0
    let numeros = 0
    let simbolos = 0
    for (const letra of senha){
        if ((/[a-z]/).test(letra)){
            pequenas++
        }
        else if ((/[A-Z]/).test(letra)){
            grandes++
        }
        else if ((/[0-9]/).test(letra)){
            numeros++
        } else{
            simbolos++
        }
    }
    if(pequenas==0){
        mensa.push("Erro... senha deve possuir letra(s) minúsculas")
    }
    if(grandes==0){
        mensa.push("Erro... senha deve possuir letra(s) maiúsculas")
    }
    if(numeros==0){
        mensa.push("Erro... senha deve possuir número(s)")
    }
    if(simbolos==0){
        mensa.push("Erro... senha deve possuir símbolo(s)")
    }
    return mensa
}

router.post("/", async (req,res) => {
    const valida = usuarioSchema.safeParse(req.body)
    if(!valida.success){
        res.status(400).json({ erro: valida.error })
        return
    }
    const {jogadorId, email, senha} = valida.data
    const mensaErrors = validaSenha(senha)
    if(mensaErrors.length > 0){
        res.status(400).json({errors: mensaErrors})
        return 
    }
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(senha, salt)
    const codigo = crypto.randomBytes(20).toString("hex")
    try{
        const usuario = await prisma.usuarios.create({
            data: {
                jogadorId,
                email,
                senha: hash,
                codigoAtivacao: codigo,
                status: "INATIVO",
                ultimoLogin: new Date()
            }
        })
        const link = `http://localhost:3000/usuarios/ativar/${codigo}`
        await sendMail({
            to: usuario.email,
            subject: "Ative sua conta - Casino Playa - Lounge",
            html:
            `<h2>Confirmação de cadastro</h2>
            <p>Clique no link abaixo para ativar sua conta:</p>
            <a href="${link}">Link: ${link}</a>
            `
        })
        res.status(201).json(usuario)
    } catch(error) {
        res.status(400).json({ error })
    }
})

router.get("/ativar/:codigo", async (req, res) => {
    const { codigo } = req.params

    try{
        const usuario = await prisma.usuarios.findFirst({
            where: {codigoAtivacao: codigo}
        })

        if (!usuario){
            return res.status(404).json({erro: "Código inválido!"})
        }
        await prisma.usuarios.update({
            where: { id: usuario.id },
            data: { status: "ATIVO" }
        })

        res.send("Conta ativada com sucesso! Você já pode fazer login.")
    } catch(error: any){
        res.status(500).json({erro: error.message})
    }

})

router.delete("/me", verificaToken, async (req: any, res) => {
  try {
    const usuarioId = req.usuarioLogado.id

    await prisma.usuarios.delete({
      where: { id: usuarioId }
    })

    res.json({
      mensagem: "Usuário excluído com sucesso"
    })
  } catch (error) {
    res.status(400).json({
      erro: "Erro ao excluir usuário"
    })
  }
})



export default router
