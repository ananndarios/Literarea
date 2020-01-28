import Input from "../Components/input.js";
import Button from "../Components/button.js";
import actionIcon from "../Components/action-icon.js";
import InitMap from "../Components/map.js"

const bookAPI = 'https://www.googleapis.com/books/v1/volumes?q='
const main = document.querySelector('.page')
let bookUrl = ''

function Home() {

  setTimeout(InitMap, 500);

  return main.innerHTML = `
    <header>
      <img src="/images/literarea.png" class="header-img"/>
      <div>
        ${actionIcon({
          class: 'signout-icon fas fa-sign-out-alt',
          name: 'sair',
          onClick: signOut,
        })}
        <p class="signout-text">Sair</p>
      </div>
    </header>

    <section class="container-map">
      <p class="title-map"> Usuários com livros disponíveis na sua região </p> 
      <div class="map-container">
        <div id="map"></div>
      </div>
    </section>

    <div class="search-box">
      ${Input({
        type: 'text',
        class: 'search',
        placeholder: 'Título/Autor',
        value: '',
      })}
      ${Button({
        type: 'submit',
        class: 'search-btn register-link',
        onclick: apiAddress,
        title: 'Pesquisar',
        dataId: 'search-btn',
      })}
    </div>

    <section class="search-result"> <section>
  `
}

const apiAddress = () => {
  const bookAPI = 'https://www.googleapis.com/books/v1/volumes?q='
  const searchBox = document.querySelector('.search').value
  bookUrl = bookAPI + searchBox +'&maxResults=40'
  app.searchInAPI(bookUrl)
}

const searchInAPI = (bookUrl) => {

  document.querySelector('.search-result').innerHTML =`
  <p class="searchResults list-title"> Resultados da pesquisa </p>
  <section class="all-books"> </section>
  `
  const searchBox = document.querySelector('.search');
  const allBooks = document.querySelector('.all-books');
  searchBox.value = ""
  allBooks.innerHTML= ""

  fetch(bookUrl)
  .then(data => data.json())
  .then(containt => {
    let result = containt.items;
    let booksWithImages = [];
    result.forEach(element => {
      let bookImage = element.volumeInfo.imageLinks
      let bookAuthors = element.volumeInfo.authors
      if(bookImage !== undefined && bookAuthors!== undefined){
        booksWithImages.push(element)
      }
    }
  );

  booksWithImages.forEach(book => {
    const template =
      `<section class="book-card" data-id="${book.id}">
        <img src="${book.volumeInfo.imageLinks.thumbnail}"/>
        <article class="book-info">
          <p class="book-title">${book.volumeInfo.title}</p>
          <button type="button" id="iWantButton" class="book-list btn-login" data-id="${book.id}"
            onclick="app.iWantButton(event.target.dataset.id)"> ♡ Quero </button>
          <button type="button" id="exchangeButton"class="book-list btn-login" data-id="${book.id}"
            onclick="app.exchangeButton(event.target.dataset.id)"> ✓ Tenho p/ Trocar </button>
          <button type="button" id="donationButton"class="book-list btn-login" data-id="${book.id}"
            onclick="app.donationButton(event.target.dataset.id)"> ✓ Tenho p/ Doar </button>
        </article>
      </section>`
      allBooks.innerHTML += template
    })
  })
}

const iWantButton = (id) => {
  fetch(bookAPI+id)
    .then(data => data.json())
    .then((data) => {
      const title = data.items[0].volumeInfo.title;
      const bookImage = data.items[0].volumeInfo.imageLinks.thumbnail;
      const author = data.items[0].volumeInfo.authors;
      const wishBooks = {
        book: id,
        title: title,
        photo: bookImage,
        author: author,
      }

      const actualUser = firebase.auth().currentUser.uid
      firebase.firestore()
      .collection('users')
      .doc(actualUser)
      .collection('iWant')
      .add(wishBooks)
      .then(alert("livro adicionado à lista de Desejos"))

    })
    .then(function disableBtn() {
      document.getElementById("iWantButton").disabled = true;
    })
}

const exchangeButton = (id) => {
  fetch(bookAPI+id)
    .then(data => data.json())
    .then((data) => {
      const title = data.items[0].volumeInfo.title;
      const bookImage = data.items[0].volumeInfo.imageLinks.thumbnail;
      const author = data.items[0].volumeInfo.authors;
      const myBooks = {
        book: id,
        title: title,
        photo: bookImage,
        author: author,
      }

      const actualUser = firebase.auth().currentUser.uid
      firebase.firestore()
      .collection('users')
      .doc(actualUser)
      .collection('exchange')
      .add(myBooks)
      .then(alert("livro adicionado à Seus Livros para Troca "))
    })
}

