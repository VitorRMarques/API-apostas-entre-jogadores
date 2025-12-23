import { Router } from "express"
import mysqldump from "mysqldump"
import path from "path"
import fs from "fs"
import multer from "multer"
import { verificaToken } from "../middlewares/verificaToken"

const router = Router()

const pastaBackup = path.join(__dirname, "..", "backups")
if (!fs.existsSync(pastaBackup)) {
  fs.mkdirSync(pastaBackup)
}


router.get("/backup", verificaToken, async (req, res) => {
  try {
    const nomeArquivo = `backup-${Date.now()}.sql`
    const caminho = path.join(pastaBackup, nomeArquivo)

    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      },
      dumpToFile: caminho
    })

    res.json({
      mensagem: "Backup gerado com sucesso",
      arquivo: nomeArquivo
    })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao gerar backup" })
  }
})



const upload = multer({ dest: pastaBackup })

router.post("/restore", verificaToken, upload.single("backup"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Arquivo não enviado" })
    }

    const arquivo = req.file.path

    const { exec } = require("child_process")

    const comando = `mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${arquivo}`

    exec(comando, (error: any) => {
      if (error) {
        return res.status(500).json({ erro: "Erro ao restaurar backup" })
      }
      res.json({ mensagem: "Backup restaurado com sucesso" })
    })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao restaurar backup" })
  }
})

export default router
