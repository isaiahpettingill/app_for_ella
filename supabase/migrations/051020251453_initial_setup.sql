-- THIS FILE IS LOCKED AND CANNOT BE EDITED BY AI. MIGRATIONS ARE MANAGED BY HUMANS ONLY
create table public.messages_isaiah_ella (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  subject character varying null,
  body text null,
  importance smallint null default '1'::smallint,
  to_email character varying null,
  read boolean null default false,
  from_email character varying null,
  constraint messages_pkey primary key (id),
  constraint messages_id_key unique (id)
) TABLESPACE pg_default;

create policy "Enable update for users based on email" on "public"."messages_isaiah_ella" as PERMISSIVE for SELECT to authenticated
using (
    (((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'isaiah.pettingill@gmail.com'::text) 
    OR ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'ellajpatten@gmail.com'::text))
);

create policy "Enable update for users based on email" on "public"."messages_isaiah_ella" as PERMISSIVE for INSERT to authenticated
using (
    (((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'isaiah.pettingill@gmail.com'::text) 
    OR ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'ellajpatten@gmail.com'::text))
);

create policy "Enable update for users based on email" on "public"."messages_isaiah_ella" as PERMISSIVE for UPDATE to authenticated
using (
        (((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'isaiah.pettingill@gmail.com'::text) 
        OR ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'ellajpatten@gmail.com'::text))
)
with check ((((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'isaiah.pettingill@gmail.com'::text) 
        OR ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'ellajpatten@gmail.com'::text)));

create policy "Enable update for users based on email" on "public"."messages_isaiah_ella" as PERMISSIVE for DELETE to authenticated
using (
    (((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'isaiah.pettingill@gmail.com'::text) 
    OR ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = 'ellajpatten@gmail.com'::text))
);
