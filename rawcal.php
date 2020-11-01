<?php
	$curl = curl_init(); 
	//curl_setopt($curl,CURLOPT_URL,"https://calendar.google.com/calendar/ical/56nbcv5a4cmq165uk7l8cq2afg%40group.calendar.google.com/private-a77e99513a74e3c175444875faa84560/basic.ics");
	curl_setopt($curl,CURLOPT_URL,"https://calendar.google.com/calendar/ical/assistantsjns%40gmail.com/public/basic.ics");
	curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
	curl_setopt($curl,CURLOPT_HEADER, false); 
	$result=curl_exec($curl);
	curl_close($curl);
	echo $result;
?>