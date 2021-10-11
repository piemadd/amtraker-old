//initial load, fill list
fetch('https://api.amtrak.piemadd.com/v1/trains', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'TE': 'trailers'
    }
}).then(response => response.json()).then((data) => {
	let trains_holder = document.getElementById('trains_holder');

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const statuses = {
		'Late': 'late',
		'Early': 'early',
		'On Time': 'on-time',
		'Completed': 'completed',
		'No Data': 'completed',
	}

	Object.keys(data).forEach((key) => {
		data[key].forEach((train_obj) => {

			let sch_dep_obj = new Date(train_obj.origSchDep);

			let font_change = ' number-small';
			if (train_obj.trainNum.toString().length > 2) {
				font_change = ' number-large';
			}

			let inner_html = `
			<div class='meta'>
				<div class='title'>
					<h3>${train_obj.routeName}</h3>
					<div class='status ${statuses[train_obj.trainTimely]}'>${train_obj.trainTimely}</div>
				</div>
				<p class='route'>${months[sch_dep_obj.getMonth()]} ${sch_dep_obj.getDate()}, ${sch_dep_obj.getFullYear()}</p>
				<p class='route'>${train_obj.origCode} &rarr; ${train_obj.destCode}</p>
				<p class='location'><span class='tag'>Current Destination:</span> ${train_obj.eventCode}</p>
			</div>

			<div class='number${font_change}'>${train_obj.trainNum}</div>`;

			let train_card = document.createElement('article');

			train_card.setAttribute("onclick", `addTrain(${train_obj.objectID})`);

			train_card.innerHTML = inner_html;

			trains_holder.appendChild(train_card)
		})
	})
})

const addTrain = ((objectID) => {
	
	return;
})