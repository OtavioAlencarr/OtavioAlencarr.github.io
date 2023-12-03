import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  limit,
  startAfter,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";

const $loginBtn = document.querySelector("#login_button");

const firebaseConfig = {
  apiKey: "AIzaSyD1yDHCRFviLcyLOkNf0QYk10b8CKWYeJ4",
  authDomain: "universoiot.firebaseapp.com",
  projectId: "universoiot",
  storageBucket: "universoiot.appspot.com",
  messagingSenderId: "430007256885",
  appId: "1:430007256885:web:ee1387a39bf810e9fdae7c",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

const db = getFirestore(firebaseApp);
const postsCollection = collection(db, "posts");

const googleProvider = new GoogleAuthProvider();

function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      handleLogin(result.user);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function signInWithEmail() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const $errorMessageForm = document.getElementById("errorMessageForm");

  if (!email) {
    $errorMessageForm.textContent = "E-mail é obrigatório";
    return;
  }

  if (!password) {
    $errorMessageForm.textContent = "Senha é obrigatória";
    return;
  }

  $errorMessageForm.textContent = "";
  $loginBtn.textContent = "Carregando...";
  $loginBtn.disabled = true;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      handleLogin(userCredential.user);
    })
    .catch((error) => {
      if (error.code === "auth/invalid-login-credentials") {
        $errorMessageForm.textContent = "E-mail ou senha incorretos";
      }

      console.error(error.message);
    })
    .finally(() => {
      $loginBtn.textContent = "Login";
      $loginBtn.disabled = false;
    });
}

function createUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("name").value || email;
  const $errorMessageForm = document.getElementById("errorMessageForm");

  if (!displayName) {
    $errorMessageForm.textContent = "Nome é obrigátório";
    return;
  }

  if (!email) {
    $errorMessageForm.textContent = "E-mail é obrigatório";
    return;
  }

  if (!password) {
    $errorMessageForm.textContent = "Senha é obrigatória";
    return;
  }

  $errorMessageForm.textContent = "";
  $loginBtn.textContent = "Criando...";
  $loginBtn.disabled = true;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      updateProfile(auth.currentUser, { displayName }).then(() => {
        handleLogin({ ...userCredential.user, displayName });
      });
    })
    .catch((error) => {
      if (error.code === "auth/weak-password") {
        $errorMessageForm.textContent =
          "Sua senha deve ter pelo menos 6 caracteres";
      }

      if (error.code === "auth/email-already-in-use") {
        $errorMessageForm.textContent = "Esse e-mail já está em uso";
      }

      console.error(error.message);
    })
    .finally(() => {
      $loginBtn.textContent = "Criar Conta";
      $loginBtn.disabled = false;
    });
}

const $criarConta = document.querySelector("#criarConta");
const $fileNameSelected = document.querySelector("#fileNameSelected");

function toggleCreateAccount(event) {
  const $nameBox = document.querySelector("#nameBox");

  const create = $criarConta.getAttribute("data-type") === "create";

  if (create) {
    $criarConta.textContent = "Fazer login";
    $criarConta.setAttribute("data-type", "login");
    $nameBox.style.display = "block";
    $loginBtn.textContent = "Criar Conta";

    return;
  }

  $criarConta.setAttribute("data-type", "create");
  $criarConta.textContent = "Criar conta";
  $nameBox.style.display = "none";
  $loginBtn.textContent = "Login";
}

function handleLogin(user) {
  const $modal = document.querySelector("#janela-modal");

  const data = {
    id: user.uid,
    name: user.displayName || user.email,
    email: user.email,
    photoURL: user.photoURL,
  };

  localStorage.setItem("user", JSON.stringify(data));

  $modal.classList.remove("abrir");
  loadUser();
}

function loadUser() {
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    return;
  }

  const user = JSON.parse(userRaw);

  const $newPost = document.querySelector("#newPost");
  const $forumLogin = document.querySelector("#forumLogin");
  const $loginModalBtn = document.querySelector("#login_button_modal");
  const $userInfo = document.querySelector("#userInfo");
  const $userName = document.querySelector("#userName");
  const $userImage = document.querySelector("#userImage");
  const $userImage2 = document.querySelector("#imgUser");

  $forumLogin.style.display = "none";
  $newPost.style.display = "flex";
  $loginModalBtn.textContent = "Sair";
  $userInfo.style.display = "flex";

  $userInfo.querySelector("p").textContent = user.name.split(" ")[0];
  $userName.textContent = user.name;

  if (user.photoURL) {
    $userImage.src = user.photoURL;
    $userImage2.src = user.photoURL;
  }
}

function handleSignInOrCreate() {
  const create = $criarConta.getAttribute("data-type") === "create";

  if (create) {
    signInWithEmail();
  } else {
    createUser();
  }
}

const $googleLoginButtons = document.querySelectorAll(
  '[data-js="google-login"]'
);

$loginBtn.addEventListener("click", handleSignInOrCreate);
$criarConta.addEventListener("click", toggleCreateAccount);

$googleLoginButtons.forEach(($button) =>
  $button.addEventListener("click", signInWithGoogle)
);

addEventListener("load", loadUser);

