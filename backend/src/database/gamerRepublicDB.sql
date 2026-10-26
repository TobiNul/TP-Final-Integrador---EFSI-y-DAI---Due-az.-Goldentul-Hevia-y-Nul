--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.0

-- Started on 2026-10-26 13:59:41

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 16615)
-- Name: actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad (
    "idActividad" bigint NOT NULL,
    "idUsuario" integer NOT NULL,
    tipo character varying(40) NOT NULL,
    "idVideojuego" integer,
    "idColeccion" integer,
    fecha timestamp with time zone DEFAULT now() NOT NULL,
    detalle jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT actividad_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['juego_agregado'::character varying, 'juego_completado'::character varying, 'favorito_agregado'::character varying, 'coleccion_creada'::character varying, 'juego_agregado_coleccion'::character varying, 'logro_desbloqueado'::character varying, 'estado_actualizado'::character varying])::text[])))
);


ALTER TABLE public.actividad OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16614)
-- Name: actividad_idActividad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.actividad ALTER COLUMN "idActividad" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."actividad_idActividad_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16557)
-- Name: amistades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.amistades (
    "idAmistad" integer NOT NULL,
    "idSolicitante" integer NOT NULL,
    "idReceptor" integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    "fechaSolicitud" timestamp with time zone DEFAULT now() NOT NULL,
    "fechaRespuesta" timestamp with time zone,
    CONSTRAINT amistades_check CHECK (("idSolicitante" <> "idReceptor")),
    CONSTRAINT amistades_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aceptada'::character varying, 'rechazada'::character varying, 'bloqueada'::character varying])::text[])))
);


ALTER TABLE public.amistades OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16556)
-- Name: amistades_idAmistad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.amistades ALTER COLUMN "idAmistad" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."amistades_idAmistad_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16505)
-- Name: biblioteca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biblioteca (
    "idUsuario" integer NOT NULL,
    "idVideojuego" integer NOT NULL,
    "fechaAgregado" timestamp with time zone DEFAULT now() NOT NULL,
    "esFavorito" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.biblioteca OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16524)
-- Name: colecciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones (
    "idColeccion" integer NOT NULL,
    "idUsuario" integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    "portadaUrl" text,
    "esPublica" boolean DEFAULT true NOT NULL,
    "fechaCreacion" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.colecciones OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16539)
-- Name: coleccionesVideojuegos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."coleccionesVideojuegos" (
    "idColeccion" integer NOT NULL,
    "idVideojuego" integer NOT NULL,
    "fechaAgregado" timestamp with time zone DEFAULT now() NOT NULL,
    posicion integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."coleccionesVideojuegos" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16523)
-- Name: colecciones_idColeccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.colecciones ALTER COLUMN "idColeccion" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."colecciones_idColeccion_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 16422)
-- Name: generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generos (
    "idGenero" integer NOT NULL,
    nombre character varying(80) NOT NULL
);


ALTER TABLE public.generos OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16421)
-- Name: generos_idGenero_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.generos ALTER COLUMN "idGenero" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."generos_idGenero_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 16581)
-- Name: logros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logros (
    "idLogro" integer NOT NULL,
    "idVideojuego" integer NOT NULL,
    "idExterno" character varying(150),
    nombre character varying(200) NOT NULL,
    descripcion text,
    "iconoUrl" text,
    puntuacion numeric(8,2),
    "porcentajeDesbloqueo" numeric(5,2),
    CONSTRAINT "logros_porcentajeDesbloqueo_check" CHECK ((("porcentajeDesbloqueo" >= (0)::numeric) AND ("porcentajeDesbloqueo" <= (100)::numeric)))
);


ALTER TABLE public.logros OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16580)
-- Name: logros_idLogro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.logros ALTER COLUMN "idLogro" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."logros_idLogro_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16468)
-- Name: modosJuego; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."modosJuego" (
    "idModo" integer NOT NULL,
    nombre character varying(80) NOT NULL
);


ALTER TABLE public."modosJuego" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16467)
-- Name: modosJuego_idModo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."modosJuego" ALTER COLUMN "idModo" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."modosJuego_idModo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16445)
-- Name: plataformas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plataformas (
    "idPlataforma" integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.plataformas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16444)
