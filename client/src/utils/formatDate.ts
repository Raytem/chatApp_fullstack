
function isMoreThanMinuteAgo(date: Date) {
  const curDate = new Date();

  const minute_ms = 1000 * 60;
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > minute_ms;
}

function isMoreThanHourAgo(date: Date) {
  const curDate = new Date();

  const hour_ms = 1000 * 60 * 60;
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > hour_ms;
}

function isMoreThanDayAgo(date: Date) {
  const curDate = new Date();

  const day_ms = 1000 * 60 * 60 * 24;
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > day_ms;
}

function isMoreThanTwoDaysAgo(date: Date) {
  const curDate = new Date();

  const twoDays_ms = (1000 * 60 * 60 * 24) * 2;
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > twoDays_ms;
}

function isMoreThanWeekAgo(date: Date) {
  const curDate = new Date();

  const week_ms = (1000 * 60 * 60 * 24) * 7;
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > week_ms;
}

function isMoreThanMonthAgo(date: Date) {
  const curDate = new Date();

  const daysInMonth = function(d: Date) {
		return 32 - new Date(d.getFullYear(), d.getMonth(), 32).getDate();
	};

  const month_ms = (1000 * 60 * 60 * 24) * daysInMonth(date);
  const timeDiff = date.getTime() - curDate.getTime();

  return  Math.abs(timeDiff) > month_ms;
}

//-----

function isDayAgo(dateStr: string | Date) {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 1);
  return date < dayBefore;
}

function isWeekAgo(date: Date) {
  const weekBefore = new Date();
  weekBefore.setDate(weekBefore.getDate() - 7)
  return date < weekBefore;
}

function isMonthAgo(date: Date) {
  const monthBefore = new Date();
  monthBefore.setMonth(monthBefore.getMonth() - 1);
  return date < monthBefore;
}

function isYearAgo(date: Date) {
  const yearBefore = new Date();
  yearBefore.setFullYear(yearBefore.getFullYear() - 1);
  return date < yearBefore;
}

//-------------

export const formatDate_time = (dateStr: string | Date) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);

  const curDayFormatter = new Intl.DateTimeFormat("ru", {
    hour: "numeric",
    minute: "numeric",
  });
  return curDayFormatter.format(date);
}

export const formatDate_date = (dateStr: string | Date, longer?: boolean) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  let formatter;

  if (!isDayAgo(date)) {
    if (longer) return 'Today'
    formatter = new Intl.DateTimeFormat("ru", {
      hour: "numeric",
      minute: "numeric",
    })
    const prevDate = new Date(date);
    prevDate.setHours(hours);
    prevDate.setMinutes(minutes);
    return formatter.format(prevDate);
  }
  else if (!isWeekAgo(date)) {
    if (longer) {
      formatter = new Intl.DateTimeFormat("en", {
        day: 'numeric',
        month: 'long',
      })
    } else {
      formatter = new Intl.DateTimeFormat("eng", {
        weekday: 'short',
      })
    }
  }
  else if (!isMonthAgo(date)) {
    formatter = new Intl.DateTimeFormat("en", {
      day: 'numeric',
      month: 'short',
    })
  }
  else if (!isYearAgo(date)) {
    formatter = new Intl.DateTimeFormat("en", {
      day: 'numeric',
      month: 'short',
    })
  }
  else {
    if (longer) {
      formatter = new Intl.DateTimeFormat("en", {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } else {
      formatter = new Intl.DateTimeFormat("en", {
        day: 'numeric',
        month: 'numeric',
        year: '2-digit',
      })
    }
  }

  return formatter.format(date);
}

export const formatDate_onlineStatus= (dateStr: string | Date | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  let result = 'last seen just now';

  if (isMoreThanMinuteAgo(date)) {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    result = 
      `last seen ${minutes > 1 ? `${minutes} minutes` : `${minutes} minute`} ago`;
  }
  if (isMoreThanHourAgo(date)) {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    result = 
      `last seen ${hours > 1 ? `${hours} hours` : `${hours} hour`} ago`;
  }
  if (isMoreThanDayAgo(date)) {
    const formatter = new Intl.DateTimeFormat("ru", {
      hour: "numeric",
      minute: "numeric",
    })
    result = `last seen yesterday at ${formatter.format(date)}`
  }
  if (isMoreThanTwoDaysAgo(date)) {
    result = `last seen this week`
  }
  if (isMoreThanWeekAgo(date)) {
    result = 'last seen this month'
  }
  if (isMoreThanMonthAgo(date)) {
    const formatter = new Intl.DateTimeFormat("ru", {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
    result = `last seen ${formatter.format(date)}`
  }

  return result
}