const donationButton = (id) => {
  fetch(bookAPI+id)
    .then(data => data.json())
    .then((data) => {
      const title = data.items[0].volumeInfo.title;
      const bookImage = data.items[0].volumeInfo.imageLinks.thumbnail;
      const author = data.items[0].volumeInfo.authors;
      const myBooks = {
        book: id,
        title: title,
        photo: bookImage,
        author: author,
      }

      const actualUser = firebase.auth().currentUser.uid
      firebase.firestore()
      .collection('users')
      .doc(actualUser)
      .collection('donation')
      .add(myBooks)
      .then(alert("livro adicionado à Seus Livros para Doação "))
    })
}

function signOut() {
  firebase.auth().signOut().then(() => {
      window.location.hash = '#login';
  });
}

function userProfile(actualUser) {

  document.querySelector('.search-result').innerHTML =
  `<section class="profile">
    <p class="user-name">
      Nome do Usuário </p>
    <p class="list-title">
      ♡ Livros desejados
    </p>
    <div class="iwant-books"> </div>
    <p class="list-title">
      ✓ Doando
    </p>
    <div class="donation-books"> </div>
    <p class="list-title">
      ✓ Disponíveis para troca 
    </p>
    <div class="exchange-books"> </div>
  </section>`

  firebase.firestore()
    .collection('users')
    .doc(actualUser)
    .get()
    .then(function(doc) {
      document.querySelector('.user-name').innerHTML = "Livros de:  " + doc.data().name;
    })


  firebase.firestore()
  .collection('users')
  .doc(actualUser)
  .collection('iWant')
  .onSnapshot((querySnapshot) => {
    if (querySnapshot.size > 0) {
      document.querySelector('.iwant-books').innerHTML = '';
      querySnapshot.forEach((doc) => {
        let iWantTemplate = `
         <section class="book-card" data-id="">
            <img src="${doc.data().photo}"/>
            <article class="book-info">
              <p class="book-title">${doc.data().title}</p>
                <p class="book-title">${doc.data().author}</p>
              <button type="button" class="message-btn search-btn register-link"
                onclick=app.message()>Mensagem</button>
            </article>
          </section>
          `
          document.querySelector('.iwant-books').innerHTML += iWantTemplate;
        })

      } else {
        document.querySelector('.iwant-books').innerHTML = `<p class="list-title empty-list"> Ainda não há livros na lista de desejados </p>`;
      }
    });


  firebase.firestore()
  .collection('users')
  .doc(actualUser)
  .collection('exchange')
  .onSnapshot((querySnapshot) => {
    if (querySnapshot.size > 0) {
      document.querySelector('.exchange-books').innerHTML = '';
      querySnapshot.forEach((doc) => {
        let exchangeTemplate = `
        <section class="book-card" data-id="">
            <img src="${doc.data().photo}"/>
            <article class="book-info">
              <p class="book-title">${doc.data().title}</p>
              <p class="book-title">${doc.data().author}</p>
              <button type="button" class="message-btn search-btn register-link"
                onclick=app.message()>Mensagem</button>
            </article>
          </section>
        `;
        document.querySelector('.exchange-books').innerHTML += exchangeTemplate;
      })
    
    } else {
      document.querySelector('.exchange-books').innerHTML = `<p class="list-title empty-list"> 
      Ainda não há livros na lista de disponíveis para troca </p>`;
    }
  });

  firebase.firestore()
  .collection('users')
  .doc(actualUser)
  .collection('donation')
  .onSnapshot((querySnapshot) => {
    if (querySnapshot.size > 0) {
      document.querySelector('.donation-books').innerHTML =  '';
      querySnapshot.forEach((doc) => {
        let donationTemplate = `
        <section class="book-card" data-id="">
            <img src="${doc.data().photo}"/>
            <article class="book-info">
              <p class="book-title">${doc.data().title}</p>
              <p class="book-title">${doc.data().author}</p>
              <button type="button" class="message-btn search-btn register-link"
                onclick=app.message()>Mensagem</button>
            </article>
          </section>
        `;
        document.querySelector('.donation-books').innerHTML += donationTemplate;
      })
      
    } else {
      document.querySelector('.donation-books').innerHTML = `<p class="list-title empty-list"> Ainda não há livros na lista de doando </p>`
    }
  });
}

function message() {
  alert("Mensagem de interesse enviada")
}

window.app = {
  exchangeButton: exchangeButton,
  donationButton: donationButton,
  iWantButton: iWantButton,
  apiAddress: apiAddress,
  searchInAPI: searchInAPI,
  signOut:signOut,
  userProfile: userProfile,
  message: message,
}

export default Home;
