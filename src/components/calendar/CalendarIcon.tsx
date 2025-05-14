import { h } from 'preact';
import { FunctionComponent } from 'preact';
import calendarImg from '../../assets/calendar.png';
import { useDaysUntilNextMeetupDate } from '../../api/hooks/useDaysUntilNextMeetupDate';

export const CalendarIcon: FunctionComponent = () => {
  const { daysUntilNextMeetup } = useDaysUntilNextMeetupDate();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'hidden',
      }}
    >
      <img
        src={calendarImg}
        alt="Calendar Icon"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
        }}
      />
      {
        <span
          style={{
            position: 'absolute',
            top: '62%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#333333',
            fontSize: 24,
            fontWeight: 600,
            zIndex: 2,
            lineHeight: 1,
            background: 'none',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {daysUntilNextMeetup ?? '?'}
        </span>
      }
    </div>
  );
}; 