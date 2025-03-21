const RSS_FEED_TOKENS = [
    'MjAzNDY4XzE3NDI1NTIzMDNfNTM4OGZlZjM1ZWY1YzUwY2UzYzRmMTUxNjI1NTFhM2VmNDg2NGM3NA==',
    'YWx0ZXJuYXRlX3Rva2VuX2hlcmVfZm9yX2ZhbGxiYWNr',
    'YW5vdGhlcl9iYWNrdXBfdG9rZW5fZm9yX3JlZHVuZGFuY3k='
];

async function fetchHighlights(tokenIndex = 0) {
    // If we've exhausted all tokens, return empty array
    if (tokenIndex >= RSS_FEED_TOKENS.length) {
        console.error('All API tokens have been exhausted');
        return [];
    }

    const RSS_FEED_URL = `https://www.scorebat.com/video-api/v3/feed/?token=${RSS_FEED_TOKENS[tokenIndex]}`;

    try {
        const response = await fetch(RSS_FEED_URL);
        
        // Check if response is not successful
        if (!response.ok) {
            // If token fails, try next token
            console.warn(`Token ${tokenIndex} failed. Trying next token.`);
            return fetchHighlights(tokenIndex + 1);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(`Error fetching highlights with token ${tokenIndex}:`, error);
        
        // If fetch fails, try next token
        return fetchHighlights(tokenIndex + 1);
    }
}

// Optional: Add a function to manually refresh tokens if needed
function refreshTokens() {
    // You can implement token rotation or fetching logic here
    RSS_FEED_TOKENS.push('new_token_from_external_source');
}

function renderHighlight(highlight) {
    // Create main container for the highlight
    const highlightElement = document.createElement('div');
    highlightElement.classList.add('video-grid-item', 'rounded-xl', 'overflow-hidden', 'shadow-lg');

    // Check if highlight has valid data
    if (!highlight || !highlight.title) {
        console.warn('Invalid highlight object:', highlight);
        return highlightElement;
    }

    // Parse and format the date and time
    const feedDate = highlight.date ? new Date(highlight.date) : new Date();
    const formattedDate = feedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = feedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Preserve all original feed items
    const fullHighlightData = { ...highlight };

    // Determine video sources and details
    let videoEmbeds = highlight.videos || [];
    let liveStreams = highlight.liveStreams || [];
    let thumbnailUrl = highlight.thumbnail || (videoEmbeds.length > 0 ? videoEmbeds[0].thumbnail : '');

    // Prepare additional details
    const competition = highlight.competition || 'Football Highlight';
    const teams = highlight.teams && highlight.teams.length > 0 
        ? highlight.teams.join(' vs ') 
        : null;
    const league = highlight.league && highlight.league !== 'Unknown League' 
        ? highlight.league 
        : null;

    // Create highlight content
    highlightElement.innerHTML = `
        <div class="relative">
            ${thumbnailUrl ? `
                <img src="${thumbnailUrl}" alt="${highlight.title}" class="w-full h-auto object-cover highlight-image cursor-pointer">
            ` : ''}
            
            <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs flex items-center">
                <i class="fas fa-calendar-alt mr-2"></i>
                <span>${formattedDate} | ${formattedTime}</span>
            </div>
            
            <div class="p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <h3 class="text-lg font-bold mb-2 truncate">${highlight.title}</h3>
                
                ${teams || league ? `
                    <div class="mb-2 text-sm opacity-75">
                        ${teams ? `<i class="fas fa-futbol mr-2"></i>${teams}` : ''}
                        ${league ? `<span class="ml-2"><i class="fas fa-trophy mr-2"></i>${league}</span>` : ''}
                    </div>
                ` : ''}

                <div class="mb-2 text-sm opacity-75">
                    <i class="fas fa-tag mr-2"></i>${competition}
                </div>

                ${liveStreams.length > 0 ? `
                    <div class="mb-2">
                        <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                            <i class="fas fa-broadcast-tower mr-1"></i>Live Stream Available
                        </span>
                    </div>
                ` : ''}
                
                <div class="flex flex-wrap space-x-2 space-y-2">
                    ${videoEmbeds.length > 0 ? `
                        <div class="modal-trigger cursor-pointer" data-embed="${videoEmbeds[0].embed.replace(/"/g, '&quot;')}" data-index="0">
                            <button class="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform">
                                <i class="fas fa-play mr-2"></i>Watch Highlight
                            </button>
                        </div>
                    ` : ''}

                    ${liveStreams.map((stream, index) => `
                        <div class="live-stream-trigger cursor-pointer" data-stream="${stream.replace(/"/g, '&quot;')}" data-index="${index}">
                            <button class="bg-red-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform">
                                <i class="fas fa-video mr-2"></i>Live Stream ${index + 1}
                            </button>
                        </div>
                    `).join('')}
                </div>

                ${highlight.description ? `
                    <div class="mt-4 text-sm opacity-75 italic">
                        <i class="fas fa-info-circle mr-2"></i>${highlight.description}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Add image click handler to open video details
    const highlightImage = highlightElement.querySelector('.highlight-image');
    if (highlightImage) {
        highlightImage.addEventListener('click', () => {
            // Encode the entire highlight data to pass to the detail page
            const encodedHighlightData = encodeURIComponent(JSON.stringify(fullHighlightData));
            
            // Redirect to video-detail.html with highlight data
            window.location.href = `video-detail.html?data=${encodedHighlightData}`;
        });
    }

    // Add modal trigger functionality for highlights
    const modalTriggers = highlightElement.querySelectorAll('.modal-trigger');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const embedCode = trigger.getAttribute('data-embed');
            const index = trigger.getAttribute('data-index');
            openVideoModal(embedCode, `Highlight ${parseInt(index) + 1}`);
        });
    });

    // Add live stream trigger functionality
    const liveStreamTriggers = highlightElement.querySelectorAll('.live-stream-trigger');
    liveStreamTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const streamCode = trigger.getAttribute('data-stream');
            const index = trigger.getAttribute('data-index');
            openVideoModal(streamCode, `Live Stream ${parseInt(index) + 1}`);
        });
    });

    // Attach full highlight data to the element for potential future use
    highlightElement.highlightData = fullHighlightData;

    return highlightElement;
}

