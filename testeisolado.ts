import { sendMail } from "./services/mail" 

async function testarEmailAposta() {
    console.log("🧪 Testando email de aposta...")
    
    try {
        await sendMail({
            to: "teste@exemplo.com",
            subject: "Confirmação de aposta - Casino Playa Lounge",
            html: `
               <h2>Olá Jogador de Teste!</h2>
               <p>Sua aposta foi registrada com sucesso.</p>
               <ul>
                  <li><b>Jogo:</b> #123</li>
                  <li><b>Valor apostado:</b> R$ 50.00</li>
                  <li><b>Saldo restante:</b> R$ 450.00</li>
                </ul>
                <p>Boa sorte e obrigado por jogar no Casino Playa Lounge!</p>
            `,
        })
        console.log("✅ Email de teste enviado! Verifique o Mailtrap.")
    } catch (error) {
        console.error("❌ Falhou:", error)
    }
}

testarEmailAposta()