-- Name: plataformas_idPlataforma_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.plataformas ALTER COLUMN "idPlataforma" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."plataformas_idPlataforma_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 16597)
-- Name: progresoLogros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."progresoLogros" (
    "idUsuario" integer NOT NULL,
    "idLogro" integer NOT NULL,
    desbloqueado boolean DEFAULT false NOT NULL,
    "fechaDesbloqueo" timestamp with time zone,
    CONSTRAINT "progresoLogros_check" CHECK (((desbloqueado = true) OR ("fechaDesbloqueo" IS NULL)))
);


ALTER TABLE public."progresoLogros" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16399)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    "idUsuario" integer NOT NULL,
    username character varying(40) NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" text NOT NULL,
    "nombreCompleto" character varying(120),
    "fotoPerfil" text,
    biografia text,
    "fechaCreacion" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16490)
-- Name: usuariosModosJuego; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosModosJuego" (
    "idUsuario" integer NOT NULL,
    "idModo" integer NOT NULL
);


ALTER TABLE public."usuariosModosJuego" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16398)
-- Name: usuarios_idUsuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ALTER COLUMN "idUsuario" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."usuarios_idUsuario_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16412)
-- Name: videojuegos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.videojuegos (
    "idVideojuego" integer NOT NULL,
    "proveedorApi" character varying(50) NOT NULL,
    "idExterno" character varying(100) NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text,
    "portadaUrl" text,
    "fechaLanzamiento" date,
    desarrolladora character varying(255),
    publisher character varying(255),
    "puntuacionApi" numeric(4,2),
    "fechaActualizacionApi" timestamp with time zone
);


ALTER TABLE public.videojuegos OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: videojuegosGeneros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."videojuegosGeneros" (
    "idVideojuego" integer NOT NULL,
    "idGenero" integer NOT NULL
);


ALTER TABLE public."videojuegosGeneros" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16475)
-- Name: videojuegosModos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."videojuegosModos" (
    "idVideojuego" integer NOT NULL,
    "idModo" integer NOT NULL
);


ALTER TABLE public."videojuegosModos" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16452)
-- Name: videojuegosPlataformas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."videojuegosPlataformas" (
    "idVideojuego" integer NOT NULL,
    "idPlataforma" integer NOT NULL
);


ALTER TABLE public."videojuegosPlataformas" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16411)
-- Name: videojuegos_idVideojuego_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.videojuegos ALTER COLUMN "idVideojuego" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."videojuegos_idVideojuego_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4962 (class 0 OID 16615)
-- Dependencies: 240
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4957 (class 0 OID 16557)
-- Dependencies: 235
-- Data for Name: amistades; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4952 (class 0 OID 16505)
-- Dependencies: 230
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4954 (class 0 OID 16524)
-- Dependencies: 232
-- Data for Name: colecciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4955 (class 0 OID 16539)
-- Dependencies: 233
-- Data for Name: coleccionesVideojuegos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4943 (class 0 OID 16422)
-- Dependencies: 221
-- Data for Name: generos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (1, 'Acción');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (2, 'Aventura');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (3, 'RPG');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (4, 'JRPG');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (5, 'MMORPG');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (6, 'Shooter');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (7, 'FPS');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (8, 'TPS');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (9, 'Estrategia');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (10, 'Simulación');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (11, 'Deportes');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (12, 'Carreras');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (13, 'Plataformas');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (14, 'Puzzle');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (15, 'Terror');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (16, 'Supervivencia');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (17, 'Lucha');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (18, 'Indie');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (19, 'Casual');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (20, 'Música');


--
-- TOC entry 4959 (class 0 OID 16581)
-- Dependencies: 237
-- Data for Name: logros; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4949 (class 0 OID 16468)
-- Dependencies: 227
-- Data for Name: modosJuego; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (1, 'Un jugador');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (2, 'Multijugador');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (3, 'Cooperativo');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (4, 'Cooperativo local');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (5, 'Cooperativo en línea');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (6, 'Competitivo');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (7, 'PvP');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (8, 'PvE');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (9, 'Pantalla dividida');
INSERT INTO public."modosJuego" OVERRIDING SYSTEM VALUE VALUES (10, 'MMO');


