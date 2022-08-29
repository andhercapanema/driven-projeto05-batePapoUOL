const urlAPI = "https://mock-api.driven..com.br/api/v6/uol/";

let usr = { name: "Batman" };
let addressee = "Todos";
let msgType = "message";

// Chat Login

function loading() {
    const usrInsertPage = document.querySelector(".c-login-page__usr-insert");
    usrInsertPage.classList.add("is-inactive");

    const loadingPage = document.querySelector(".c-login-page__loading");
    loadingPage.classList.remove("is-inactive");
}

function keepStatusOnline() {
    const promise = axios.post(
        `${urlAPI}status`,
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
    usr.name = usrNameEl.value;

    loading();

    const promise = axios.post(
        `${urlAPI}participants`,
        usr
    );

    promise.then(login);
    promise.catch((err) => {
        if (err.response.status === 400) {
            alert("Nome de usuário já utilizado, favor inserir outro!");
            window.location.reload();
            usrNameEl.value = "";
        } else {
            console.log("Erro no usrInput axios.post!");
            console.log(err.response);
        }
    });
}

const usrNameEl = document.querySelector(".c-login-page__input");

usrNameEl.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        usrInput();
    }
});

// Chat App

let msgTime = "00:00:00";

function msgDiv(msg) {
    const standardMsg = {
        beginning: `
        <div class="c-chat__msg is-${msg.type}">
        <p>
        <span class="c-chat__msg__time">(${msgTime})</span>
        `,
        end: `
        </p>
        </div>
        `,
    };
    if (msg.type === "message") {
        return `
            ${standardMsg.beginning}
            <strong>${msg.from}</strong> para <strong>${msg.to}</strong>: ${msg.text}
            ${standardMsg.end}
        `;
    } else if (msg.type === "status") {
        return `
            ${standardMsg.beginning}
            <strong>${msg.from}</strong> ${msg.text}
            ${standardMsg.end}
        `;
    } else if (msg.type === "private_message") {
        return `
            ${standardMsg.beginning}
            <strong>${msg.from}</strong> reservadamente para <strong>${msg.to}</strong>: ${msg.text}
            ${standardMsg.end}
        `;
    }
}

function loadMessages() {
    const chatElement = document.querySelector(".c-chat");

    chatElement.innerHTML = "";

    axios
        .get(`${urlAPI}messages`)
        .then((res) => {
            res.data.forEach((msg) => {
                msgTime = +msg.time.slice(0, 2) + 9 + msg.time.slice(2);

                const isPrivate = msg.type === "private_message";
                const fromOrToUsr =
                    msg.from === usr.name || msg.to === usr.name;
                const shouldRender = !isPrivate || (isPrivate && fromOrToUsr);

                if (shouldRender) {
                    chatElement.innerHTML += msgDiv(msg);
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
    const msgText = msgTextEl.value;
    msgTextEl.value = "";

    const msg = {
        from: usr.name,
        to: addressee,
        text: msgText,
        type: msgType,
    };

    axios
        .post(`${urlAPI}messages`, msg)
        .then((res) => {
            loadMessages();
        })
        .catch((err) => {
            window.location.reload();
        });
}

const msgTextEl = document.querySelector("#c-msg-insert__input");

msgTextEl.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

loadMessages();
setInterval(loadMessages, 3000); // Para não ficar atualizando a página toda hora

// Config page

let addresseeElement = {};
const usersList = document.querySelector(".js-users-list");

function toggleConfigMenu() {
    const configMenu = document.querySelector(".c-config-page");
    configMenu.classList.toggle("is-inactive");

    const configBackground = document.querySelector(
        ".c-config-page__background"
    );
    configBackground.classList.toggle("c-config-page__background--is-inactive");

    const sideMenu = document.querySelector(".c-side-menu");
    sideMenu.classList.toggle("c-side-menu--is-inactive");
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
    if (to === undefined || to === null) {
        to = document.querySelector(".js-users-list:first-child");
    }

    addresseeElement = to;
    addressee = to.textContent.trim();

    updateCheck(to, ".js-users-list");

    updateSendToInfo();
}

function keepAddresseeSelected() {
    const usersListArray = Object.values(usersList.childNodes);

    addresseeElement = usersListArray.filter((usr) => {
        const usrWithouSpace = usr.textContent.trim();
        return usrWithouSpace === addressee;
    })[0];

    selectAddressee(addresseeElement);
}

function updateUsers() {
    axios
        .get(`${urlAPI}participants`)
        .then((res) => {
            fillUsersList(res);
            keepAddresseeSelected();
        })
        .catch((err) => {
            console.log("Erro no updateUsers() axios.get!");
            console.error(err);
        });
}

function selectPrivacy(priv) {
    const privWithoutSpaces = priv.innerText.trim();
    privWithoutSpaces === "Público"
        ? (msgType = "message")
        : (msgType = "private_message");

    updateCheck(priv, ".js-privacy-list");

    updateSendToInfo();
}

updateUsers();
setInterval(updateUsers, 10000);
selectPrivacy(document.querySelector(".js-privacy-list li:first-of-type"));
