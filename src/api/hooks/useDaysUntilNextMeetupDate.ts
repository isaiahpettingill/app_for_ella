import { useMeetupDates } from './useMeetupDates';

export function useDaysUntilNextMeetupDate() {
  const { meetupDates } = useMeetupDates();
  let daysUntilNextMeetup: number | undefined = undefined;

  if (meetupDates && meetupDates.length > 0) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize current date to start of day for comparison

    const upcomingMeetups = meetupDates
      .map(meetupDateObject => meetupDateObject.when) // Access the 'when' property which is a Date object
      .filter(date => date >= now)
      .sort((a, b) => a.getTime() - b.getTime());

    if (upcomingMeetups.length > 0) {
      const nextMeetupDate = upcomingMeetups[0];
      const diffTime = Math.abs(nextMeetupDate.getTime() - now.getTime());
      daysUntilNextMeetup = Math.round(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  return { daysUntilNextMeetup };
} 