const adsThing = document.createElement('script');

if (window.location.hostname == 'amtraker.com') {
    adsThing.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9074000161783128';
    adsThing.crossorigin = 'anonymous';
    adsThing.async = '';
    document.head.appendChild(adsThing);
}

let dummyTrains = document.getElementsByClassName('dummy')
let dummyTrainsLength = dummyTrains.length
for (let i = 0; i < dummyTrainsLength; i++) {
    dummyTrains[0].remove()
}

let listOfTrainsKeys = Object.keys(localStorage)

listOfTrainsKeys = listOfTrainsKeys.filter((item) => {
	return (item.indexOf("settings") !== 0 && item.indexOf("train") == 0);
});

let trains_holder = document.getElementById('trains_holder');

listOfTrains = listOfTrainsKeys.map((key) => {
	return JSON.parse(localStorage.getItem(key));
})

let addButton = document.getElementsByClassName('add')[0];
//let allButton = document.getElementsByClassName('add')[1];
addButton.remove();
//allButton.remove();

listOfTrains.sort((a, b) => (a.trainNum > b.trainNum) ? 1 : -1)

const wait = ((delay) => {//milliseconds
    return new Promise((resolve) => setTimeout(resolve, delay));
})

const convertTZ = ((date, tzString) => {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
})

const fetchRetry = ((url, delay, tries, fetchOptions = {}) => {
    function onError(err){
        triesLeft = tries - 1;
        if(!triesLeft){
            throw err;
        }
        return wait(delay).then(() => fetchRetry(url, delay, triesLeft, fetchOptions));
    }
    return fetch(url,fetchOptions).catch(onError);
})

listOfTrains.forEach((train_obj) => {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const statuses = {
		'Late': 'late',
		'Early': 'early',
		'On Time': 'on-time',
		'Completed': 'completed',
		'No Data': 'completed',
	}
	let sch_dep_obj = new Date(train_obj.origSchDep);

	if (localStorage.getItem('settings_tz') == 1) {
		sch_dep_obj = convertTZ(sch_dep_obj, train_obj.trainTimeZone);
	}

	let font_change = ' number-small';

	if (train_obj.trainNum.toString().length > 2) {
		font_change = ' number-large';
	}

	if (train_obj.velocity == null) {
		train_obj.velocity = 0;
	}

	let inner_html = `
		<div class='meta'>
			<div class='title'>
				<h3>${train_obj.routeName}</h3>
				<div class='status ${statuses[train_obj.trainTimely]}'>${train_obj.trainTimely}</div>
			</div>
			<p class='route'>${months[sch_dep_obj.getMonth()]} ${sch_dep_obj.getDate()}, ${sch_dep_obj.getFullYear()} - ${train_obj.origCode} --> ${train_obj.destCode}</p>
			<p class='route'><span class='tag'>Current Speed: </span>${train_obj.velocity.toFixed(2)} mph</p>
			<p class='location'><span class='tag'>Current Destination:</span> ${train_obj.eventName} (${train_obj.eventCode})</p>
		</div>

		<div class='number${font_change}'>${train_obj.trainNum}</div>`;

	let train_card = document.createElement('a');

	//train_card.setAttribute("onclick", `window.location.href = "/view.html?train=${train_obj.objectID}"`);
    train_card.setAttribute("href", `/view.html?train=${train_obj.objectID}`);
    train_card.classList.add("card");

	train_card.setAttribute("id", train_obj.objectID);

	train_card.innerHTML = inner_html;

	trains_holder.appendChild(train_card)
})

trains_holder.appendChild(addButton);
//trains_holder.appendChild(allButton);

setInterval(function() {
	updateTrains()
}, 60 * 1000);

const updateTrains = (() => {

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const statuses = {
		'Late': 'late',
		'Early': 'early',
		'On Time': 'on-time',
		'Completed': 'completed',
		'No Data': 'completed',
	}

	listOfTrainsKeys.forEach(async (objectID) => {
		let data;

		try {
			data = await fetchRetry(`https://api.amtraker.com/v1/trains/${JSON.parse(localStorage.getItem(objectID)).trainNum}`, 100, 3, {
				headers: {
					'User-Agent': 'AmtrakerUI/1.0 (Fart Poop 69.420; Win69; x8008; rvp00p;)',
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
				return data;
			})

		} catch {
			temp_id = objectID.substring(6);
			console.log("fucky wucky!")
			console.log(temp_id)
			console.log(document.getElementById(temp_id))
			localStorage.removeItem(`train_${temp_id}`)
			document.getElementById(temp_id).remove();
			return;
		}

		let train_obj = {};

		for (let i = 0; i < data.length; i++) {
			if (data[i].objectID == objectID.substring(6)) {
				localStorage.setItem(`train_${objectID.substring(6)}`, JSON.stringify(data[i]));
				train_obj = data[i];
				break;
			}
		}

		if (Object.keys(train_obj).length == 0) {
			temp_id = objectID.substring(6);
			console.log("fucky wucky!")
			console.log(temp_id)
			console.log(document.getElementById(temp_id))
			localStorage.removeItem(`train_${temp_id}`)
			document.getElementById(temp_id).remove();
		}

		let sch_dep_obj = new Date(train_obj.origSchDep);

		if (localStorage.getItem('settings_tz') == 1) {
			sch_dep_obj = convertTZ(sch_dep_obj, train_obj.trainTimeZone);
		}

		console.log(train_obj)

		let font_change = ' number-small';
		if (train_obj.trainNum.toString().length > 2) {
			font_change = ' number-large';
		}

		if (train_obj.velocity == null) {
			train_obj.velocity = 0;
		}

		let inner_html = `
		<div class='meta'>
			<div class='title'>
				<h3>${train_obj.routeName}</h3>
				<div class='status ${statuses[train_obj.trainTimely]}'>${train_obj.trainTimely}</div>
			</div>
			<p class='route'>${months[sch_dep_obj.getMonth()]} ${sch_dep_obj.getDate()}, ${sch_dep_obj.getFullYear()} - ${train_obj.origCode} --> ${train_obj.destCode}</p>
			<p class='route'><span class='tag'>Current Speed: </span>${train_obj.velocity.toFixed(2)} mph</p>
			<p class='location'><span class='tag'>Current Destination:</span> ${train_obj.eventName} (${train_obj.eventCode})</p>
		</div>

		<div class='number${font_change}'>${train_obj.trainNum}</div>`;

		let train_card = document.getElementById(objectID.substring(6));

		train_card.innerHTML = inner_html;

		console.log(`updated ${objectID.substring(6)}`)

	})
})

updateTrains();

let ua = navigator.userAgent.toLowerCase();
let isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
if (isAndroid) {
	console.log("Android")
} else if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
	console.log("Mobile but not android ig")
} else {
	console.log("Desktop")
}