--
-- TOC entry 4946 (class 0 OID 16445)
-- Dependencies: 224
-- Data for Name: plataformas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (1, 'PC');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (2, 'PlayStation 5');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (3, 'PlayStation 4');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (4, 'Xbox Series X/S');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (5, 'Xbox One');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (6, 'Nintendo Switch');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (7, 'Nintendo Switch 2');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (8, 'iOS');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (9, 'Android');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (10, 'macOS');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (11, 'Linux');
INSERT INTO public.plataformas OVERRIDING SYSTEM VALUE VALUES (12, 'Steam Deck');


--
-- TOC entry 4960 (class 0 OID 16597)
-- Dependencies: 238
-- Data for Name: progresoLogros; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4939 (class 0 OID 16399)
-- Dependencies: 217
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4951 (class 0 OID 16490)
-- Dependencies: 229
-- Data for Name: usuariosModosJuego; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4941 (class 0 OID 16412)
-- Dependencies: 219
-- Data for Name: videojuegos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4944 (class 0 OID 16429)
-- Dependencies: 222
-- Data for Name: videojuegosGeneros; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4950 (class 0 OID 16475)
-- Dependencies: 228
-- Data for Name: videojuegosModos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4947 (class 0 OID 16452)
-- Dependencies: 225
-- Data for Name: videojuegosPlataformas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 239
-- Name: actividad_idActividad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."actividad_idActividad_seq"', 1, false);


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 234
-- Name: amistades_idAmistad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."amistades_idAmistad_seq"', 1, false);


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 231
-- Name: colecciones_idColeccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."colecciones_idColeccion_seq"', 1, false);


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 220
-- Name: generos_idGenero_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."generos_idGenero_seq"', 20, true);


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 236
-- Name: logros_idLogro_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."logros_idLogro_seq"', 1, false);


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 226
-- Name: modosJuego_idModo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."modosJuego_idModo_seq"', 70, true);


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 223
-- Name: plataformas_idPlataforma_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."plataformas_idPlataforma_seq"', 12, true);


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 216
-- Name: usuarios_idUsuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."usuarios_idUsuario_seq"', 1, false);


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 218
-- Name: videojuegos_idVideojuego_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."videojuegos_idVideojuego_seq"', 1, false);


--
-- TOC entry 4772 (class 2606 OID 16624)
-- Name: actividad actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pkey PRIMARY KEY ("idActividad");


--
-- TOC entry 4759 (class 2606 OID 16567)
-- Name: amistades amistades_idSolicitante_idReceptor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT "amistades_idSolicitante_idReceptor_key" UNIQUE ("idSolicitante", "idReceptor");


--
-- TOC entry 4761 (class 2606 OID 16565)
-- Name: amistades amistades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_pkey PRIMARY KEY ("idAmistad");


--
-- TOC entry 4751 (class 2606 OID 16511)
-- Name: biblioteca biblioteca_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pkey PRIMARY KEY ("idUsuario", "idVideojuego");


--
-- TOC entry 4757 (class 2606 OID 16545)
-- Name: coleccionesVideojuegos coleccionesVideojuegos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."coleccionesVideojuegos"
    ADD CONSTRAINT "coleccionesVideojuegos_pkey" PRIMARY KEY ("idColeccion", "idVideojuego");


--
-- TOC entry 4754 (class 2606 OID 16532)
-- Name: colecciones colecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_pkey PRIMARY KEY ("idColeccion");


--
-- TOC entry 4731 (class 2606 OID 16428)
-- Name: generos generos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_nombre_key UNIQUE (nombre);


--
-- TOC entry 4733 (class 2606 OID 16426)
-- Name: generos generos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_pkey PRIMARY KEY ("idGenero");


--
-- TOC entry 4766 (class 2606 OID 16590)
-- Name: logros logros_idVideojuego_idExterno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT "logros_idVideojuego_idExterno_key" UNIQUE ("idVideojuego", "idExterno");


--
-- TOC entry 4768 (class 2606 OID 16588)
-- Name: logros logros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT logros_pkey PRIMARY KEY ("idLogro");


--
-- TOC entry 4743 (class 2606 OID 16474)
-- Name: modosJuego modosJuego_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."modosJuego"
    ADD CONSTRAINT "modosJuego_nombre_key" UNIQUE (nombre);


--
-- TOC entry 4745 (class 2606 OID 16472)
-- Name: modosJuego modosJuego_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."modosJuego"
    ADD CONSTRAINT "modosJuego_pkey" PRIMARY KEY ("idModo");


