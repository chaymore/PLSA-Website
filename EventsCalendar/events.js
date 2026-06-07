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
            
            let startDate, endDate;
            let timeRange = '';
            const dateOptions = { month: 'short', day: 'numeric' };

            // 2. Check if it's a timed event or an all-day event
            if (event.start.dateTime) {
                // Timed event: Parse normally with timezone data intact
                startDate = new Date(startStr);
                endDate = new Date(endStr);
                
                const timeOptions = { hour: '2-digit', minute: '2-digit' };
                const startTimeFormatted = startDate.toLocaleTimeString('en-US', timeOptions);
                const endTimeFormatted = endDate.toLocaleTimeString('en-US', timeOptions);
                
                timeRange = `, ${startTimeFormatted} - ${endTimeFormatted}`;
            } else {
                // All-day event: Force local time parsing by replacing '-' with '/'
                // This stops the browser from subtracting hours for your timezone!
                const localStartDateStr = startStr.replace(/-/g, '/');
                startDate = new Date(localStartDateStr);
                
                timeRange = ' (All Day)';
            }
            
            // 3. Format the main date cleanly (e.g., "Jun 15")
            const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
            
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