// Enhanced modal function to support title
function openVideoModal(embedCode, title = 'Video') {
    // Create modal container
    const modalContainer = document.getElementById('video-modal') || createVideoModal();
    
    // Set modal content
    const modalContent = modalContainer.querySelector('.modal-content');
    modalContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">${title}</h2>
        <div class="video-container">${embedCode}</div>
    `;
    
    // Show modal
    modalContainer.classList.remove('hidden');
}

// Create video modal if it doesn't exist
function createVideoModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'video-modal';
    modalContainer.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-75', 'flex', 'items-center', 'justify-center', 'z-50', 'hidden');
    
    modalContainer.innerHTML = `
        <div class="modal-content bg-white p-4 rounded-lg max-w-3xl w-full relative">
            <button class="close-modal absolute top-2 right-2 text-red-500 text-2xl">&times;</button>
            <!-- Embed will be inserted here -->
        </div>
    `;
    
    // Close modal functionality
    modalContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-modal') || e.target.id === 'video-modal') {
            modalContainer.classList.add('hidden');
        }
    });
    
    document.body.appendChild(modalContainer);
    return modalContainer;
}

async function renderHighlights() {
    const highlightsContainer = document.getElementById('highlights-container');
    
    // Clear any existing highlights
    highlightsContainer.innerHTML = '';
    
    try {
        // Fetch highlights
        const highlights = await fetchHighlights();
        
        // Render each highlight
        highlights.forEach(highlight => {
            const highlightElement = renderHighlight(highlight);
            highlightsContainer.appendChild(highlightElement);
        });
        
        // Handle case of no highlights
        if (highlights.length === 0) {
            highlightsContainer.innerHTML = `
                <div class="col-span-full text-center text-gray-500">
                    <i class="fas fa-info-circle mr-2"></i>
                    No highlights available at the moment.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error rendering highlights:', error);
        highlightsContainer.innerHTML = `
            <div class="col-span-full text-center text-red-500">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Failed to load highlights. Please try again later.
            </div>
        `;
    }
}

// Call renderHighlights when the page loads
document.addEventListener('DOMContentLoaded', renderHighlights);