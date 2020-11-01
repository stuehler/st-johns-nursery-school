function init(includeCalendar) {
	"use strict";
	
	var
		elems,
		i, l,
		elem,
		menu,
		request;
		
	menu = document.getElementById("menu");
	
	document.querySelector("nav > button").addEventListener("click", function() {
		menu.style.display = "block";
		setTimeout(function() {
			menu.classList.add("visible");
		}, 50);
	});

	document.querySelector("#menu > button").addEventListener("click", function() {
		menu.classList.remove("visible");
	});
	
	menu.addEventListener("transitionend", function() {
		if (!this.classList.contains("visible")) {
			this.style.display = "none";
		}
	});
	
	document.querySelector("button.facebook").addEventListener("click", function() {
		window.open("https://www.facebook.com/stjohnsnurserywestwood/", '_blank');
	});

	if (includeCalendar === true) {
	
		request = new XMLHttpRequest();
		request.open("GET", "cal.php", true);
		request.onload = function() {
			"use strict";
			
			function formatDate(date, style) {
				var
					hours,
					minutes,
					ampm,
					months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
				switch (style) {
					case 1:
						// "Apr 1"
						return months[date.getMonth()] + " " + date.getDate();
					case 2:
						// "Apr 1, 2018"
						return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
					case 3:
						// "9:00am"
						hours = date.getHours();
						minutes = date.getMinutes();
						ampm = hours >= 12 ? 'pm' : 'am';
						hours = hours % 12;
						hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
						minutes = minutes < 10 ? '0' + minutes : minutes;
						return hours + ':' + minutes + ampm;
				}
			}
			
			var
				i, l,
				events,
				earliest,
				today,
				latest,
				event,
				keep,
				response,
				frag,
				table,
				tbody,
				tr,
				td,
				thead,
				th,
				time,
				span;
	
			if (request.status >= 200 && request.status < 400) {
				// Success!
				response = JSON.parse(request.responseText);
				
				events = [];
	
				today = new Date();
	
				earliest = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
				latest = new Date(today.getFullYear(), today.getMonth() + 3, 0);
	
				for (i = 0, l = response.length; i < l; i ++) {
					event = response[i];
					keep = false;
					if (event.start !== undefined) {
						event.startTimestamp = new Date(event.start);
						if ((event.startTimestamp >= earliest) && (event.startTimestamp <= latest)) {
							keep = true;
						}
					}
					if (event.startDate !== undefined) {
						event.startTimestamp = new Date(event.startDate);
						if ((event.startTimestamp >= earliest) && (event.startTimestamp <= latest)) {
							keep = true;
						}
					}
					if (event.end !== undefined) {
						event.endTimestamp = new Date(event.end);
					}
					if (event.endDate !== undefined) {
						event.endTimestamp = new Date(event.endDate);
					}
					if (keep) {
						events.push({
							description: event.summary,
							start: event.startTimestamp,
							end: event.endTimestamp,
							dateAndTime: (event.start !== undefined)
						});
					}
				}
				
				if (events.length > 0) {
					
					events.sort(function(a, b) {
						return a.start.getTime() - b.start.getTime();
					});
					
					frag = document.createDocumentFragment();
		
					table = document.createElement("table");
					table.className = "calendar";
					frag.appendChild(table);
		
					thead = document.createElement("thead");
					table.appendChild(thead);
		
					tr = document.createElement("tr");
					thead.appendChild(tr);
					
					th = document.createElement("th");
					tr.appendChild(th);
					th.colSpan = "2";
					th.textContent = "Upcoming Dates";
		
					tbody = document.createElement("tbody");
					table.appendChild(tbody);
					
					for (i = 0, l = Math.min(events.length, 6); i < l; i ++) {
						
						tr = document.createElement("tr");
						tbody.appendChild(tr);
						
						td = document.createElement("td");
						tr.appendChild(td);
		
						time = document.createElement("time");
						td.appendChild(time);
						time.setAttribute("datetime", events[i].start.toString());
						
						span = document.createElement("span");
						time.appendChild(span);
						span.className = "month"
						span.textContent = formatDate(events[i].start, 1)
		
						span = document.createElement("span");
						time.appendChild(span);
						span.className = "year"
						span.textContent = events[i].start.getFullYear();
		
						td = document.createElement("td");
						tr.appendChild(td);
		
						span = document.createElement("span");
						td.appendChild(span);
						span.className = "description";
						span.textContent = events[i].description;
		
						time = document.createElement("time");
						td.appendChild(time);
						time.setAttribute("datetime", events[i].end.toString());
		
						if (((events[i].start.getMonth() === events[i].end.getMonth()) && (events[i].start.getDate() !== events[i].end.getDate())) || (events[i].start.getMonth() !== events[i].end.getMonth())) {
		
							// event spans days
		
							span = document.createElement("span");
							time.appendChild(span);
							span.className = "time"
							span.textContent = "Through " + formatDate(events[i].end, 2);
		
						} else if (((events[i].start.getMonth() === events[i].end.getMonth()) && (events[i].start.getDate() === events[i].end.getDate())) && (events[i].dateAndTime === false)) {
		
							// all day event
		
							span = document.createElement("span");
							time.appendChild(span);
							span.className = "time"
							span.textContent = "All day";
		
						} else {
		
							// specific time
		
							span = document.createElement("span");
							time.appendChild(span);
							span.className = "time"
							span.innerHTML = formatDate(events[i].start, 3) + " &ndash; " + formatDate(events[i].end, 3);
		
						}
						
					}
		
					document.querySelector("main").prepend(frag);
				}
	
			} else {
				// We reached our target server, but it returned an error
			}
		};
		
		request.onerror = function() {
			// There was a connection error of some sort
		};
		
		request.send();	

	}
}