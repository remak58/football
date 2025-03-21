// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1]);
}

// Mock stream data (replace with actual data source)
const streamData = [
    {
        id: 1,
        title: "Premier League: Manchester United vs Liverpool",
        description: "Exciting match between two top Premier League teams",
        embedUrl: "https://www.youtube.com/embed/live_stream_example1",
        competition: "Premier League",
        date: "2025-03-22",
        league: "English Premier League"
    },
    {
        id: 2,
        title: "La Liga: Real Madrid vs Barcelona",
        description: "The classic El Clasico showdown",
        embedUrl: "https://www.youtube.com/embed/live_stream_example2",
        competition: "La Liga",
        date: "2025-03-23",
        league: "Spanish La Liga"
    }
];

// Function to render stream details and embed
function renderStreamPlayer() {
    const streamId = parseInt(getUrlParameter('id'));
    const stream = streamData.find(s => s.id === streamId);

    if (!stream) {
        document.getElementById('stream-details-container').innerHTML = `
            <div class="error-message">
                <h2>Stream Not Found</h2>
                <p>The requested stream could not be found.</p>
            </div>
        `;
        return;
    }

    // Render stream details
    document.getElementById('stream-details-container').innerHTML = `
        <div class="stream-info-card">
            <h1>${stream.title}</h1>
            <div class="stream-metadata">
                <span class="competition">${stream.competition}</span>
                <span class="date">${stream.date}</span>
            </div>
            <p class="stream-description">${stream.description}</p>
        </div>
    `;

    // Render stream embed
    document.getElementById('stream-embed-container').innerHTML = `
        <div class="stream-embed-wrapper">
            <iframe 
                width="100%" 
                height="500" 
                src="${stream.embedUrl}" 
                title="${stream.title}" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        </div>
    `;
}

// Call render function when page loads
document.addEventListener('DOMContentLoaded', renderStreamPlayer);