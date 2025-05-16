-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- CreateEnum
CREATE TYPE unit_category AS ENUM (
  'length',
  'weight',
  'mass',
  'volume',
  'temperature',
  'area',
  'speed',
  'time',
  'digital',
  'cooking',
  'pressure',
  'energy',
  'power',
  'force',
  'angle',
  'data',
  'data-transfer',
  'frequency',
  'illuminance',
  'luminance',
  'luminous-flux',
  'luminous-intensity',
  'magnetic-flux',
  'magnetic-flux-density',
  'radiation',
  'radiation-absorbed-dose',
  'radiation-equivalent-dose',
  'radioactivity',
  'voltage',
  'current',
  'capacitance',
  'resistance',
  'conductance',
  'magnetic-inductance',
  'inductance',
  'electric-charge',
  'electric-potential',
  'other'
);

-- CreateTable
CREATE TABLE public.inchtogram_conversions (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    from_unit TEXT NOT NULL,
    to_unit TEXT NOT NULL,
    factor FLOAT8 NOT NULL,
    category unit_category NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT inchtogram_conversions_pkey PRIMARY KEY (id)
);

-- CreateIndex
CREATE UNIQUE INDEX inchtogram_conversions_from_unit_to_unit_key ON public.inchtogram_conversions(from_unit, to_unit);

-- CreateIndex
CREATE INDEX inchtogram_conversions_category_idx ON public.inchtogram_conversions(category);

-- CreateIndex
CREATE INDEX inchtogram_conversions_from_unit_idx ON public.inchtogram_conversions(from_unit);

-- CreateIndex
CREATE INDEX inchtogram_conversions_to_unit_idx ON public.inchtogram_conversions(to_unit);

-- CreateIndex
CREATE INDEX inchtogram_conversions_is_enabled_idx ON public.inchtogram_conversions(is_enabled);

-- Enable RLS and set up policies
ALTER TABLE public.inchtogram_conversions ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all users (authenticated and anonymous)
CREATE POLICY "Enable read access for all users" 
ON public.inchtogram_conversions
FOR SELECT
USING (true);

-- Deny all other operations
CREATE POLICY "Deny all operations except select"
ON public.inchtogram_conversions
FOR ALL
USING (false);

-- Enable automatic updated_at update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inchtogram_conversions_updated_at
BEFORE UPDATE ON public.inchtogram_conversions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for the table
COMMENT ON TABLE public.inchtogram_conversions IS 'Stores unit conversions for the Inchtogram application';

-- Add comments for columns
COMMENT ON COLUMN public.inchtogram_conversions.id IS 'Unique identifier for the conversion';
COMMENT ON COLUMN public.inchtogram_conversions.from_unit IS 'The unit to convert from';
COMMENT ON COLUMN public.inchtogram_conversions.to_unit IS 'The unit to convert to';
COMMENT ON COLUMN public.inchtogram_conversions.factor IS 'Conversion factor (1 from_unit = factor to_unit)';
COMMENT ON COLUMN public.inchtogram_conversions.category IS 'Category for grouping related units';
COMMENT ON COLUMN public.inchtogram_conversions.is_enabled IS 'Whether this conversion is active';
COMMENT ON COLUMN public.inchtogram_conversions.description IS 'Description of the conversion';
COMMENT ON COLUMN public.inchtogram_conversions.created_at IS 'When the conversion was created';
COMMENT ON COLUMN public.inchtogram_conversions.updated_at IS 'When the conversion was last updated';