--
-- TOC entry 4737 (class 2606 OID 16451)
-- Name: plataformas plataformas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plataformas
    ADD CONSTRAINT plataformas_nombre_key UNIQUE (nombre);


--
-- TOC entry 4739 (class 2606 OID 16449)
-- Name: plataformas plataformas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plataformas
    ADD CONSTRAINT plataformas_pkey PRIMARY KEY ("idPlataforma");


--
-- TOC entry 4770 (class 2606 OID 16603)
-- Name: progresoLogros progresoLogros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."progresoLogros"
    ADD CONSTRAINT "progresoLogros_pkey" PRIMARY KEY ("idUsuario", "idLogro");


--
-- TOC entry 4749 (class 2606 OID 16494)
-- Name: usuariosModosJuego usuariosModosJuego_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosModosJuego"
    ADD CONSTRAINT "usuariosModosJuego_pkey" PRIMARY KEY ("idUsuario", "idModo");


--
-- TOC entry 4721 (class 2606 OID 16410)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4723 (class 2606 OID 16406)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY ("idUsuario");


--
-- TOC entry 4725 (class 2606 OID 16408)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 4735 (class 2606 OID 16433)
-- Name: videojuegosGeneros videojuegosGeneros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosGeneros"
    ADD CONSTRAINT "videojuegosGeneros_pkey" PRIMARY KEY ("idVideojuego", "idGenero");


--
-- TOC entry 4747 (class 2606 OID 16479)
-- Name: videojuegosModos videojuegosModos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosModos"
    ADD CONSTRAINT "videojuegosModos_pkey" PRIMARY KEY ("idVideojuego", "idModo");


--
-- TOC entry 4741 (class 2606 OID 16456)
-- Name: videojuegosPlataformas videojuegosPlataformas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosPlataformas"
    ADD CONSTRAINT "videojuegosPlataformas_pkey" PRIMARY KEY ("idVideojuego", "idPlataforma");


--
-- TOC entry 4727 (class 2606 OID 16418)
-- Name: videojuegos videojuegos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videojuegos
    ADD CONSTRAINT videojuegos_pkey PRIMARY KEY ("idVideojuego");


--
-- TOC entry 4729 (class 2606 OID 16420)
-- Name: videojuegos videojuegos_proveedorApi_idExterno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videojuegos
    ADD CONSTRAINT "videojuegos_proveedorApi_idExterno_key" UNIQUE ("proveedorApi", "idExterno");


--
-- TOC entry 4773 (class 1259 OID 16640)
-- Name: idxActividadUsuarioFecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxActividadUsuarioFecha" ON public.actividad USING btree ("idUsuario", fecha DESC);


--
-- TOC entry 4762 (class 1259 OID 16578)
-- Name: idxAmistadesReceptorEstado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxAmistadesReceptorEstado" ON public.amistades USING btree ("idReceptor", estado);


--
-- TOC entry 4763 (class 1259 OID 16579)
-- Name: idxAmistadesSolicitanteEstado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxAmistadesSolicitanteEstado" ON public.amistades USING btree ("idSolicitante", estado);


--
-- TOC entry 4752 (class 1259 OID 16522)
-- Name: idxBibliotecaVideojuego; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxBibliotecaVideojuego" ON public.biblioteca USING btree ("idVideojuego");


--
-- TOC entry 4755 (class 1259 OID 16538)
-- Name: idxColeccionesUsuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxColeccionesUsuario" ON public.colecciones USING btree ("idUsuario");


--
-- TOC entry 4764 (class 1259 OID 16596)
-- Name: idxLogrosVideojuego; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idxLogrosVideojuego" ON public.logros USING btree ("idVideojuego");


--
-- TOC entry 4792 (class 2606 OID 16635)
-- Name: actividad actividad_idColeccion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT "actividad_idColeccion_fkey" FOREIGN KEY ("idColeccion") REFERENCES public.colecciones("idColeccion") ON DELETE SET NULL;


--
-- TOC entry 4793 (class 2606 OID 16625)
-- Name: actividad actividad_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT "actividad_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 16630)
-- Name: actividad actividad_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT "actividad_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE SET NULL;


