let usr = { name: "" };

// Chat Login

function usrInput() {
    usr.name = prompt("Qual é o seu lindo nome?");

    const promise = axios.post(
        "https://mock-api.driven.com.br/api/v6/uol/participants",
        usr
    );

    promise.then(login);
    promise.catch(errorHandling);
}

function errorHandling(err) {
    if (err.response.status === 400) {
        alert("Nome de usuário já utilizado, favor inserir outro!");
        usrInput();
    } else {
        console.log("Erro não cadastrado!");
        console.log(err.response);
    }
}

function login() {
    const loginPage = document.querySelector(".c-login-page");
    loginPage.classList.add("is-inactive");

    const chatPage = document.querySelector(".c-main-page");
    chatPage.classList.remove("is-inactive");

    setInterval(keepStatusOnline, 5000);
}

function keepStatusOnline() {
    const promise = axios.post(
        "https://mock-api.driven.com.br/api/v6/uol/status",
        usr
    );
}

// usrInput(); // PARA ENTRAR JÁ NO CHAT!!

usr = { name: "luiz" }; // PARA ENTRAR JÁ NO CHAT!!
login(); // PARA ENTRAR JÁ NO CHAT!!

// Chat App

function loadMessages() {
    const chatElement = document.querySelector(".c-chat");

    chatElement.innerHTML = "";

    axios
        .get("https://mock-api.driven.com.br/api/v6/uol/messages")
        .then((res) => {
            res.data.forEach((msg) => {
                const isPrivate = msg.type === "private_message";
                const fromOrToUsr = msg.from === usr || msg.to === usr;

                if (!isPrivate || (isPrivate && fromOrToUsr)) {
                    chatElement.innerHTML += `
                    <div class="c-chat__msg is-${msg.type}">
                        <p>
                            <span class="c-chat__msg__time">(${msg.time})</span
                            >
                            <strong>${msg.from}</strong> para<strong>${msg.to}</strong
                            >: ${msg.text}
                        </p>
                    </div>
                    `;
                }
            });

            const lastMsg = document.querySelectorAll(
                ".c-chat__msg:last-of-type"
            )[0];
            lastMsg.scrollIntoView();
        })
        .catch((err) => {
            console.error(err);
        });
}

loadMessages();
// setInterval(loadMessages, 3000); // Para não ficar atualizando a página toda hora
