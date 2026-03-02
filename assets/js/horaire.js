const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

fetch("assets/horaire.json")
    .then(response => response.json())
    .then(data => buildTable(data));

function timeToMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(m) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`;
}

function buildTable(data) {

    const timetable = document.getElementById("timetable");

    // Compute min/max
    const allTimes = data.flatMap(d => [timeToMinutes(d.start), timeToMinutes(d.end)]);
    const minTime = Math.floor(Math.min(...allTimes) / 30) * 30;
    const maxTime = Math.ceil(Math.max(...allTimes) / 30) * 30;

    const rows = (maxTime - minTime) / 30 + 1;
    timetable.style.gridTemplateColumns = `100px repeat(${days.length}, 1fr)`;

    // Header row
    timetable.appendChild(makeCell("", "time-header"));
    days.forEach(day => timetable.appendChild(makeCell(day, "day-header")));

    // Time slots
    for (let t = minTime; t < maxTime; t += 30) {

        const isFullHour = (t % 60 === 0);

        const timeLabel = makeCell(
            isFullHour ? minutesToTime(t) : "",
            "time-header"
        );

        timetable.appendChild(timeLabel);

        days.forEach(day => {
            const cell = document.createElement("div");
            cell.classList.add("time-cell");

            if (t % 60 !== 0) {
                cell.classList.add("time-half");
            }

            const active = data.filter(d =>
                d.day === day &&
                timeToMinutes(d.start) <= t &&
                timeToMinutes(d.end) > t
            );

            if (active.length > 0) {
                const container = document.createElement("div");
                container.classList.add("subject-container");

                active.forEach(subject => {
                    const block = document.createElement("div");
                    block.classList.add("subject-block");
                    block.style.backgroundColor = subject.color;
                    container.appendChild(block);
                });

                cell.appendChild(container);
            }

            timetable.appendChild(cell);
        });
    }

    buildLegend(data);
}

function makeCell(text, className) {
    const div = document.createElement("div");
    div.classList.add(className);
    div.textContent = text;
    return div;
}

function buildLegend(data) {
    const legend = document.getElementById("legend");
    const uniqueSubjects = [...new Map(data.map(d => [d.subject, d])).values()];

    uniqueSubjects.forEach(sub => {
        const item = document.createElement("div");
        item.classList.add("legend-item");

        const color = document.createElement("div");
        color.classList.add("legend-color");
        color.style.backgroundColor = sub.color;

        const label = document.createElement("span");
        label.textContent = sub.subject;

        item.appendChild(color);
        item.appendChild(label);
        legend.appendChild(item);
    });
}