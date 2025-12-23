import "dotenv/config"

import express from "express"
const app = express()
const port = 3000

app.use(express.json())

try{
    const jogadoresRoutes = await import("./routes/jogadores.js")
    app.use("/jogadores", jogadoresRoutes.default)
} catch (error) {
    console.error("Error loading jogadores routes:", error)
}  


try {
    const jogosRoutes = await import("./routes/jogos.js")
    app.use("/jogos", jogosRoutes.default)
} catch (error) {
    console.log("Error loading jogos routes", error)
}


try {
    const apostasRoutes = await import("./routes/apostas.js")
    app.use("/apostas", apostasRoutes.default)
} catch (error) {
    console.log("Error loading apostas routes:", error)
}


try {
    const disputasRoutes = await import("./routes/disputas.js")
    app.use("/disputas", disputasRoutes.default)
} catch (error) {
    console.error("Error loading disputas routes:", error)
}

try {
    const usuariosRoutes = await import("./routes/usuarios.js")
    app.use("/usuarios", usuariosRoutes.default)
} catch (error) {
    console.error("Error loading usuarios routes:", error)
}

try{
    const loginRoutes = await import("./routes/login.js")
    app.use("/usuarios/login", loginRoutes.default)
} catch (error) {
    console.error("Error loading login routes:", error)
}


app.get("/", (req, res) => {
    res.send('CASINO PLAYA LOUNGE')
})


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})