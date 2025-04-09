window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
        console.error("Ingen kod hittades i URL:en. Omdirigerar till login.");
        window.location.href = "/login.html";
        return;
    }

    console.log("Authorization code mottagen:", code); // 👀 Kontrollera om vi får en kod

    const clientId = '0e003d9184eb4010a520086c26a4b9e7';
    const clientSecret = '66fbce2f6b4e4bac9cd07609544637b3';
    const redirectUri = 'http://127.0.0.1:5500/callback.html';

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    });

    fetch('https://accounts.spotify.com/api/token', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        console.log("Token response från Spotify API:", data); // 👀 Se vad Spotify skickar tillbaka

        if (data.access_token) {
            // Spara token i localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            console.log("Access token sparad i localStorage:", localStorage.getItem('access_token')); // 👀 Se om token sparas

            window.location.href = '/spotify.html'; // Skicka vidare till dashboard
        } else {
            console.error("Misslyckades att få access token. Respons:", data);
        }
    })
    .catch(error => console.error('Fel vid hämtning av token:', error));
};
