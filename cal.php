<?php
	//step1
	
	//$ical_url = "https://calendar.google.com/calendar/ical/56nbcv5a4cmq165uk7l8cq2afg%40group.calendar.google.com/private-a77e99513a74e3c175444875faa84560/basic.ics";
	$ical_url = "https://calendar.google.com/calendar/ical/assistantsjns%40gmail.com/public/basic.ics";
	
	$curl = curl_init(); 
	
	curl_setopt($curl,CURLOPT_URL, $ical_url);
	curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
	curl_setopt($curl,CURLOPT_HEADER, false); 
	$result=curl_exec($curl);
	curl_close($curl);

	$tags = array("BEGIN:", "CALSCALE:", "CREATED:", "DESCRIPTION:", "DTEND:", "DTEND;VALUE=DATE:", "DTSTAMP:", "DTSTART:", "DTSTART;VALUE=DATE:", "END:", "LAST-MODIFIED:", "LOCATION:", "METHOD:", "PRODID:", "SEQUENCE:", "STATUS:", "SUMMARY:", "TRANSP:", "UID:", "VERSION:", "X-WR-CALNAME:", "X-WR-TIMEZONE:", "EXDATE:", "RRULE:");
	
	// add unambiguous delimiter - "|||" - before all tags
	foreach ($tags as $tag) {
		
		$find = "/\n" . $tag . "/";
		$replacement = "\n|||" . $tag;
		
		$result = preg_replace($find, $replacement, $result);
	}
	
	// remove all line breaks, and trailing or leading spaces
	// this will combine multiple lines that are actually part of the same tag/value pair
	
	$result = preg_replace("/\s*[\n\r]\s*/", "", $result);
	
	// consolidate spaces
	
	$result = preg_replace("/\s+/", " ", $result);
	
	// fix escaped commas
	
	$result = preg_replace("/\\\,/", ",", $result);
	
	//replace new delimiter with line breaks
	$result = str_replace("|||", PHP_EOL, $result);
	
	// split on new line breaks
	$lines = explode(PHP_EOL, $result);
	
	$inEvent = false;
	$events = array();

	foreach ($lines as $line) {
		
		$line = trim($line);

		// split line based on tags
		
		$data = splitLine($line);
		
		$tag = $data["tag"];
		$value = $data["value"];
		
		if (($tag == "BEGIN") && ($value == "VEVENT")) {
			$event = array();
			$inEvent = true;
		} else if ($tag == "DTSTART") {
			if ($inEvent) {
				$event["start"] = fixDateTimeString($value);
			}
		} else if ($tag == "DTSTART;VALUE=DATE") {
			if ($inEvent) {
				$event["startDate"] = fixDateString($value . "T000000");
			}
		} else if ($tag == "DTEND") {
			if ($inEvent) {
				$event["end"] = fixDateTimeString($value);
			}
		} else if ($tag == "DTEND;VALUE=DATE") {
			if ($inEvent) {
				$event["endDate"] = fixDateString($value . "T235959", true);
			}
		} else if ($tag == "SUMMARY") {
			if ($inEvent) {
				$event["summary"] = $value;
			}
		} else if (($tag == "END") && ($value == "VEVENT")) {
			$inEvent = false;
			$events[] = $event;
		}
	}
	
	header('Content-Type: application/json');	
	echo json_encode($events);
	
	function splitLine($line) {
		foreach ($GLOBALS['tags'] as $tag) {
			$l = strlen($tag);
			if (substr($line, 0, $l) == $tag) {
				return array (
					"tag" => substr($tag, 0, -1),
					"value" => substr($line, $l)
				);
			}
		}
		return array (
			"tag" => null,
			"value" => null,
		);
		
	}
	
	function fixDateTimeString($d) {
		$datetime = new DateTime();
		$newDate = $datetime->createFromFormat('Ymd\THis\Z', $d);
		//$newDate->setTimeZone(new DateTimeZone("America/New_York"));		
		return $newDate->format('Y-m-d\TH:i:s\Z');
	}

	function fixDateString($d, $subtractOneDay = false) {
		$datetime = new DateTime();
		$newDate = $datetime->createFromFormat('Ymd\THis', $d, new DateTimeZone("America/New_York"));
		$newDate->setTimeZone(new DateTimeZone("UTC"));
		if ($subtractOneDay) {
			$newDate->modify('-1 day');
			// do foo
		}
// 		return $newDate->format('Y-m-d');
		return $newDate->format('Y-m-d\TH:i:s\Z');
	}
	
?>