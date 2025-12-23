import { PrismaClient } from "@prisma/client";
import { Router} from "express"
import { z } from "zod"
import  bcrypt  from "bcrypt"
import jwt from "jsonwebtoken"
import { registrarLog } from "../utils/registrarLogs";

const prisma = new PrismaClient()
const router = Router();

const loginSchema = z.object({
    email: z.string().email(),
    senha: z.string()
})

router.post("/", async (req, res) => {
  const valida = loginSchema.safeParse(req.body)

  if (!valida.success){
    return res.status(400).json({erro: valida.error.flatten()})
  }

  const { email, senha } = valida.data

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    })

    if (!usuario){
      await registrarLog(null, "LOGIN_FALHOU", `Email inexistente: ${email}`)
      return res.status(400).json({ erro: "Usuário não encontrado" })
    }

    if (usuario.status !== "ATIVO"){
      return res.status(403).json({ erro: "Usuário não ativado, verifique seu email." })
    }

    const confere = bcrypt.compareSync(senha, usuario.senha)
    if (!confere){
      await registrarLog(usuario.id, "LOGIN_FALHOU", "Senha incorreta")
      return res.status(400).json({ erro: "Senha incorreta" })
    }

    let mensagem: string

    if (!usuario.ultimoLogin){
      mensagem = "Bem-vindo! Este é o seu primeiro acesso ao sistema."
    } else {
      mensagem = `Bem-vindo! Seu último acesso foi em ${usuario.ultimoLogin.toLocaleString("pt-BR")}`
    }

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    })

    const token = jwt.sign(
      {
        id: usuario.id,
        jogadorId: usuario.jogadorId,
        email: usuario.email,
      },
      process.env.JWT_PROCESS || "segredo123",
      { expiresIn: "1h" }
    )

    await registrarLog(usuario.id, "LOGIN_SUCESSO", "Usuário logado com sucesso")

    return res.json({
      auth: true,
      token,
      mensagem
    })

  } catch (error: any){
    return res.status(500).json({ erro: error.message })
  }
})

export default router