// ================================================
// Globala funktioner för att hämta och rendera data
// ================================================

// Funktion för att hämta "All Top Songs" (låtar baserat på långsiktig lyssningsdata)
function getAllTopSongs(accessToken) {
    fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
      const songsContainer = document.querySelector('#all-songs');
      const songList = document.createElement('div');
      songList.classList.add('song-list');
      data.items.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
          <img src="${song.album.images[0]?.url}" alt="${song.name}" class="song-image">
          <div class="song-info">
            <p class="song-title">${song.name}</p>
            <p class="song-artist">${song.artists.map(artist => artist.name).join(', ')}</p>
          </div>
        `;
        songList.appendChild(songElement);
      });
      songsContainer.appendChild(songList);
    })
    .catch(error => console.error("Error fetching All Top Songs:", error));
  }
  
  // Funktion för att hämta "Top Artists" baserat på kortsiktig lyssningsdata
  function getTopArtists(accessToken) {
    fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=15', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
      const artistContainer = document.querySelector('.top-artists');
      artistContainer.innerHTML = "<h2>Top Artists This Month</h2>";
      const gridContainer = document.createElement('div');
      gridContainer.classList.add('artist-grid');
      data.items.forEach(artist => {
        const artistElement = document.createElement('div');
        artistElement.classList.add('artist-item');
        artistElement.innerHTML = `
          <img src="${artist.images[0]?.url}" alt="${artist.name}" class="artist-image">
          <div class="artist-name-overlay">${artist.name}</div>
        `;
        gridContainer.appendChild(artistElement);
      });
      artistContainer.appendChild(gridContainer);
    })
    .catch(error => console.error("Error fetching Top Artists:", error));
  }
  
  // Funktion för att hämta "Top Songs" (kortsiktiga topplåtar)
  function getTopSongs(accessToken) {
    fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
      const songsContainer = document.querySelector('.top-songs');
      songsContainer.innerHTML = "<h2>Top Songs This Month</h2>";
      const songList = document.createElement('div');
      songList.classList.add('song-list');
      data.items.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('song-item');
        songElement.innerHTML = `
          <img src="${song.album.images[0]?.url}" alt="${song.name}" class="song-image">
          <div class="song-info">
            <p class="song-title">${song.name}</p>
            <p class="song-artist">${song.artists.map(artist => artist.name).join(', ')}</p>
          </div>
        `;
        songList.appendChild(songElement);
      });
      songsContainer.appendChild(songList);
    })
    .catch(error => console.error("Error fetching Top Songs:", error));
  }
  // Funktion för att hämta "Top Genre" och rita ett cirkeldiagram med Chart.js
function getTopGenre(accessToken) {
    fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
      // Skapa en objekt där varje genre räknas
      const genreCounts = {};
      data.items.forEach(artist => {
        artist.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6); // Ta de 6 vanligaste
      const genreLabels = sortedGenres.map(item => item[0]);
      const genreData = sortedGenres.map(item => item[1]);
      
      const ctx = document.getElementById('genreChart')?.getContext('2d');
      if (!ctx) return;
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: genreLabels,
          datasets: [{
            data: genreData,
            backgroundColor: ['#1DB954', '#ffcc00', '#ff6666', '#3399ff', '#cc33ff', '#ff9900'],
            borderWidth: 2,
            borderColor: "#fff"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  let total = genreData.reduce((acc, val) => acc + val, 0);
                  let percentage = ((tooltipItem.raw / total) * 100).toFixed(1);
                  return `${tooltipItem.label}: ${percentage}%`;
                }
              }
            }
          }
        }
      });
    })
    .catch(error => console.error("Error fetching Top Genre:", error));
  }
  
  
  // Funktion för att hämta "Listening Hours" (lyssningstid per dag under senaste veckan)
  // och rita ett stapeldiagram med Chart.js
  async function getListeningHours(accessToken) {
    if (!accessToken) {
      console.error("Ingen access token tillgänglig.");
      return;
    }
    const limit = 50;
    const maxPages = 4;
    const allItems = [];
    let nextUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`;
    
    // Beräkna tidsgräns: sju dagar tillbaka
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekdaysMap = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];
    const listeningData = { "mån": 0, "tis": 0, "ons": 0, "tors": 0, "fre": 0, "lör": 0, "sön": 0 };
    
    // Hämta upp till 200 låtar
    for (let i = 0; i < maxPages && nextUrl; i++) {
      const response = await fetch(nextUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        console.error(`Fel vid hämtning: ${response.status}`);
        break;
      }
      const data = await response.json();
      if (!data.items || data.items.length === 0) break;
      allItems.push(...data.items);
      nextUrl = data.next;
    }
    
    // Summera lyssningstiden per veckodag (i millisekunder)
    allItems.forEach(item => {
      const playedAt = new Date(item.played_at);
      if (playedAt < sevenDaysAgo) return;
      const weekday = weekdaysMap[playedAt.getDay()];
      if (listeningData[weekday] !== undefined) {
        listeningData[weekday] += item.track.duration_ms;
      }
    });
    
    // Omvandla till timmar
    const sortedWeekdays = ['mån', 'tis', 'ons', 'tors', 'fre', 'lör', 'sön'];
    const listeningHours = sortedWeekdays.map(day => ({
      day,
      hours: +(listeningData[day] / (1000 * 60 * 60)).toFixed(1)
    }));
    
    const averageHours = listeningHours.reduce((acc, curr) => acc + curr.hours, 0) / listeningHours.length;
    
    // Rita stapeldiagram med Chart.js
    const canvas = document.getElementById('listeningChart');
    if (!canvas) {
      console.error("Canvas för listeningChart saknas.");
      return;
    }
    const ctx = canvas.getContext('2d');
    if (window.listeningChart instanceof Chart) {
      window.listeningChart.destroy();
    }
    window.listeningChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: listeningHours.map(d => d.day),
        datasets: [{
          label: 'Timmar per dag',
          data: listeningHours.map(d => d.hours),
          backgroundColor: '#1DB954',
          borderRadius: 12,
          barThickness: 20,
          maxBarThickness: 30,
          hoverBackgroundColor: '#1ed760'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 10 },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.raw} timmar` } },
          title: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 8,
            ticks: { stepSize: 1 },
            grid: { display: true, lineWidth: 1, color: '#ccc' }
          },
          x: { ticks: { font: { size: 14 } }, grid: { drawOnChartArea: false, drawTicks: false } }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });
  }
  
  // Funktion för att hämta dagens top 3 låtar baserat på nyligen spelade låtar
  // och returnera de använda seed-track ID:n
  async function getTodayTopSongs(accessToken) {
    if (!accessToken) return;
    const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=50`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    const today = new Date().toDateString();
    // Filtrera ut låtar som spelats idag
    const todayTracks = data.items.filter(item => {
      const playedDate = new Date(item.played_at).toDateString();
      return playedDate === today;
    });
    // Räkna antalet gånger varje låt spelats idag
    const trackCount = {};
    todayTracks.forEach(item => {
      const trackId = item.track.id;
      if (trackCount[trackId]) {
        trackCount[trackId].count++;
      } else {
        trackCount[trackId] = { count: 1, track: item.track };
      }
    });
    // Sortera låtarna baserat på spelningsfrekvens och ta de tre mest spelade
    const sortedTracks = Object.values(trackCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    const container = document.getElementById('today-top-songs');
    container.innerHTML = "";
    sortedTracks.forEach(item => {
      const track = item.track;
      const trackUrl = track.external_urls.spotify;
      const songElement = document.createElement('div');
      songElement.classList.add('song-card');
      songElement.innerHTML = `
        <img src="${track.album.images[0]?.url}" alt="${track.name}">
        <div class="song-details">
          <p class="song-title">${track.name}</p>
          <p class="song-artist">${track.artists.map(artist => artist.name).join(', ')}</p>
        </div>
        <button class="play-button" onclick="window.open('${trackUrl}', '_blank')">▶</button>
      `;
      container.appendChild(songElement);
    });
    // Returnera en array med de använda seed-track ID:n
    return sortedTracks.map(item => item.track.id);
  }
  
  // Funktion för att hämta "Recently Played" låtar
  async function getRecentlyPlayedSongs(accessToken) {
    if (!accessToken) return;
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        console.error("Fel vid hämtning av nyligen spelade låtar:", response.status, response.statusText);
        return;
      }
      const data = await response.json();
      const container = document.getElementById('recent-songs-container');
      container.innerHTML = "";
      data.items.forEach(item => {
        const track = item.track;
        const trackUrl = track.external_urls.spotify;
        const songElement = document.createElement('div');
        songElement.classList.add('song-card');
        songElement.innerHTML = `
          <img src="${track.album.images[0]?.url}" alt="${track.name}">
          <div class="song-details">
            <p class="song-title">${track.name}</p>
            <p class="song-artist">${track.artists.map(artist => artist.name).join(', ')}</p>
          </div>
          <button class="play-button" onclick="window.open('${trackUrl}', '_blank')">▶</button>
        `;
        container.appendChild(songElement);
      });
    } catch (error) {
      console.error("Ett fel inträffade vid hämtning av nyligen spelade låtar:", error);
    }
  }
  
  // ================================================
  // window.onload: Startar alla funktioner vid sidladdning
  // ================================================
  window.onload = async function () {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      window.location.href = '/login.html';
      return;
    }
    
    // Hämta och rendera dagens top 3 låtar samt spara seed-track ID:n
    const todaySeedIds = await getTodayTopSongs(accessToken);
    
    
    
    // Hämta andra datasektioner
    getAllTopSongs(accessToken);
    getRecentlyPlayedSongs(accessToken);
    getTopArtists(accessToken);
    getTopSongs(accessToken);
    getListeningHours(accessToken);
    getTopGenre(accessToken);
    
    // Hämta användarens profilinformation och rendera denna
    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
      if (data.display_name) {
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('user-name').textContent = data.display_name;
        document.getElementById('user-image').src = data.images.length > 0 ? data.images[0].url : "default-profile.png";
        if (document.getElementById('login-btn')) {
          document.getElementById('login-btn').style.display = 'none';
        }
        document.getElementById('logout-btn').style.display = 'block';
      }
    })
    .catch(error => {
      console.error("Fel vid hämtning av användaruppgifter:", error);
      localStorage.removeItem('access_token');
      window.location.href = '/login.html';
    });
    
    // Hantera utloggning
    document.getElementById('logout-btn').addEventListener('click', function () {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.clear();
      window.location.href = '/login.html';
    });
  };
  