const $publicarBtn = document.querySelector("#publicarBtn");
const $publishImg = document.querySelector("#publishImg");

function calculateTimeDifference(firebaseTimestamp) {
  const timestampDate = new Date(firebaseTimestamp);

  const now = new Date();

  const timeDifference = Math.abs(now - timestampDate);

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days + " dia(s) atrás";
  } else if (hours > 0) {
    return hours + " hora(s) atrás";
  } else if (minutes > 0) {
    return minutes + " minuto(s) atrás";
  } else {
    return seconds + " segundo(s) atrás";
  }
}

async function uploadImage(file) {
  if (file) {
    const storageRef = ref(storage, "images" + file.name);

    try {
      await uploadBytes(storageRef, file);

      return getDownloadURL(storageRef);
    } catch (error) {
      console.error("Erro ao enviar o arquivo:", error.message);
    }
  }
}

async function handlePublish() {
  $publicarBtn.disabled = true;
  $publicarBtn.textContent = "Publicando...";

  try {
    const $publishText = document.querySelector("#publishText");
    const $errorMessage = document.querySelector("#errorMessage");

    const text = $publishText.value;
    const file = $publishImg.files[0];

    if (!text || text.length < 50) {
      $errorMessage.textContent = "Escreva pelo menos 50 caracteres";

      return;
    }

    if (!file) {
      $errorMessage.textContent = "Imagem é obrigatória";

      return;
    }

    $errorMessage.textContent = "";

    const createdAt = serverTimestamp();
    const image = await uploadImage(file);

    await addDoc(postsCollection, {
      text,
      createdAt,
      image: image || null,
      userEmail: auth.currentUser.email,
      userImage: auth.currentUser.photoURL,
      userName: auth.currentUser.displayName,
    });

    $publishText.value = "";
    $publishImg.value = "";
  } catch (error) {
    console.log(error);
  } finally {
    $publicarBtn.textContent = "Publicar";
    $publicarBtn.disabled = false;
  }
}

function handleSetFileName(event) {
  const file = event.target.files[0];

  if (file) {
    $fileNameSelected.textContent = file.name;
  }
}

const $loadMoreButton = document.querySelector(".btn.load-more");

function renderPosts(posts, shouldAppend = false) {
  const postsContainer = document.getElementById("postsContainer");

  if (!shouldAppend) {
    postsContainer.innerHTML = "";
  }

  if (posts.length > 0 && !shouldAppend) {
    postsContainer.innerHTML = "<h2>POSTAGENS</h2>";
  }

  if (posts.length >= 3) {
    $loadMoreButton.classList.add("show");
  } else {
    $loadMoreButton.classList.remove("show");
  }

  posts.forEach((post) => {
    const postElement = document.createElement("div");

    postElement.classList.add("post");

    postElement.innerHTML = `
        ${post.image ? `<img src="${post.image}" class="image" />` : ""}

        <div class="info">
          <div class="user">
            <img src="${post.userImage || "/user.svg"}" class="userImg" />
            
            <div class="nameAndTime">
              <p class="userName">${post.userName}</p>
              <p class="time">${calculateTimeDifference(
                post.createdAt.toDate()
              )}</p>
            </div>
          </div>

          <p class="text">${post.text}</p>
        </div>

      `;

    postsContainer.appendChild(postElement);
  });
}

let postsPerPage = 3;
let lastVisiblePost = null;

async function loadMorePosts() {
  try {
    $loadMoreButton.disabled = true;
    $loadMoreButton.textContent = "Carregando...";

    const q = query(
      postsCollection,
      orderBy("createdAt", "desc"),
      limit(postsPerPage),
      startAfter(lastVisiblePost)
    );

    const querySnapshot = await getDocs(q);

    const newPosts = [];
    querySnapshot.forEach((doc) => {
      newPosts.push({ id: doc.id, ...doc.data() });
    });

    lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];

    if (!lastVisiblePost) {
      $loadMoreButton.classList.remove("show");
    }

    renderPosts(newPosts, true);
  } catch (error) {
    console.error("Erro ao carregar mais posts:", error.message);
  } finally {
    $loadMoreButton.disabled = false;
    $loadMoreButton.textContent = "Carregar Mais";
  }
}

async function initializePage() {
  try {
    const q = query(
      postsCollection,
      orderBy("createdAt", "desc"),
      limit(postsPerPage)
    );

    const querySnapshot = await getDocs(q);

    const initialPosts = [];
    querySnapshot.forEach((doc) => {
      initialPosts.push({ id: doc.id, ...doc.data() });
    });

    lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];

    renderPosts(initialPosts);

    onSnapshot(q, (snapshot) => {
      const updatedPosts = [];
      snapshot.forEach((doc) => {
        updatedPosts.push({ id: doc.id, ...doc.data() });
      });

      renderPosts(updatedPosts);
    });
  } catch (error) {
    console.error("Erro ao inicializar a página:", error.message);
  }
}

$publicarBtn.addEventListener("click", handlePublish);
$publishImg.addEventListener("change", handleSetFileName);
$loadMoreButton.addEventListener("click", loadMorePosts);
window.addEventListener("DOMContentLoaded", initializePage);
