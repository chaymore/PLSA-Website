// Next Five Upcoming Events
const CALENDAR_ID = "d3089fcdd1bc9fe4060c01f42bf826f211c33534fc1a8bb08d5855254c9092ed@group.calendar.google.com";
const API_KEY = "AIzaSyAKxZjHW5rV2JX_vU1fL-cuwokkKgZIqck";

async function fetchUpcomingEvents() {
    const listElement = document.getElementById('events-list');
    
    // Set timeMin to start of today (prevents timezone clipping for today's events)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeMin = today.toISOString();

    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&maxResults=5&singleEvents=true&orderBy=startTime`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Log API response to browser console for debugging
        console.log("Google Calendar API Response:", data);

        if (data.error) {
            console.error("API Error Details:", data.error.message);
            listElement.innerHTML = `<li class="no-events">API Error: ${data.error.message}</li>`;
            return;
        }

        listElement.innerHTML = '';
        
        if (!data.items || data.items.length === 0) {
            listElement.innerHTML = '<li class="no-events">No upcoming events</li>';
            return;
        }
        
        data.items.forEach(event => {
            const startStr = event.start.dateTime || event.start.date;
            const endStr = event.end.dateTime || event.end.date;
            
            let startDate, endDate;
            let timeRange = '';
            const dateOptions = { month: 'short', day: 'numeric' };

            if (event.start.dateTime) {
                // Timed event
                startDate = new Date(startStr);
                endDate = new Date(endStr);
                
                const timeOptions = { hour: '2-digit', minute: '2-digit' };
                const startTimeFormatted = startDate.toLocaleTimeString('en-US', timeOptions);
                const endTimeFormatted = endDate.toLocaleTimeString('en-US', timeOptions);
                
                timeRange = `, ${startTimeFormatted} - ${endTimeFormatted}`;
            } else {
                // All-day event
                const localStartDateStr = startStr.replace(/-/g, '/');
                startDate = new Date(localStartDateStr);
                timeRange = ' (All Day)';
            }
            
            const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
            const eventTitle = event.summary || 'Untitled Event';
            
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