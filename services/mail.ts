import "dotenv/config"

import nodemailer from "nodemailer"

export const sendMail = async ({
    to,
    subject,
    html,
}: {
    to: string,
    subject: string,
    html: string
}) => {
    console.log("Iniciando envio de email para:", to)

    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "abe852d7ebc7d3",
            pass: "88ec4e4be9b600",
        },
    })

    try {
        await transporter.verify()
        console.log("Conexão com Mailtrap verificada")
    } catch (error) {
        console.error("Erro na conexão com Mailtrap:", error)
        throw new Error("Falha na conexão com servidor de email")
    }

    const info = await transporter.sendMail({
        from: '"Casino Playa Lounge" <no-reply@casino.com',
        to,
        subject,
        html,
    });

    console.log("Email enviado com sucesso!")
    console.log(" Message ID:", info.messageId)
    console.log(" Preview URL:", nodemailer.getTestMessageUrl(info))

    return info
}