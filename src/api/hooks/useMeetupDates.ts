import { useState, useCallback, useEffect } from 'preact/hooks';
import { supabase } from '../supabase';
import { MeetupDate } from '../entities/meetup_date';

const TABLE_NAME = 'meetup_dates_isaiah_ella';

export function useMeetupDates() {
  const [meetupDates, setMeetupDates] = useState<MeetupDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMeetupDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('when', { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMeetupDates(
      (data || []).map((d: any) => ({
        ...d,
        created_at: new Date(d.created_at),
        when: new Date(d.when),
      }))
    );
  }, []);

  useEffect(() => {
    getMeetupDates();
  }, [getMeetupDates]);

  const insertMeetupDate = useCallback(async (when: Date) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ when: when.toISOString() }])
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw error;
    }
    const newMeetupDate: MeetupDate = {
      ...data,
      created_at: new Date(data.created_at),
      when: new Date(data.when),
    };
    setMeetupDates(prev => [...prev, newMeetupDate]);
    return newMeetupDate;
  }, []);

  return {
    meetupDates,
    loading,
    error,
    getMeetupDates,
    insertMeetupDate,
  };
} 