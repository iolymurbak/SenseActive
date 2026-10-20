// ==========================================
// SENSEACTIVE
// BACKEND DO SISTEMA DE CADASTRO
// MAILERSEND
// ==========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Carrega o arquivo .env
dotenv.config();

// Cria o servidor
const app = express();

// Porta do servidor
const PORT = process.env.PORT || 3000;


// ==========================================
// CONFIGURAÇÕES
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// FUNÇÃO PARA PROTEGER O HTML DO E-MAIL
// ==========================================

function escaparHTML(texto) {

    if (texto === undefined || texto === null) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// TESTE DO SERVIDOR
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Backend SenseActive funcionando!"

    });

});


// ==========================================
// ROTA DE CADASTRO
// ==========================================

app.post("/cadastro", async (req, res) => {

    try {

        // ==========================================
        // RECEBE OS DADOS DO FRONTEND
        // ==========================================

        const {

            fullName,
            birthDate,
            age,
            email,
            phone,
            plan,
            period,
            value,
            academy

        } = req.body;


        // ==========================================
        // VERIFICA CAMPOS OBRIGATÓRIOS
        // ==========================================

        if (

            !fullName ||
            !birthDate ||
            !email ||
            !phone ||
            !plan ||
            !period ||
            !academy

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Preencha todos os campos obrigatórios."

            });

        }


        // ==========================================
        // VERIFICA IDADE
        // ==========================================

        if (Number(age) < 16) {

            return res.status(400).json({

                success: false,

                message:
                    "O cadastro é permitido somente para maiores de 16 anos."

            });

        }


        // ==========================================
        // VERIFICA E-MAIL
        // ==========================================

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


        if (!emailValido) {

            return res.status(400).json({

                success: false,

                message:
                    "Digite um e-mail válido."

            });

        }


        // ==========================================
        // UNIDADES
        // ==========================================

        const unidades = {

            itatiba:
                "SenseActive Itatiba",

            campinas:
                "SenseActive Campinas",

            jundiai:
                "SenseActive Jundiaí",

            "sao-paulo":
                "SenseActive São Paulo"

        };


        const nomeUnidade =
            unidades[academy] || academy;


        // ==========================================
        // FORMATA DATA DE NASCIMENTO
        // ==========================================

        let dataNascimento = birthDate;


        if (birthDate.includes("-")) {

            const partes =
                birthDate.split("-");


            if (partes.length === 3) {

                dataNascimento =
                    `${partes[2]}/${partes[1]}/${partes[0]}`;

            }

        }


        // ==========================================
        // DATA DO CADASTRO
        // ==========================================

        const dataCadastro =
            new Date().toLocaleString(

                "pt-BR",

                {
                    timeZone:
                        "America/Sao_Paulo"
                }

            );


        // ==========================================
        // PROTEGE OS DADOS PARA O HTML
        // ==========================================

        const nomeSeguro =
            escaparHTML(fullName);

        const nascimentoSeguro =
            escaparHTML(dataNascimento);

        const idadeSegura =
            escaparHTML(age);

        const emailSeguro =
            escaparHTML(email);

        const telefoneSeguro =
            escaparHTML(phone);

        const planoSeguro =
            escaparHTML(plan);

        const periodoSeguro =
            escaparHTML(period);

        const valorSeguro =
            escaparHTML(value || "Não informado");

        const unidadeSegura =
            escaparHTML(nomeUnidade);

        const dataCadastroSegura =
            escaparHTML(dataCadastro);


        // ==========================================
        // E-MAIL HTML
        // ==========================================

        const htmlEmail = `

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<title>Cadastro SenseActive</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#0a0a0a;
    font-family:Arial,Helvetica,sans-serif;
">

<div style="
    max-width:650px;
    margin:30px auto;
    background:#25382b;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #79e0b2;
">


    <!-- CABEÇALHO -->

    <div style="
        background:#0a0a0a;
        padding:30px;
        text-align:center;
    ">

        <div style="
            color:#79e0b2;
            font-size:30px;
            font-weight:bold;
            letter-spacing:2px;
        ">

            SENSEACTIVE

        </div>


        <div style="
            margin-top:8px;
            color:#cccccc;
            font-size:14px;
        ">

            Academia Inteligente

        </div>

    </div>


    <!-- CONTEÚDO -->

    <div style="
        padding:30px;
        color:#ffffff;
    ">


        <div style="
            color:#79e0b2;
            font-size:24px;
            font-weight:bold;
            margin-bottom:10px;
        ">

            Cadastro realizado com sucesso! 💚

        </div>


        <div style="
            color:#dddddd;
            line-height:1.6;
            margin-bottom:25px;
        ">

            Olá,
            <strong>${nomeSeguro}</strong>!

            <br><br>

            Seu cadastro na SenseActive foi realizado
            com sucesso.

            <br>

            Confira abaixo os dados cadastrados:

        </div>


        <!-- NOME -->

        <div style="
            background:rgba(0,0,0,0.25);
            padding:18px;
            margin-bottom:12px;
            border-radius:12px;
        ">

            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Nome completo

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${nomeSeguro}

            </div>

        </div>


        <!-- NASCIMENTO -->

        <div style="
            background:rgba(0,0,0,0.25);
            padding:18px;
            margin-bottom:12px;
            border-radius:12px;
        ">

            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Data de nascimento

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${nascimentoSeguro}

            </div>

        </div>


        <!-- IDADE -->

        <div style="
            background:rgba(0,0,0,0.25);
            padding:18px;
            margin-bottom:12px;
            border-radius:12px;
        ">

            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Idade

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${idadeSegura} anos

            </div>

        </div>


        <!-- E-MAIL -->

        <div style="
            background:rgba(0,0,0,0.25);
            padding:18px;
            margin-bottom:12px;
            border-radius:12px;
        ">

            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                E-mail cadastrado

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${emailSeguro}

            </div>

        </div>


        <!-- TELEFONE -->

        <div style="
            background:rgba(0,0,0,0.25);
            padding:18px;
            margin-bottom:12px;
            border-radius:12px;
        ">

            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Telefone

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${telefoneSeguro}

            </div>

        </div>


        <!-- PLANO -->

        <div style="
            border:1px solid #79e0b2;
            padding:20px;
            border-radius:12px;
            margin-top:20px;
        ">


            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Plano contratado

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${planoSeguro}

            </div>


            <br>


            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Período

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${periodoSeguro}

            </div>


            <br>


            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Valor

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${valorSeguro}

            </div>


            <br>


            <div style="
                color:#79e0b2;
                font-size:11px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:6px;
            ">

                Unidade

            </div>

            <div style="
                color:#ffffff;
                font-size:16px;
            ">

                ${unidadeSegura}

            </div>


        </div>


    </div>


    <!-- RODAPÉ -->

    <div style="
        background:#0a0a0a;
        padding:20px;
        text-align:center;
        color:#999999;
        font-size:12px;
    ">

        Cadastro realizado em
        ${dataCadastroSegura}

        <br><br>

        SenseActive — Academia Inteligente

    </div>


</div>

</body>

</html>

`;


        // ==========================================
        // ENVIO PELO MAILERSEND
        // ==========================================

        const resposta = await fetch(
            "https://api.mailersend.com/v1/email",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${process.env.MAILERSEND_API_KEY}`,

                    "X-Requested-With":
                        "XMLHttpRequest"

                },

                body: JSON.stringify({

                    from: {

                        email:
                            process.env.MAILERSEND_FROM_EMAIL,

                        name:
                            process.env.MAILERSEND_FROM_NAME ||
                            "SenseActive"

                    },


                    // ======================================
                    // DESTINATÁRIO DINÂMICO
                    // ======================================

                    to: [

                        {

                            email: email,

                            name: fullName

                        }

                    ],


                    subject:
                        "Cadastro realizado - SenseActive",


                    html:
                        htmlEmail,


                    text:
                        `Olá ${fullName}!

Seu cadastro na SenseActive foi realizado com sucesso.

Plano: ${plan}
Período: ${period}
Valor: ${value || "Não informado"}
Unidade: ${nomeUnidade}

E-mail: ${email}
Telefone: ${phone}

SenseActive — Academia Inteligente`

                })

            }

        );


        // ==========================================
        // LÊ A RESPOSTA DO MAILERSEND
        // ==========================================

        const respostaTexto =
            await resposta.text();


        let respostaJSON = {};

        try {

            respostaJSON =
                respostaTexto
                    ? JSON.parse(respostaTexto)
                    : {};

        } catch {

            respostaJSON = {};

        }


        // ==========================================
        // VERIFICA SE O MAILERSEND ACEITOU
        // ==========================================

        if (!resposta.ok) {

            console.error(
                "======================================"
            );

            console.error(
                "ERRO DO MAILERSEND"
            );

            console.error(
                "Status:",
                resposta.status
            );

            console.error(
                "Resposta:",
                respostaJSON
            );

            console.error(
                "======================================"
            );


            return res.status(500).json({

                success: false,

                message:
                    "Não foi possível enviar o e-mail.",

                error:
                    respostaJSON

            });

        }


        // ==========================================
        // SUCESSO
        // ==========================================

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "CADASTRO REALIZADO COM SUCESSO"
        );

        console.log(
            `E-mail enviado para: ${email}`
        );

        console.log(
            "======================================"
        );

        console.log("");


        res.status(200).json({

            success: true,

            message:
                "Cadastro realizado com sucesso! O e-mail foi enviado."

        });


    } catch (error) {

        console.error("");
        console.error(
            "======================================"
        );

        console.error(
            "ERRO NO BACKEND"
        );

        console.error(error);

        console.error(
            "======================================"
        );


        res.status(500).json({

            success: false,

            message:
                "Erro interno do servidor.",

            error:
                error.message

        });

    }

});


// ==========================================
// INICIA O SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log("");
    console.log(
        "======================================"
    );

    console.log(
        "       SENSEACTIVE BACKEND"
    );

    console.log(
        "======================================"
    );

    console.log(
        `Servidor: http://localhost:${PORT}`
    );

    console.log(
        "======================================"
    );

    console.log("");

});