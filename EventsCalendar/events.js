// Next Five Upcoming Events
// CONFIGURATION: Replace these with your actual keys
const CALENDAR_ID = "d3089fcdd1bc9fe4060c01f42bf826f211c33534fc1a8bb08d5855254c9092ed@group.calendar.google.com";
const API_KEY = "AIzaSyAKxZjHW5rV2JX_vU1fL-cuwokkKgZIqck";

const now = new Date().toISOString();
const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now}&maxResults=5&singleEvents=true&orderBy=startTime`;

async function fetchUpcomingEvents() {
    const listElement = document.getElementById('events-list');
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        listElement.innerHTML = '';
        
        if (!data.items || data.items.length === 0) {
            listElement.innerHTML = '<li class="no-events">No upcoming events</li>';
            return;
        }
        
        data.items.forEach(event => {
            // 1. Grab both start and end times from Google
            const startStr = event.start.dateTime || event.start.date;
            const endStr = event.end.dateTime || event.end.date;
            
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            
            // 2. Format the main date (e.g., "Jun 15")
            const dateOptions = { month: 'short', day: 'numeric' };
            const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
            
            // 3. Handle time ranges for timed vs all-day events
            let timeRange = '';
            
            if (event.start.dateTime) {
                // Settings for just the time portion
                const timeOptions = { hour: '2-digit', minute: '2-digit' };
                const startTimeFormatted = startDate.toLocaleTimeString('en-US', timeOptions);
                const endTimeFormatted = endDate.toLocaleTimeString('en-US', timeOptions);
                
                timeRange = `, ${startTimeFormatted} - ${endTimeFormatted}`;
            } else {
                // It's an all-day event, so we don't display a time range
                timeRange = ' (All Day)';
            }
            
            const eventTitle = event.summary || 'Untitled Event';
            
            // 4. Inject into HTML layout
            const li = document.createElement('li');
            li.className = 'event-item';
            li.innerHTML = `
                <span class="event-title">${eventTitle}</span>
                <span class="event-date">${formattedDate}${timeRange}</span>
            `;
            listElement.appendChild(li);
        });
        
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        listElement.innerHTML = '<li class="no-events">Unable to load events at this time.</li>';
    }
}

document.addEventListener('DOMContentLoaded', fetchUpcomingEvents);