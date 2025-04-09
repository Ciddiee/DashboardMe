
// Hämta token från URL
const hash = window.location.hash;
const params = new URLSearchParams(hash.substring(1));
const accessToken = params.get("access_token");

// Spara token i localStorage
if (accessToken) {
  localStorage.setItem("access_token", accessToken);
  // Skicka användaren vidare till dashboard
  window.location.href = "spotify.html";
} else {
  document.body.innerHTML = "<p>Fel: Ingen token hittades.</p>";
}
