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

    axios
        .get("https://mock-api.driven.com.br/api/v6/uol/messages")
        .then((res) => {
            console.log(res.data);

            res.data.forEach((msg) => {
                chatElement.innerHTML += `
                <div class="c-chat__msg">
                    <p>
                        <span class="c-chat__msg__time">(${msg.time})</span
                        >
                        <strong>${msg.from}</strong> para<strong>${msg.to}</strong
                        >: ${msg.text}
                    </p>
                </div>
                `;
            });
        })
        .catch((err) => {
            console.error(err);
        });
}

loadMessages();