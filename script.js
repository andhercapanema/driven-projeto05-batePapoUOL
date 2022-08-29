let usr = { name: "Batman" };
let addressee = "Todos";
let msgType = "message";

// Chat Login

function loading() {
    const usrInsertPage = document.querySelector(".c-login-page__usr-insert");
    usrInsertPage.classList.add('is-inactive');

    const loadingPage = document.querySelector(".c-login-page__loading");
    loadingPage.classList.remove('is-inactive');
}

function keepStatusOnline() {
    const promise = axios.post(
        "https://mock-api.driven.com.br/api/v6/uol/status",
        usr
    );
}

function login() {
    const loginPage = document.querySelector(".c-login-page");
    loginPage.classList.add("is-inactive");

    const chatPage = document.querySelector(".c-main-page");
    chatPage.classList.remove("is-inactive");

    const input = chatPage.querySelector("#c-msg-insert__input");
    input.value = "";

    setInterval(keepStatusOnline, 5000);
}

function usrInput() {
    const usrNameEl = document.querySelector(".c-login-page__input");
    usr.name = usrNameEl.value;

    loading();

    const promise = axios.post(
        "https://mock-api.driven.com.br/api/v6/uol/participants",
        usr
    );

    promise.then(login);
    promise.catch((err) => {
        if (err.response.status === 400) {
            alert("Nome de usuário já utilizado, favor inserir outro!");
            window.location.reload();
            usrNameEl.value = "";
        } else {
            console.log("Erro não cadastrado!");
            console.log(err.response);
        }
    });
}

// usrInput(); // PARA ENTRAR JÁ NO CHAT!!

// login(); // PARA ENTRAR JÁ NO CHAT!!

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
                const shouldRender = !isPrivate || (isPrivate && fromOrToUsr);

                if (shouldRender) {
                    chatElement.innerHTML += `
                    <div class="c-chat__msg is-${msg.type}">
                        <p>
                            <span class="c-chat__msg__time">(${msg.time})</span
                            >
                            <strong>${msg.from}</strong> para <strong>${msg.to}</strong
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

function sendMessage() {
    const msgText = document.querySelector("#c-msg-insert__input").value;

    const msg = {
        from: usr.name,
        to: addressee,
        text: msgText,
        type: msgType,
    };

    axios
        .post("https://mock-api.driven.com.br/api/v6/uol/messages", msg)
        .then((res) => {
            loadMessages();
        })
        .catch((err) => {
            window.location.reload();
        });
}

loadMessages();
setInterval(loadMessages, 3000); // Para não ficar atualizando a página toda hora

// Config page

let addresseeElement = {};
const usersList = document.querySelector(".js-users-list");

function toggleConfigMenu() {
    const configMenu = document.querySelector(".c-config-page");
    configMenu.classList.toggle("is-inactive");
}

function usrLi(name) {
    return `
    <li
        class="c-side-menu__item"
        onclick="selectAddressee(this)"
        data-identifier="participant"
    >
        <ion-icon name="person-circle"></ion-icon>
        <p>${name}</p>
        <img src="./img/checkmark.svg" alt="Checked" />
    </li>
`;
}

function fillUsersList(apiUsersList) {
    usersList.innerHTML = usrLi("Todos");

    apiUsersList.data.forEach((usr) => {
        usersList.innerHTML += usrLi(usr.name);
    });
}

function keepAddresseeSelected() {
    const usersListArray = Object.values(usersList.childNodes);

    addresseeElement = usersListArray.filter((usr) => {
        const usrWithouSpace = usr.textContent.replace(/\s+/g, "");
        return usrWithouSpace === addressee;
    })[0];

    selectAddressee(addresseeElement);
}

function updateUsers() {
    axios
        .get("https://mock-api.driven.com.br/api/v6/uol/participants")
        .then((res) => {
            fillUsersList(res);
            keepAddresseeSelected();
        })
        .catch((err) => {
            console.log("Erro no updateUsers() axios.get!");
            console.error(err);
        });
}

function updateCheck(elSelected, elParent) {
    const previouslySelected = document.querySelector(
        `${elParent} .is-selected`
    );
    if (previouslySelected !== null) {
        previouslySelected.classList.remove("is-selected");
    }

    elSelected.classList.add("is-selected");
}

function updateSendToInfo() {
    const sendTo = document.querySelector(".c-msg-insert p");

    const privacy = msgType === "private_message" ? "Reservado" : "Público";
    sendTo.innerHTML = `Enviado para ${addressee} (${privacy})`;
}

function selectAddressee(to) {
    addresseeElement = to;
    addressee = to.innerText;

    updateCheck(to, ".js-users-list");

    updateSendToInfo();
}

function selectPrivacy(priv) {
    const privWithoutSpaces = priv.innerText.replace(/\s+/g, "");
    privWithoutSpaces === "Público"
        ? (msgType = "message")
        : (msgType = "private_message");

    updateCheck(priv, ".js-privacy-list");

    updateSendToInfo();
}

updateUsers();
setInterval(updateUsers, 10000);
selectPrivacy(document.querySelector(".js-privacy-list li:first-of-type"));
