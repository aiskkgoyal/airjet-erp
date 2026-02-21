--
-- PostgreSQL database dump
--

\restrict sk9y8KcFDp3BOKff6wIG1EZvOOK3cqxyG9O3A4WPBBWnfjv1GBLYcmq5x5mK0Rq

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: alert_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.alert_type_enum AS ENUM (
    'OVER_PRODUCTION',
    'INACTIVE_30_DAYS',
    'REPLACEMENT'
);


ALTER TYPE public.alert_type_enum OWNER TO postgres;

--
-- Name: beam_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.beam_status_enum AS ENUM (
    'QUEUED',
    'ACTIVE',
    'PAUSED',
    'COMPLETE',
    'OVER_PRODUCED'
);


ALTER TYPE public.beam_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    audit_id integer NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    action character varying(50),
    old_data jsonb,
    new_data jsonb,
    reason text,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_audit_id_seq OWNER TO postgres;

--
-- Name: audit_logs_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_audit_id_seq OWNED BY public.audit_logs.audit_id;


--
-- Name: beam_inwards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beam_inwards (
    inward_id integer NOT NULL,
    plant_id integer,
    beam_id integer,
    set_no character varying(50),
    sizing_meter numeric(14,3) NOT NULL,
    sizing_mark_interval numeric(10,3) DEFAULT 110 NOT NULL,
    inward_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    consumed_by_issue_id integer,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beam_inwards OWNER TO postgres;

--
-- Name: beam_inwards_inward_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beam_inwards_inward_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beam_inwards_inward_id_seq OWNER TO postgres;

--
-- Name: beam_inwards_inward_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beam_inwards_inward_id_seq OWNED BY public.beam_inwards.inward_id;


--
-- Name: beam_issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beam_issues (
    issue_id integer NOT NULL,
    plant_id integer,
    inward_id integer,
    beam_id integer,
    beam_no character varying(100),
    loom_id integer,
    design_id integer,
    sizing_meter numeric(14,3),
    sizing_mark_interval numeric(10,3),
    fabric_mark_interval numeric(10,3),
    predicted_marks integer,
    predicted_fabric_meter numeric(14,3),
    expected_meter numeric(14,3),
    roll_per_meter numeric(10,3),
    predicted_roll_count integer,
    produced_meter numeric(14,3) DEFAULT 0,
    status public.beam_status_enum DEFAULT 'QUEUED'::public.beam_status_enum,
    queued_at timestamp without time zone,
    activated_at timestamp without time zone,
    activated_by character varying(100),
    override_reason text,
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beam_issues OWNER TO postgres;

--
-- Name: beam_issues_issue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beam_issues_issue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beam_issues_issue_id_seq OWNER TO postgres;

--
-- Name: beam_issues_issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beam_issues_issue_id_seq OWNED BY public.beam_issues.issue_id;


--
-- Name: beam_names; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beam_names (
    beam_name_id integer NOT NULL,
    plant_id integer,
    beam_name character varying(100) NOT NULL,
    yarn character varying(100),
    total_end integer,
    rs character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beam_names OWNER TO postgres;

--
-- Name: beam_names_beam_name_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beam_names_beam_name_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beam_names_beam_name_id_seq OWNER TO postgres;

--
-- Name: beam_names_beam_name_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beam_names_beam_name_id_seq OWNED BY public.beam_names.beam_name_id;


--
-- Name: beam_number_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beam_number_sequences (
    plant_id integer NOT NULL,
    current_number bigint DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beam_number_sequences OWNER TO postgres;

--
-- Name: beam_replacements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beam_replacements (
    replacement_id integer NOT NULL,
    plant_id integer,
    loom_id integer,
    old_issue_id integer,
    new_issue_id integer,
    removed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    removed_by character varying(100),
    removed_reason text,
    removed_partial_meter numeric(12,3),
    redistributed_inward_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beam_replacements OWNER TO postgres;

--
-- Name: beam_replacements_replacement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beam_replacements_replacement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beam_replacements_replacement_id_seq OWNER TO postgres;

--
-- Name: beam_replacements_replacement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beam_replacements_replacement_id_seq OWNED BY public.beam_replacements.replacement_id;


--
-- Name: beams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beams (
    beam_id integer NOT NULL,
    plant_id integer,
    beam_no character varying(100) NOT NULL,
    beam_name_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beams OWNER TO postgres;

--
-- Name: beams_beam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beams_beam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beams_beam_id_seq OWNER TO postgres;

--
-- Name: beams_beam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beams_beam_id_seq OWNED BY public.beams.beam_id;


--
-- Name: designs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designs (
    design_id integer NOT NULL,
    plant_id integer,
    design_no character varying(50) NOT NULL,
    description text,
    reed character varying(50),
    pick character varying(50),
    warp_yarn character varying(100),
    weft_yarn character varying(100),
    width numeric(10,2),
    average_meter numeric(10,3),
    average_weight numeric(10,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.designs OWNER TO postgres;

--
-- Name: designs_design_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designs_design_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designs_design_id_seq OWNER TO postgres;

--
-- Name: designs_design_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designs_design_id_seq OWNED BY public.designs.design_id;


--
-- Name: looms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.looms (
    loom_id integer NOT NULL,
    plant_id integer,
    loom_no character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.looms OWNER TO postgres;

--
-- Name: looms_loom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.looms_loom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.looms_loom_id_seq OWNER TO postgres;

--
-- Name: looms_loom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.looms_loom_id_seq OWNED BY public.looms.loom_id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    plant_id integer NOT NULL,
    plant_code character varying(20) NOT NULL,
    plant_name character varying(100) NOT NULL,
    location character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plants_plant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_plant_id_seq OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plants_plant_id_seq OWNED BY public.plants.plant_id;


--
-- Name: production_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_entries (
    entry_id integer NOT NULL,
    plant_id integer,
    issue_id integer,
    parent_piece_no integer,
    total_meter numeric(14,3),
    total_weight numeric(14,3),
    total_damage_meter numeric(14,3),
    total_damage_weight numeric(14,3),
    observed_mark_count integer,
    observed_mark_meter numeric(12,3),
    created_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.production_entries OWNER TO postgres;

--
-- Name: production_entries_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.production_entries_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_entries_entry_id_seq OWNER TO postgres;

--
-- Name: production_entries_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.production_entries_entry_id_seq OWNED BY public.production_entries.entry_id;


--
-- Name: production_piece_marks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_piece_marks (
    mark_id integer NOT NULL,
    piece_id integer,
    mark_index integer,
    mark_meter numeric(12,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.production_piece_marks OWNER TO postgres;

--
-- Name: production_piece_marks_mark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.production_piece_marks_mark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_piece_marks_mark_id_seq OWNER TO postgres;

--
-- Name: production_piece_marks_mark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.production_piece_marks_mark_id_seq OWNED BY public.production_piece_marks.mark_id;


--
-- Name: production_pieces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.production_pieces (
    piece_id integer NOT NULL,
    entry_id integer,
    piece_seq integer,
    full_piece_no character varying(50),
    meter numeric(12,3),
    weight numeric(12,3),
    damage_meter numeric(12,3),
    damage_weight numeric(12,3),
    net_meter numeric(12,3),
    net_weight numeric(12,3),
    avg_mark_interval numeric(10,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.production_pieces OWNER TO postgres;

--
-- Name: production_pieces_piece_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.production_pieces_piece_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_pieces_piece_id_seq OWNER TO postgres;

--
-- Name: production_pieces_piece_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.production_pieces_piece_id_seq OWNED BY public.production_pieces.piece_id;


--
-- Name: stock_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_ledger (
    ledger_id integer NOT NULL,
    plant_id integer,
    warehouse_id integer,
    reference_type character varying(50),
    reference_id integer,
    meter numeric(14,3),
    weight numeric(14,3),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_ledger OWNER TO postgres;

--
-- Name: stock_ledger_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_ledger_ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_ledger_ledger_id_seq OWNER TO postgres;

--
-- Name: stock_ledger_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_ledger_ledger_id_seq OWNED BY public.stock_ledger.ledger_id;


--
-- Name: system_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_alerts (
    alert_id integer NOT NULL,
    plant_id integer,
    issue_id integer,
    alert_type public.alert_type_enum,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_alerts OWNER TO postgres;

--
-- Name: system_alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_alerts_alert_id_seq OWNER TO postgres;

--
-- Name: system_alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_alerts_alert_id_seq OWNED BY public.system_alerts.alert_id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    warehouse_id integer NOT NULL,
    plant_id integer,
    warehouse_name character varying(100),
    warehouse_type character varying(50)
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_warehouse_id_seq OWNER TO postgres;

--
-- Name: warehouses_warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_warehouse_id_seq OWNED BY public.warehouses.warehouse_id;


--
-- Name: audit_logs audit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN audit_id SET DEFAULT nextval('public.audit_logs_audit_id_seq'::regclass);


--
-- Name: beam_inwards inward_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_inwards ALTER COLUMN inward_id SET DEFAULT nextval('public.beam_inwards_inward_id_seq'::regclass);


--
-- Name: beam_issues issue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues ALTER COLUMN issue_id SET DEFAULT nextval('public.beam_issues_issue_id_seq'::regclass);


--
-- Name: beam_names beam_name_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_names ALTER COLUMN beam_name_id SET DEFAULT nextval('public.beam_names_beam_name_id_seq'::regclass);


--
-- Name: beam_replacements replacement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_replacements ALTER COLUMN replacement_id SET DEFAULT nextval('public.beam_replacements_replacement_id_seq'::regclass);


--
-- Name: beams beam_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beams ALTER COLUMN beam_id SET DEFAULT nextval('public.beams_beam_id_seq'::regclass);


--
-- Name: designs design_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs ALTER COLUMN design_id SET DEFAULT nextval('public.designs_design_id_seq'::regclass);


--
-- Name: looms loom_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.looms ALTER COLUMN loom_id SET DEFAULT nextval('public.looms_loom_id_seq'::regclass);


--
-- Name: plants plant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants ALTER COLUMN plant_id SET DEFAULT nextval('public.plants_plant_id_seq'::regclass);


--
-- Name: production_entries entry_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_entries ALTER COLUMN entry_id SET DEFAULT nextval('public.production_entries_entry_id_seq'::regclass);


--
-- Name: production_piece_marks mark_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_piece_marks ALTER COLUMN mark_id SET DEFAULT nextval('public.production_piece_marks_mark_id_seq'::regclass);


--
-- Name: production_pieces piece_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_pieces ALTER COLUMN piece_id SET DEFAULT nextval('public.production_pieces_piece_id_seq'::regclass);


--
-- Name: stock_ledger ledger_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_ledger ALTER COLUMN ledger_id SET DEFAULT nextval('public.stock_ledger_ledger_id_seq'::regclass);


--
-- Name: system_alerts alert_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_alerts ALTER COLUMN alert_id SET DEFAULT nextval('public.system_alerts_alert_id_seq'::regclass);


--
-- Name: warehouses warehouse_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN warehouse_id SET DEFAULT nextval('public.warehouses_warehouse_id_seq'::regclass);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_id);


--
-- Name: beam_inwards beam_inwards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_inwards
    ADD CONSTRAINT beam_inwards_pkey PRIMARY KEY (inward_id);


--
-- Name: beam_issues beam_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_pkey PRIMARY KEY (issue_id);


--
-- Name: beam_names beam_names_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_names
    ADD CONSTRAINT beam_names_pkey PRIMARY KEY (beam_name_id);


--
-- Name: beam_number_sequences beam_number_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_number_sequences
    ADD CONSTRAINT beam_number_sequences_pkey PRIMARY KEY (plant_id);


--
-- Name: beam_replacements beam_replacements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_replacements
    ADD CONSTRAINT beam_replacements_pkey PRIMARY KEY (replacement_id);


--
-- Name: beams beams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beams
    ADD CONSTRAINT beams_pkey PRIMARY KEY (beam_id);


--
-- Name: beams beams_plant_id_beam_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beams
    ADD CONSTRAINT beams_plant_id_beam_no_key UNIQUE (plant_id, beam_no);


--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (design_id);


--
-- Name: looms looms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.looms
    ADD CONSTRAINT looms_pkey PRIMARY KEY (loom_id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (plant_id);


--
-- Name: plants plants_plant_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_plant_code_key UNIQUE (plant_code);


--
-- Name: production_entries production_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_entries
    ADD CONSTRAINT production_entries_pkey PRIMARY KEY (entry_id);


--
-- Name: production_piece_marks production_piece_marks_piece_id_mark_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_piece_marks
    ADD CONSTRAINT production_piece_marks_piece_id_mark_index_key UNIQUE (piece_id, mark_index);


--
-- Name: production_piece_marks production_piece_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_piece_marks
    ADD CONSTRAINT production_piece_marks_pkey PRIMARY KEY (mark_id);


--
-- Name: production_pieces production_pieces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_pieces
    ADD CONSTRAINT production_pieces_pkey PRIMARY KEY (piece_id);


--
-- Name: stock_ledger stock_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_ledger
    ADD CONSTRAINT stock_ledger_pkey PRIMARY KEY (ledger_id);


--
-- Name: system_alerts system_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_alerts
    ADD CONSTRAINT system_alerts_pkey PRIMARY KEY (alert_id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (warehouse_id);


--
-- Name: idx_beam_issues_loom_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_beam_issues_loom_status ON public.beam_issues USING btree (loom_id, status);


--
-- Name: idx_production_pieces_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_production_pieces_entry ON public.production_pieces USING btree (entry_id);


--
-- Name: idx_stock_ledger_wh; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_ledger_wh ON public.stock_ledger USING btree (warehouse_id);


--
-- Name: beam_inwards beam_inwards_beam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_inwards
    ADD CONSTRAINT beam_inwards_beam_id_fkey FOREIGN KEY (beam_id) REFERENCES public.beams(beam_id);


--
-- Name: beam_inwards beam_inwards_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_inwards
    ADD CONSTRAINT beam_inwards_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: beam_issues beam_issues_beam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_beam_id_fkey FOREIGN KEY (beam_id) REFERENCES public.beams(beam_id);


--
-- Name: beam_issues beam_issues_design_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(design_id);


--
-- Name: beam_issues beam_issues_inward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_inward_id_fkey FOREIGN KEY (inward_id) REFERENCES public.beam_inwards(inward_id);


--
-- Name: beam_issues beam_issues_loom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_loom_id_fkey FOREIGN KEY (loom_id) REFERENCES public.looms(loom_id);


--
-- Name: beam_issues beam_issues_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_issues
    ADD CONSTRAINT beam_issues_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: beam_names beam_names_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_names
    ADD CONSTRAINT beam_names_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: beam_number_sequences beam_number_sequences_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_number_sequences
    ADD CONSTRAINT beam_number_sequences_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: beam_replacements beam_replacements_new_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_replacements
    ADD CONSTRAINT beam_replacements_new_issue_id_fkey FOREIGN KEY (new_issue_id) REFERENCES public.beam_issues(issue_id);


--
-- Name: beam_replacements beam_replacements_old_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_replacements
    ADD CONSTRAINT beam_replacements_old_issue_id_fkey FOREIGN KEY (old_issue_id) REFERENCES public.beam_issues(issue_id);


--
-- Name: beam_replacements beam_replacements_redistributed_inward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beam_replacements
    ADD CONSTRAINT beam_replacements_redistributed_inward_id_fkey FOREIGN KEY (redistributed_inward_id) REFERENCES public.beam_inwards(inward_id);


--
-- Name: beams beams_beam_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beams
    ADD CONSTRAINT beams_beam_name_id_fkey FOREIGN KEY (beam_name_id) REFERENCES public.beam_names(beam_name_id);


--
-- Name: beams beams_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beams
    ADD CONSTRAINT beams_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: designs designs_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: looms looms_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.looms
    ADD CONSTRAINT looms_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: production_entries production_entries_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_entries
    ADD CONSTRAINT production_entries_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.beam_issues(issue_id);


--
-- Name: production_entries production_entries_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_entries
    ADD CONSTRAINT production_entries_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: production_piece_marks production_piece_marks_piece_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_piece_marks
    ADD CONSTRAINT production_piece_marks_piece_id_fkey FOREIGN KEY (piece_id) REFERENCES public.production_pieces(piece_id) ON DELETE CASCADE;


--
-- Name: production_pieces production_pieces_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.production_pieces
    ADD CONSTRAINT production_pieces_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.production_entries(entry_id) ON DELETE CASCADE;


--
-- Name: stock_ledger stock_ledger_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_ledger
    ADD CONSTRAINT stock_ledger_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: stock_ledger stock_ledger_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_ledger
    ADD CONSTRAINT stock_ledger_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(warehouse_id);


--
-- Name: system_alerts system_alerts_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_alerts
    ADD CONSTRAINT system_alerts_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.beam_issues(issue_id);


--
-- Name: system_alerts system_alerts_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_alerts
    ADD CONSTRAINT system_alerts_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- Name: warehouses warehouses_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id);


--
-- PostgreSQL database dump complete
--

\unrestrict sk9y8KcFDp3BOKff6wIG1EZvOOK3cqxyG9O3A4WPBBWnfjv1GBLYcmq5x5mK0Rq

