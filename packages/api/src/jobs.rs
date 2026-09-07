use std::sync::Arc;
use std::time::Duration;

use chrono::{Datelike, NaiveDate, NaiveDateTime, TimeDelta, Utc};

use crate::services::notification_service::{NotificationBuilder, PushsaferService};

const PICTURE_DAY: (u32, u32) = (12, 12);
const WINDOW_START_HOUR: u32 = 8;
/// 08:00–20:00 UTC, which is inside 08:00–21:00 UK time whether we're on GMT or BST.
const WINDOW_MINUTES: i64 = 12 * 60;

/// Nudges the house once a day, at a different time each day, to take the
/// Christmas picture.
pub async fn run_christmas_picture_loop(pushsafer_service: Arc<PushsaferService>) {
    loop {
        let now = Utc::now().naive_utc();
        let today_target = target_time_for(now.date());
        let target = if today_target > now {
            today_target
        } else {
            target_time_for(now.date() + TimeDelta::days(1))
        };

        let wait = (target - now).to_std().unwrap_or(Duration::from_secs(0));
        tokio::time::sleep(wait).await;

        let days = days_until_picture_day(Utc::now().naive_utc().date());
        let message = match days {
            0 => "it's christmas dinner today, time to take a picture with todays number on it"
                .to_string(),
            1 => "it's 1 day until christmas dinner, time to take a picture with todays number on it"
                .to_string(),
            n => format!(
                "it's {} days until christmas dinner, time to take a picture with todays number on it",
                n
            ),
        };

        let notification =
            NotificationBuilder::new("It's time to BeChristmassy".to_string(), message).build();
        let _ = pushsafer_service.send_notification(notification).await;
    }
}

fn days_until_picture_day(today: NaiveDate) -> i64 {
    let (month, day) = PICTURE_DAY;
    let this_year = NaiveDate::from_ymd_opt(today.year(), month, day).unwrap();
    let target = if this_year >= today {
        this_year
    } else {
        NaiveDate::from_ymd_opt(today.year() + 1, month, day).unwrap()
    };
    (target - today).num_days()
}

/// Derived from the date so a restart picks the same time again rather than
/// re-rolling and sending twice.
fn target_time_for(date: NaiveDate) -> NaiveDateTime {
    let offset = (scramble(date.num_days_from_ce() as u64) % WINDOW_MINUTES as u64) as i64;
    date.and_hms_opt(WINDOW_START_HOUR, 0, 0).unwrap() + TimeDelta::minutes(offset)
}

fn scramble(seed: u64) -> u64 {
    let mut x = seed ^ 0x9e37_79b9_7f4a_7c15;
    x = (x ^ (x >> 30)).wrapping_mul(0xbf58_476d_1ce4_e5b9);
    x = (x ^ (x >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
    x ^ (x >> 31)
}
