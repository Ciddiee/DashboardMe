document.getElementById('login-btn').addEventListener('click', function () {
    const clientId = '0e003d9184eb4010a520086c26a4b9e7';
    const redirectUri = 'http://127.0.0.1:5500/callback.html';
    const scope = 'user-top-read user-library-read playlist-read-private user-read-recently-played';

    const authUrl = `https://accounts.spotify.com/authorize` +
        `?client_id=${clientId}` +
        `&response_type=token` + // 🔁 NYCKEL: Implicit flow = token direkt
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&show_dialog=true`;

    window.location.href = authUrl;
});