--
-- TOC entry 4787 (class 2606 OID 16573)
-- Name: amistades amistades_idReceptor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT "amistades_idReceptor_fkey" FOREIGN KEY ("idReceptor") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4788 (class 2606 OID 16568)
-- Name: amistades amistades_idSolicitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT "amistades_idSolicitante_fkey" FOREIGN KEY ("idSolicitante") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4782 (class 2606 OID 16512)
-- Name: biblioteca biblioteca_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT "biblioteca_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4783 (class 2606 OID 16517)
-- Name: biblioteca biblioteca_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT "biblioteca_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


--
-- TOC entry 4785 (class 2606 OID 16546)
-- Name: coleccionesVideojuegos coleccionesVideojuegos_idColeccion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."coleccionesVideojuegos"
    ADD CONSTRAINT "coleccionesVideojuegos_idColeccion_fkey" FOREIGN KEY ("idColeccion") REFERENCES public.colecciones("idColeccion") ON DELETE CASCADE;


--
-- TOC entry 4786 (class 2606 OID 16551)
-- Name: coleccionesVideojuegos coleccionesVideojuegos_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."coleccionesVideojuegos"
    ADD CONSTRAINT "coleccionesVideojuegos_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


--
-- TOC entry 4784 (class 2606 OID 16533)
-- Name: colecciones colecciones_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT "colecciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4789 (class 2606 OID 16591)
-- Name: logros logros_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT "logros_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 16609)
-- Name: progresoLogros progresoLogros_idLogro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."progresoLogros"
    ADD CONSTRAINT "progresoLogros_idLogro_fkey" FOREIGN KEY ("idLogro") REFERENCES public.logros("idLogro") ON DELETE CASCADE;


--
-- TOC entry 4791 (class 2606 OID 16604)
-- Name: progresoLogros progresoLogros_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."progresoLogros"
    ADD CONSTRAINT "progresoLogros_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4780 (class 2606 OID 16500)
-- Name: usuariosModosJuego usuariosModosJuego_idModo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosModosJuego"
    ADD CONSTRAINT "usuariosModosJuego_idModo_fkey" FOREIGN KEY ("idModo") REFERENCES public."modosJuego"("idModo") ON DELETE CASCADE;


--
-- TOC entry 4781 (class 2606 OID 16495)
-- Name: usuariosModosJuego usuariosModosJuego_idUsuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosModosJuego"
    ADD CONSTRAINT "usuariosModosJuego_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES public.usuarios("idUsuario") ON DELETE CASCADE;


--
-- TOC entry 4774 (class 2606 OID 16439)
-- Name: videojuegosGeneros videojuegosGeneros_idGenero_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosGeneros"
    ADD CONSTRAINT "videojuegosGeneros_idGenero_fkey" FOREIGN KEY ("idGenero") REFERENCES public.generos("idGenero") ON DELETE CASCADE;


--
-- TOC entry 4775 (class 2606 OID 16434)
-- Name: videojuegosGeneros videojuegosGeneros_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosGeneros"
    ADD CONSTRAINT "videojuegosGeneros_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


--
-- TOC entry 4778 (class 2606 OID 16485)
-- Name: videojuegosModos videojuegosModos_idModo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosModos"
    ADD CONSTRAINT "videojuegosModos_idModo_fkey" FOREIGN KEY ("idModo") REFERENCES public."modosJuego"("idModo") ON DELETE CASCADE;


--
-- TOC entry 4779 (class 2606 OID 16480)
-- Name: videojuegosModos videojuegosModos_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosModos"
    ADD CONSTRAINT "videojuegosModos_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


--
-- TOC entry 4776 (class 2606 OID 16462)
-- Name: videojuegosPlataformas videojuegosPlataformas_idPlataforma_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosPlataformas"
    ADD CONSTRAINT "videojuegosPlataformas_idPlataforma_fkey" FOREIGN KEY ("idPlataforma") REFERENCES public.plataformas("idPlataforma") ON DELETE CASCADE;


--
-- TOC entry 4777 (class 2606 OID 16457)
-- Name: videojuegosPlataformas videojuegosPlataformas_idVideojuego_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."videojuegosPlataformas"
    ADD CONSTRAINT "videojuegosPlataformas_idVideojuego_fkey" FOREIGN KEY ("idVideojuego") REFERENCES public.videojuegos("idVideojuego") ON DELETE CASCADE;


-- Completed on 2026-10-26 13:59:41

--
-- PostgreSQL database dump complete
--

