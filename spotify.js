
const accessToken = localStorage.getItem("access_token");

if (!accessToken) {
  // Om ingen token finns, skicka användaren tillbaka till login
  window.location.href = "login.html";
} else {
  // Nu kan du använda token för att hämta data från Spotify
  fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + accessToken
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("Användardata:", data);
      // Här kan du lägga till kod för att visa användarens namn, bild m.m.
      document.body.innerHTML += `<h1>Hej, ${data.display_name}!</h1>`;
    })
    .catch(error => {
      console.error("Fel vid hämtning av data:", error);
    });
}
